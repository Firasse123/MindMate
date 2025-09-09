import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatBot from "../models/Chatbot.js";
import StudySession from "../models/StudySession.js";
import LevelService from "../services/levelService.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generate = async (req, res) => {
    const { prompt, ficheId } = req.body; // Add optional ficheId for context
    const userId = req.userId;
    
    if (!prompt || !userId) {
        return res.status(400).json({ error: "Message and userId are required" });
    }
    
    try {
        const startTime = Date.now();
        
        // Save user message
        await ChatBot.create({ userId, role: "user", content: prompt });
        
        // Get chat history
        const history = await ChatBot.find({ userId }).sort({ timestamp: 1 });
        const formattedHistory = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));

        // Generate AI response
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent({ contents: formattedHistory });
        const aiReply = result.response.text();
        
        if (!aiReply || aiReply.trim() === "") {
            return res.status(500).json({ error: "AI did not generate a reply" });
        }

        // Save AI response
        await ChatBot.create({ userId, role: "assistant", content: aiReply });
        
        // Create StudySession for AI interaction
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        
        const studySession = await StudySession.create({
            user: userId,
            fiche: ficheId || null, // Optional fiche context
            sessionType: "ai_chat",
            aiInteraction: {
                messagesExchanged: 2, // User message + AI response
                helpRequested: 1,
                explanationsViewed: [prompt.substring(0, 50) + "..."], // Store topic of question
                personalizedPath: {
                    nextActions: ["Continue studying based on AI recommendations"]
                }
            },
            results: {
                timeSpent: timeSpent,
                completionRate: 100
            },
            status: "completed",
            completedAt: new Date()
        });

        // Award XP for AI interaction
        await LevelService.awardXP(userId, "AI_INTERACTION");
        // Don't update streak for every chat message - only for substantial study activities
        
        res.json({ 
            reply: aiReply,
            studySession: studySession
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Enhanced chat history to include study context
export const getHistory = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(400).json({ message: "user not found" });
    }
    
    try {
        // Get chat history
        const history = await ChatBot.find({ userId })
            .sort({ timestamp: -1 })
            .limit(50); // Increased limit for better context

        // Get recent AI chat sessions for analytics
        const chatSessions = await StudySession.find({
            user: userId,
            sessionType: "ai_chat"
        })
        .sort({ createdAt: -1 })
        .limit(10);

        res.json({
            chatHistory: history.reverse(), // Reverse to show chronological order
            sessionAnalytics: {
                totalChatSessions: chatSessions.length,
                totalTimeSpent: chatSessions.reduce((sum, session) => 
                    sum + (session.results?.timeSpent || 0), 0),
                averageMessagesPerSession: chatSessions.length > 0 ? 
                    chatSessions.reduce((sum, session) => 
                        sum + (session.aiInteraction?.messagesExchanged || 0), 0) / chatSessions.length : 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteChat = async (req, res) => {
    const userId = req.userId;
    try {
        // Delete chat messages
        const chats = await ChatBot.deleteMany({ userId });
        
        // Also delete AI chat study sessions if you want to clear everything
        const sessions = await StudySession.deleteMany({
            user: userId,
            sessionType: "ai_chat"
        });
        
        if (chats.deletedCount === 0 && sessions.deletedCount === 0) {
            return res.status(404).json({ message: "No chats found for this user" });
        }

        return res.status(200).json({ 
            message: "All chats deleted successfully",
            deletedMessages: chats.deletedCount,
            deletedSessions: sessions.deletedCount
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete chats" });
    }
};

// New endpoint: Get AI chat analytics for dashboard
export const getChatAnalytics = async (req, res) => {
    const userId = req.userId;
    
    try {
        const analytics = await StudySession.aggregate([
            { $match: { user: userId, sessionType: "ai_chat" } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    totalSessions: { $sum: 1 },
                    totalMessages: { $sum: "$aiInteraction.messagesExchanged" },
                    totalTime: { $sum: "$results.timeSpent" },
                    helpRequests: { $sum: "$aiInteraction.helpRequested" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
            { $limit: 30 } // Last 30 days
        ]);

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};