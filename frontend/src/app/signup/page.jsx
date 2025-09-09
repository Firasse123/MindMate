"use client";

import { motion } from "framer-motion";
import Input from "../../components/Input.jsx";
import { User, Mail, Lock, Loader, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter.jsx"
import { useAuthStore } from "../../store/authStore.js";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { signup, error, isLoading, clearError } = useAuthStore();

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [name, email, password, clearError]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

const isPasswordStrong = (password) => {
  return (
    password.length >= 6 &&
    /[A-Z]/.test(password) &&  // contains uppercase
    /[a-z]/.test(password) &&  // contains lowercase
    /\d/.test(password) &&     // contains digit
    /[!@#$%^&*(),.?":{}|<>]/.test(password) // contains special character
  );
};

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return; 
    }
    
    if (!email.trim() || !isValidEmail(email)) {
      return; 
    }
    
    if (!password.trim() || !isPasswordStrong(password)) {
      return; 
    }
    
    try {
      await signup(email, password, name.trim());
      
      setShowSuccess(true);
      
      setName("");
      setEmail("");
      setPassword("");
      
      setTimeout(() => {
        router.push("/verify-email");
      }, 1500);
      
    } catch (error) {
      console.log("Signup error:", error);
    }
  };

  // Success state with centering wrapper
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className='max-w-md w-full backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-opacity-20 p-8 text-center relative z-10'
          style={{ 
            backgroundColor: 'rgba(30, 20, 80, 0.85)',
            borderColor: '#53B4EE'
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CheckCircle className="mx-auto mb-4 text-green-400" size={64} />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2 text-white">Account Created!</h2>
          <p className="text-gray-300 mb-4">Please check your email to verify your account.</p>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-blue-500 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Main signup form with centering wrapper
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
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(to right, #53B4EE, #57AFF0)`
              }}>
            Create Account
          </h2>
          
          <form onSubmit={handleSignUp}>
            <Input 
              icon={User} 
              type="text" 
              placeholder="Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-label="Full Name"
              disabled={isLoading}
            />
            <Input 
              icon={Mail} 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email Address"
              disabled={isLoading}
            />
            <Input 
              icon={Lock} 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
              disabled={isLoading}
            />
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 font-semibold mt-2 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                role="alert"
                aria-live="polite"
              >
                {error}
              </motion.div>
            )}
            
            <PasswordStrengthMeter password={password}/>
            
            <motion.button 
              className="mt-5 w-full py-3 px-4 text-white font-bold rounded-lg shadow-lg 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #53B4EE, #57AFF0)`,
                focusRingColor: '#53B4EE',
                focusRingOffsetColor: '#180C3D'
              }}
              whileHover={!isLoading ? { 
                scale: 1.02,
                background: `linear-gradient(to right, #4A9FD9, #4E9EDB)`
              } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              type='submit'
              disabled={isLoading || !name.trim() || !email.trim() || !password.trim() || !isValidEmail(email) || !isPasswordStrong(password)}
              aria-label={isLoading ? "Creating account..." : "Create account"}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className='animate-spin mr-2' size={20}/>
                  Creating Account...
                </div>
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </form>
        </div>
        
        <div className="px-8 py-4 flex justify-center"
             style={{ backgroundColor: 'rgba(22, 12, 60, 0.8)' }}>
          <p className="text-sm text-gray-300">
            Already have an account?{" "}
            <Link href="/login" className="hover:underline transition-colors duration-200"
                  style={{ color: '#53B4EE' }}>
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;