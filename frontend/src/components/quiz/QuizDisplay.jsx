import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Trophy,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import QuizResults from './QuizResults';

// Floating Shape Component
const FloatingShape = ({ color, size, top, left, delay }) => (
  <div 
    className={`absolute ${size} ${color} rounded-full blur-3xl opacity-20 animate-pulse`}
    style={{
      top,
      left,
      animationDelay: `${delay}s`,
      animationDuration: '6s'
    }}
  />
);

const QuizDisplay = ({ quiz, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (quiz && quiz.questions) {
      setQuestions([...quiz.questions]);
    }
  }, [quiz]);

  const handleAnswerSelect = (answer) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answer;
      console.log(`Answer selected for Q${currentQuestionIndex + 1}:`, answer);
      console.log('Updated answers array:', newAnswers);
      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;
    questions.forEach((question, index) => {
      maxScore = maxScore + question.points || 1;
      const userAnswer = userAnswers[index];
      const correctAnswer = question.correctAnswer;
      if (userAnswer === correctAnswer) {
        totalScore += question.points || 1;
      }
    });
    return { totalScore, maxScore, percentage: Math.round((totalScore / maxScore) * 100) };
  };

  // FIXED: Only calculate score and pass data to parent - NO API CALL HERE
  const handleSubmitQuiz = async () => {
    const scoreData = calculateScore();
    setQuizCompleted(true);
    console.log("Quiz completed!", { scoreData, userAnswers });
    
    // Create detailed answers for parent component
    const detailedAnswers = userAnswers.map((answer, index) => ({
      questionIndex: index,
      userAnswer: answer,
      correctAnswer: quiz.questions[index].correctAnswer,
      isCorrect: answer === quiz.questions[index].correctAnswer,
      timeSpent: 1000, 
      questionText: quiz.questions[index].question
    }));
    
    // ONLY pass data to parent - parent handles API submission
    onComplete && onComplete(scoreData, userAnswers, detailedAnswers);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const score = calculateScore();
    return (
      <QuizResults 
        quiz={quiz}
        score={score} 
        userAnswers={userAnswers}
        questions={questions}
        onRestart={handleRestartQuiz}
      />
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen p-6 relative">
      {/* Background Effects */}
      <FloatingShape color="bg-blue-400" size="w-96 h-96" top="5%" left="80%" delay={0} />
      <FloatingShape color="bg-purple-500" size="w-64 h-64" top="70%" left="10%" delay={2} />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {quiz.title || 'Quiz Challenge'}
              </h1>
            </div>
            <div className="text-slate-400 font-medium">
              {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-slate-700/50 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-purple-500 shadow-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-6">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-white pr-4 leading-relaxed">
                {currentQuestion.question}
              </h2>
              {currentQuestion.points > 1 && (
                <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full">
                  <Trophy className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">{currentQuestion.points} pts</span>
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="grid gap-4">
              {currentQuestion.options?.map((option, index) => {
                const isSelected = userAnswers[currentQuestionIndex] === option;
                const letters = ['A', 'B', 'C', 'D'];
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`p-6 rounded-xl border-2 transition-all transform hover:scale-[1.02] text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25'
                        : 'border-slate-600/50 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
                        isSelected 
                          ? 'border-blue-400 bg-blue-500 text-white' 
                          : 'border-slate-500 text-slate-400'
                      }`}>
                        {letters[index]}
                      </div>
                      <span className={`text-lg ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="text-center">
              <div className="text-slate-400 mb-1">Progress</div>
              <div className="text-white font-semibold">
                {Object.keys(userAnswers).length} of {questions.length} answered
              </div>
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all transform hover:scale-105"
              >
                <Trophy className="w-5 h-5" />
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:scale-105"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDisplay;