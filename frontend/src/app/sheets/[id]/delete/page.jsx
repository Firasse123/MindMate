"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "../../../../store/authStore";
import { deleteSheet, showSheet } from "@/store/sheetStore";
import Link from "next/link";
import { 
  ArrowLeft, 
  Trash2, 
  AlertTriangle,
  X,
  Loader2,
  FileText,
  Calendar,
  Clock,
  Star,
  BookOpen,
  Target,
  Shield,
  AlertCircle
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

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const DeleteSheet = () => {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const { token, isAuthenticated, isCheckingAuth, user, checkAuth } = useAuthStore();
  
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

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
    if (id && token) {
      const fetchSheet = async () => {
        try {
          setLoading(true);
          const response = await showSheet(id);
          setSheet(response.data);
        } catch (error) {
          console.error("Error fetching sheet:", error);
          setError("Failed to load sheet information.");
        } finally {
          setLoading(false);
        }
      };
      fetchSheet();
    }
  }, [id, token]);

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!token || !sheet) return;

    // Check if user typed the sheet title correctly
    if (confirmText.trim().toLowerCase() !== sheet.title.toLowerCase()) {
      setError("Sheet title doesn't match. Please type the exact title to confirm.");
      return;
    }

    try {
      setDeleting(true);
      setError("");
      await deleteSheet(id);
      
      // Show success message briefly before redirecting
      setTimeout(() => {
        router.push("/sheets");
      }, 1000);
    } catch (error) {
      console.error("Error deleting sheet:", error);
      setError("Failed to delete the sheet. Please try again.");
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmText("");
    setError("");
  };

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
            <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading sheet information...</h3>
            <p className="text-slate-400">Preparing deletion details</p>
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
            <p className="text-slate-400 mb-6">The sheet you're trying to delete doesn't exist or you don't have permission to delete it.</p>
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
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-pulse animation-delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header Section */}
        <div className="backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href={`/sheets/${sheet._id}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Sheet</span>
              </Link>
              
              <div className="flex items-center gap-2 text-red-400">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Danger Zone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          
          {/* Warning Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Delete Study Sheet
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              You're about to permanently delete this study sheet. This action cannot be undone.
            </p>
          </div>

          {/* Sheet Information Card */}
          <div className="group relative transition-all duration-300 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-orange-600/10 rounded-2xl blur-xl"></div>
            <div
              className="relative p-8 rounded-2xl backdrop-filter backdrop-blur-lg border border-red-400/30"
              style={{ backgroundColor: "rgba(15, 23, 42, 0.8)" }}
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 rounded-xl bg-red-500/20 border border-red-400/30">
                  <DomainIcon className="w-8 h-8 text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {sheet.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sheet.classification?.topics?.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-sm rounded-full bg-red-500/20 text-red-300 border border-red-400/30"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getDifficultyColor(sheet.classification?.difficulty) }}
                  ></div>
                  <span className="capitalize">{sheet.classification?.difficulty || "N/A"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{sheet.classification?.estimatedStudyTime || "N/A"} min</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(sheet.createdAt)}</span>
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

          {/* Warning Notice */}
          <div className="group relative transition-all duration-300 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-red-600/5 rounded-xl blur-xl"></div>
            <div className="relative p-6 rounded-xl backdrop-filter backdrop-blur-lg bg-slate-800/50 border border-amber-400/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-400 mb-2">
                    ⚠️ This action is irreversible
                  </h3>
                  <ul className="text-slate-300 space-y-2">
                    <li>• Your study content will be permanently lost</li>
                    <li>• Any associated quizzes or progress will be deleted</li>
                    <li>• This sheet cannot be recovered after deletion</li>
                    <li>• Consider downloading or backing up important content first</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link href={`/sheets/${sheet._id}`}>
              <button className="px-8 py-3 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-all font-medium">
                Cancel & Go Back
              </button>
            </Link>

            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-500/25 transition-all font-medium"
            >
              <Trash2 className="w-5 h-5" />
              Delete Sheet Permanently
            </button>
          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancel}
          ></div>

          {/* Modal */}
          <div className="relative bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Confirm Deletion
              </h3>
              <p className="text-slate-400">
                Type the sheet title exactly to confirm deletion:
              </p>
            </div>

            {/* Sheet title reference */}
            <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-1">Sheet title:</p>
              <p className="text-white font-medium">{sheet.title}</p>
            </div>

            {/* Input field */}
            <div className="mb-6">
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type the sheet title here..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={deleting}
                className="flex-1 px-4 py-3 text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting || confirmText.trim().toLowerCase() !== sheet.title.toLowerCase()}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  deleting || confirmText.trim().toLowerCase() !== sheet.title.toLowerCase()
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg hover:shadow-red-500/25'
                }`}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
      `}</style>
    </>
  );
};

export default DeleteSheet;