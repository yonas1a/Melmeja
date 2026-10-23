import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Flag, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Sparkles, 
  Send,
  X,
  HelpCircle,
  Maximize2,
  Minimize2,
  Check,
  Lock,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { QuestionPaletteStatus } from '../types';
import { RichQuestionViewer } from '../components/RichQuestionViewer';

interface LiveExamWorkspaceProps {
  onNavigate: (view: string, extraData?: any) => void;
}

export const LiveExamWorkspace: React.FC<LiveExamWorkspaceProps> = ({ onNavigate }) => {
  const { user, hasExamAccess, isAdmin } = useAuth();
  const {
    currentExam,
    currentQuestionIndex,
    userAnswers,
    flaggedQuestions,
    remainingSeconds,
    selectAnswer,
    toggleFlagCurrentQuestion,
    clearCurrentAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitExam,
    exitExamToHub,
    getQuestionStatus,
    getStatsSummary,
    isSubmitting
  } = useExam();

  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleExitExamConfirmed = () => {
    setShowExitConfirmModal(false);
    exitExamToHub();
    onNavigate('hub');
  };

  // Keyboard navigation support (A/B/C/D or 1/2/3/4 to select, Arrow keys to navigate, F to flag)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is focused or modal is open
      if (showSubmitConfirmModal) return;

      const key = e.key.toUpperCase();
      if (['A', '1'].includes(key)) {
        selectAnswer(0);
      } else if (['B', '2'].includes(key)) {
        selectAnswer(1);
      } else if (['C', '3'].includes(key)) {
        selectAnswer(2);
      } else if (['D', '4'].includes(key)) {
        selectAnswer(3);
      } else if (key === 'F') {
        toggleFlagCurrentQuestion();
      } else if (e.key === 'ArrowRight') {
        nextQuestion();
      } else if (e.key === 'ArrowLeft') {
        prevQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSubmitConfirmModal, selectAnswer, toggleFlagCurrentQuestion, nextQuestion, prevQuestion]);

  if (!currentExam) return null;

  // Strict Access Guard: Only logged-in students with verified payment (or admin) can access
  const isAuthorized = isAdmin || (!!user && hasExamAccess(currentExam.id, false, currentExam.packageRequired));
  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-xl text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900">Exam Locked • Payment Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            To maintain examination integrity and provide full question solutions, access to <span className="font-bold text-slate-900">"{currentExam.title}"</span> requires login and a verified Telebirr package payment.
          </p>
        </div>

        <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-left text-xs space-y-2 text-slate-700">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-amber-700" />
            <span>How to unlock this exam:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
            <li>Submit payment via Telebirr (Account: <span className="font-mono font-bold text-slate-900">+251963155856</span>)</li>
            <li>Upload transaction screenshot or enter Transaction ID on the payment page</li>
            <li>Admin verifies submission within minutes and unlocks your full testing package</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('payment', { preselectedPackageId: currentExam.packageRequired })}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Unlock via Telebirr</span>
          </button>
          <button
            onClick={() => {
              exitExamToHub();
              onNavigate('hub');
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
          >
            <span>Back to Exam Hub</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQ = currentExam.questions[currentQuestionIndex];
  const totalQuestions = currentExam.questions.length;
  const isFlagged = flaggedQuestions.includes(currentQuestionIndex);
  const selectedOption = userAnswers[currentQuestionIndex];

  // Format countdown HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const isTimeCritical = remainingSeconds < 300; // less than 5 mins
  const stats = getStatsSummary();

  const handleFinalSubmit = async () => {
    const result = await submitExam();
    setShowSubmitConfirmModal(false);
    if (result) {
      onNavigate('results');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Exam Title & Category */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setShowExitConfirmModal(true)}
              className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Exit Exam to Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  {currentExam.category}
                </span>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {currentExam.title}
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Question {currentQuestionIndex + 1} of {totalQuestions} • {currentQ?.topic || 'General Aptitude'}
              </p>
            </div>
          </div>

          {/* Right Action Items: Live Countdown Timer & Submit Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Live Countdown Timer */}
            <div
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                isTimeCritical
                  ? 'bg-red-50 text-red-700 border-red-300 animate-pulse shadow-xs'
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isTimeCritical ? 'text-red-600' : 'text-slate-600'}`} />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="hidden sm:flex p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Submit Exam Button */}
            <button
              onClick={() => setShowSubmitConfirmModal(true)}
              className="px-2.5 sm:px-4 py-2 sm:py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. SPLIT WORKSPACE: Main Panel (Left) + Right Question Palette Panel (Sticky Grid) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
        
        {/* LEFT QUESTION PANEL (8 cols on lg) */}
        <main className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between overflow-hidden min-h-[min(520px,calc(100dvh-90px))] sm:min-h-[520px]">
          {/* Question Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Question {currentQuestionIndex + 1}
              </span>
              <span className="text-xs text-slate-500 font-medium">of {totalQuestions}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded truncate max-w-[40%]">
                Topic: {currentQ?.topic}
              </span>
            </div>
          </div>

          {/* Question Content & Options */}
          <div className="p-5 sm:p-6 space-y-5 flex-1">
            {currentQ && (
              <RichQuestionViewer
                question={currentQ}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
                selectedOptionIndex={selectedOption}
                onSelectOption={(idx) => selectAnswer(idx)}
                readOnly={false}
              />
            )}
          </div>

          {/* BOTTOM ACTION BAR */}
          <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            {/* Left Controls: Flag & Clear Selection */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={toggleFlagCurrentQuestion}
                className={`px-2.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isFlagged
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-white' : 'text-red-500'}`} />
                <span>{isFlagged ? 'Flagged (Red)' : 'Flag Question'}</span>
              </button>

              {selectedOption !== undefined && (
                <button
                  type="button"
                  onClick={clearCurrentAnswer}
                  className="px-2 py-2 sm:py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Selection</span>
                </button>
              )}
            </div>

            {/* Right Controls: Previous & Next Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={nextQuestion}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="px-3 sm:px-4 py-2 sm:py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:pointer-events-none text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT QUESTION PALETTE PANEL (4 cols on lg, sticky) */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-xs p-3 sm:p-5 lg:sticky lg:top-20 space-y-3 sm:space-y-4">
          {/* Palette Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Question Palette
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              {stats.answered} / {totalQuestions} answered
            </span>
          </div>

          {/* PALETTE COLOR CODING RULES
              - Active/Current Question: Blue outline/highlight.
              - Answered Question: Solid Green background.
              - Unanswered/Skipped Question: Solid Gray/Slate background.
              - Flagged Question: Solid Red background.
          */}
          <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-5 gap-1.5 sm:gap-2 max-h-56 sm:max-h-none overflow-y-auto">
            {currentExam.questions.map((_, index) => {
              const status: QuestionPaletteStatus = getQuestionStatus(index);
              const isActive = index === currentQuestionIndex;

              let btnClass = '';

              if (isActive) {
                // Active: Blue outline + ring
                btnClass = 'bg-white border-2 border-blue-600 text-blue-700 font-black ring-2 ring-blue-500/20 shadow-xs';
              } else if (status === 'flagged') {
                // Flagged: Solid Red background
                btnClass = 'bg-red-600 text-white font-bold border border-red-600 shadow-xs';
              } else if (status === 'answered') {
                // Answered: Solid Green background
                btnClass = 'bg-emerald-600 text-white font-bold border border-emerald-600 shadow-xs';
              } else {
                // Unanswered/Skipped: Solid Gray background
                btnClass = 'bg-slate-100 text-slate-700 font-semibold border border-slate-200 hover:bg-slate-200';
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToQuestion(index)}
                  className={`h-10 sm:h-9 rounded-lg text-xs transition-all flex items-center justify-center relative active:scale-95 ${btnClass}`}
                  title={`Question ${index + 1} (${status})`}
                >
                  <span>{index + 1}</span>
                  {flaggedQuestions.includes(index) && !isActive && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamic Color Coding Rules Legend */}
          <div className="hidden sm:block bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Color Coding Legend:
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-white border-2 border-blue-600"></div>
                <span>Active / Current</span>
              </div>
              <span className="font-mono font-bold text-blue-700">Q{currentQuestionIndex + 1}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-emerald-600"></div>
                <span>Answered</span>
              </div>
              <span className="font-mono font-bold text-emerald-700">{stats.answered}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-red-600"></div>
                <span>Flagged for Review</span>
              </div>
              <span className="font-mono font-bold text-red-600">{stats.flagged}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300"></div>
                <span>Unanswered</span>
              </div>
              <span className="font-mono font-bold text-slate-600">{stats.unanswered}</span>
            </div>
          </div>

          {/* Quick Shortcuts Info */}
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 space-y-1">
            <div className="font-semibold text-slate-700">Keyboard Shortcuts:</div>
            <div className="flex flex-wrap gap-1 text-[10px]">
              <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">A/B/C/D</span> Select Option
              <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">F</span> Flag
              <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">← / →</span> Navigate
            </div>
          </div>
        </aside>
      </div>

      {/* 3. SUBMIT CONFIRMATION MODAL */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Submit Examination?</h3>
              <p className="text-xs text-slate-500">
                Please review your progress before finalizing your submission.
              </p>
            </div>

            {/* Summary Progress Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span>Total Questions:</span>
                <span className="font-bold text-slate-900 font-mono">{totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-700">
                <span>Answered:</span>
                <span className="font-bold font-mono">{stats.answered}</span>
              </div>
              <div className="flex justify-between items-center text-red-600">
                <span>Flagged Questions:</span>
                <span className="font-bold font-mono">{stats.flagged}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Unanswered / Skipped:</span>
                <span className="font-bold font-mono">{stats.unanswered}</span>
              </div>
              <div className="flex justify-between items-center text-amber-800 pt-2 border-t border-slate-200">
                <span>Time Remaining:</span>
                <span className="font-mono font-bold">{formatTime(remainingSeconds)}</span>
              </div>
            </div>

            {stats.unanswered > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>You have {stats.unanswered} unanswered question(s). Unanswered questions are marked as incorrect.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Keep Working
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Grading Test...' : 'Yes, Final Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. EXIT EXAMINATION CONFIRMATION MODAL */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Leave Examination?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to exit? Your answered questions and progress will be saved if you return during this session.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Current Exam:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{currentExam.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Progress:</span>
                <span className="font-mono font-bold text-emerald-700">{stats.answered} / {totalQuestions} answered</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowExitConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Resume Exam
              </button>

              <button
                type="button"
                onClick={handleExitExamConfirmed}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit to Exam Hub</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
