"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getSessions, getStats } from '@/store/sessionStore';
import { getLevel } from "../../store/levelStore";
import { getAllSheets } from '@/store/sheetStore';
import { getAllQuiz } from '@/store/quizStore'; 
import Link from 'next/link';
import {calculateAchievements,AchievementCard } from "../../utils/achievements.js"
import Navbar from '@/components/Navbar';
import { 
  Trophy, 
  Target, 
  Clock, 
  Brain, 
  Zap, 
  BookOpen,
  Award,
  Activity,
  BarChart3,
  Flame,
  Star,
  ChevronRight,
  Plus,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated, isCheckingAuth, checkAuth, logout, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check auth on page load
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Only redirect when we're done checking auth
    if (!isCheckingAuth) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (isAuthenticated && !user?.isVerified) {
        router.replace("/verify-email");
      }
    }
  }, [isAuthenticated, user, isCheckingAuth, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // State for dashboard data
  const [userData, setUserData] = useState({
    level: 1,
    experience: 0,
    experienceToNext: 100,
    streak: { current: 0, longest: 0 },
    totalStudyTime: 0,
    sheetsCreated: 0,
    quizzesCompleted: 0,
    achievements: []
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [topicProgress, setTopicProgress] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyQuote, setDailyQuote] = useState('');

  // Famous motivational quotes
  const motivationalQuotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The only impossible journey is the one you never begin. - Tony Robbins",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "It always seems impossible until it's done. - Nelson Mandela",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
    "Every day is a new opportunity to change your life.",
    "The expert in anything was once a beginner.",
    "Progress, not perfection, is the goal.",
    "A year from now you may wish you had started today.",
    "Knowledge is power, but action is the key to unlocking it.",
    "The best time to plant a tree was 20 years ago. The second best time is now."
  ];

  // Get daily quote
  useEffect(() => {
    const today = new Date().toDateString();
    const savedQuote = localStorage.getItem('dailyQuote');
    const savedDate = localStorage.getItem('dailyQuoteDate');
    
    if (savedDate !== today) {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setDailyQuote(randomQuote);
      localStorage.setItem('dailyQuote', randomQuote);
      localStorage.setItem('dailyQuoteDate', today);
    } else {
      setDailyQuote(savedQuote);
    }
  }, []);

  // Helper functions
  const getActivityType = (sessionType) => {
    const types = {
      'quiz': 'quiz_completed',
      'sheet_generation': 'sheet_created',
      'quiz_generation': 'quiz_generated',
      'ai_chat': 'ai_interaction',
      'review': 'sheet_evaluated'
    };
    return types[sessionType] || 'activity';
  };

  const getActivityTitle = (session) => {
    if (session.fiche?.title) return session.fiche.title;
    if (session.quiz?.title) return session.quiz.title;
    return `${session.sessionType.replace('_', ' ')} session`;
  };

  const calculateXPEarned = (session) => {
    const xpMap = {
      'quiz': Math.floor(30 * (session.results?.score || 50) / 100),
      'sheet_generation': 50,
      'quiz_generation': 40,
      'ai_chat': 5,
      'review': 20
    };
    return xpMap[session.sessionType] || 10;
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  // Helper function to calculate study time from session
  const calculateSessionStudyTime = (session) => {
    // Different session types have different study time calculations
    switch (session.sessionType) {
      case 'quiz':
        // Quiz time based on number of questions (assume 1 minute per question)
        const questionCount = session.quiz?.questions?.length || session.results?.totalQuestions || 5;
        return questionCount * 1; // 1 minute per question
        
      case 'sheet_generation':
        // Sheet creation time (estimate based on content length or fixed time)
        const contentLength = session.fiche?.content?.length || 500;
        return Math.max(Math.floor(contentLength / 100), 5); // Min 5 minutes, ~1 min per 100 chars
        
      case 'quiz_generation':
        return 10; // Fixed 10 minutes for quiz generation
        
      case 'ai_chat':
        // Chat session time (could be tracked separately or estimated)
        return 5; // Fixed 5 minutes per chat session
        
      case 'review':
        return 15; // Fixed 15 minutes for sheet review
        
      default:
        return 5; // Default 5 minutes
    }
  };


  // Dynamic Topic Mastery Generation
  const generateDynamicTopicData = async () => {
    try {
      const sheets = await getAllSheets();
      
      if (!sheets || sheets.length === 0) {
        setTopicProgress([]);
        return;
      }

      // Group sheets by domain
      const domainGroups = {};
      const domainLastStudied = {};
      
      sheets.forEach(sheet => {
        const domain = sheet.classification?.domain || 'other';
        
        // Initialize domain if not exists
        if (!domainGroups[domain]) {
          domainGroups[domain] = [];
          domainLastStudied[domain] = new Date(0); // Very old date as default
        }
        
        domainGroups[domain].push(sheet);
        
        // Track most recent activity for this domain
        const sheetDate = new Date(sheet.updatedAt || sheet.createdAt);
        if (sheetDate > domainLastStudied[domain]) {
          domainLastStudied[domain] = sheetDate;
        }
      });

      // Calculate mastery and format data
      const topicData = Object.entries(domainGroups).map(([domain, domainSheets]) => {
        const sheetCount = domainSheets.length;
        const mastery = Math.min(sheetCount * 10, 100); // 10% per sheet, max 100%
        
        // Format domain name for display
        const formattedDomain = domain
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Calculate time since last studied
        const lastStudiedTime = formatTimestamp(domainLastStudied[domain]);
        
        return {
          topic: formattedDomain,
          mastery: mastery,
          lastStudied: lastStudiedTime,
          sessions: sheetCount, // Using sheet count as "sessions"
          domain: domain // Keep original for potential filtering
        };
      });

      // Sort by mastery level (highest first)
      topicData.sort((a, b) => b.mastery - a.mastery);
      
      setTopicProgress(topicData);
      
    } catch (error) {
      console.error('Error fetching topic mastery data:', error);
      // Fallback to empty array
      setTopicProgress([]);
    }
  };

  // Dynamic Weekly Progress Generation
  const generateDynamicWeeklyProgress = async () => {
    try {
      const sessionsResponse = await getSessions();
      
      if (!sessionsResponse || sessionsResponse.length === 0) {
        // If no sessions, create empty week
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const emptyWeek = days.map(day => ({
          day,
          studyTime: 0,
          xpEarned: 0,
          sessionCount: 0
        }));
        setWeeklyProgress(emptyWeek);
        return;
      }

      // Get the current week (Monday to Sunday)
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Calculate days to Monday
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      // Create array of this week's dates
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push(date);
      }

      // Initialize week data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weekData = days.map((day, index) => ({
        day,
        date: weekDates[index],
        studyTime: 0,
        xpEarned: 0,
        sessionCount: 0,
        sessions: []
      }));

      // Process sessions for this week
      sessionsResponse.forEach(session => {
        const sessionDate = new Date(session.completedAt || session.createdAt);
        
        // Check if session is in current week
        const dayIndex = weekDates.findIndex(date => {
          const nextDay = new Date(date);
          nextDay.setDate(date.getDate() + 1);
          return sessionDate >= date && sessionDate < nextDay;
        });

        if (dayIndex !== -1) {
          const dayData = weekData[dayIndex];
          
          // Calculate study time (in minutes)
          const studyTime = calculateSessionStudyTime(session);
          dayData.studyTime += studyTime;
          
          // Calculate XP earned
          const xpEarned = calculateXPEarned(session);
          dayData.xpEarned += xpEarned;
          
          // Increment session count
          dayData.sessionCount += 1;
          
          // Store session for potential tooltip/details
          dayData.sessions.push({
            type: session.sessionType,
            title: getActivityTitle(session),
            time: studyTime,
            xp: xpEarned
          });
        }
      });

      // Clean up the data (remove sessions array for state)
      const cleanWeekData = weekData.map(({ sessions, date, ...day }) => day);
      
      setWeeklyProgress(cleanWeekData);
      
    } catch (error) {
      console.error('Error generating weekly progress:', error);
      // Fallback to empty week
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const emptyWeek = days.map(day => ({
        day,
        studyTime: 0,
        xpEarned: 0,
        sessionCount: 0
      }));
      setWeeklyProgress(emptyWeek);
    }
  };

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id || !token) return;
      
      try {
        setLoading(true);
        
        // Fetch user progress/level data
        const levelData = await getLevel(user._id);
        
        // Fetch recent study sessions
        const sessionsResponse = await getSessions();
        
        // Fetch user stats
        const statsResponse = await getStats();
        
        // Fetch sheets and quizzes count
        const [allSheets, allQuizzes] = await Promise.all([
          getAllSheets(),
          getAllQuiz()
        ]);
        
        // Calculate weekly total study time
        let weeklyStudyTime = 0;
        if (sessionsResponse && sessionsResponse.length > 0) {
          const now = new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          
          weeklyStudyTime = sessionsResponse
            .filter(session => new Date(session.createdAt) >= oneWeekAgo)
            .reduce((total, session) => total + calculateSessionStudyTime(session), 0);
        }
        
        // Process level data
        if (levelData) {
          setUserData({
            level: levelData.level || 1,
            experience: levelData.currentXP || 0,
            experienceToNext: levelData.xpForNextLevel || 100,
            streak: levelData.streak || { current: 0, longest: 0 },
            totalStudyTime: weeklyStudyTime, // Use weekly time instead of total
            sheetsCreated: allSheets?.length || 0,
            quizzesCompleted: allQuizzes?.length || 0,
            achievements: []
          });
        }
        
        // Process recent activity
      // Process recent activity
if (sessionsResponse) {
  // Remove duplicates based on session ID
  const uniqueSessions = sessionsResponse.filter((session, index, self) => 
    index === self.findIndex(s => s._id === session._id)
  );
  
  const formattedActivity = uniqueSessions.slice(0, 10).map(session => ({
    id: session._id,
    type: getActivityType(session.sessionType),
    title: getActivityTitle(session),
    score: session.results?.score,
    xpEarned: calculateXPEarned(session),
    timestamp: formatTimestamp(session.completedAt || session.createdAt),
    difficulty: session.results?.difficulty || 'medium'
  }));
  setRecentActivity(formattedActivity);
}
        
        // Generate dynamic data
        await Promise.all([
          generateDynamicTopicData(),
          generateDynamicWeeklyProgress()
        ]);
        
        // Calculate achievements after all data is processed
        setTimeout(() => {
          const tempUserData = {
            level: levelData?.level || 1,
            experience: levelData?.currentXP || 0,
            experienceToNext: levelData?.xpForNextLevel || 100,
            streak: levelData?.streak || { current: 0, longest: 0 },
            totalStudyTime: Math.floor(weeklyStudyTime / 60), // Convert to hours for achievements
            sheetsCreated: allSheets?.length || 0,
            quizzesCompleted: allQuizzes?.length || 0,
            achievements: []
          };
          
          const calculatedAchievements = calculateAchievements(
            tempUserData,
            recentActivity,
            topicProgress,
            weeklyProgress
          );
          
          setUserData(prev => ({
            ...prev,
            achievements: calculatedAchievements
          }));
        }, 1000);
        
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);

  const levelProgress = userData.experienceToNext > userData.experience 
    ? ((userData.experience - Math.max(0, userData.experienceToNext - 750)) / 750) * 100 
    : 100;

  const getActivityIcon = (type) => {
    const icons = {
      'quiz_completed': <Target className="w-4 h-4" />,
      'sheet_created': <BookOpen className="w-4 h-4" />,
      'quiz_generated': <Zap className="w-4 h-4" />,
      'ai_interaction': <Brain className="w-4 h-4" />,
      'sheet_evaluated': <CheckCircle className="w-4 h-4" />
    };
    return icons[type] || <Activity className="w-4 h-4" />;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'easy': 'text-green-400',
      'medium': 'text-yellow-400',
      'hard': 'text-red-400'
    };
    return colors[difficulty] || 'text-slate-400';
  };

  const getMasteryColor = (mastery) => {
    if (mastery >= 90) return 'bg-emerald-500'; // Excellent
    if (mastery >= 70) return 'bg-green-500';   // Good
    if (mastery >= 50) return 'bg-yellow-500';  // Average
    if (mastery >= 30) return 'bg-orange-500';  // Needs work
    return 'bg-red-500'; // Beginner
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      'quiz_completed': 'bg-blue-500/20 text-blue-400',
      'sheet_created': 'bg-green-500/20 text-green-400',
      'quiz_generated': 'bg-purple-500/20 text-purple-400',
      'ai_interaction': 'bg-yellow-500/20 text-yellow-400',
      'sheet_evaluated': 'bg-pink-500/20 text-pink-400'
    };
    return colors[type] || 'bg-slate-500/20 text-slate-400';
  };

  // Enhanced Weekly Progress Chart Component
  const WeeklyProgressChart = () => {
    const maxStudyTime = Math.max(...weeklyProgress.map(d => d.studyTime), 1);
    const maxXP = Math.max(...weeklyProgress.map(d => d.xpEarned), 1);
    const totalWeekTime = weeklyProgress.reduce((sum, day) => sum + day.studyTime, 0);
    const totalWeekXP = weeklyProgress.reduce((sum, day) => sum + day.xpEarned, 0);

    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Weekly Progress</h3>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Study Time</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>XP Earned</span>
            </div>
          </div>
        </div>

        {/* Week Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-sm text-slate-400">XP Earned</div>
            <div className="text-lg font-semibold text-white">{totalWeekXP}</div>
            <div className="text-xs text-slate-500">Experience Points</div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="flex items-end justify-between space-x-2 h-32 mb-4">
          {weeklyProgress.map((day, index) => {
            const studyHeight = maxStudyTime > 0 ? (day.studyTime / maxStudyTime) * 100 : 0;
            const xpHeight = maxXP > 0 ? (day.xpEarned / maxXP) * 80 : 0; // Slightly smaller for visual distinction
            
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-xs rounded-lg p-2 whitespace-nowrap z-10 shadow-lg">
                  <div className="font-semibold">{day.day}</div>
                  <div>Study Time: {day.studyTime}m</div>
                  <div>XP Earned: {day.xpEarned}</div>
                  <div>Sessions: {day.sessionCount}</div>
                </div>
                
                {/* Bars Container */}
                <div className="w-full flex space-x-1 items-end h-24">
                  {/* Study Time Bar */}
                  <div className="flex-1 bg-slate-800 rounded-t-sm overflow-hidden">
                    <div 
                      className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-500"
                      style={{ height: `${Math.max(studyHeight, day.studyTime > 0 ? 8 : 0)}px` }}
                    />
                  </div>
                  
                  {/* XP Bar */}
                  <div className="flex-1 bg-slate-800 rounded-t-sm overflow-hidden">
                    <div 
                      className="bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm transition-all duration-500"
                      style={{ height: `${Math.max(xpHeight, day.xpEarned > 0 ? 6 : 0)}px` }}
                    />
                  </div>
                </div>
                
                {/* Day Label */}
                <div className="text-xs text-slate-400 mt-2 font-medium">{day.day}</div>
                
                {/* Activity Indicator */}
                {day.sessionCount > 0 && (
                  <div className="w-1 h-1 bg-green-400 rounded-full mt-1"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Week Stats */}
        <div className="flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-slate-800">
          <div>
            {weeklyProgress.filter(day => day.sessionCount > 0).length}/7 active days
          </div>
          <div>
            Avg: {Math.round(totalWeekTime / 7)}m/day
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isCheckingAuth || !isAuthenticated || !user?.isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 ">
      <Navbar />
<div className="max-w-7xl mx-auto pt-5">
        
        {/* Header with Daily Quote */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 text-center ">
            Welcome back, {user?.name || "Student"}!
          </h1>
          
          {/* Daily Motivational Quote */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="text-sm text-blue-300 font-medium mb-1">Daily Inspiration</div>
                <p className="text-white text-sm italic leading-relaxed">"{dailyQuote}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Moved to top */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={"/generate-sheet"}
              className="block w-full flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-6 h-6 text-blue-400" />
                <span className="text-white font-medium">Create New Sheet</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>

            <Link
              href={"/sheets"}
              className="block w-full flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-green-400" />
                <span className="text-white font-medium">Take a Quiz</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>

            <Link
              href={"/chatbot"}
              className="block w-full flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 text-purple-400" />
                <span className="text-white font-medium">AI Study Chat</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Level & XP Card (Bigger) */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Level Info */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white">{userData.level}</div>
                    <div className="text-lg text-purple-300">Level</div>
                  </div>
                </div>
                <div className="text-slate-400">
                  Keep pushing forward! You're doing amazing.
                </div>
              </div>
              
              {/* XP Progress */}
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-slate-300">Experience Progress</span>
                  <span className="text-purple-300 font-semibold">
                    {userData.experience} / {userData.experienceToNext} XP
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.max(levelProgress, 5)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{Math.round(levelProgress)}% to next level</span>
                  <span>{userData.experienceToNext - userData.experience} XP needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{userData.streak.current}</div>
                <div className="text-sm text-orange-300">Day Streak</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Best: {userData.streak.longest} days
            </div>
          </div>

          {/* Time Spent This Week Card */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{Math.round(userData.totalStudyTime)}m</div>
                <div className="text-sm text-blue-300">Time This Week</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Keep up the great work!
            </div>
          </div>

          {/* Sheets & Quizzes Card */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{userData.sheetsCreated}</div>
                <div className="text-sm text-green-300">Sheets Created</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              {userData.quizzesCompleted} quizzes completed
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
              </div>
              
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityTypeColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-white">{activity.title}</div>
                        <div className="text-sm text-slate-400 flex items-center space-x-2">
                          <span>{activity.timestamp}</span>
                          {activity.score && (
                            <>
                              <span>•</span>
                              <span>Score: {activity.score}%</span>
                            </>
                          )}
                          {activity.difficulty && (
                            <>
                              <span>•</span>
                              <span className={getDifficultyColor(activity.difficulty)}>
                                {activity.difficulty}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-green-400 font-medium">+{activity.xpEarned} XP</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No recent activity</p>
                    <p className="text-slate-500 text-sm">Start studying to see your progress here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <WeeklyProgressChart />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Topic Mastery */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Topic Mastery</h3>
                <Brain className="w-5 h-5 text-slate-400" />
              </div>
              
              <div className="space-y-4">
                {topicProgress.length > 0 ? (
                  topicProgress.map((topic) => (
                    <div key={topic.topic}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{topic.topic}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-sm">{topic.mastery}%</span>
                          {topic.mastery >= 100 && (
                            <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <span className="text-xs">★</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 mb-1">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getMasteryColor(topic.mastery)}`}
                          style={{ width: `${Math.min(topic.mastery, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-500">
                        {topic.sessions} sheet{topic.sessions !== 1 ? 's' : ''} • {topic.lastStudied}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No study sheets yet</p>
                    <p className="text-slate-500 text-xs">Create sheets to track your mastery!</p>
                  </div>
                )}
              </div>
              
              {topicProgress.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-500">
                    💡 Each sheet adds 10% mastery to its domain
                  </div>
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Recent Achievements</h3>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-slate-400" />
                  <span className="text-xs text-slate-400">{userData.achievements.length}</span>
                </div>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {userData.achievements.slice(0, 20).map((achievement, index) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
                
                {userData.achievements.length === 0 && (
                  <div className="text-center py-4">
                    <Award className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No achievements yet</p>
                    <p className="text-slate-500 text-xs">Keep studying to earn your first badge!</p>
                  </div>
                )}
                
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;