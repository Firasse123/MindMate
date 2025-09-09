import React from "react";
import FloatingShape from "../FloatingShape.jsx";
import { 
  Trophy, 
  XCircle, 
  Brain, 
  CheckCircle, 
  Sparkles, 
  RotateCcw, 
  ChevronLeft 
} from "lucide-react";

const QuizResults = ({ quiz, score, userAnswers, questions, onRestart }) => {
  const passed = score.percentage >= (quiz.config?.passingScore || 70);
  
  const getScoreGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { grade: 'F', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const gradeInfo = getScoreGrade(score.percentage);

  return (
    <div className="min-h-screen p-6 relative">
      {/* Background Effects */}
      <FloatingShape color="bg-green-400" size="w-72 h-72" top="10%" left="75%" delay={0} />
      <FloatingShape color="bg-blue-500" size="w-96 h-96" top="60%" left="5%" delay={1} />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${gradeInfo.bg} border-2 ${
            passed ? 'border-green-500/50' : 'border-red-500/50'
          }`}>
            {passed ? <Trophy className="w-12 h-12 text-green-400" /> : <XCircle className="w-12 h-12 text-red-400" />}
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {passed ? 'Outstanding!' : 'Quiz Complete'}
          </h1>
          
          <p className="text-xl text-slate-400 mb-6">
            You scored {score.totalScore} out of {score.maxScore} points
          </p>

          {/* Score Display */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className={`text-center p-6 rounded-2xl ${gradeInfo.bg} border border-opacity-30`}>
              <div className={`text-6xl font-bold ${gradeInfo.color} mb-2`}>
                {score.percentage}%
              </div>
              <div className={`text-2xl font-semibold ${gradeInfo.color}`}>
                Grade: {gradeInfo.grade}
              </div>
            </div>
          </div>

          <p className={`text-lg font-medium ${passed ? 'text-green-400' : 'text-red-400'}`}>
            {passed ? '🎉 Congratulations! You passed!' : `You need ${quiz.config?.passingScore || 70}% to pass. Keep practicing!`}
          </p>
        </div>

        {/* Answer Review */}
        {quiz.config?.showCorrectAnswers && (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-400" />
              Review Your Answers
            </h3>
            
            <div className="space-y-6">
              {questions.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={index} className={`p-6 rounded-xl border-l-4 ${
                    isCorrect 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-red-500 bg-red-500/10'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {isCorrect ? 
                          <CheckCircle className="text-green-400 w-6 h-6" /> : 
                          <XCircle className="text-red-400 w-6 h-6" />
                        }
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold text-white mb-3 text-lg">
                          Q{index + 1}: {question.question}
                        </h4>
                        
                        <div className="grid gap-3">
                          <div className={`p-3 rounded-lg ${
                            isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                          }`}>
                            <span className="text-sm font-medium text-slate-300">Your Answer:</span>
                            <p className={`${isCorrect ? 'text-green-300' : 'text-red-300'} font-medium`}>
                              {userAnswer || 'No answer selected'}
                            </p>
                          </div>
                          
                          <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                            <span className="text-sm font-medium text-slate-300">Correct Answer:</span>
                            <p className="text-blue-300 font-medium">{question.correctAnswer}</p>
                          </div>
                        </div>
                        
                        {question.explanation && (
                          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                            <span className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4" />
                              Explanation:
                            </span>
                            <p className="text-slate-300">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {quiz.config?.allowRetries && (
            <button
              onClick={onRestart}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:scale-105 font-semibold"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-3 px-8 py-4 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all transform hover:scale-105 font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Sheets
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;