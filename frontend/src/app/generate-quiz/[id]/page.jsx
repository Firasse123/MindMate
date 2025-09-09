"use client";
import React, { useState, useEffect } from "react";
import GenerateQuiz from "../../../components/quiz/GenerateQuiz";
import QuizDisplay from "../../../components/quiz/QuizDisplay";
import QuizResults from "../../../components/quiz/QuizResults";
import { useAuthStore } from "../../../store/authStore";
import { useParams, useRouter } from "next/navigation";
import { submitQuiz } from "@/store/quizStore";

const GenerateQuizPage = () => {
  const { user, isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();
  const [quiz, setQuiz] = useState(null);
  const [currentView, setCurrentView] = useState("generate");
  const [scoreData, setScoreData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);

  const params = useParams();
  const router = useRouter();
  const sheet_id = params?.id;

  // Debug logs
  useEffect(() => {
    console.log("URL Params:", params);
    console.log("Sheet ID:", sheet_id);
  }, [params, sheet_id]);

  // Authentication check
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

  const handleQuizGenerated = (generatedQuiz) => {
    console.log("Quiz generated:", generatedQuiz);
    setQuiz(generatedQuiz);
    setCurrentView("display");
  };

  const handleQuizComplete = async (score, answers) => {
    console.log("Quiz completed!", { score, answers });
    setScoreData(score);
    setUserAnswers(answers);
    setCurrentView("results");

    try {
      const detailedAnswers = answers.map((answer, index) => ({
        questionIndex: index,
        userAnswer: answer,
        correctAnswer: quiz.questions[index].correctAnswer,
        isCorrect: answer === quiz.questions[index].correctAnswer,
        timeSpent: 0,
        questionText: quiz.questions[index].question,
      }));

      const result = await submitQuiz(
        quiz._id,
        detailedAnswers,
        0,
        score
      );

      console.log("Quiz results saved:", result.data);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const handleRestart = () => {
    setQuiz(null);
    setScoreData(null);
    setUserAnswers([]);
    setCurrentView("generate");
  };

  if (!sheet_id) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Sheet ID</h2>
          <p className="text-gray-600">No sheet ID found in URL parameters.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative text-white">
      {/* Navigation */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2">
          {[
            { key: "generate", label: "Generate" },
            { key: "display", label: "Quiz" },
            { key: "results", label: "Results" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              disabled={key !== "generate" && !quiz}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === key
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white disabled:opacity-40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pt-20">
        {currentView === "generate" && (
          <GenerateQuiz sheet_id={sheet_id} onQuizGenerated={handleQuizGenerated} />
        )}

        {currentView === "display" && quiz && (
          <QuizDisplay quiz={quiz} onComplete={handleQuizComplete} />
        )}

        {currentView === "results" && quiz && scoreData && (
          <QuizResults
            quiz={quiz}
            score={scoreData}
            userAnswers={userAnswers}
            questions={quiz.questions}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
};

export default GenerateQuizPage;
