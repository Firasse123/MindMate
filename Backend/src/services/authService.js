import bcryptjs from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "./emailService.js";
import { generateToken } from "../utils/generateToken.js"


export const createUser = async ({ email, password, name }) => {
    if (!email || !password || !name) throw new Error("All fields are required");

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) throw new Error("User already exists");

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
        email,
        password: hashedPassword,
        name,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    await user.save();
    await sendVerificationEmail(user.email, verificationToken);

    return user;
};

export const verifyUserEmail = async (code) => {
    const user = await User.findOne({
        verificationToken: code,
        verificationTokenExpiresAt: { $gt: Date.now() }
    });

    if (!user) throw new Error("Invalid or expired verification code");

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);
    return user;
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    user.lastLogin = new Date();
    await user.save();

    return user;
};

export const forgotPasswordService = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();
    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    return resetToken;
};

export const resetPasswordService = async (token, newPassword) => {
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) throw new Error("Invalid or expired reset token");

    user.password = await bcryptjs.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();
    await sendResetSuccessEmail(user.email);

    return user;
};

export const checkAuthService = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("User not found");
    return user;
};
