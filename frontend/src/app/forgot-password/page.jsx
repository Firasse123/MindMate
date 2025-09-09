"use client";

import React from 'react'
import { useState, useEffect } from "react";
import { useAuthStore } from '../../store/authStore';
import Input from "../../components/Input"
import { ArrowLeft, Loader, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isLoading, forgotPassword, error, clearError } = useAuthStore();

  // Clear error when user types
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, clearError]);

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      await forgotPassword(email.trim());
      setIsSubmitted(true);
    } catch (error) {
      console.log("Forgot password error:", error);
      // Error is handled by store
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setEmail("");
    clearError();
  };

  const isFormValid = email.trim() && isValidEmail(email);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-md w-full backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-opacity-20 relative z-10'
        style={{ 
          backgroundColor: 'rgba(30, 20, 80, 0.85)',
          borderColor: '#53B4EE'
        }}
      >
        <div className='p-8'>
          <h2 className='text-3xl font-bold mb-6 text-center text-transparent bg-clip-text'
              style={{
                backgroundImage: `linear-gradient(to right, #53B4EE, #57AFF0)`
              }}>
            Forgot Password
          </h2>

          {!isSubmitted ? (
            <>
              <p className='text-gray-300 mb-6 text-center'>
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} aria-label="Password reset request form">
                <Input
                  icon={Mail} 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                  disabled={isLoading}
                  aria-label="Email Address"
                  autoComplete="email"
                />
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 font-semibold mt-2 mb-4 p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </motion.div>
                )}
                
                <motion.button
                  whileHover={!isLoading && isFormValid ? { 
                    scale: 1.02,
                    background: `linear-gradient(to right, #4A9FD9, #4E9EDB)`
                  } : {}}
                  whileTap={!isLoading && isFormValid ? { scale: 0.98 } : {}}
                  className='w-full py-3 px-4 text-white font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  style={{
                    background: `linear-gradient(to right, #53B4EE, #57AFF0)`,
                    focusRingColor: '#53B4EE',
                    focusRingOffsetColor: '#180C3D'
                  }}
                  type='submit'
                  disabled={isLoading || !isFormValid}
                  aria-label={isLoading ? "Sending reset link..." : "Send password reset link"}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader className='animate-spin mr-2' size={20}/>
                      Sending...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            <div className='text-center'>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className='w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'
                style={{ backgroundColor: '#53B4EE' }}
              >
                <Mail className='h-8 w-8 text-white' />
              </motion.div>
              
              <h3 className='text-xl font-semibold text-white mb-2'>Check Your Email</h3>
              <p className='text-gray-300 mb-6'>
                If an account exists for <span className='text-white font-medium'>{email}</span>, you will receive a password reset link shortly.
              </p>
              
              <div className='space-y-3'>
                <motion.button
                  onClick={handleTryAgain}
                  className='w-full py-2 px-4 text-sm font-medium rounded-lg border transition duration-200 hover:bg-opacity-10'
                  style={{
                    borderColor: '#53B4EE',
                    color: '#53B4EE'
                  }}
                  whileHover={{ backgroundColor: 'rgba(83, 180, 238, 0.1)' }}
                >
                  <RefreshCw className='inline-block mr-2' size={16} />
                  Try Different Email
                </motion.button>
                
                <p className='text-xs text-gray-400'>
                  Didn't receive an email? Check your spam folder or try again.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className='px-8 py-4 flex justify-center'
             style={{ backgroundColor: 'rgba(22, 12, 60, 0.8)' }}>
          <Link 
            href="/login" 
            className='text-sm hover:underline flex items-center transition-colors duration-200'
            style={{ color: '#53B4EE' }}
          >
            <ArrowLeft className='h-4 w-4 mr-2' /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;