import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,        // good practice
      lowercase: true,   // good practice
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      firstName: String,
      lastName: String,
      age: Number,
      avatar: String,
    },
    preferences: {
      difficultyPreference: {
        type: String,
        enum: ["easy", "medium", "hard", "adaptive"],
        default: "adaptive",
      },
      dailyGoal: {
        type: Number,
        default: 30, // minutes per day
      },
    },
    stats: {
      totalStudyTime: { type: Number, default: 0 },
      totalQuizzesTaken: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      lastStudyDate: { type: Date },
    },
  },
  { timestamps: true } // ✅ correct placement
);

const User = mongoose.model("User", UserSchema);
export default User;