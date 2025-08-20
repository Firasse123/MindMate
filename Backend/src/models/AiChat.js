import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user","assistant"], required: true },
  content: { type: String, required: true },
  metadata: {
    type: {
      type: String,
      enum: ["question","explanation","encouragement","suggestion","quiz_feedback"],
      default: "question"
    },
    relatedFiche: mongoose.Schema.Types.ObjectId,
    relatedQuestion: mongoose.Schema.Types.ObjectId,
    confidence: Number
  },
  timestamp: { type: Date, default: Date.now }
});

const aiSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studySession: { type: mongoose.Schema.Types.ObjectId, ref: "StudySession", required: true },
    messages: { type: [messageSchema], default: [] },
    context: {
      currentFiche: mongoose.Schema.Types.ObjectId,
      studyGoal: String,
      userLevel: String,
      focusAreas: { type: [String], default: [] }
    }
  },
  { timestamps: true }
);

aiSchema.index({ user: 1, studySession: 1, 'messages.timestamp': 1 });

const AI = mongoose.model("AI", aiSchema);
export default AI;
