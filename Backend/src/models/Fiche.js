import mongoose from "mongoose";

const FicheSchema = new mongoose.Schema(
  {
    title: { type: String , required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classification: {
      domain: {
        type: String,
        enum: [
          "mathematics","math", "physics", "chemistry", "biology",
          "history", "geography", "literature", "philosophy",
          "computer_science", "economics", "law", "medicine",
          "psychology", "sociology", "art", "music", "other"
        ],
        lowercase: true,
        trim: true
      },
      difficulty: { type: String, enum: ["easy","medium","hard"], default: "medium" },
      topics: { type: [String], default: [] },
      estimatedStudyTime: Number
    },
    qualityScore: {
      score: { type: Number, min: 0, max: 100 },
      criteria: {
        clarity: { type: Number, default: 0 },
        coherence: { type: Number, default: 0 },
        completeness: { type: Number, default: 0 },
        structure: { type: Number, default: 0 }
      },
      feedback: String
    },


  },

  { timestamps: true }
);

// Indexes for search performance
FicheSchema.index({ "classification.domain": 1, "classification.difficulty": 1 });
FicheSchema.index({ author: 1, createdAt: -1 });
FicheSchema.index({ "classification.topics": 1 });

const Fiche = mongoose.model("Fiche", FicheSchema);
export default Fiche;
