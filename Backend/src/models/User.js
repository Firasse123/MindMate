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
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,

    // Nested objects should be inside the main schema object
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
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
