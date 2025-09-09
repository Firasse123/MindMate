"use client";

import React from 'react';
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../store/authStore.js";
import { Loader, RefreshCw } from 'lucide-react';
import toast from "react-hot-toast";

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  const router = useRouter();
  const { verifyEmail, error, isLoading, clearError, user } = useAuthStore();

  // Clear error when user types
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [code, clearError]);

  // Check if user is already authenticated
  useEffect(() => {
    if (user && user.isVerified) {
      router.push("/login"); // redirect to login if already verified
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      return;
    }
    
    try {
      await verifyEmail(verificationCode);
      
      // Small delay to show toast before redirect
      setTimeout(() => {
        router.push("/login"); // Redirect to login after verification
      }, 1000);
      
    } catch (error) {
      console.log("Verification error:", error);
      // Error is handled by store
    }
  };
  

  const handleChange = (index, value) => {
    const newCode = [...code];
    
    if (value.length > 1) {
      // Handle paste - take first 6 characters
      const pasteCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pasteCode[i] || "";
      }
      setCode(newCode);
      
      // Focus next empty field or last field
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else if (/^\d*$/.test(value)) {
      // Only allow digits
      newCode[index] = value;
      setCode(newCode);
      
      // Auto-focus next field on input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && code.every(digit => digit !== "")) {
      handleSubmit(e);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      // You'll need to implement this in your auth store
      // await resendVerificationCode();
      toast.success("Verification code resent!");
    } catch (error) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const isFormValid = code.every(digit => digit !== "" && /^\d$/.test(digit));

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
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
            Verify Your Email
          </h2>
          
          <p className='text-center text-gray-300 mb-6'>
            Enter the 6-digit code sent to your email address.
          </p>
          
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='flex justify-between' role="group" aria-label="Verification code input">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type='text'
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className='w-12 h-12 text-center text-2xl font-bold text-white rounded-lg focus:outline-none transition duration-200 disabled:opacity-50'
                  style={{
                    backgroundColor: 'rgba(22, 12, 60, 0.7)',
                    border: '2px solid rgba(83, 180, 238, 0.3)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#53B4EE';
                    e.target.style.boxShadow = '0 0 0 2px rgba(83, 180, 238, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(83, 180, 238, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                  aria-label={`Digit ${index + 1} of verification code`}
                />
              ))}
            </div>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 font-semibold mt-2 p-3 rounded-lg text-center"
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
              type='submit'
              disabled={isLoading || !isFormValid}
              className='w-full font-bold py-3 px-4 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              style={{
                background: `linear-gradient(to right, #53B4EE, #57AFF0)`,
                color: 'white',
                focusRingColor: '#53B4EE',
                focusRingOffsetColor: '#180C3D'
              }}
              aria-label={isLoading ? "Verifying email..." : "Verify email"}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className='animate-spin mr-2' size={20}/>
                  Verifying...
                </div>
              ) : (
                "Verify Email"
              )}
            </motion.button>
          </form>
          
          <div className="mt-6 flex justify-center">
            <div
              className="px-4 py-3 rounded-lg shadow-sm"
              style={{
                backgroundColor: 'rgba(83, 180, 238, 0.1)', 
                border: '1px solid rgba(83, 180, 238, 0.3)', 
              }}
            >
              <p className="text-blue-400 font-semibold text-sm mb-1">
                Didn't receive the code?
              </p>
              <p className="text-gray-300 text-xs">
                Please check your spam folder or wait a few minutes before trying again.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;