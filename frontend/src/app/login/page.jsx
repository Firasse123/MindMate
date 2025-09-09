"use client";

import React from 'react';
import { useState, useEffect } from "react";
import Input from "../../components/Input";
import { Mail, Lock, Loader } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuthStore } from "../../store/authStore.js";
import { useRouter } from 'next/navigation';
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading, clearError, isAuthenticated ,user} = useAuthStore();
  const router = useRouter();

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, clearError]);

  // Redirect if already authenticated
useEffect(() => {
  if (isAuthenticated && user?.isVerified) {
    router.replace("/dashboard");
  } else if (isAuthenticated && !user?.isVerified) {
    router.replace("/verify-email");
  }
}, [isAuthenticated, user, router]);

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const isFormValid = email.trim() && password.trim() && isValidEmail(email) && password.length >= 6;

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    try {
      const data = await login(email.trim(), password); // data contains user and token
    console.log("Logged-in user ID:", data.user._id);
      
    } catch (error) {
      console.log("Login error:", error);
      // Error is handled by store
    }
  };

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
            Welcome Back
          </h2>
          
          <form onSubmit={handleLogin} aria-label="Login form">
            <Input 
              icon={Mail} 
              type="email"
              value={email}
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              aria-label="Email Address"
              autoComplete="email"
            />
            
            <Input 
              icon={Lock} 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={isLoading}
              aria-label="Password"
              autoComplete="current-password"
              minLength={6}
            />
            
            <div className='flex items-center mb-6'>
              <Link 
                href="/forgot-password" 
                className='text-sm hover:underline transition-colors duration-200'
                style={{ color: '#53B4EE' }}
                tabIndex={isLoading ? -1 : 0}
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 font-semibold mb-4 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                role="alert"
                aria-live="polite"
              >
                {error}
              </motion.div>
            )}
            
            <motion.button 
              whileHover={!isLoading && isFormValid ? { scale: 1.02 } : {}} 
              whileTap={!isLoading && isFormValid ? { scale: 0.98 } : {}} 
              className='w-full py-3 px-4 text-white font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              style={{
                background: `linear-gradient(to right, #53B4EE, #57AFF0)`,
                focusRingColor: '#53B4EE',
                focusRingOffsetColor: '#180C3D'
              }}
              type='submit'
              disabled={isLoading || !isFormValid}
              aria-label={isLoading ? "Logging in..." : "Log in to your account"}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className='animate-spin mr-2' size={20}/>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </motion.button>
          </form>
        </div>
        
        <div className="px-8 py-4 flex justify-center"
             style={{ backgroundColor: 'rgba(22, 12, 60, 0.8)' }}>
          <p className='text-sm text-gray-300'>
            Don't have an account?{" "}
            <Link 
              href="/signup" 
              className='hover:underline transition-colors duration-200'
              style={{ color: '#53B4EE' }}
              tabIndex={isLoading ? -1 : 0}
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
      <Toaster position="top-center" />
    </div>
  );
};
export default Login;