import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fiche: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fiche',
        required: true
    },
    questions: [{
        questionNumber: Number,
        question: String,
        type: {
            type: String,
            enum: ['multiple_choice', 'true_false', 'short_answer']
        },
        options: [String], // For multiple choice
        correctAnswer: String,
        explanation: String,
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard']
        },
        concept: String
    }],
    userAnswers: [{
        questionNumber: Number,
        answer: String
    }],
    results: [{
        questionNumber: Number,
        question: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        explanation: String,
        concept: String,
        difficulty: String
    }],
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    strengths: [String], // Array of concepts user is strong in
    weaknesses: [String], // Array of concepts user needs work on
    status: {
        type: String,
        enum: ['active', 'completed', 'expired'],
        default: 'active'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date
}, {
    timestamps: true
});

// Index for efficient queries
assessmentSchema.index({ user: 1, fiche: 1, status: 1 });
assessmentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Assessment', assessmentSchema);
