import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    role:{
        type:String,enum:['user','assistant'],
        required:true
    },
    content:{
        type:String,
        required:true
    },
      metadata: {
    type: {
      type: String,
      enum: ['question', 'explanation', 'encouragement', 'suggestion', 'quiz_feedback']
    },
    relatedFiche: mongoose.Schema.Types.ObjectId,
    relatedQuestion: mongoose.Schema.Types.ObjectId,
    confidence: Number // Score de confiance de l'IA
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const aiSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:True
    },
    studySession:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"StudySession",
        required:true
    },
    messages:[messageSchema],
      context: {
    currentFiche: mongoose.Schema.Types.ObjectId,
    studyGoal: String,
    userLevel: String,
    focusAreas: [String]
  }, 
  timestamps: true
});
