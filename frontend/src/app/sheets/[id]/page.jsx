"use client";
import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/authStore";
import { showSheet } from "@/store/sheetStore";
import { 
  ArrowLeft, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar, 
  Star, 
  Brain,
  BookOpen,
  Target,
  FileText,
  Download,
  Share,
  Bookmark,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

// Utility functions
const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "easy": return "#10B981";
    case "medium": return "#F59E0B";
    case "hard": return "#EF4444";
    default: return "#6B7280";
  }
};

const getDomainIcon = (domain) => {
  switch (domain) {
    case "history": return BookOpen;
    case "biology": return Target;
    case "mathematics": return Target;
    default: return FileText;
  }
};

const getQualityColor = (score) => {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const ShowSheet = () => {
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const { token, isAuthenticated, isCheckingAuth, user, checkAuth } = useAuthStore();

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect if not authenticated or not verified
  useEffect(() => {
    if (!isCheckingAuth) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (isAuthenticated && !user?.isVerified) {
        router.replace("/verify-email");
      }
    }
  }, [isAuthenticated, user, isCheckingAuth, router]);

  // Fetch sheet
  useEffect(() => {
    if (!token) return;

    const getSheet = async () => {
      try {
        setLoading(true);
        const response = await showSheet(id);
        setSheet(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getSheet();
  }, [id, token]);
  

  if (loading) {
    return (
      <>
        {/* Loading Screen with same background */}
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
        />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading your study sheet...</h3>
            <p className="text-slate-400">Preparing your learning materials</p>
          </div>
        </div>
      </>
    );
  }

  if (!sheet) {
    return (
      <>
        {/* Error Screen with same background */}
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
        />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Sheet not found</h3>
            <p className="text-slate-400 mb-6">The study sheet you're looking for doesn't exist or has been removed.</p>
            <Link href="/sheets">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                Back to Sheets
              </button>
            </Link>
          </div>
        </div>
      </>
    );
  }
    const DomainIcon = getDomainIcon(sheet.classification?.domain);

// Replace your existing enhanceSheetContent function with this cleaner version:
const enhanceSheetContent = (content) => {
  if (!content) return '';

  // Step 0: Trim content and remove extra blank lines
  let enhanced = content
    .split('\n')                     // Split into lines
    .map(line => line.trim())         // Remove leading/trailing spaces
    .filter((line, idx, arr) => {    // Remove consecutive blank lines
      if (line !== '') return true;
      return arr[idx - 1] !== '';
    })
    .join('\n');                      // Join lines back

  // Step 1: Add emojis to section headers (using more precise regex)
  const emojiMappings = [
    [/^# (?!🎯)(.+)$/gm, '# 🎯 $1'],
    [/^## Key Concepts(?! 🔑)/gm, '## 🔑 Key Concepts'],
    [/^## Detailed Explanation(?! 📊)/gm, '## 📊 Detailed Analysis'],
    [/^## Examples(?! 🎯)/gm, '## 🎯 Critical Examples & Case Studies'],
    [/^## Summary(?! 💡)/gm, '## 💡 Key Takeaways & Summary'],
    [/^### Definition(?! 📖)/gm, '### 📖 **Definition**'],
    [/^### Causes(?! 🔥)/gm, '### 🔥 **Primary Causes**'],
    [/(?:^|\n)(Key takeaways:)(?! 🎯)/gm, '$1\n### 🎯 **Essential Understanding**']
  ];

  emojiMappings.forEach(([pattern, replacement]) => {
    enhanced = enhanced.replace(pattern, replacement);
  });

  return enhanced;
};

// Simplified version for your processSheetContent function
const processSheetContent = (rawContent) => {
  return enhanceSheetContent(rawContent);
};

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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl animate-pulse animation-delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header Section */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Back Button */}
              <Link href="/sheets" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Sheets</span>
              </Link>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link href={`/generate-quiz/${sheet._id}`}>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 text-purple-300 hover:from-purple-600/30 hover:to-blue-600/30 hover:text-white rounded-lg transition-all duration-300">
                    <Brain className="w-4 h-4" />
                    <span className="hidden sm:inline">Generate Quiz</span>
                  </button>
                </Link>

                {/* More Actions Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  {showActions && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl py-2">
                      <Link href={`/sheets/${sheet._id}/edit`}>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
                        <Edit className="w-4 h-4" />
                        Edit Sheet
                      </button>
                      </Link>
                      <div className="border-t border-slate-700/50 my-2"></div>
                      <Link href={`/sheets/${sheet._id}/delete`}>
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                          Delete Sheet
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          
          {/* Sheet Header Card */}
          <div className="group relative transition-all duration-300 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-2xl blur-xl"></div>
            <div
              className="relative p-8 rounded-2xl backdrop-filter backdrop-blur-lg border border-opacity-30 shadow-2xl"
              style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", borderColor: "#53B4EE" }}
            >
              {/* Header Content */}
              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-400/30">
                  <DomainIcon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {sheet.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sheet.classification?.topics?.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getDifficultyColor(sheet.classification?.difficulty) }}
                  ></div>
                  <span className="text-gray-300 capitalize">{sheet.classification?.difficulty || "N/A"}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>{sheet.classification?.estimatedStudyTime || "N/A"} min</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(sheet.createdAt)}</span>
                </div>

                {sheet.qualityScore?.score > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span
                      className="font-medium"
                      style={{ color: getQualityColor(sheet.qualityScore.score) }}
                    >
                      {sheet.qualityScore.score}/100
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quality Feedback */}
          {sheet.qualityScore?.feedback && (
            <div className="group relative transition-all duration-300 mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-orange-600/5 rounded-xl blur-xl"></div>
              <div className="relative p-6 rounded-xl backdrop-filter backdrop-blur-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Quality Assessment</h3>
                </div>
                <p className="text-slate-300 italic leading-relaxed">
                  "{sheet.qualityScore.feedback}"
                </p>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="group relative transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-400/5 to-slate-600/5 rounded-2xl blur-xl"></div>
            <div className="relative p-8 rounded-2xl backdrop-filter backdrop-blur-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-6 h-6 text-slate-400" />
                <h2 className="text-2xl font-semibold text-white">Study Content</h2>
              </div>
              
              <div className="prose prose-lg prose-invert max-w-none">
                <div 
                  className="text-slate-200 leading-relaxed whitespace-pre-line"
                  style={{ 
                    lineHeight: '1.8',
                    fontSize: '1.1rem'
                  }}
                >
          <div className="prose prose-invert max-w-none">
    <ReactMarkdown>{processSheetContent(sheet.content)}</ReactMarkdown>
            </div>                 
            </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-12 text-center">
            <Link href={`/generate-quiz/${sheet._id}`}>
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 font-medium text-lg">
                <Brain className="w-5 h-5" />
                Generate Quiz from this Sheet
              </button>
            </Link>
          </div>

        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        /* Custom prose styles for better readability */
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: #f8fafc;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .prose p {
          margin-bottom: 1.5rem;
        }
        
        .prose ul, .prose ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        
        .prose li {
          margin-bottom: 0.5rem;
        }
        
        .prose strong {
          color: #e2e8f0;
          font-weight: 600;
        }
        
        .prose em {
          color: #cbd5e1;
        }
        
        .prose blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          margin: 2rem 0;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 0.5rem;
          padding: 1.5rem;
        }
      `}</style>
    </>
  );
};

export default ShowSheet