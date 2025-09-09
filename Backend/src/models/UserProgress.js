import mongoose from "mongoose";

const topicProgressSchema = new mongoose.Schema({
topic: String,
  domain: String,
  mastery: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastStudied: Date,
  totalTime: { type: Number, default: 0 }, // en minutes
  sessionsCount: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 }
});

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Progression par sujet
  topicProgress: [topicProgressSchema],

  // Progression globale
  overall: {
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    totalStudyTime: { type: Number, default: 0 },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastStudyDate: Date
    }
  },

  // Badges et récompenses
  achievements: [{
    badgeId: String,
    name: String,
    description: String,
    earnedAt: Date,
    category: {
      type: String,
      enum: ['study_time', 'streak', 'score', 'completion', 'exploration',"level"]
    }
  }],

  // Recommandations IA
  recommendations: {
    nextTopics: [String],
    suggestedFiches: [mongoose.Schema.Types.ObjectId],
    studyPlan: [{
      topic: String,
      priority: Number,
      estimatedTime: Number,
      reason: String
    }],
    lastUpdated: Date
  }
}, {
  timestamps: true
});
const userProgress=mongoose.model("UserProgress", userProgressSchema);
export default userProgress;
