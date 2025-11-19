"use client";
import React from "react";
import { Eye, Edit, Trash2, Clock, Calendar, Star, Brain } from "lucide-react";
import Link from "next/link";

// Utility functions (can be moved to a utils file if reused)
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
    case "history": return require("lucide-react").BookOpen;
    case "biology": return require("lucide-react").Target;
    case "mathematics": return require("lucide-react").Target;
    default: return require("lucide-react").FileText;
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
  });

const SheetCard = ({ sheet }) => {
  const DomainIcon = getDomainIcon(sheet.classification.domain);

  return (
    <div className="group relative transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
      <div
  className="relative p-6 rounded-xl backdrop-filter backdrop-blur-lg border border-opacity-30 shadow-2xl transition-all duration-300 flex flex-col min-h-[420px] h-full"

        style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", borderColor: "#53B4EE" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-400/30">
              <DomainIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {sheet.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {sheet.classification.topics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <Link href={`/sheets/${sheet._id}`}>
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors cursor-pointer" title="View Sheet">
                <Eye className="w-4 h-4" />
              </div>
            </Link>
            <Link href={`/sheets/${sheet._id}/edit`}>
            <div className="p-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors" title="Edit Sheet">
              <Edit className="w-4 h-4" />
            </div>
            </Link>

            <Link href={`/generate-quiz/${sheet._id}`}>
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors cursor-pointer" title="Generate Quiz">
                <Brain className="w-4 h-4" />
              </div>
            </Link>

            <Link href={`/sheets/${sheet._id}/delete`}>
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer" title="Delete Sheet">
                <Trash2 className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-4">
          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
            {sheet.content.replace(/[#*]/g, "").substring(0, 200)}...
          </p>
        </div>

        {/* Generate Quiz CTA Button */}
        <div className="mb-4">
          <Link href={`/generate-quiz/${sheet._id}`}>
            <button className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 text-purple-300 hover:from-purple-600/30 hover:to-blue-600/30 hover:text-white transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 group/btn">
              <Brain className="w-4 h-4 group-hover/btn:animate-pulse" />
              Generate Quiz from this Sheet
            </button>
          </Link>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getDifficultyColor(sheet.classification.difficulty) }}
              ></div>
              <span className="text-gray-400 capitalize">{sheet.classification.difficulty}</span>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{sheet.classification.estimatedStudyTime} min</span>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(sheet.createdAt)}</span>
            </div>
          </div>

          {/* Quality Score */}
          {sheet.qualityScore.score > 0 && (
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
  );
};

export default SheetCard;