import LevelService from "../services/levelService.js";
import UserProgress from "../models/UserProgress.js"; // Fix: Capital U

export const awardXP = async (req, res) => {
    try {
        const { activityType, metadata } = req.body;
        const userId = req.userId;

        const result = await LevelService.awardXP(userId, activityType, metadata);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLevel = async (req, res) => {
    try {
        const userProgress = await UserProgress.findOne({ user: req.userId }); // Fix: Use UserProgress, not userProgress
        if (!userProgress) {
            return res.status(404).json({ message: "User progress not found" }); // Fix: Add return
        }
        
        const levelInfo = LevelService.calculateLevel(userProgress.overall.experience);
        res.json({
            ...levelInfo,
            streak: userProgress.overall.streak,
            achievements: userProgress.achievements
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};