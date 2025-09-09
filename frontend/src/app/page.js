"use client"
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, FileText, Target, Zap, ArrowRight, BookOpen, HelpCircle, Star, Users, Clock, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
const WelcomePage = () => {
const router=useRouter();
   const [showSplash, setShowSplash] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Single timer to handle splash screen
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, []); // Empty dependency array to run only once

  // Enhanced Splash Screen with 3D effects
  const SplashScreen = () => (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
    >
      {/* Simplified floating particles */}
      <div className="absolute inset-0">
        {isClient && [...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-60"
            style={{
              width: 4,
              height: 4,
              background: `#60a5fa`,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%'
            }}
            animate={{ 
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 3,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Simplified geometric background */}
      <div className="absolute inset-0 opacity-10">
        {isClient && [...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border border-blue-400/30"
            style={{
              width: 300 + i * 150,
              height: 300 + i * 150,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%'
            }}
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 20 + i * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="text-center relative z-10">
        {/* Simplified logo animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 1, 
            ease: "easeOut"
          }}
          className="mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-40"></div>
            <Brain className="w-32 h-32 mx-auto text-blue-400 drop-shadow-2xl relative z-10" />
          </div>
        </motion.div>

        {/* Animated welcome text with better effects */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1, ease: "easeOut" }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text mb-6"
            style={{
              backgroundImage: `linear-gradient(135deg, #8961FF, #53B4EE, #57AFF0, #8961FF, #53B4EE)`
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            MindMate
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.8, duration: 0.8 }}
            className="text-gray-300 text-xl md:text-2xl font-light"
          >
            Initializing AI-Powered Learning Experience...
          </motion.p>
        </motion.div>

        {/* Simplified loading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
          className="mt-12"
        >
          <motion.div
            className="w-64 h-2 bg-gray-800 rounded-full mx-auto mb-4 overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 2.7, duration: 1 }}
            />
          </motion.div>
          <div className="flex justify-center gap-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-blue-400"
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  delay: 3 + i * 0.3,
                  repeat: Infinity
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const features = [
    {
      Icon: FileText,
      title: "AI-Powered Creation",
      description: "Automatically generate comprehensive study sheets with intelligent suggestions and content optimization"
    },
    {
      Icon: Target,
      title: "Smart Classification", 
      description: "Intelligent assessment of subject domain, difficulty level, and content quality for better organization"
    },
    {
      Icon: HelpCircle,
      title: "Dynamic Quizzes",
      description: "Generate personalized quizzes and multiple-choice questions from your study materials"
    },
    {
      Icon: Brain,
      title: "AI Study Assistant",
      description: "Your personal interactive guide to optimize learning strategies and track progress"
    }
  ];

  const stats = [
    { icon: Brain, label: "AI Powered", value: "Advanced", color: "#53B4EE" },
    { icon: Clock, label: "Available", value: "24/7", color: "#57AFF0" },
    { icon: TrendingUp, label: "Personalized", value: "100%", color: "#53B4EE" },
    { icon: Users, label: "Students", value: "1000+", color: "#57AFF0" }
  ];

  const handleGetStarted = () => {
    router.push("/signup")
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="min-h-screen"
          >
            {/* Navigation Header */}
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full py-6 px-8 flex justify-between items-center relative z-10"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold text-white">MindMate</span>
              </div>
            </motion.nav>

            <div className="container mx-auto px-6 lg:px-12 py-12">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20 max-w-5xl mx-auto"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="mb-8"
                >
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <Brain className="w-24 h-24 mx-auto relative z-10 text-blue-400" />
                  </div>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-6xl lg:text-8xl font-bold mb-6 text-transparent bg-clip-text leading-tight"
                  style={{
                    backgroundImage: `linear-gradient(135deg, #53B4EE, #57AFF0, #9333EA)`
                  }}
                >
                  MindMate
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed"
                >
                  Your intelligent companion for personalized and effective study sessions
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
                >
                  Transform the way you learn with AI-powered study tools that adapt to your unique learning style
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                >
                  <motion.button
                    onClick={handleGetStarted}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 font-bold rounded-xl shadow-2xl text-white transition-all duration-300 flex items-center gap-3 group focus:outline-none focus:ring-4 focus:ring-blue-400/50"
                    style={{
                      background: `linear-gradient(135deg, #53B4EE, #57AFF0, #9333EA)`
                    }}
                  >
                    Get Started Free
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  <motion.button
                    onClick={handleSignIn}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 font-bold rounded-xl shadow-lg transition-all duration-300 border-2 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-400/50"
                    style={{
                      borderColor: '#53B4EE',
                      color: '#53B4EE',
                      backgroundColor: 'rgba(83, 180, 238, 0.15)'
                    }}
                  >
                  Login                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Features Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="mb-20"
              >
                <div className="text-center mb-16">
                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="text-4xl font-bold mb-4 text-white"
                  >
                    Powerful Features
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.6 }}
                    className="text-gray-400 text-lg max-w-2xl mx-auto"
                  >
                    Discover how MindMate revolutionizes your study experience with cutting-edge AI technology
                  </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + index * 0.15, duration: 0.6 }}
                      whileHover={{ y: -8, scale: 1.03 }}
                      className="group relative h-full"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                      <div 
                        className="relative p-8 rounded-xl backdrop-filter backdrop-blur-lg border border-opacity-30 shadow-2xl transition-all duration-300 h-full"
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          borderColor: '#53B4EE'
                        }}
                      >
                        {feature.Icon && (
                          <motion.div
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                            className="mb-6"
                          >
                            <feature.Icon 
                              className="w-14 h-14 text-blue-400" 
                            />
                          </motion.div>
                        )}
                        <h3 
                          className="text-xl font-bold mb-4 group-hover:text-blue-300 transition-colors"
                          style={{ color: '#57AFF0' }}
                        >
                          {feature.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.8 }}
                className="mb-20"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Trusted by Students Worldwide
                  </h2>
                  <p className="text-gray-400 text-lg">
                    Join thousands of learners already improving their study efficiency
                  </p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 2.4 + index * 0.1, duration: 0.6 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="text-center group"
                    >
                      <div 
                        className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center backdrop-blur-sm border-2 group-hover:shadow-xl transition-all duration-300"
                        style={{ 
                          backgroundColor: `${stat.color}15`,
                          borderColor: stat.color 
                        }}
                      >
                        <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
                      </div>
                      <div className="text-3xl font-bold mb-2" style={{ color: stat.color }}>
                        {stat.value}
                      </div>
                      <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Call to Action Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.8, duration: 0.8 }}
                className="text-center max-w-4xl mx-auto"
              >
                <div 
                  className="relative p-12 rounded-2xl backdrop-filter backdrop-blur-lg border border-opacity-20 shadow-2xl overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(83, 180, 238, 0.1)',
                    borderColor: '#53B4EE'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-600/10 animate-pulse"></div>
                  <div className="relative z-10">
                    <Star className="w-16 h-16 mx-auto mb-6 text-blue-400" />
                    <h2 className="text-4xl font-bold mb-6 text-white">
                      Ready to Transform Your Learning?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                      Join the revolution in AI-powered education. Start creating personalized study materials in minutes.
                    </p>
                    <motion.button
                      onClick={handleGetStarted}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-12 py-6 font-bold rounded-xl shadow-2xl text-white transition-all duration-300 flex items-center gap-3 mx-auto group text-lg focus:outline-none focus:ring-4 focus:ring-blue-400/50"
                      style={{
                        background: `linear-gradient(135deg, #53B4EE, #57AFF0, #9333EA)`
                      }}
                    >
                      Start Your Journey
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Footer */}
              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.2, duration: 0.8 }}
                className="mt-20 text-center border-t border-gray-700 pt-12"
              >
                <div className="flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto gap-6">
                  <div className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-blue-400" />
                    <span className="text-lg font-semibold text-white">MindMate</span>
                  </div>
                  
                  <p className="text-gray-400 text-center">
                    Revolutionize your learning experience with artificial intelligence
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <p className="text-gray-500 text-sm">
                    © 2025 MindMate. All rights reserved. Empowering students through intelligent technology.
                  </p>
                </div>
              </motion.footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WelcomePage