import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  Filter, 
  Check, 
  X, 
  AlertCircle,
  TrendingUp,
  User,
  Share2
} from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { RichQuestionViewer } from '../components/RichQuestionViewer';

interface ExamResultsPageProps {
  onNavigate: (view: string, extraData?: any) => void;
}

export const ExamResultsPage: React.FC<ExamResultsPageProps> = ({ onNavigate }) => {
  const { lastAttemptResult, startExam, allExams = [] } = useExam();
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'flagged'>('all');

  if (!lastAttemptResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Award className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Recent Exam Result Found</h2>
        <p className="text-xs text-slate-400">Take an exam in the Exam Center Hub to view your detailed analytics.</p>
        <button
          onClick={() => onNavigate('hub')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
        >
          Go to Exam Center Hub
        </button>
      </div>
    );
  }

  // Find original exam questions for in-depth review (from built-in or custom exams)
  const examsList = allExams || [];
  const exam = examsList.find(e => e.id === lastAttemptResult.examId);
  const questions = exam?.questions || [];

  // Format time taken
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  const handleRetake = () => {
    if (exam) {
      startExam(exam);
      onNavigate('workspace');
    }
  };

  // Filter questions based on filterMode
  const filteredQuestions = questions.filter((q, idx) => {
    const selected = lastAttemptResult.userAnswers[idx];
    const isCorrect = selected === q.correctAnswerIndex;
    const isFlagged = lastAttemptResult.flaggedQuestions.includes(idx);

    if (filterMode === 'incorrect') {
      return !isCorrect;
    }
    if (filterMode === 'flagged') {
      return isFlagged;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      {/* 1. HERO SCORE SUMMARY CARD */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-[10px] uppercase font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                {lastAttemptResult.examCategory} Result
              </span>
              <span className="text-xs text-slate-500">
                Completed on {new Date(lastAttemptResult.completedAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {lastAttemptResult.examTitle}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              <span className="text-xs text-slate-600">
                Candidate: <strong className="text-slate-900">{lastAttemptResult.userName}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Time Spent: <strong className="text-slate-900 font-mono">{formatTime(lastAttemptResult.timeTakenSeconds)}</strong>
              </span>
            </div>
          </div>

          {/* Score Badge */}
          <div className="text-center shrink-0">
            <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center p-2 border-4 shadow-xs ${
              lastAttemptResult.passed
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              <div className="text-3xl font-black font-mono">{lastAttemptResult.scorePercent}%</div>
              <div className="text-[10px] uppercase tracking-wider font-extrabold mt-0.5">
                {lastAttemptResult.passed ? 'PASSED' : 'NOT PASSED'}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-medium">
              National Pass Mark: {exam?.passMarkPercent || 70}%
            </div>
          </div>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
            <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Total Questions</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">{lastAttemptResult.totalQuestions}</div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-lg text-center">
            <div className="text-[11px] text-emerald-800 flex items-center justify-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Correct Answers</span>
            </div>
            <div className="text-lg font-bold text-emerald-800 font-mono mt-0.5">{lastAttemptResult.totalCorrect}</div>
          </div>

          <div className="bg-red-50/60 border border-red-200 p-3 rounded-lg text-center">
            <div className="text-[11px] text-red-800 flex items-center justify-center gap-1 font-semibold">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Incorrect Answers</span>
            </div>
            <div className="text-lg font-bold text-red-800 font-mono mt-0.5">{lastAttemptResult.totalIncorrect}</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
            <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Skipped / Blank</span>
            </div>
            <div className="text-lg font-bold text-slate-700 font-mono mt-0.5">{lastAttemptResult.totalSkipped}</div>
          </div>
        </div>

        {/* Primary Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={() => onNavigate('hub')}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Return to Exam Center Hub</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('profile')}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>View in Profile History</span>
            </button>

            <button
              onClick={handleRetake}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DETAILED QUESTION-BY-QUESTION REVIEW */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Detailed Solution Key & Explanations
            </h3>
            <p className="text-xs text-slate-500">
              Review official reasoning and Ethiopian curriculum benchmarks for every question.
            </p>
          </div>

          {/* Review Filter Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 self-start sm:self-auto text-xs shadow-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                filterMode === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({questions.length})
            </button>

            <button
              onClick={() => setFilterMode('incorrect')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                filterMode === 'incorrect' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Incorrect Only ({lastAttemptResult.totalIncorrect + lastAttemptResult.totalSkipped})
            </button>

            <button
              onClick={() => setFilterMode('flagged')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                filterMode === 'flagged' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flagged ({lastAttemptResult.flaggedQuestions.length})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, qIndex) => {
            const originalIndex = questions.findIndex(orig => orig.id === q.id);
            const userSelected = lastAttemptResult.userAnswers[originalIndex];
            const isCorrect = userSelected === q.correctAnswerIndex;
            const isSkipped = userSelected === undefined;

            return (
              <div
                key={q.id}
                className={`bg-white border rounded-xl p-5 space-y-3.5 shadow-xs ${
                  isCorrect
                    ? 'border-emerald-200'
                    : isSkipped
                    ? 'border-slate-200'
                    : 'border-red-200'
                }`}
              >
                {/* Question item header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      Q{originalIndex + 1}
                    </span>
                    <span className="text-xs text-slate-500">{q.topic}</span>
                  </div>

                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Correct (+1)</span>
                      </span>
                    ) : isSkipped ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Skipped</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-800 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Rich Question Review */}
                <RichQuestionViewer
                  question={q}
                  questionNumber={originalIndex + 1}
                  totalQuestions={questions.length}
                  readOnly={true}
                  showAnswerFeedback={true}
                  userSelectedIndex={userSelected}
                />

                {/* In-Depth Explanation Box */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 space-y-1 text-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pedagogical Explanation:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
