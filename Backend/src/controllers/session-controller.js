import StudySession from "../models/StudySession.js";
import Fiche from "../models/Fiche.js";
export const getRecentSessions = async (req, res) => {
    try {
        const sessions = await StudySession.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('fiche', 'title')
            .populate('quiz', 'title');
            
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// controllers/statsController.js
export const getStats = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Count sheets created
        const sheetsCreated = await Fiche.countDocuments({ author: userId });
        
        // Count quizzes completed
        const quizzesCompleted = await StudySession.countDocuments({ 
            user: userId, 
            sessionType: 'quiz',
            status: 'completed'
        });
        
        // Total study time (in minutes)
        const totalTimeResult = await StudySession.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, totalTime: { $sum: "$results.timeSpent" } } }
        ]);
        
        const totalStudyTime = totalTimeResult[0]?.totalTime || 0;
        
        res.json({
            sheetsCreated,
            quizzesCompleted,
            totalStudyTime
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};