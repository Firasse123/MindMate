// utils/achievements.js or lib/achievements.js

export const calculateAchievements = (userData, recentActivity, topicProgress, weeklyProgress) => {
  const achievements = [];
  
  // Level-based achievements
  if (userData.level >= 5) {
    achievements.push({
      id: 'level_5',
      name: 'Rising Scholar',
      description: 'Reached Level 5',
      icon: '🎓',
      rarity: 'common',
      unlockedAt: new Date().toISOString()
    });
  }
  
  if (userData.level >= 10) {
    achievements.push({
      id: 'level_10',
      name: 'Knowledge Seeker',
      description: 'Reached Level 10',
      icon: '📚',
      rarity: 'uncommon',
      unlockedAt: new Date().toISOString()
    });
  }
  
  if (userData.level >= 20) {
    achievements.push({
      id: 'level_20',
      name: 'Master Student',
      description: 'Reached Level 20',
      icon: '🏆',
      rarity: 'rare',
      unlockedAt: new Date().toISOString()
    });
  }

  // Streak achievements
  if (userData.streak.current >= 3) {
    achievements.push({
      id: 'streak_3',
      name: 'Getting Started',
      description: '3-day study streak',
      icon: '🔥',
      rarity: 'common',
      unlockedAt: new Date().toISOString()
    });
  }
  
  if (userData.streak.current >= 7) {
    achievements.push({
      id: 'streak_7',
      name: 'Weekly Warrior',
      description: '7-day study streak',
      icon: '⚡',
      rarity: 'uncommon',
      unlockedAt: new Date().toISOString()
    });
  }
  
  if (userData.streak.current >= 30) {
    achievements.push({
      id: 'streak_30',
      name: 'Dedication Master',
      description: '30-day study streak',
      icon: '👑',
      rarity: 'legendary',
      unlockedAt: new Date().toISOString()
    });
  }

  // Sheet creation achievements
  if (userData.sheetsCreated >= 1) {
    achievements.push({
      id: 'first_sheet',
      name: 'First Steps',
      description: 'Created your first study sheet',
      icon: '📝',
      rarity: 'common',
      unlockedAt: new Date().toISOString()
    });
  }
  
  if (userData.sheetsCreated >= 10) {
    achievements.push({
      id: 'sheets_10',
      name: 'Content Creator',
      description: 'Created 10 study sheets',
      icon: '✍️',
      rarity: 'uncommon',
      unlockedAt: new Date().toISOString()
    });
  }
  
  if (userData.sheetsCreated >= 50) {
    achievements.push({
      id: 'sheets_50',
      name: 'Knowledge Builder',
      description: 'Created 50 study sheets',
      icon: '🏗️',
      rarity: 'rare',
      unlockedAt: new Date().toISOString()
    });
  }

  // Quiz achievements
  if (userData.quizzesCompleted >= 1) {
    achievements.push({
      id: 'first_quiz',
      name: 'Test Taker',
      description: 'Completed your first quiz',
      icon: '🎯',
      rarity: 'common',
      unlockedAt: new Date().toISOString()
    });
  }
  
  if (userData.quizzesCompleted >= 25) {
    achievements.push({
      id: 'quiz_master',
      name: 'Quiz Master',
      description: 'Completed 25 quizzes',
      icon: '🎮',
      rarity: 'uncommon',
      unlockedAt: new Date().toISOString()
    });
  }

  // Study time achievements
  if (userData.totalStudyTime >= 10) {
    achievements.push({
      id: 'study_10h',
      name: 'Time Invested',
      description: 'Studied for 10+ hours total',
      icon: '⏰',
      rarity: 'common',
      unlockedAt: new Date().toISOString()
    });
  }
  
  if (userData.totalStudyTime >= 100) {
    achievements.push({
      id: 'study_100h',
      name: 'Century Scholar',
      description: 'Studied for 100+ hours total',
      icon: '📖',
      rarity: 'rare',
      unlockedAt: new Date().toISOString()
    });
  }

  // Topic mastery achievements
  const masteriedTopics = topicProgress.filter(topic => topic.mastery >= 100);
  if (masteriedTopics.length >= 1) {
    achievements.push({
      id: 'first_mastery',
      name: 'Subject Master',
      description: `Mastered ${masteriedTopics[0].topic}`,
      icon: '⭐',
      rarity: 'uncommon',
      unlockedAt: new Date().toISOString()
    });
  }
  
  if (masteriedTopics.length >= 3) {
    achievements.push({
      id: 'multi_master',
      name: 'Renaissance Scholar',
      description: 'Mastered 3 different subjects',
      icon: '🌟',
      rarity: 'rare',
      unlockedAt: new Date().toISOString()
    });
  }

  // Weekly activity achievements
  const activeWeekDays = weeklyProgress.filter(day => day.sessionCount > 0).length;
  if (activeWeekDays >= 5) {
    achievements.push({
      id: 'week_active',
      name: 'Weekly Champion',
      description: 'Active 5+ days this week',
      icon: '📅',
      rarity: 'common',
      unlockedAt: new Date().toISOString()
    });
  }

  // Perfect week (7 days active)
  if (activeWeekDays === 7) {
    achievements.push({
      id: 'perfect_week',
      name: 'Perfect Week',
      description: 'Active every day this week',
      icon: '💯',
      rarity: 'rare',
      unlockedAt: new Date().toISOString()
    });
  }

  // Score-based achievements (from recent activity)
  const highScores = recentActivity.filter(activity => activity.score && activity.score >= 90);
  if (highScores.length >= 3) {
    achievements.push({
      id: 'high_scorer',
      name: 'Excellence Seeker',
      description: '3+ quizzes with 90%+ scores',
      icon: '🎖️',
      rarity: 'uncommon',
      unlockedAt: new Date().toISOString()
    });
  }

  // XP milestone achievements
  if (userData.experience >= 500) {
    achievements.push({
      id: 'xp_500',
      name: 'Experience Collector',
      description: 'Earned 500+ XP',
      icon: '💎',
      rarity: 'common',
      unlockedAt: new Date().toISOString()
    });
  }
  
  if (userData.experience >= 2000) {
    achievements.push({
      id: 'xp_2000',
      name: 'XP Millionaire',
      description: 'Earned 2000+ XP',
      icon: '💰',
      rarity: 'rare',
      unlockedAt: new Date().toISOString()
    });
  }

  // Special combination achievements
  if (userData.level >= 10 && userData.streak.current >= 7 && masteriedTopics.length >= 1) {
    achievements.push({
      id: 'triple_threat',
      name: 'Triple Threat',
      description: 'Level 10+, 7-day streak, and mastered a subject',
      icon: '🚀',
      rarity: 'legendary',
      unlockedAt: new Date().toISOString()
    });
  }

  return achievements.sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));
};

// Achievement Card Component
export const AchievementCard = ({ achievement }) => {
  const getRarityColor = (rarity) => {
    const colors = {
      'common': 'border-gray-500/30 bg-gray-500/10',
      'uncommon': 'border-green-500/30 bg-green-500/10',
      'rare': 'border-blue-500/30 bg-blue-500/10',
      'epic': 'border-purple-500/30 bg-purple-500/10',
      'legendary': 'border-yellow-500/30 bg-yellow-500/10'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityTextColor = (rarity) => {
    const colors = {
      'common': 'text-gray-400',
      'uncommon': 'text-green-400',
      'rare': 'text-blue-400',
      'epic': 'text-purple-400',
      'legendary': 'text-yellow-400'
    };
    return colors[rarity] || colors.common;
  };

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-xl border ${getRarityColor(achievement.rarity)}`}>
      <div className="text-2xl">{achievement.icon}</div>
      <div className="flex-1">
        <div className="font-medium text-white">{achievement.name}</div>
        <div className="text-xs text-slate-400">{achievement.description}</div>
        <div className={`text-xs ${getRarityTextColor(achievement.rarity)} capitalize`}>
          {achievement.rarity}
        </div>
      </div>
    </div>
  );
};

