// Fixed levelService.js - Add missing activity types and improve XP calculation
import StudySession from "../models/StudySession.js"
import UserProgress from "../models/UserProgress.js";
class LevelService {
  constructor() {
    this.XP_RATES = {
      SHEET_CREATED: 50,
      QUIZ_GENERATED: 40,
      QUIZ_COMPLETED: 30,
      SHEET_EVALUATED: 35,
      PERSONALIZED_PATH_CREATED:50, // ADD THIS - Missing activity type
      AI_INTERACTION: 5,

      ACHIEVEMENT_EARNED: 100,
      SCORE_MULTIPLIERS: {
        100: 2.5,
        90: 2.0,
        80: 1.5,
        70: 1.2,
        60: 1.0,
        0: 0.5
      },
      BONUSES: {
        FIRST_QUIZ_OF_DAY: 25,
        STUDY_STREAK_DAILY: 15,
        PERFECT_SCORE: 50,
        HIGH_SCORE: 25 // 90%+ score
      }
    };

    this.LEVEL_THRESHOLDS = this.generateLevelThresholds();
  }

  generateLevelThresholds() {
    const thresholds = [0]; // Level 1 = 0 XP
    let baseXP = 100;

    for (let level = 2; level <= 100; level++) {
      baseXP = Math.floor(baseXP * 1.15); // 15% increase per level
      thresholds.push(thresholds[level - 2] + baseXP);
    }

    return thresholds;
  }

  calculateLevel(totalXP) {
    for (let level = this.LEVEL_THRESHOLDS.length - 1; level >= 0; level--) {
      if (totalXP >= this.LEVEL_THRESHOLDS[level]) {
        return {
          level: level + 1,
          currentXP: totalXP,
          xpForCurrentLevel: this.LEVEL_THRESHOLDS[level],
          xpForNextLevel: this.LEVEL_THRESHOLDS[level + 1] || null,
          progressToNext: this.LEVEL_THRESHOLDS[level + 1]
            ? ((totalXP - this.LEVEL_THRESHOLDS[level]) /
                (this.LEVEL_THRESHOLDS[level + 1] -
                  this.LEVEL_THRESHOLDS[level])) *
              100
            : 100
        };
      }
    }
    return { level: 1, currentXP: totalXP, progressToNext: 0 };
  }

  async awardXP(userId, activityType, metadata = {}) {
    try {
      let userProgress = await UserProgress.findOne({ user: userId });

      if (!userProgress) {
        userProgress = await UserProgress.create({
          user: userId,
          overall: {
            level: 1,
            experience: 0,
            totalStudyTime: 0,
            streak: { current: 0, longest: 0 }
          },
          achievements: []
        });
      }

      // Calculate earned XP
      let xpEarned = this.calculateXPForActivity(activityType, metadata);

      // Add bonus XP
      const bonusXP = await this.calculateBonusXP(userId, userProgress, metadata);
      xpEarned += bonusXP;

      // Track old level
      const oldLevel = userProgress.overall.level;

      // Add XP
      userProgress.overall.experience += xpEarned;

      // Recalculate level
      const levelInfo = this.calculateLevel(userProgress.overall.experience);
      userProgress.overall.level = levelInfo.level;

      const leveledUp = levelInfo.level > oldLevel;

      if (leveledUp) {
        await this.checkLevelUpAchievements(userProgress, levelInfo.level);
      }

      await userProgress.save();

      return {
        xpEarned,
        bonusXP,
        leveledUp,
        oldLevel,
        newLevel: levelInfo.level,
        totalXP: userProgress.overall.experience,
        levelInfo
      };
    } catch (error) {
      console.error("Error awarding XP:", error);
      throw error;
    }
  }

  calculateXPForActivity(activityType, metadata) {
    switch (activityType) {
      case "SHEET_CREATED":
        return this.XP_RATES.SHEET_CREATED;

      case "QUIZ_COMPLETED":
        const baseXP = this.XP_RATES.QUIZ_COMPLETED;
        const score = metadata.score || 0;
        const multiplier = this.getScoreMultiplier(score);
        return Math.floor(baseXP * multiplier);

      case "QUIZ_GENERATED":
        return this.XP_RATES.QUIZ_GENERATED;

      case "SHEET_EVALUATED": // FIX: Add this missing case
        return this.XP_RATES.SHEET_EVALUATED;

      case "AI_INTERACTION":
        return this.XP_RATES.AI_INTERACTION;
      case "PERSONALIZED_PATH_CREATED":
        return this.XP_RATES.AI_INTERACTION;


      default:
        console.warn(`Unknown activity type: ${activityType}`);
        return 0;
    }
  }

  getScoreMultiplier(score) {
    if (score >= 100) return this.XP_RATES.SCORE_MULTIPLIERS[100];
    if (score >= 90) return this.XP_RATES.SCORE_MULTIPLIERS[90];
    if (score >= 80) return this.XP_RATES.SCORE_MULTIPLIERS[80];
    if (score >= 70) return this.XP_RATES.SCORE_MULTIPLIERS[70];
    if (score >= 60) return this.XP_RATES.SCORE_MULTIPLIERS[60];
    return this.XP_RATES.SCORE_MULTIPLIERS[0];
  }

  async calculateBonusXP(userId, userProgress, metadata) {
    let bonusXP = 0;

    // Daily streak bonus
    const today = new Date().toDateString();
    const lastStudy = userProgress.overall.streak.lastStudyDate;

    if (!lastStudy || lastStudy.toDateString() !== today) {
      bonusXP += this.XP_RATES.BONUSES.STUDY_STREAK_DAILY;
    }

    // Perfect score bonus
    if (metadata.score === 100) {
      bonusXP += this.XP_RATES.BONUSES.PERFECT_SCORE;
    } else if (metadata.score >= 90) {
      bonusXP += this.XP_RATES.BONUSES.HIGH_SCORE;
    }

    // First quiz of the day bonus
    if (metadata.score !== undefined) { // Only for quiz completions
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayQuizzes = await StudySession.countDocuments({
        user: userId,
        sessionType: 'quiz',
        createdAt: { $gte: todayStart }
      });

      if (todayQuizzes === 0) { // This will be the first quiz after counting
        bonusXP += this.XP_RATES.BONUSES.FIRST_QUIZ_OF_DAY;
      }
    }

    return bonusXP;
  }

  async checkLevelUpAchievements(userProgress, newLevel) {
    const milestones = [5, 10, 25, 50, 75, 100];

    if (milestones.includes(newLevel)) {
      const achievement = {
        badgeId: `level_${newLevel}`,
        name: `Level ${newLevel} Master`,
        description: `Reached level ${newLevel}!`,
        earnedAt: new Date(),
        category: "level"
      };

      // Check if achievement already exists
      const existingAchievement = userProgress.achievements.find(
        ach => ach.badgeId === achievement.badgeId
      );

      if (!existingAchievement) {
        userProgress.achievements.push(achievement);
      }
    }
  }

  async updateStreak(userId) {
    const userProgress = await UserProgress.findOne({ user: userId });
    if (!userProgress) return;

    const today = new Date();
    const lastStudy = userProgress.overall.streak.lastStudyDate;

    if (!lastStudy) {
      userProgress.overall.streak.current = 1;
      userProgress.overall.streak.longest = 1;
    } else {
      const daysSinceLastStudy = Math.floor(
        (today - lastStudy) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastStudy === 1) {
        userProgress.overall.streak.current += 1;
        userProgress.overall.streak.longest = Math.max(
          userProgress.overall.streak.longest,
          userProgress.overall.streak.current
        );
      } else if (daysSinceLastStudy > 1) {
        userProgress.overall.streak.current = 1;
      }
      // If daysSinceLastStudy === 0, same day - don't change streak
    }

    userProgress.overall.streak.lastStudyDate = today;
    await userProgress.save();
  }

  // NEW: Get user progress for dashboard
  async getUserProgress(userId) {
    const userProgress = await UserProgress.findOne({ user: userId });
    if (!userProgress) {
      return null;
    }

    const levelInfo = this.calculateLevel(userProgress.overall.experience);
    
    return {
      ...userProgress.toObject(),
      levelInfo
    };
  }
}

export default new LevelService();