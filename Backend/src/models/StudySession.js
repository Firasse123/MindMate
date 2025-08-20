import mongoose from "mongoose";
const answerSchema =new mongoose.Schema({
      questionId: mongoose.Schema.Types.ObjectId,
      userAnswer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      timeSpent: Number,
      attempts: { type: Number, default: 1 }
});
const studySessionSchema=new mongoose.Schema({
      user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:True},
      fiche:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Fiche",
            required:True
      },
      quiz:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Quiz",
            required:True
      },
        sessionType: {
    type: String,
    enum: ['study', 'quiz', 'review', 'ai_chat'],
    required: true
  },
  answers:[answerSchema],
    results: {
    score: Number, // pourcentage
    totalQuestions: Number,
    correctAnswers: Number,
    timeSpent: Number, // en minutes
    completionRate: Number // pourcentage
  },
    aiInteraction: {
    messagesExchanged: Number,
    helpRequested: Number,
    explanationsViewed: [String], // IDs des questions expliquées
    personalizedPath: {
      recommendedTopics: [String],
      suggestedDifficulty: String,
      nextActions: [String]
    }
  },  // Statut de la session
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },

  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});
// Index pour les requêtes de performance utilisateur
studySessionSchema.index({ user: 1, createdAt: -1 });
studySessionSchema.index({ fiche: 1, createdAt: -1 });

const studySessionModel = mongoose.model("StudySession", studySessionSchema);
export default studySessionModel;
