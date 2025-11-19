"use client";
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Brain, TrendingUp, TrendingDown, BookOpen, AlertCircle, ArrowLeft, Play } from 'lucide-react';
import { generateAssessment, submitAssessment, generatePersonalizedPath } from '../../store/assessmentStore';
import { getAllSheets } from '../../store/sheetStore';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
const AssessmentFlow = () => {
  const [stage, setStage] = useState('selectSheet'); // selectSheet, assessment, results, path, existingPaths
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [personalizedPath, setPersonalizedPath] = useState(null);
  const [existingPaths, setExistingPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const { user, isAuthenticated, isCheckingAuth, checkAuth, logout, token } = useAuthStore();
  const router=useRouter();

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

  // Ref for short answer input
  const shortAnswerRef = useRef(null);

  // Load available sheets on component mount
  useEffect(() => {
    loadAvailableSheets();
  }, []);

  const loadAvailableSheets = async () => {
    try {
      const sheets = await getAllSheets();
      setAvailableSheets(sheets);
    } catch (error) {
      console.error('Failed to load sheets:', error);
      setError('Failed to load study sheets. Please try again.');
    }
  };

  

  const startAssessment = async (sheetId) => {
    setLoading(true);
    setError(null);
    setSelectedSheet(sheetId);
    
    try {
      const response = await generateAssessment(sheetId);
      setAssessmentId(response.assessmentId);
      setQuestions(response.questions);
      setCurrentQuestion(0);
      setAnswers({});
      setStage('assessment');
    } catch (error) {
      console.error('Failed to start assessment:', error);
      setError('Failed to generate assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (answer) => {
    if (!answer && answer !== false && answer !== 0) {
      setError('Please provide an answer before continuing.');
      return;
    }

    const currentQ = questions[currentQuestion];
    setAnswers(prev => ({
      ...prev,
      [currentQ.questionNumber]: answer
    }));

    setError(null);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Submit all answers
      submitAssessmentAnswers();
    }
  };

  const handleShortAnswerSubmit = () => {
    const answer = shortAnswerRef.current?.value?.trim();
    if (!answer) {
      setError('Please enter an answer before submitting.');
      return;
    }
    handleAnswerSubmit(answer);
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setError(null);
    }
  };

  const submitAssessmentAnswers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(([questionNumber, answer]) => ({
        questionNumber: parseInt(questionNumber),
        answer: answer
      }));

      const response = await submitAssessment(assessmentId, formattedAnswers);
      setResults(response);
      setStage('results');
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      setError('Failed to submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateLearningPath = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await generatePersonalizedPath(assessmentId);
      setPersonalizedPath(response.path);
      setStage('path');
    } 
     catch (error) {
      console.error('Failed to generate path:', error);
      // Show more detailed error information
      if (error.response?.status === 500) {
        setError('Server error occurred. Please check the backend logs and try again.');
      } else if (error.response?.status === 404) {
        setError('Assessment not found or not completed. Please retake the assessment.');
      } else if (error.response?.data?.error) {
        setError(`Error: ${error.response.data.error}`);
      } else {
        setError(`Failed to generate personalized path: ${error.message}`);
      }
    } finally {
      setLoading(false);
  };}

  const resetAssessment = () => {
    setStage('selectSheet');
    setSelectedSheet(null);
    setAssessmentId(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
    setPersonalizedPath(null);
    setError(null);
  };
  const handlePaths=()=>{
    router.push("/paths");
  }

  const startActivity = (pathId, phaseNumber, activityIndex) => {
    // TODO: Implement activity start logic here
    console.log('Starting activity:', { pathId, phaseNumber, activityIndex });
    setError('Activity functionality is not implemented yet.');
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  };

  const renderAnswerInput = (question) => {
    if (question.type === 'short_answer') {
      return (
        <div className="space-y-3">
          <textarea
            ref={shortAnswerRef}
            className="w-full p-4 border border-slate-600/50 rounded-xl resize-none h-24 focus:ring-2 focus:ring-[#8961FF]/50 focus:border-[#8961FF]/50 focus:outline-none transition-all bg-[#160C3C]/30 text-white placeholder-slate-400 backdrop-blur-sm"
            placeholder="Type your answer here..."
            defaultValue={answers[question.questionNumber] || ''}
          />
          <button
            onClick={handleShortAnswerSubmit}
            className="w-full bg-gradient-to-r from-[#8961FF] to-[#53B4EE] text-white p-4 rounded-xl hover:shadow-lg hover:shadow-[#8961FF]/25 transition-all duration-300 font-medium"
          >
            Submit Answer
          </button>
        </div>
      );
    }

    if (question.type === 'true_false') {
      return (
        <div className="space-y-3">
          <button
            onClick={() => handleAnswerSubmit('True')}
            className="w-full text-left p-4 border border-slate-600/50 rounded-xl hover:bg-green-500/20 hover:border-green-400/50 transition-all duration-300 bg-[#160C3C]/20 text-white backdrop-blur-sm"
          >
            <span className="text-green-400 mr-3">✓</span> True
          </button>
          <button
            onClick={() => handleAnswerSubmit('False')}
            className="w-full text-left p-4 border border-slate-600/50 rounded-xl hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-300 bg-[#160C3C]/20 text-white backdrop-blur-sm"
          >
            <span className="text-red-400 mr-3">✗</span> False
          </button>
        </div>
      );
    }

    // Multiple choice
    return (
      <div className="space-y-3">
        {question.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSubmit(option.charAt(0))}
            className="w-full text-left p-4 border border-slate-600/50 rounded-xl hover:bg-[#8961FF]/20 hover:border-[#8961FF]/50 transition-all duration-300 bg-[#160C3C]/20 text-white backdrop-blur-sm"
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#180C3D] to-[#160C3C]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8961FF] mx-auto mb-4"></div>
          <p className="text-slate-300">
            {stage === 'selectSheet' && 'Loading study sheets...'}
            {stage === 'assessment' && 'Generating assessment questions...'}
            {stage === 'results' && 'Analyzing your responses...'}
            {stage === 'path' && 'Creating your personalized path...'}
            {stage === 'existingPaths' && 'Loading your learning paths...'}
          </p>
        </div>
      </div>
    );
  }
 if (isCheckingAuth || !isAuthenticated || !user?.isVerified) {
    return null;
 }
  return (
<div className="w-full min-h-screen bg-gradient-to-br from-[#180C3D] to-[#160C3C]">
  <Navbar/>
  <div className="w-full p-6">      {renderError()}

      {stage === 'selectSheet' && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#53B4EE] to-[#8961FF] bg-clip-text text-transparent">Choose Your Study Sheet</h1>
            <Link
              href={"/paths"}
              className="bg-gradient-to-r from-[#57AFF0] to-[#53B4EE] text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-[#57AFF0]/25 transition-all duration-300"
            >
              View My Paths
            </Link>
          </div>
          
          {availableSheets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No study sheets available. Please create some sheets first.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableSheets.map(sheet => (
                <div key={sheet._id} 
                     className="bg-[#160C3C]/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:shadow-xl hover:shadow-[#8961FF]/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                     onClick={() => startAssessment(sheet._id)}>
                  <BookOpen className="w-8 h-8 text-[#53B4EE] mb-3" />
                  <h3 className="font-semibold text-lg text-white mb-2">{sheet.title}</h3>
                  <p className="text-slate-400 mb-4">{sheet.classification?.domain || 'General'}</p>
                  <button className="w-full bg-gradient-to-r from-[#8961FF] to-[#53B4EE] text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-[#8961FF]/25 transition-all duration-300">
                    Start Assessment
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {stage === 'assessment' && questions.length > 0 && currentQuestion < questions.length && (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {currentQuestion > 0 && (
                  <button
                    onClick={goToPreviousQuestion}
                    className="mr-4 p-2 text-slate-400 hover:text-white hover:bg-[#160C3C]/50 rounded-full transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="text-2xl font-bold text-white">Assessment</h2>
              </div>
              <span className="text-sm text-slate-400">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-[#8961FF] to-[#53B4EE] h-2 rounded-full transition-all duration-500" 
                   style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-[#160C3C]/40 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                questions[currentQuestion]?.difficulty === 'easy' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                questions[currentQuestion]?.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {questions[currentQuestion]?.difficulty || 'unknown'}
              </span>
              <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs font-semibold border border-slate-600/50">
                {questions[currentQuestion]?.type?.replace('_', ' ') || 'question'}
              </span>
            </div>

            <h3 className="text-xl font-semibold mb-6 text-white">
              {questions[currentQuestion]?.question || 'Loading question...'}
            </h3>

            {questions[currentQuestion] && renderAnswerInput(questions[currentQuestion])}
          </div>
        </div>
      )}

      {stage === 'results' && results && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#53B4EE] to-[#8961FF] bg-clip-text text-transparent">Assessment Complete!</h2>
            <div className="text-6xl font-bold mb-2">
              <span className={results.score >= 70 ? 'text-green-400' : 'text-orange-400'}>
                {results.score}%
              </span>
            </div>
            <p className="text-slate-400">
              {results.correctCount} out of {results.totalQuestions} questions correct
            </p>
          </div>

          <div className="bg-[#160C3C]/40 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-white">Question Results</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {results.results.map((result, index) => (
                <div key={index} className={`p-3 rounded-xl backdrop-blur-sm ${result.isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-white">Q{result.questionNumber}:</span>
                    {result.isCorrect ? 
                      <CheckCircle className="w-5 h-5 text-green-400" /> : 
                      <XCircle className="w-5 h-5 text-red-400" />
                    }
                  </div>
                  <p className="text-sm text-slate-300 mb-1">{result.question}</p>
                  <div className="text-xs space-y-1">
                    <p className="text-slate-400"><strong>Your answer:</strong> {result.userAnswer}</p>
                    {!result.isCorrect && (
                      <p className="text-slate-400"><strong>Correct answer:</strong> {result.correctAnswer}</p>
                    )}
                    {result.explanation && (
                      <p className="mt-2 text-slate-400"><strong>Explanation:</strong> {result.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-500/20 rounded-xl p-6 border border-green-500/30 backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
                <h3 className="text-lg font-semibold text-green-400">Your Strengths</h3>
              </div>
              {results.strengths?.length > 0 ? (
                <ul className="space-y-2">
                  {results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center text-green-300">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {strength}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-300">Focus on building fundamental understanding</p>
              )}
            </div>

            <div className="bg-orange-500/20 rounded-xl p-6 border border-orange-500/30 backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <TrendingDown className="w-6 h-6 text-orange-400 mr-2" />
                <h3 className="text-lg font-semibold text-orange-400">Areas to Improve</h3>
              </div>
              {results.weaknesses?.length > 0 ? (
                <ul className="space-y-2">
                  {results.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-center text-orange-300">
                      <XCircle className="w-4 h-4 mr-2" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-orange-300">Great job! Keep reinforcing your knowledge</p>
              )}
            </div>
          </div>

          <div className="text-center space-x-4">
            <button onClick={generateLearningPath}
                    className="bg-gradient-to-r from-[#8961FF] to-[#57AFF0] text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-[#8961FF]/25 transition-all duration-300 text-lg font-semibold">
              <Brain className="w-5 h-5 inline mr-2" />
              Generate My Personalized Learning Path
            </button>
            <button onClick={resetAssessment}
                    className="bg-slate-700/50 text-white px-6 py-3 rounded-xl hover:bg-slate-600/50 transition-all duration-300 backdrop-blur-sm">
              Take Another Assessment
            </button>
          </div>
        </div>
      )}


{stage === 'path' && personalizedPath && (
  <div>
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#00D4FF] via-[#8961FF] to-[#FF6B9D] bg-clip-text text-transparent animate-pulse">
        {personalizedPath.pathTitle}
      </h2>
      <p className="text-slate-200 text-lg mb-2 font-medium">{personalizedPath.overview}</p>
      <p className="text-sm text-[#00D4FF] font-semibold">⚡ Estimated Duration: {personalizedPath.estimatedDuration}</p>
    </div>

    <div className="space-y-8">
      {personalizedPath.phases?.map((phase, index) => (
        <div key={phase.phaseNumber} 
             className={`relative overflow-hidden border-2 rounded-2xl p-8 backdrop-blur-lg shadow-2xl transform hover:scale-[1.02] transition-all duration-500 ${
               phase.focus === 'weakness' 
                 ? 'border-[#FF6B9D] bg-gradient-to-br from-[#FF6B9D]/20 via-[#FF8A80]/10 to-[#FF6B9D]/5 shadow-[#FF6B9D]/20' :
               phase.focus === 'strength' 
                 ? 'border-[#00FF88] bg-gradient-to-br from-[#00FF88]/20 via-[#64FFDA]/10 to-[#00FF88]/5 shadow-[#00FF88]/20' :
                 'border-[#00D4FF] bg-gradient-to-br from-[#00D4FF]/20 via-[#8961FF]/10 to-[#00D4FF]/5 shadow-[#00D4FF]/20'
             }`}>
          
          {/* Animated background gradient */}
          <div className={`absolute inset-0 opacity-10 ${
            phase.focus === 'weakness' 
              ? 'bg-gradient-to-r from-[#FF6B9D] via-transparent to-[#FF8A80]' :
            phase.focus === 'strength' 
              ? 'bg-gradient-to-r from-[#00FF88] via-transparent to-[#64FFDA]' :
              'bg-gradient-to-r from-[#00D4FF] via-transparent to-[#8961FF]'
          } animate-pulse`}></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center text-white">
                <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black mr-4 shadow-xl transform hover:rotate-12 transition-transform duration-300 ${
                  phase.focus === 'weakness' 
                    ? 'bg-gradient-to-br from-[#FF6B9D] to-[#FF8A80] shadow-[#FF6B9D]/50' :
                  phase.focus === 'strength' 
                    ? 'bg-gradient-to-br from-[#00FF88] to-[#64FFDA] shadow-[#00FF88]/50 text-black' :
                    'bg-gradient-to-br from-[#00D4FF] to-[#8961FF] shadow-[#00D4FF]/50'
                }`}>
                  {phase.phaseNumber}
                </span>
                {phase.title}
              </h3>
              
              <div className="flex items-center space-x-3">
                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                  phase.focus === 'weakness' 
                    ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF8A80] text-white shadow-[#FF6B9D]/30' :
                  phase.focus === 'strength' 
                    ? 'bg-gradient-to-r from-[#00FF88] to-[#64FFDA] text-black shadow-[#00FF88]/30' :
                    'bg-gradient-to-r from-[#00D4FF] to-[#8961FF] text-white shadow-[#00D4FF]/30'
                }`}>
                  {phase.focus === 'weakness' ? '🎯 Priority Focus' : 
                   phase.focus === 'strength' ? '💎 Build Mastery' : '🚀 Core Learning'}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#00D4FF] mb-6 font-semibold flex items-center">
              <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-2 animate-pulse"></span>
              ⏱️ {phase.estimatedTime}
            </p>

            <div className="space-y-4">
              {phase.activities?.map((activity, actIndex) => (
                <div key={actIndex} className={`bg-gradient-to-r p-6 rounded-xl shadow-xl border-2 backdrop-blur-sm transform hover:scale-[1.01] transition-all duration-300 ${
                  activity.difficulty === 'easy' 
                    ? 'from-[#00FF88]/20 to-[#64FFDA]/10 border-[#00FF88]/30 hover:shadow-[#00FF88]/20' :
                  activity.difficulty === 'medium' 
                    ? 'from-[#FFD700]/20 to-[#FFA500]/10 border-[#FFD700]/30 hover:shadow-[#FFD700]/20' :
                    'from-[#FF6B9D]/20 to-[#FF8A80]/10 border-[#FF6B9D]/30 hover:shadow-[#FF6B9D]/20'
                }`}>
                  
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg text-white flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-3 ${
                        activity.difficulty === 'easy' ? 'bg-[#00FF88] shadow-lg shadow-[#00FF88]/50' :
                        activity.difficulty === 'medium' ? 'bg-[#FFD700] shadow-lg shadow-[#FFD700]/50' :
                        'bg-[#FF6B9D] shadow-lg shadow-[#FF6B9D]/50'
                      }`}></span>
                      {activity.title}
                    </h4>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg ${
                      activity.difficulty === 'easy' 
                        ? 'bg-gradient-to-r from-[#00FF88] to-[#64FFDA] text-black shadow-[#00FF88]/30' :
                      activity.difficulty === 'medium' 
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black shadow-[#FFD700]/30' :
                        'bg-gradient-to-r from-[#FF6B9D] to-[#FF8A80] text-white shadow-[#FF6B9D]/30'
                    }`}>
                      {activity.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-slate-200 text-sm mb-4 leading-relaxed">{activity.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${
                        activity.type === 'reading' 
                          ? 'bg-gradient-to-r from-[#00D4FF]/30 to-[#8961FF]/20 text-[#00D4FF] border-[#00D4FF]/50' :
                        activity.type === 'practice' 
                          ? 'bg-gradient-to-r from-[#8961FF]/30 to-[#FF6B9D]/20 text-[#8961FF] border-[#8961FF]/50' :
                        activity.type === 'video' 
                          ? 'bg-gradient-to-r from-[#00FF88]/30 to-[#64FFDA]/20 text-[#00FF88] border-[#00FF88]/50' :
                          'bg-gradient-to-r from-slate-600/30 to-slate-500/20 text-slate-300 border-slate-500/50'
                      }`}>
                        {activity.type === 'reading' ? '📚' : 
                         activity.type === 'practice' ? '🎯' : 
                         activity.type === 'video' ? '🎬' : '📝'} {activity.type.toUpperCase()}
                      </span>
                      
                      <span className="text-xs text-[#00D4FF] font-semibold flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-1 animate-pulse"></span>
                        ⏱️ {activity.estimatedTime}
                      </span>
                    </div>
                    
                    {activity.type === "practice" ? (
                      <Link href="/sheets" className="bg-gradient-to-r from-[#8961FF] to-[#FF6B9D] text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-[#8961FF]/30 transition-all duration-300 transform hover:scale-105">
                        🎯 Generate Quiz
                      </Link>
                    ) : (
                      <a
                        href={activity.resourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-[#00D4FF] to-[#8961FF] text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-[#00D4FF]/30 transition-all duration-300 transform hover:scale-105 inline-flex items-center"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        🚀 Start
                      </a>
                    )}
                  </div>
                  
                  {activity.concepts && activity.concepts.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activity.concepts.map((concept, cIndex) => (
                        <span key={cIndex} className="bg-gradient-to-r from-slate-700/80 to-slate-600/60 text-[#00D4FF] px-3 py-1 rounded-full text-xs font-semibold border border-[#00D4FF]/30 shadow-sm">
                          {concept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {personalizedPath.milestones?.find(m => m.after_phase === phase.phaseNumber) && (
              <div className="mt-6 p-4 bg-gradient-to-r from-[#FFD700]/30 to-[#FFA500]/20 border-2 border-[#FFD700]/50 rounded-xl backdrop-blur-sm shadow-xl shadow-[#FFD700]/20">
                <div className="flex items-center">
                  <span className="text-3xl mr-3 animate-bounce">🏆</span>
                  <div>
                    <p className="font-bold text-[#FFD700] text-lg">
                      🎉 Milestone Achievement
                    </p>
                    <p className="font-semibold text-white">
                      {personalizedPath.milestones.find(m => m.after_phase === phase.phaseNumber)?.title}
                    </p>
                    <p className="text-sm text-[#FFD700]/80">
                      {personalizedPath.milestones.find(m => m.after_phase === phase.phaseNumber)?.criteria}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>

    <div className="mt-12 bg-gradient-to-r from-[#160C3C]/60 via-[#8961FF]/20 to-[#00D4FF]/20 rounded-2xl p-8 border-2 border-[#8961FF]/30 backdrop-blur-lg shadow-2xl shadow-[#8961FF]/20">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
        <span className="text-3xl mr-3">📊</span>
        <span className="bg-gradient-to-r from-[#00D4FF] to-[#8961FF] bg-clip-text text-transparent">
          Learning Path Overview
        </span>
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="bg-gradient-to-br from-[#8961FF]/20 to-[#8961FF]/10 rounded-xl p-4 border border-[#8961FF]/30">
          <div className="text-4xl font-black text-[#8961FF] mb-2">
            {personalizedPath.phases?.length || 0}
          </div>
          <div className="text-sm font-semibold text-[#8961FF]">Learning Phases</div>
        </div>
        
        <div className="bg-gradient-to-br from-[#00D4FF]/20 to-[#00D4FF]/10 rounded-xl p-4 border border-[#00D4FF]/30">
          <div className="text-4xl font-black text-[#00D4FF] mb-2">
            {personalizedPath.phases?.reduce((total, phase) => total + (phase.activities?.length || 0), 0) || 0}
          </div>
          <div className="text-sm font-semibold text-[#00D4FF]">Total Activities</div>
        </div>
        
        <div className="bg-gradient-to-br from-[#00FF88]/20 to-[#00FF88]/10 rounded-xl p-4 border border-[#00FF88]/30">
          <div className="text-4xl font-black text-[#00FF88] mb-2">
            {personalizedPath.milestones?.length || 0}
          </div>
          <div className="text-sm font-semibold text-[#00FF88]">Milestones</div>
        </div>
        
        <div className="bg-gradient-to-br from-[#FF6B9D]/20 to-[#FF6B9D]/10 rounded-xl p-4 border border-[#FF6B9D]/30">
          <div className="text-4xl font-black text-[#FF6B9D] mb-2">
            {personalizedPath.estimatedDuration}
          </div>
          <div className="text-sm font-semibold text-[#FF6B9D]">Total Duration</div>
        </div>
      </div>
    </div>

    <div className="mt-8 text-center space-x-4">
      <button onClick={resetAssessment}
              className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-8 py-3 rounded-xl hover:from-slate-600 hover:to-slate-500 transition-all duration-300 backdrop-blur-sm font-semibold shadow-lg">
        🔄 New Assessment
      </button>
      <button onClick={handlePaths} 
        className="bg-gradient-to-r from-[#00D4FF] via-[#8961FF] to-[#FF6B9D] text-white px-8 py-3 rounded-xl hover:shadow-xl hover:shadow-[#8961FF]/30 transition-all duration-300 font-semibold transform hover:scale-105"
      >
        🎯 View All Paths
      </button>
    </div>
  </div>
)}

      {stage === 'existingPaths' && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#53B4EE] to-[#8961FF] bg-clip-text text-transparent">My Learning Paths</h1>
            <button 
              onClick={resetAssessment}
              className="bg-gradient-to-r from-[#8961FF] to-[#53B4EE] text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-[#8961FF]/25 transition-all duration-300"
            >
              Create New Path
            </button>
          </div>

          {existingPaths.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No learning paths found. Take an assessment to create your first personalized path!</p>
              <button 
                onClick={resetAssessment}
                className="mt-4 bg-gradient-to-r from-[#8961FF] to-[#53B4EE] text-white px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-[#8961FF]/25 transition-all duration-300"
              >
                Start Assessment
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {existingPaths.map((pathItem, index) => (
                <div key={pathItem._id} className="bg-[#160C3C]/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{pathItem.pathData.pathTitle}</h3>
                      <p className="text-slate-400 mt-1">{pathItem.pathData.overview}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                        <span>📚 {pathItem.fiche?.title}</span>
                        <span>⏱️ {pathItem.pathData.estimatedDuration}</span>
                        <span>📊 Phase {pathItem.currentPhase}/{pathItem.pathData.phases?.length || 0}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      pathItem.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      pathItem.status === 'completed' ? 'bg-[#53B4EE]/20 text-[#53B4EE] border-[#53B4EE]/30' :
                      'bg-slate-700/50 text-slate-400 border-slate-600/50'
                    }`}>
                      {pathItem.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {pathItem.pathData.phases?.map((phase, phaseIndex) => (
                      <div key={phase.phaseNumber} 
                           className={`border rounded-xl p-4 backdrop-blur-sm ${
                             phase.phaseNumber === pathItem.currentPhase ? 'border-[#8961FF]/30 bg-[#8961FF]/20' : 
                             phase.phaseNumber < pathItem.currentPhase ? 'border-green-500/30 bg-green-500/20' : 
                             'border-slate-700/50 bg-slate-700/20'
                           }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold flex items-center text-white">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 ${
                              phase.phaseNumber < pathItem.currentPhase ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              phase.phaseNumber === pathItem.currentPhase ? 'bg-gradient-to-r from-[#8961FF] to-[#53B4EE]' :
                              'bg-slate-600'
                            }`}>
                              {phase.phaseNumber < pathItem.currentPhase ? '✓' : phase.phaseNumber}
                            </span>
                            {phase.title}
                          </h4>
                          <span className="text-xs text-slate-500">⏱️ {phase.estimatedTime}</span>
                        </div>

                        <div className="ml-8 space-y-2">
                          {phase.activities?.map((activity, actIndex) => (
                            <div key={actIndex} className="flex items-center justify-between p-2 bg-[#160C3C]/60 rounded border border-slate-700/50 backdrop-blur-sm">
                              <div className="flex-1">
                                <span className="font-medium text-sm text-white">{activity.title}</span>
                                <span className="ml-2 text-xs text-slate-500">({activity.estimatedTime})</span>
                              </div>
                              <button 
                                onClick={() => startActivity(pathItem._id, phase.phaseNumber, actIndex)}
                                className={`px-3 py-1 rounded text-xs transition-all duration-300 ${
                                  phase.phaseNumber > pathItem.currentPhase 
                                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-[#53B4EE] to-[#57AFF0] text-white hover:shadow-lg hover:shadow-[#53B4EE]/25'
                                }`}
                                disabled={phase.phaseNumber > pathItem.currentPhase}
                              >
                                {phase.phaseNumber > pathItem.currentPhase ? 'Locked' : 'Start'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Created: {new Date(pathItem.createdAt).toLocaleDateString()}</span>
                      <span>Last accessed: {pathItem.lastAccessedAt ? new Date(pathItem.lastAccessedAt).toLocaleDateString() : 'Never'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
</div>
</div>
  );
};

export default AssessmentFlow;