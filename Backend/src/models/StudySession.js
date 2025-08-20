import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  userAnswer: mongoose.Schema.Types.Mixed,
  isCorrect: Boolean,
  timeSpent: Number,
  attempts: { type: Number, default: 1 }
});

const studySessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fiche: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fiche",
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },
  sessionType: {
    type: String,
    enum: ["study", "quiz", "review", "ai_chat"],
    required: true
  },
  answers: { type: [answerSchema], default: [] },
  results: {
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    timeSpent: Number,
    completionRate: Number
  },
  aiInteraction: {
    messagesExchanged: { type: Number, default: 0 },
    helpRequested: { type: Number, default: 0 },
    explanationsViewed: { type: [String], default: [] },
    personalizedPath: {
      recommendedTopics: { type: [String], default: [] },
      suggestedDifficulty: { type: String, default: "medium" },
      nextActions: { type: [String], default: [] }
    }
  },
  status: {
    type: String,
    enum: ["in_progress", "completed", "abandoned"],
    default: "in_progress"
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date
}, { timestamps: true });

// Indexes for performance
studySessionSchema.index({ user: 1, createdAt: -1 });
studySessionSchema.index({ fiche: 1, createdAt: -1 });

const StudySession = mongoose.model("StudySession", studySessionSchema);
export default StudySession;
