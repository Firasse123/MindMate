"use client";
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  ArrowRight,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getPersonalizedPath } from '../../store/pathStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';



const MyPathsPage = () => {
  const { user, isAuthenticated, isCheckingAuth, checkAuth, logout, token } = useAuthStore();
  const router = useRouter();

      useEffect(() => {
    // Check auth on page load
    checkAuth();
  }, [checkAuth]);

    useEffect(() => {
      // Only redirect when we're done checking auth
      if (!isCheckingAuth) {
        if (!isAuthenticated) {
          router.replace("/login");
        } else if (isAuthenticated && !user?.isVerified) {
          router.replace("/verify-email");
        }
      }
    }, [isAuthenticated, user, isCheckingAuth, router]);
    
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    setLoading(true);
    setError(null);
    try {
      const pathsData = await getPersonalizedPath();
      setPaths(pathsData || []);
    } catch (error) {
      console.error('Failed to load paths:', error);
      setError('Failed to load learning paths. Please try again.');
    } finally {
      setLoading(false);
    }
  };




  const getFocusColor = (focus) => {
    switch (focus) {
      case 'weakness':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'strength':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  const calculateProgress = (path) => {
    if (!path.pathData?.phases) return 0;
    
    const totalPhases = path.pathData.phases.length;
    const completedPhases = path.currentPhase - 1;
    return Math.round((completedPhases / totalPhases) * 100);
  };


  const startActivity = (pathId, phaseNumber, activityIndex) => {
    // TODO: Implement activity start logic
    console.log('Starting activity:', { pathId, phaseNumber, activityIndex });
  };


  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#180C3D] to-[#160C3C]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8961FF] mx-auto mb-4"></div>
            <p className="text-slate-300">Loading your learning paths...</p>
          </div>
        </div>
      </div>
    );
  }
 if (isCheckingAuth || !isAuthenticated || !user?.isVerified) {
    return null;
  }  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#180C3D] to-[#160C3C]">
      <Navbar />
      <div className="w-full p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#53B4EE] to-[#8961FF] bg-clip-text text-transparent mb-2">
              My Learning Paths
            </h1>
            <p className="text-slate-400">
              {paths.length} {paths.length === 1 ? 'path' : 'paths'} • Continue your learning journey
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <button
              onClick={loadPaths}
              className="flex items-center px-4 py-2 bg-slate-700/50 text-white rounded-xl hover:bg-slate-600/50 transition-all duration-300 backdrop-blur-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <Link
              href="/personalized-path"
              className="flex items-center px-6 py-2 bg-gradient-to-r from-[#8961FF] to-[#53B4EE] text-white rounded-xl hover:shadow-lg hover:shadow-[#8961FF]/25 transition-all duration-300"
            >
              Create New Path
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}



        {/* Paths Grid */}
        {paths.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              {paths.length === 0 ? 'No Learning Paths Yet' : 'No Paths Found'}
            </h3>
            <p className="text-slate-500 mb-6">
              {paths.length === 0 
                ? 'Take an assessment to create your first personalized learning path!' 
                : 'Try adjusting your search or filters.'}
            </p>
            {paths.length === 0 && (
              <Link
                href="/assessment"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8961FF] to-[#53B4EE] text-white rounded-xl hover:shadow-lg hover:shadow-[#8961FF]/25 transition-all duration-300"
              >
                Start Your First Assessment
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {paths.map((path) => (
              <div
                key={path._id}
                className="bg-[#160C3C]/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-[#8961FF]/10 transition-all duration-300"
              >
                {/* Path Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {path.pathData?.pathTitle || 'Untitled Path'}
                      </h3>
                      <div className="flex items-center gap-2">
                      
                      </div>
                    </div>
                    <p className="text-slate-400 mb-3">
                      {path.pathData?.overview || 'No description available'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {path.fiche?.title || 'Unknown Sheet'}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {path.pathData?.estimatedDuration || 'Unknown duration'}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(path.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-[#160C3C]/50 rounded-full transition-all duration-300">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Progress</span>
                    <span className="text-sm font-semibold text-white">
                      Phase {path.currentPhase} of {path.pathData?.phases?.length || 0}
                      {' '}({calculateProgress(path)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 backdrop-blur-sm">
                    <div 
                      className="bg-gradient-to-r from-[#8961FF] to-[#53B4EE] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${calculateProgress(path)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Phase */}
                {path.pathData?.phases && path.pathData.phases.length > 0 && (
                  <div className="mb-4">
                    {(() => {
                      const currentPhase = path.pathData.phases.find(p => p.phaseNumber === path.currentPhase);
                      if (!currentPhase) return null;
                      
                      return (
                        <div className={`border rounded-xl p-4 backdrop-blur-sm border-[#8961FF]/30 bg-[#8961FF]/20`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold flex items-center text-white">
                              <span className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-r from-[#8961FF] to-[#53B4EE] text-white text-xs font-bold mr-2">
                                {currentPhase.phaseNumber}
                              </span>
                              {currentPhase.title}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getFocusColor(currentPhase.focus)}`}>
                              {currentPhase.focus === 'weakness' ? '🎯 Focus' : 
                               currentPhase.focus === 'strength' ? '💪 Strength' : '🔄 Mixed'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mb-3">⏱️ {currentPhase.estimatedTime}</p>
                          
                          {/* Next Activities */}
                          <div className="space-y-2">
                            {currentPhase.activities?.slice(0, 2).map((activity, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-[#160C3C]/60 rounded border border-slate-700/50 backdrop-blur-sm">
                                <div className="flex-1">
                                  <span className="font-medium text-sm text-white">{activity.title}</span>
                                  <span className="ml-2 text-xs text-slate-500">({activity.estimatedTime})</span>
                                </div>
                                <button 
                                  onClick={() => startActivity(path._id, currentPhase.phaseNumber, index)}
                                  className="px-3 py-1 bg-gradient-to-r from-[#53B4EE] to-[#57AFF0] text-white rounded text-xs hover:shadow-lg hover:shadow-[#53B4EE]/25 transition-all duration-300"
                                >
                                  Start
                                </button>
                              </div>
                            ))}
                            {currentPhase.activities && currentPhase.activities.length > 2 && (
                              <p className="text-xs text-slate-500 text-center">
                                +{currentPhase.activities.length - 2} more activities
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Path Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-slate-700/20 rounded-xl backdrop-blur-sm">
                    <div className="text-lg font-bold text-[#8961FF]">
                      {path.pathData?.phases?.length || 0}
                    </div>
                    <div className="text-xs text-slate-400">Phases</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/20 rounded-xl backdrop-blur-sm">
                    <div className="text-lg font-bold text-[#53B4EE]">
                      {path.pathData?.phases?.reduce((total, phase) => total + (phase.activities?.length || 0), 0) || 0}
                    </div>
                    <div className="text-xs text-slate-400">Activities</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/20 rounded-xl backdrop-blur-sm">
                    <div className="text-lg font-bold text-green-400">
                      {path.assessment?.score || 0}%
                    </div>
                    <div className="text-xs text-slate-400">Score</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/20 rounded-xl backdrop-blur-sm">
                    <div className="text-lg font-bold text-[#57AFF0]">
                      {path.completedActivities?.length || 0}
                    </div>
                    <div className="text-xs text-slate-400">Completed</div>
                  </div>
                </div>


                {/* Last Accessed */}
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Created: {new Date(path.createdAt).toLocaleDateString()}</span>
                    <span>
                      Last accessed: {path.lastAccessedAt 
                        ? new Date(path.lastAccessedAt).toLocaleDateString() 
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPathsPage;