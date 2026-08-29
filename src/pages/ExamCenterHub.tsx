import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Play, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Filter,
  X,
  CreditCard,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { INITIAL_EXAMS, EXAM_PACKAGES } from '../data/examsData';
import { Exam, ExamCategory } from '../types';
import { EmailVerificationNotice } from '../components/EmailVerificationNotice';

interface ExamCenterHubProps {
  onNavigate: (view: string, extraData?: any) => void;
  onOpenAuth: () => void;
  initialCategory?: string;
  initialSelectedExamId?: string;
}

export const ExamCenterHub: React.FC<ExamCenterHubProps> = ({ 
  onNavigate, 
  onOpenAuth, 
  initialCategory,
  initialSelectedExamId 
}) => {
  const { user, userProfile, hasExamAccess, isAdmin, isEmailVerified } = useAuth();
  const { startExam, allExams = [] } = useExam();
  const examsList = allExams || [];

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  // Modal for Exam Instructions before starting
  const [instructionExam, setInstructionExam] = useState<Exam | null>(() => {
    if (initialSelectedExamId) {
      return examsList.find(e => e.id === initialSelectedExamId) || null;
    }
    return null;
  });

  const categories: { label: string; value: string; count: number }[] = [
    { label: 'All Exams', value: 'ALL', count: examsList.length },
    { label: 'NGAT (Graduate)', value: 'NGAT', count: examsList.filter(e => e.category === 'NGAT').length },
    { label: 'AAU GAT', value: 'GAT', count: examsList.filter(e => e.category === 'GAT').length },
    { label: 'MoE EXIT Exams', value: 'EXIT', count: examsList.filter(e => e.category === 'EXIT').length },
    { label: 'Grade 12 Entrance', value: 'ENTRANCE', count: examsList.filter(e => e.category === 'ENTRANCE').length },
  ];

  // Filter exams
  const filteredExams = examsList.filter(exam => {
    if (selectedCategory !== 'ALL' && exam.category !== selectedCategory) {
      return false;
    }
    if (selectedDifficulty !== 'ALL' && exam.difficulty !== selectedDifficulty) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = exam.title?.toLowerCase().includes(q);
      const matchSub = exam.subCategory?.toLowerCase().includes(q);
      const matchDesc = exam.description?.toLowerCase().includes(q);
      const matchTags = exam.tags?.some(t => t.toLowerCase().includes(q)) || false;
      if (!matchTitle && !matchSub && !matchDesc && !matchTags) {
        return false;
      }
    }
    return true;
  });

  const handleExamClick = (exam: Exam, isUnlocked: boolean) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (isUnlocked) {
      setInstructionExam(exam);
    } else {
      // Redirect to payment page with this package preselected
      onNavigate('payment', { preselectedPackageId: exam.packageRequired });
    }
  };

  const handleLaunchExam = (exam: Exam) => {
    if (!hasExamAccess(exam.id, false, exam.packageRequired)) {
      setInstructionExam(null);
      onNavigate('payment', { preselectedPackageId: exam.packageRequired });
      return;
    }
    setInstructionExam(null);
    startExam(exam);
    onNavigate('workspace');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Email verification notice if needed */}
      <EmailVerificationNotice />

      {/* Hub Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Exam Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a mock exam simulation to test your knowledge or unlock full access.
          </p>
        </div>

        {/* Quick Payment Link */}
        <button
          onClick={() => onNavigate('payment')}
          className="px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <CreditCard className="w-4 h-4 text-amber-700" />
          <span>Telebirr Payment</span>
        </button>
      </div>

      {/* Category Pills & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exams..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Exam Grid */}
      {filteredExams.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl p-8 space-y-3 shadow-xs">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No exams found</h3>
          <button
            onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => {
            const isUnlocked = hasExamAccess(exam.id, exam.isFree, exam.packageRequired);
            const reqPackage = EXAM_PACKAGES.find(p => p.id === exam.packageRequired);

            return (
              <div
                key={exam.id}
                className="rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between overflow-hidden hover:border-slate-300 transition-all"
              >
                <div className="p-5 space-y-3">
                  {/* Top Category Tag & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                      {exam.category}
                    </span>

                    {/* DYNAMIC ACCESS BADGE */}
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Available</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold leading-snug text-slate-900">
                    {exam.title}
                  </h3>

                  {/* Sleek Compact 1-line Metadata */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium border-t border-slate-100 pt-2.5">
                    <span>⏱️ {exam.durationMinutes}m</span>
                    <span>•</span>
                    <span>📝 {exam.totalQuestions} Qs</span>
                    <span>•</span>
                    <span>🎯 {exam.passMarkPercent}% Pass</span>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="p-3.5 bg-slate-50 border-t border-slate-100">
                  {isUnlocked ? (
                    <button
                      onClick={() => handleExamClick(exam, true)}
                      className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Take Exam Simulation</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleExamClick(exam, false)}
                      className="w-full py-2.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] shadow-xs"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Unlock Access ({reqPackage?.priceETB || '200'} ETB)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Instruction Modal (Opens when an available exam is clicked) */}
      {instructionExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
            {/* Header decoration */}
            <div className="h-1.5 bg-emerald-600"></div>

            <button
              onClick={() => setInstructionExam(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {instructionExam.category}
                  </span>
                  <span className="text-xs text-slate-500">{instructionExam.subCategory}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {instructionExam.title}
                </h3>
                <p className="text-xs text-slate-600">
                  {instructionExam.description}
                </p>
              </div>

              {/* Exam Parameters Card */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">Exam Duration</div>
                  <div className="text-base font-black text-slate-900 font-mono">{instructionExam.durationMinutes} Minutes</div>
                </div>
                <div className="border-x border-slate-200">
                  <div className="text-[11px] text-slate-500 mb-0.5">Total Questions</div>
                  <div className="text-base font-black text-slate-900 font-mono">{instructionExam.totalQuestions} Items</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">Pass Mark</div>
                  <div className="text-base font-black text-emerald-700 font-mono">{instructionExam.passMarkPercent}%</div>
                </div>
              </div>

              {/* Test Guidelines */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Guidelines:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Timer starts immediately upon clicking <strong>Start Exam</strong>.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Use the palette to navigate and flag questions for review.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Answers can be changed anytime before submitting.</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setInstructionExam(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Cancel
                </button>

                {hasExamAccess(instructionExam.id, false, instructionExam.packageRequired) ? (
                  <button
                    onClick={() => handleLaunchExam(instructionExam)}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Exam Now</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setInstructionExam(null);
                      onNavigate('payment', { preselectedPackageId: instructionExam.packageRequired });
                    }}
                    className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Purchase Access ({EXAM_PACKAGES.find(p => p.id === instructionExam.packageRequired)?.priceETB || '350'} ETB)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
