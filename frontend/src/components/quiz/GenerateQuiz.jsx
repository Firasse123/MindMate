import React, { useState } from 'react';
import { 
  Brain,
  Target,
  Zap,
  Sparkles,
  ChevronRight,
  XCircle,
  Trophy
} from 'lucide-react';
import { createQuiz } from "../../store/quizStore";

// Floating Shape Component
const FloatingShape = ({ color, size, top, left, delay, style }) => (
  <div 
    className={`absolute ${size} ${color} rounded-full blur-3xl opacity-20 animate-pulse`}
    style={{
      top,
      left,
      ...style,
      animationDelay: `${delay}s`,
      animationDuration: '6s'
    }}
  />
);

const GenerateQuiz = ({ sheet_id, onQuizGenerated }) => {
  const [questionCount, setQuestionCount] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!questionCount || questionCount <= 0) {
        throw new Error("Please enter a valid number of questions");
      }

      const response = await createQuiz(sheet_id, questionCount, difficulty);

      // Normalize the quiz data
      let quizData = null;

      if (response?.newQuiz?.questions && response.newQuiz.questions.length > 0) {
        quizData = response.newQuiz;
      } else if (response?.questions && response.questions.length > 0) {
        quizData = response;
      } else if (response?.Quiz) {
        // If your backend returns { Quiz: {...} }
        quizData = { questions: response.Quiz.questions || [], ...response.Quiz };
      }

      if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        throw new Error("Failed to generate quiz questions");
      }

      onQuizGenerated(quizData);
    } catch (error) {
      console.error("Quiz generation error:", error);
      setError(error.message || "Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const difficultyColors = {
    easy: "from-green-500 to-emerald-600",
    medium: "from-yellow-500 to-orange-600", 
    hard: "from-red-500 to-pink-600"
  };

  const difficultyIcons = {
    easy: "🌱",
    medium: "🔥", 
    hard: "⚡"
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Floating Shapes */}
      <FloatingShape color="bg-blue-400" size="w-72 h-72" top="10%" left="20%" delay={0} />
      <FloatingShape color="bg-purple-500" size="w-48 h-48" top="60%" left="70%" delay={2} />
      <FloatingShape color="bg-indigo-400" size="w-64 h-64" top="40%" left="5%" delay={1} />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            AI Quiz Generator
          </h1>
          <p className="text-xl text-slate-400">
            Transform your study materials into interactive quizzes powered by AI
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="space-y-8">
            {/* Question Count */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-lg font-semibold text-white">
                <Target className="w-5 h-5 text-blue-400" />
                Number of Questions
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="How many questions?"
                  value={questionCount}
             onChange={(e) => {
                const val = e.target.value;
              setQuestionCount(val === "" ? "" : parseInt(val, 10));
             }}
              className="w-full p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  min="1"
                  max="50"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
                  Max: 50
                </div>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-lg font-semibold text-white">
                <Zap className="w-5 h-5 text-yellow-400" />
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      difficulty === level
                        ? `bg-gradient-to-br ${difficultyColors[level]} border-transparent text-white shadow-lg`
                        : 'bg-slate-800/30 border-slate-600/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">{difficultyIcons[level]}</div>
                    <div className="font-semibold capitalize">{level === 'easy' ? 'Beginner' : level === 'medium' ? 'Intermediate' : 'Advanced'}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <button
                onClick={generate}
                disabled={loading || questionCount <= 0}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Quiz Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate Quiz
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: Brain, label: "AI Powered", color: "text-blue-400" },
            { icon: Target, label: "Adaptive", color: "text-green-400" },
            { icon: Zap, label: "Instant", color: "text-yellow-400" },
            { icon: Trophy, label: "Engaging", color: "text-purple-400" }
          ].map((feature, index) => (
            <div key={index} className="text-center p-4 bg-slate-800/30 rounded-xl backdrop-blur-sm border border-slate-700/30">
              <feature.icon className={`w-8 h-8 mx-auto mb-2 ${feature.color}`} />
              <p className="text-slate-300 text-sm font-medium">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenerateQuiz;