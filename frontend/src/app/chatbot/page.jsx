"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import { generateResponse, getUserChats, deleteResponse } from '../../store/chatbotStore';
import { Send, Trash2, MessageSquare, Bot, User } from "lucide-react";
import Navbar from "../../components/Navbar"

const Chatbot = () => {
  const { user, isAuthenticated, isCheckingAuth, checkAuth, logout } = useAuthStore();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  // Authentication
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Checking Auth
  useEffect(() => {
    if (!isCheckingAuth) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (isAuthenticated && !user?.isVerified) {
        router.replace("/verify-email");
      }
    }
  }, [isAuthenticated, user, isCheckingAuth, router]);

  // Fetch Data
  useEffect(() => {
    if (isAuthenticated && user?.isVerified && !isCheckingAuth) {
      const fetchChats = async () => {
        setLoadingChats(true);
        setError(null);
        try {
          const data = await getUserChats();
          setChats(data.chatHistory);
        } catch (error) {
          console.error("Failed to fetch chats:", error);
          setError("Failed to load chats. Please try again.");
          
          if (error.response?.status === 401) {
            logout();
            router.replace("/login");
          }
        } finally {
          setLoadingChats(false);
        }
      };

      fetchChats();
    }
  }, [isAuthenticated, user?.isVerified, isCheckingAuth, logout, router]);

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const sendReply = async () => {
    if (!prompt.trim()) return;

    try {
      setLoadingReply(true);
      const response = await generateResponse(prompt);
      
      // Refetch chats to get updated conversation
      const updatedChats = await getUserChats();
      setChats(updatedChats.chatHistory);
      
      setPrompt(""); // Clear input
    } catch (error) {
      console.log("error", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoadingReply(false);
    }
  };

  const deleteConversation = async () => {
    try {
      setLoadingDelete(true);
      await deleteResponse();
      setChats([]); // Clear local chats
      setError(null);
    } catch (error) {
      console.error("Error", error);
      setError("Failed to delete conversation.");
    } finally {
      setLoadingDelete(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user?.isVerified) {
    return null;
  }

  return (
    <>
      {/* Fixed Full-Screen Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(15, 23, 42, 1) 0%,
              rgba(30, 58, 138, 0.3) 25%,
              rgba(79, 70, 229, 0.2) 50%,
              rgba(168, 85, 247, 0.2) 75%,
              rgba(15, 23, 42, 1) 100%
            )
          `
        }}
      >
        {/* Animated Elements */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Navbar */}
        <Navbar />

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col">
            {/* User Profile */}
            <div className="p-6 border-b border-slate-800/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {user?.name || 'User'}
                  </h3>
                  <p className="text-slate-400 text-sm">AI Assistant Chat</p>
                </div>
              </div>
            </div>

            {/* Chat Info */}
            <div className="p-6 flex-1">
              <div className="bg-slate-800/30 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">AI Assistant</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  I'm here to help with questions about knowledge, education, business advice, and more. Feel free to ask me anything!
                </p>
              </div>

              {/* Chat Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Messages</span>
                  <span className="text-white">{chats.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Status</span>
                  <span className="text-green-400">Online</span>
                </div>
              </div>
            </div>

            {/* Clear Chat Button */}
            <div className="p-6 border-t border-slate-800/50">
              <button
                onClick={deleteConversation}
                disabled={loadingDelete || chats.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>{loadingDelete ? 'Clearing...' : 'Clear Conversation'}</span>
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">AI Assistant</h2>
                  <p className="text-slate-400 text-sm">Always here to help</p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingChats ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-400">Loading conversation...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : chats.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Start a Conversation
                    </h3>
                    <p className="text-slate-400">
                      Ask me anything! I'm here to help with your questions.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {chats.map((chat, index) => (
                    <div
                      key={chat._id || index}
                      className={`flex space-x-3 ${
                        chat.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {chat.role !== 'user' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
                          chat.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-slate-800/50 text-slate-100 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {chat.content}
                        </p>
                      </div>

                      {chat.role === 'user' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {loadingReply && (
                    <div className="flex space-x-3 justify-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-800/50 text-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-t border-slate-800/50 p-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={prompt}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={loadingReply}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={sendReply}
                  disabled={loadingReply || !prompt.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loadingReply ? 'Sending...' : 'Send'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </>
  );
};

export default Chatbot;