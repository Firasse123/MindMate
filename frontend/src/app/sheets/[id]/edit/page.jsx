"use client";
import React, { useState, useEffect } from 'react';
import { editSheet, showSheet } from '@/store/sheetStore';
import { useAuthStore } from '@/store/authStore';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Eye,
  EyeOff,
  Save, 
  FileText, 
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  BookOpen,
  Target,
  Clock,
  Star
} from "lucide-react";

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

const EditSheet = () => {
  const { isAuthenticated, isCheckingAuth, user, checkAuth } = useAuthStore();
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [sheet, setSheet] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Auth checks
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isCheckingAuth) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (isAuthenticated && !user?.isVerified) {
        router.replace("/verify-email");
      }
    }
  }, [isAuthenticated, user, isCheckingAuth, router]);

  // Fetch sheet data
  useEffect(() => {
    if (id) {
      const fetchSheet = async () => {
        try {
          setLoading(true);
          const response = await showSheet(id);
          setSheet(response.data);
          setContent(response.data.content || "");
        } catch (error) {
          console.error("Error fetching sheet:", error);
          setError("Failed to load sheet. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchSheet();
    }
  }, [id]);

  // Handle content changes
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasChanges(newContent !== (sheet?.content || ""));
    setError("");
    setSuccess("");
  };

  // Handle save
  const handleSave = async () => {
    if (!hasChanges) {
      setError("No changes to save.");
      return;
    }

    if (content.trim().length < 10) {
      setError("Content must be at least 10 characters long.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await editSheet(id, content);
      setSuccess("Sheet saved successfully!");
      setHasChanges(false);
      
      // Redirect after a brief success message
      setTimeout(() => {
        router.push(`/sheets/${id}`);
      }, 1500);
    } catch (error) {
      console.error("Error saving sheet:", error);
      setError("Failed to save sheet. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel with unsaved changes warning
  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        router.push(`/sheets/${id}`);
      }
    } else {
      router.push(`/sheets/${id}`);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, content]);

  if (loading) {
    return (
      <>
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
            <h3 className="text-xl font-semibold text-white mb-2">Loading sheet...</h3>
            <p className="text-slate-400">Preparing editor</p>
          </div>
        </div>
      </>
    );
  }

  if (!sheet) {
    return (
      <>
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
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Sheet not found</h3>
            <p className="text-slate-400 mb-6">The sheet you're trying to edit doesn't exist or you don't have permission to edit it.</p>
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
              <button 
                onClick={handleCancel}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Sheet</span>
              </button>

              {/* Status Indicator */}
              <div className="hidden md:flex items-center gap-4">
                {hasChanges && (
                  <span className="flex items-center gap-2 text-amber-400 text-sm">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    Unsaved changes
                  </span>
                )}
                <span className="text-slate-500 text-sm">
                  Press Ctrl+S to save • Esc to cancel
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-lg transition-all"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Preview'}</span>
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                    hasChanges && !saving
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          
          {/* Success/Error Messages */}
          {(success || error) && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              success 
                ? 'bg-green-500/10 border border-green-400/30 text-green-400' 
                : 'bg-red-500/10 border border-red-400/30 text-red-400'
            }`}>
              {success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{success || error}</span>
              <button 
                onClick={() => { setSuccess(""); setError(""); }}
                className="ml-auto text-current hover:bg-current/10 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sheet Header Card */}
          <div className="group relative transition-all duration-300 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-2xl blur-xl"></div>
            <div
              className="relative p-6 rounded-2xl backdrop-filter backdrop-blur-lg border border-opacity-30"
              style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", borderColor: "#53B4EE" }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-400/30">
                  <DomainIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Editing: {sheet.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
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

                    {sheet.qualityScore?.score > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">
                          {sheet.qualityScore.score}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Editor Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Editor Panel */}
            <div className="group relative transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-400/5 to-slate-600/5 rounded-2xl blur-xl"></div>
              <div className="relative rounded-2xl backdrop-filter backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <h2 className="text-lg font-semibold text-white">Content Editor</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>{content.length} characters</span>
                    {content.split('\n').length > 1 && (
                      <>
                        <span>•</span>
                        <span>{content.split('\n').length} lines</span>
                      </>
                    )}
                  </div>
                </div>
                
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start writing your study content here..."
                  className="w-full h-96 lg:h-[600px] p-6 bg-transparent text-slate-200 placeholder-slate-500 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                  style={{ minHeight: '400px' }}
                />
              </div>
            </div>

            {/* Preview Panel */}
            {showPreview && (
              <div className="group relative transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-emerald-600/5 rounded-2xl blur-xl"></div>
                <div className="relative rounded-2xl backdrop-filter backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-green-400" />
                      <h2 className="text-lg font-semibold text-white">Live Preview</h2>
                    </div>
                  </div>
                  
                  <div className="p-6 h-96 lg:h-[600px] overflow-y-auto">
                    {content ? (
                      <div className="prose prose-invert max-w-none">
                        <div 
                          className="text-slate-200 leading-relaxed whitespace-pre-line"
                          style={{ 
                            lineHeight: '1.8',
                            fontSize: '1rem'
                          }}
                        >
                          {content}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500 italic">Preview will appear here as you type...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              <p>Last saved: Never • Auto-save: Disabled</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-all"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`flex items-center gap-2 px-8 py-2 rounded-lg font-medium transition-all ${
                  hasChanges && !saving
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
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
        
        /* Custom scrollbar for textarea and preview */
        textarea::-webkit-scrollbar,
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        textarea::-webkit-scrollbar-track,
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
        }
        
        textarea::-webkit-scrollbar-thumb,
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        
        textarea::-webkit-scrollbar-thumb:hover,
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </>
  );
};

export default EditSheet;