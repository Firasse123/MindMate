import mongoose from "mongoose";
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [String], // Pour QCM
  correctAnswer: mongoose.Schema.Types.Mixed, // String, Boolean, ou Array
  explanation: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 1
  }
});

const quizSchema = new mongoose.Schema({
  title: String,
  fiche: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fiche',
    required: true
  },
   user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  
  // Configuration du quiz
  config: {
    timeLimit: Number, // en minutes
    passingScore: { type: Number, default: 70 }, // pourcentage
    shuffleQuestions: { type: Boolean, default: true },
    showCorrectAnswers: { type: Boolean, default: true },
    allowRetries: { type: Boolean, default: true }
  },

  // Métadonnées de génération IA
}, {
  timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;