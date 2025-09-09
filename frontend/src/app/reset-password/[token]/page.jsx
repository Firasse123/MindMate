"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../../store/authStore";
import { useParams, useRouter } from "next/navigation";
import Input from "../../../components/Input";
import { Lock, Loader, CheckCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordMatch, setShowPasswordMatch] = useState(false);
  const { isLoading, resetPassword, error, clearError } = useAuthStore();
  const params = useParams();
  const router = useRouter();

  const token = (params.token).split(/[%\s]/)[0];

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [password, confirmPassword, clearError]);

  useEffect(() => {
    setShowPasswordMatch(confirmPassword.length > 0);
  }, [confirmPassword]);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      router.push("/forgot-password");
    }
  }, [token, router]);

  const isPasswordStrong = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  };

  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;
  const isFormValid =
    password && confirmPassword && isPasswordStrong(password) && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isPasswordStrong(password)) {
      toast.error(
        "Password must be at least 8 characters with uppercase, lowercase, and number"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetPassword(token, password);
      toast.success("Password reset successfully!");

      // Clear form
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      if (!error.response?.data?.message) {
        toast.error("Error resetting password. Please try again.");
      }
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-opacity-20"
        style={{
          backgroundColor: "rgba(30, 20, 80, 0.85)",
          borderColor: "#53B4EE",
        }}
      >
        <div className="p-8">
          <h2
            className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(to right, #53B4EE, #57AFF0)`,
            }}
          >
            Reset Password
          </h2>

          <p className="text-center text-gray-300 mb-6">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} aria-label="Reset password form">
            <Input
              icon={Lock}
              value={password}
              placeholder="New Password"
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              disabled={isLoading}
              aria-label="New Password"
              autoComplete="new-password"
            />

            {password && (
              <div
                className="mb-4 p-3 rounded-lg"
                style={{ backgroundColor: "rgba(22, 12, 60, 0.5)" }}
              >
                <p className="text-xs text-gray-400 mb-2">
                  Password must contain:
                </p>
                <div className="space-y-1">
                  <div
                    className={`text-xs flex items-center ${
                      password.length >= 8 ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    <CheckCircle
                      className={`mr-2 ${
                        password.length >= 8 ? "opacity-100" : "opacity-30"
                      }`}
                      size={12}
                    />
                    At least 8 characters
                  </div>
                  <div
                    className={`text-xs flex items-center ${
                      /[A-Z]/.test(password)
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    <CheckCircle
                      className={`mr-2 ${
                        /[A-Z]/.test(password) ? "opacity-100" : "opacity-30"
                      }`}
                      size={12}
                    />
                    One uppercase letter
                  </div>
                  <div
                    className={`text-xs flex items-center ${
                      /[a-z]/.test(password)
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    <CheckCircle
                      className={`mr-2 ${
                        /[a-z]/.test(password) ? "opacity-100" : "opacity-30"
                      }`}
                      size={12}
                    />
                    One lowercase letter
                  </div>
                  <div
                    className={`text-xs flex items-center ${
                      /\d/.test(password)
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    <CheckCircle
                      className={`mr-2 ${
                        /\d/.test(password) ? "opacity-100" : "opacity-30"
                      }`}
                      size={12}
                    />
                    One number
                  </div>
                </div>
              </div>
            )}

            <Input
              icon={Lock}
              value={confirmPassword}
              placeholder="Confirm New Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              required
              disabled={isLoading}
              aria-label="Confirm New Password"
              autoComplete="new-password"
            />

            {showPasswordMatch && (
              <div className="mb-4 flex items-center text-sm">
                {passwordsMatch ? (
                  <div className="flex items-center text-green-400">
                    <CheckCircle size={16} className="mr-2" />
                    Passwords match
                  </div>
                ) : (
                  <div className="flex items-center text-red-400">
                    <X size={16} className="mr-2" />
                    Passwords don't match
                  </div>
                )}
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 font-semibold mb-4 p-3 rounded-lg"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                role="alert"
                aria-live="polite"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={
                !isLoading && isFormValid
                  ? {
                      scale: 1.02,
                      background: `linear-gradient(to right, #4A9FD9, #4E9EDB)`,
                    }
                  : {}
              }
              whileTap={
                !isLoading && isFormValid ? { scale: 0.98 } : {}
              }
              className="w-full py-3 px-4 text-white font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #53B4EE, #57AFF0)`,
                focusRingColor: "#53B4EE",
                focusRingOffsetColor: "#180C3D",
              }}
              type="submit"
              disabled={isLoading || !isFormValid}
              aria-label={isLoading ? "Resetting password..." : "Reset password"}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className="animate-spin mr-2" size={20} />
                  Resetting...
                </div>
              ) : (
                "Reset Password"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
