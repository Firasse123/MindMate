import Quiz from "../models/Quiz.js"
import Fiche from "../models/Fiche.js"
import LevelService from "../services/levelService.js";
import StudySession from "../models/StudySession.js";
export const getQuiz=async(req,res)=>{
    const {ficheId,quizId}=req.params;
    try{
        const quiz=await Quiz.findOne({_id:quizId,fiche:ficheId})
        .populate("fiche")
        .populate("user", "name email")
        .exec();
        if(!quiz){
            res.status(404).json({message:"Quiz non trouvé pour cette fiche"})
        }
        res.status(200).json({quiz})

    }
    catch(error){
        res.status(500).json({error:error.message})
        
    }
    }
export const getAllQuiz=async (req,res)=>{
try {
    const userId=req.userId;
    const quizzes=await Quiz.find({user:userId})
    .populate("fiche")   
    .populate("user", "name email") 
    .exec();
  if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: "Aucun quiz trouvé pour cette fiche" });
    }
    res.status(200).json(quizzes)
}
catch(error){
    res.status(500).json({error:error.message})
}

}
const FASTAPI_URL = "http://localhost:8000/create-quiz";

export const createQuiz = async (req, res) => {
    const userId = req.userId;
    try {
        const { fiche_id, question_count, difficulty } = req.body;
        const startTime = Date.now();
        
        // Validate input
        if (!fiche_id || !question_count || !difficulty) {
            return res.status(400).json({ 
                message: "Missing required fields: fiche_id, question_count, difficulty" 
            });
        }
        
        const fiche = await Fiche.findOne({ _id: fiche_id });
        
        if (!fiche) {
            return res.status(404).json({ message: "Fiche not found" });
        }
        
        const fiche_title = fiche.title;
        const fiche_content = fiche.content;
        
        
        // Increased timeout to 2 minutes for quiz generation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout
        
        try {
            const response = await fetch(FASTAPI_URL, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    fiche_id, 
                    fiche_content, 
                    fiche_title, 
                    question_count, 
                    difficulty 
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error("FastAPI Error:", data);
                return res.status(response.status).json({ 
                    message: data.error || data.detail || "Failed to generate quiz from AI service" 
                });
            }
            
            // Handle different response formats from FastAPI
            let quizData;
            if (data.Quiz) {
                // If FastAPI returns { Quiz: {...} }
                quizData = {
                    user: userId,
                    fiche: fiche_id,
                    ...data.Quiz
                };
            } else if (data.questions) {
                // If FastAPI returns questions directly
                quizData = {
                    user: userId,
                    fiche: fiche_id,
                    questions: data.questions,
                    difficulty: difficulty,
                    totalQuestions: question_count,
                    title: `Quiz for ${fiche_title}`
                };
            } else {
                // If FastAPI returns the quiz data directly
                quizData = {
                    user: userId,
                    fiche: fiche_id,
                    ...data
                };
            }
            
            console.log("Creating quiz with data:", JSON.stringify(quizData, null, 2));
            
            const newQuiz = await Quiz.create(quizData);
            console.log("Quiz created successfully:", newQuiz._id);
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        const studySession = await StudySession.create({
            user: userId,
            fiche: fiche_id,
            quiz: newQuiz._id,
            sessionType: "quiz_generation",
            aiInteraction: {
                messagesExchanged: 1,
                personalizedPath: {
                    suggestedDifficulty: difficulty,
                    nextActions: [`Take the generated quiz: ${newQuiz.title}`]
                }
            },
            results: {
                totalQuestions: question_count,
                timeSpent: timeSpent,
                completionRate: 100
            },
            status: "completed",
            completedAt: new Date()
        })
            await LevelService.awardXP(userId, "QUIZ_GENERATED");
            await LevelService.updateStreak(userId);
            res.status(201).json({
                success: true,
                newQuiz: newQuiz,
                message: "Quiz generated successfully"
            });

            
        } catch (fetchError) {
            clearTimeout(timeoutId);
            
            // Handle fetch-specific errors
            if (fetchError.name === 'AbortError') {
                console.error("FastAPI request timed out after 2 minutes");
                return res.status(408).json({ 
                    message: "Quiz generation is taking too long. Please try again with fewer questions or check if the AI service is running properly." 
                });
            }
            
            if (fetchError.code === 'ECONNREFUSED') {
                console.error("Cannot connect to FastAPI service");
                return res.status(503).json({ 
                    message: "AI service is not available. Please ensure the FastAPI server is running on port 8000." 
                });
            }
            
            throw fetchError; // Re-throw to be caught by outer catch
        }
        
    } catch (error) {
        console.error("Quiz creation error:", error);
        
        res.status(500).json({ 
            message: error.message || "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
const calculateQuizScore = (answers) => {
    if (!answers || answers.length === 0) return 0;
    
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    return Math.round((correctAnswers / answers.length) * 100);
};

// Fixed quiz-controller.js - submitQuiz function
export const submitQuiz = async (req, res) => {
    const { quizId, answers, totalTimeSpent, scoreData } = req.body; // Include scoreData
    const userId = req.userId;
    
    try {
        // Get quiz to find ficheId
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }
        
        // Calculate score properly
        const score = calculateQuizScore(answers);
        
        // Create study session
        const studySession = await StudySession.create({
            user: userId,
            quiz: quizId,
            fiche: quiz.fiche, // Include fiche reference
            sessionType: 'quiz',
            results: { 
                score, 
                timeSpent: totalTimeSpent,
                totalQuestions: answers.length,
                correctAnswers: answers.filter(a => a.isCorrect).length
            },
            status: 'completed',
            completedAt: new Date()
        });
        
        // Award XP with proper score metadata
        const xpResult = await LevelService.awardXP(userId, 'QUIZ_COMPLETED', { score });
        await LevelService.updateStreak(userId);
        
        // Return complete information including XP details
        res.json({ 
            success: true,
            studySession, 
            xpEarned: xpResult.xpEarned,
            leveledUp: xpResult.leveledUp,
            oldLevel: xpResult.oldLevel,
            newLevel: xpResult.newLevel,
            totalXP: xpResult.totalXP,
            score: score
        });
    } catch (error) {
        console.error("Quiz submission error:", error);
        res.status(500).json({ error: error.message });
    }
};