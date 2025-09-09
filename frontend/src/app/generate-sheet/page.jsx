"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { generateSheet, evaluateSheet } from "@/store/sheetStore";
import { 
  Wand2, 
  FileText, 
  Settings, 
  Copy, 
  Download, 
  RefreshCw,
  Sparkles,
  BookOpen,
  Target,
  BarChart3,
  CheckCircle
} from "lucide-react";
import Navbar from "../../components/Navbar";

// TipTap Editor Component
const TipTapEditor = ({ 
  content = '', 
  onChange = () => {}, 
  placeholder = "Start typing...",
  disabled = false
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: content,
    immediatelyRender: false,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      if (onChange && typeof onChange === 'function') {
        onChange(editor.getHTML())
      }
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm focus:outline-none min-h-[200px] p-4 text-white ${disabled ? 'opacity-50' : ''}`,
      },
    },
  })

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  if (!editor) {
    return (
      <div className="border border-slate-700 rounded-xl bg-slate-800/50 p-4 min-h-[250px] flex items-center justify-center">
        <div className="text-slate-400">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className={`border border-slate-700 rounded-xl bg-slate-800/50 ${disabled ? 'opacity-50' : ''}`}>
      {/* Toolbar */}
      <div className="border-b border-slate-700 p-3 flex gap-2 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          className={`p-2 rounded text-sm ${
            editor.isActive('bold') 
              ? 'bg-blue-500 text-white' 
              : 'text-slate-300 hover:bg-slate-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          className={`p-2 rounded text-sm ${
            editor.isActive('italic') 
              ? 'bg-blue-500 text-white' 
              : 'text-slate-300 hover:bg-slate-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={`px-3 py-2 rounded text-sm ${
            editor.isActive('bulletList') 
              ? 'bg-blue-500 text-white' 
              : 'text-slate-300 hover:bg-slate-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          • List
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={disabled}
          className={`px-3 py-2 rounded text-sm ${
            editor.isActive('codeBlock') 
              ? 'bg-blue-500 text-white' 
              : 'text-slate-300 hover:bg-slate-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Code
        </button>
      </div>
      
      {/* Editor Content */}
      <EditorContent editor={editor} className="text-white" />
    </div>
  )
}

const TextGenerator = () => {
  const { user, isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();
  const router = useRouter();

  // Form States
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [inputText, setInputText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null); // Changed to object to store structured data

  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);

  // Authentication
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

  // Generate Text Function
  const generateText = async () => {
    if (!inputText.trim() || !domain.trim() ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setShowEvaluation(false); // Hide evaluation when generating new content

      console.log("Frontend sending:");
      console.log("- domain:", domain);
      console.log("- difficulty:", difficulty);
      console.log("- inputText length:", inputText.length);

      const response = await generateSheet(
        domain,
        difficulty,
        inputText.replace(/<[^>]*>/g, ''), // Strip HTML
      );

      console.log("Response received:", response);
      console.log("Response type:", typeof response);

      // Fix the "Object Object" issue
      if (response && typeof response === 'object') {
        // If response is an object, extract the content
        const content = response.content || response.text || response.fiche || JSON.stringify(response, null, 2);
        setGeneratedText(content);
      } else if (typeof response === 'string') {
        setGeneratedText(response);
      } else {
        setGeneratedText("No content generated");
      }

      setShowResult(true);

    } catch (error) {
      console.error('Generation error:', error);
      setError(`Failed to generate text: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Evaluate Sheet Function
  const handleEvaluateSheet = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to evaluate");
      return;
    }

    try {
      setIsEvaluating(true);
      setError(null);

      console.log("Evaluating text:", inputText.replace(/<[^>]*>/g, ''));

      const response = await evaluateSheet(inputText.replace(/<[^>]*>/g, ''));
      
      console.log("Evaluation response:", response);
      console.log("Evaluation response type:", typeof response);

      // Handle error response
      if (response.error) {
        setError(response.error);
        setEvaluation(null);
        setShowResult(false);
        return;
      }

      // Structure the evaluation data
      const evaluationData = {
        domain: response?.classification?.domain || 'Not specified',
        difficulty: response?.classification?.difficulty || 'Not specified',
        feedback:response?.qualityScore?.feedback|| response?.content || response?.text || response?.fiche || 'No feedback provided'
      };

      setEvaluation(evaluationData);
      setShowEvaluation(true);

    } catch (error) {
      console.error("Evaluation error:", error);
      setError(`Failed to evaluate text: ${error.message || 'Unknown error'}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const clearForm = () => {
    setDomain("");
   setDifficulty("medium");
    setInputText("");
    setGeneratedText("");
    setEvaluation(null); // Reset to null
    setShowResult(false);
    setShowEvaluation(false);
    setError(null);
  };

  const copyToClipboard = (text) => {
    let plainText;
    if (typeof text === 'object' && text !== null) {
      // Format the evaluation object as readable text
      plainText = `Domain: ${text.domain}\nDifficulty: ${text.difficulty}\n\nFeedback:\n${text.feedback}`;
    } else {
      plainText = text.replace(/<[^>]*>/g, '');
    }
    navigator.clipboard.writeText(plainText);
    // You could add a toast notification here
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated || !user?.isVerified) {
    return null;
  }

  const isAnyActionRunning = isGenerating || isEvaluating;

  return (
    <>
      {/* Fixed Background */}
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
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-screen">
        <Navbar />

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-800/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Text Generator</h3>
                  <p className="text-slate-400 text-sm">AI-Powered Content Creation</p>
                </div>
              </div>
            </div>

            {/* Form Controls */}
            <div className="p-6 flex-1 space-y-6">
              {/* Domain */}
         <div>
  <label className="block text-sm font-medium text-slate-300 mb-2">
    <BookOpen className="w-4 h-4 inline mr-2" />
    Domain
  </label>
  <select
    value={domain}
    onChange={(e) => setDomain(e.target.value)}
    disabled={isAnyActionRunning}
    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <option value="">Select a domain</option>
    <option value="mathematics">Mathematics</option>
    <option value="physics">Physics</option>
    <option value="chemistry">Chemistry</option>
    <option value="biology">Biology</option>
    <option value="history">History</option>
    <option value="geography">Geography</option>
    <option value="literature">Literature</option>
    <option value="philosophy">Philosophy</option>
    <option value="computer_science">Computer Science</option>
    <option value="economics">Economics</option>
    <option value="law">Law</option>
    <option value="medicine">Medicine</option>
    <option value="psychology">Psychology</option>
    <option value="sociology">Sociology</option>
    <option value="art">Art</option>
    <option value="music">Music</option>
    <option value="other">Other</option>
  </select>
</div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  disabled={isAnyActionRunning}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="easy">Beginner</option>
                  <option value="medium">Intermediate</option>
                  <option value="hard">Advanced</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                {/* Generate Button */}
                <button
                  onClick={generateText}
                  disabled={isAnyActionRunning || !inputText.trim() || !domain.trim() }
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Sheet</span>
                    </>
                  )}
                </button>

                {/* Evaluate Button */}
                <button
                  onClick={handleEvaluateSheet}
                  disabled={isAnyActionRunning || !inputText.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Evaluate Sheet</span>
                    </>
                  )}
                </button>

                {/* Clear Button */}
                <button
                  onClick={clearForm}
                  disabled={isAnyActionRunning}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <h2 className="text-white font-semibold">Content Editor</h2>
                </div>
                {(showResult || showEvaluation) && (
                  <div className="flex space-x-2">
                    {showResult && (
                      <button
                        onClick={() => copyToClipboard(generatedText)}
                        className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Generated</span>
                      </button>
                    )}
                    {showEvaluation && (
                      <button
                        onClick={() => copyToClipboard(evaluation)}
                        className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Evaluation</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Content Areas */}
            <div className="flex-1 overflow-hidden">
              {!showResult && !showEvaluation ? (
                /* Input Editor */
                <div className="h-full p-6">
                  <div className="h-full">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Input Text</h3>
                      <p className="text-slate-400 text-sm">
                        Write or paste your text here. Use the rich text editor to format your content.
                        {isEvaluating && <span className="text-green-400 ml-2">✓ Only text input is active during evaluation</span>}
                      </p>
                    </div>
                    <TipTapEditor
                      content={inputText}
                      onChange={setInputText}
                      placeholder="Start writing your text here... You can use rich formatting!"
                      disabled={isEvaluating} // Disable editor during evaluation
                    />
                  </div>
                </div>
              ) : (
                /* Split/Triple View: Input, Generated, and/or Evaluation */
                <div className="h-full flex">
                  {/* Input Side */}
                  <div className={`p-6 border-r border-slate-800/50 ${
                    showResult && showEvaluation ? 'w-1/3' : 'w-1/2'
                  }`}>
                    <div className="h-full">
                      <h3 className="text-lg font-semibold text-white mb-4">Original Text</h3>
                      <div className="h-full overflow-y-auto bg-slate-800/30 rounded-xl p-4">
                        <div 
                          className="text-slate-300 prose prose-sm"
                          dangerouslySetInnerHTML={{ __html: inputText }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Generated Side */}
                  {showResult && (
                    <div className={`p-6 ${
                      showEvaluation ? 'w-1/3 border-r border-slate-800/50' : 'w-1/2'
                    }`}>
                      <div className="h-full">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Generated Text</h3>
                          {!showEvaluation && (
                            <button
                              onClick={() => setShowResult(false)}
                              className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                            >
                              Back to Editor
                            </button>
                          )}
                        </div>
                        <div className="h-full overflow-y-auto bg-slate-800/30 rounded-xl p-4">
                          <div className="text-slate-100 prose prose-sm whitespace-pre-wrap">
                            {generatedText}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Evaluation Side */}
                  {showEvaluation && evaluation && (
                    <div className={`p-6 ${showResult ? 'w-1/3' : 'w-1/2'}`}>
                      <div className="h-full">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Evaluation</h3>
                          {!showResult && (
                            <button
                              onClick={() => setShowEvaluation(false)}
                              className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                            >
                              Back to Editor
                            </button>
                          )}
                        </div>
                        <div className="h-full overflow-y-auto bg-green-900/20 rounded-xl p-4 border border-green-500/20">
                          {/* Classification Info */}
                          <div className="mb-6">
                            <h4 className="text-green-200 font-semibold mb-3 flex items-center">
                              <Target className="w-4 h-4 mr-2" />
                              Classification
                            </h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-green-800/20 rounded-lg p-3 border border-green-700/30">
                                <div className="text-green-300 text-sm font-medium">Domain</div>
                                <div className="text-green-100 capitalize">{evaluation.domain}</div>
                              </div>
                              <div className="bg-green-800/20 rounded-lg p-3 border border-green-700/30">
                                <div className="text-green-300 text-sm font-medium">Difficulty</div>
                                <div className="text-green-100 capitalize">{evaluation.difficulty}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Feedback */}
                          <div>
                            <h4 className="text-green-200 font-semibold mb-3 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Feedback
                            </h4>
                            <div className="text-green-100 prose prose-sm whitespace-pre-wrap leading-relaxed">
                              {evaluation.feedback}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ProseMirror {
          outline: none;
          color: white;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #64748b;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          color: white;
        }
        .ProseMirror code {
          background-color: #374151;
          color: #f3f4f6;
          padding: 2px 4px;
          border-radius: 4px;
        }
        .ProseMirror pre {
          background-color: #1f2937;
          border-radius: 8px;
          padding: 12px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </>
  );
};

export default TextGenerator;