import { timeStamp } from "console";
import mongoose from "mongoose";

const FicheSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
      author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
    classification:{
        domain:{
            type:String,
        enum:[
        'mathematics', 'physics', 'chemistry', 'biology',
        'history', 'geography', 'literature', 'philosophy',
        'computer_science', 'economics', 'law', 'medicine',
        'psychology', 'sociology', 'art', 'music', 'other'
      ]
        },
        difficulty:{
            type:String,
            enum:['easy', 'medium', 'hard'],
            default:"medium"
        },
          topics: [String], // Tags/mots-clés extraits par IA
    estimatedStudyTime: Number // en minutes
  },
    qualityScore: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    criteria: {
      clarity: Number,      // Clarté du contenu
      coherence: Number,    // Cohérence logique
      completeness: Number, // Complétude
      structure: Number     // Structure/organisation
    },
    feedback: String // Suggestions d'amélioration
  },
timeStamps:true});

// Index pour améliorer les performances de recherche
    FicheSchema.index({ 'classification.domain': 1, 'classification.difficulty': 1 });
    FicheSchema.index({ author: 1, createdAt: -1 });
    FicheSchema.index({ 'classification.topics': 1 });


const ficheModel=mongoose.model("Fiche",FicheSchema);
export default ficheModel;