import { createUser, verifyUserEmail, loginUser, forgotPasswordService, resetPasswordService, checkAuthService } from "../services/authService.js";
import { generateToken } from "../utils/generateToken.js"

export const signup = async (req, res) => {
    try {
        const user = await createUser(req.body);
        const token = generateToken(user._id); // stateless JWT

        res.status(201).json({ 
            success: true, 
            message: "User created successfully", 
            user: { ...user._doc, password: undefined },
            token
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const user = await verifyUserEmail(req.body.code);
        res.status(200).json({ success: true, message: "Email verified successfully", user: { ...user._doc, password: undefined } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const user = await loginUser(req.body.email, req.body.password);
        const token = generateToken(user._id);

        res.status(200).json({ 
            success: true, 
            message: "Logged in successfully", 
            user: { ...user._doc, password: undefined },
            token
        });
    } catch (error) {
        // Check if it's a credentials error
        if (error.message === "Invalid credentials") {
            return res.status(401).json({ 
                success: false, 
                message: "Wrong email or password" 
            });
        }

        // Other unexpected errors
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
};



export const forgotPassword = async (req, res) => {
    try {
        await forgotPasswordService(req.body.email);
        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        await resetPasswordService(req.params.token, req.body.password);
        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const user = await checkAuthService(req.userId);
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
}
