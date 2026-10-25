import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronLeft,
  Filter,
  X,
  CreditCard,
  Check,
  Calendar,
  GraduationCap,
  Layers,
  ArrowUpDown,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { EXAM_PACKAGES, getCategoryPackageId } from '../data/examsData';
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

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'YEAR_DESC' | 'QUESTIONS_DESC' | 'TITLE_ASC'>('DEFAULT');

  // Pagination & Launch States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const ITEMS_PER_PAGE = 18;

  // Modal for Exam Instructions before starting
  const [instructionExam, setInstructionExam] = useState<Exam | null>(() => {
    if (initialSelectedExamId) {
      return examsList.find(e => e.id === initialSelectedExamId) || null;
    }
    return null;
  });

  // Whenever top filters change, reset pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedYear, selectedDepartment, searchQuery, sortBy]);

  // Primary Category Definitions with Counts
  const categories: { label: string; value: string; count: number; badgeColor: string }[] = [
    { label: 'All Exams', value: 'ALL', count: examsList.length, badgeColor: 'bg-slate-900 text-white' },
    { label: 'Grade 9', value: 'GRADE_9', count: examsList.filter(e => e.category === 'GRADE_9').length, badgeColor: 'bg-emerald-600 text-white' },
    { label: 'Grade 10', value: 'GRADE_10', count: examsList.filter(e => e.category === 'GRADE_10').length, badgeColor: 'bg-teal-600 text-white' },
    { label: 'Grade 11', value: 'GRADE_11', count: examsList.filter(e => e.category === 'GRADE_11').length, badgeColor: 'bg-indigo-600 text-white' },
    { label: 'Grade 12', value: 'GRADE_12', count: examsList.filter(e => e.category === 'GRADE_12').length, badgeColor: 'bg-violet-600 text-white' },
    { label: 'Grade 12 Entrance', value: 'ENTRANCE', count: examsList.filter(e => e.category === 'ENTRANCE').length, badgeColor: 'bg-blue-600 text-white' },
    { label: 'NGAT (Graduate)', value: 'NGAT', count: examsList.filter(e => e.category === 'NGAT').length, badgeColor: 'bg-purple-600 text-white' },
    { label: 'AAU GAT', value: 'GAT', count: examsList.filter(e => e.category === 'GAT').length, badgeColor: 'bg-sky-600 text-white' },
    { label: 'MoE EXIT Exams', value: 'EXIT', count: examsList.filter(e => e.category === 'EXIT').length, badgeColor: 'bg-rose-600 text-white' },
  ];

  // Dynamically compute available years for the current category selection
  const availableYears = useMemo(() => {
    const relevant = selectedCategory === 'ALL'
      ? examsList
      : examsList.filter(e => e.category === selectedCategory);
    const set = new Set<string>();
    relevant.forEach(e => {
      if (e.yearOrSession) {
        const y = e.yearOrSession.match(/\b(20\d{2})\b/)?.[1];
        if (y) set.add(y);
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [examsList, selectedCategory]);

  // Dynamically compute available departments/subjects for current category & year
  const availableDepartments = useMemo(() => {
    const relevant = examsList.filter(e => {
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
      if (selectedYear !== 'ALL' && !e.yearOrSession?.includes(selectedYear)) return false;
      return true;
    });
    const set = new Set<string>();
    relevant.forEach(e => {
      const dept = e.department || e.subCategory;
      if (dept) set.add(dept);
    });
    return Array.from(set).sort();
  }, [examsList, selectedCategory, selectedYear]);

  // Comprehensive Filter & Search Logic
  const filteredExams = useMemo(() => {
    let result = examsList.filter(exam => {
      // 1. Primary Category Filter
      if (selectedCategory !== 'ALL' && exam.category !== selectedCategory) {
        return false;
      }
      // 2. Year Filter
      if (selectedYear !== 'ALL') {
        if (!exam.yearOrSession || !exam.yearOrSession.includes(selectedYear)) {
          return false;
        }
      }
      // 3. Department / Subject Filter
      if (selectedDepartment !== 'ALL') {
        const dept = exam.department || exam.subCategory;
        if (dept !== selectedDepartment) {
          return false;
        }
      }
      // 4. Free text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = exam.title?.toLowerCase().includes(q);
        const matchSub = exam.subCategory?.toLowerCase().includes(q);
        const matchDept = exam.department?.toLowerCase().includes(q);
        const matchDesc = exam.description?.toLowerCase().includes(q);
        const matchTags = exam.tags?.some(t => t.toLowerCase().includes(q)) || false;
        const matchYear = exam.yearOrSession?.toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchDept && !matchDesc && !matchTags && !matchYear) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    if (sortBy === 'YEAR_DESC') {
      result.sort((a, b) => (b.yearOrSession || '').localeCompare(a.yearOrSession || ''));
    } else if (sortBy === 'QUESTIONS_DESC') {
      result.sort((a, b) => (b.totalQuestions || b.questions.length) - (a.totalQuestions || a.questions.length));
    } else if (sortBy === 'TITLE_ASC') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [examsList, selectedCategory, selectedYear, selectedDepartment, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredExams.length / ITEMS_PER_PAGE));
  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExams.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredExams, currentPage, ITEMS_PER_PAGE]);

  // Handle Exam card click
  const handleExamClick = (exam: Exam, isUnlocked: boolean) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (isUnlocked) {
      setInstructionExam(exam);
    } else {
      const packageId = getCategoryPackageId(exam.category) || exam.packageRequired;
      onNavigate('payment', { preselectedPackageId: packageId });
    }
  };

  // Launch live exam simulation
  const handleLaunchExam = async (exam: Exam) => {
    if (!hasExamAccess(exam.id, false, exam.packageRequired, exam.category)) {
      setInstructionExam(null);
      const packageId = getCategoryPackageId(exam.category) || exam.packageRequired;
      onNavigate('payment', { preselectedPackageId: packageId });
      return;
    }

    try {
      setIsLaunching(true);
      await startExam(exam);
      setInstructionExam(null);
      onNavigate('workspace');
    } catch (err) {
      console.error('Failed to launch exam:', err);
    } finally {
      setIsLaunching(false);
    }
  };

  // Category badge color helper
  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'GRADE_9':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'GRADE_10':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'GRADE_11':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'GRADE_12':
        return 'bg-violet-50 text-violet-800 border-violet-200';
      case 'ENTRANCE':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'NGAT':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'GAT':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'EXIT':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || selectedYear !== 'ALL' || selectedDepartment !== 'ALL' || searchQuery.trim().length > 0;

  const resetAllFilters = () => {
    setSelectedCategory('ALL');
    setSelectedYear('ALL');
    setSelectedDepartment('ALL');
    setSearchQuery('');
    setSortBy('DEFAULT');
  };

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 overflow-x-clip">
      {/* Email verification notice if needed */}
      <EmailVerificationNotice />

      {/* Hub Header */}
      <div className="flex min-w-0 flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="min-w-0 break-words text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Ethiopian National Exam Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 break-words leading-relaxed">
            Access over <strong>33,000+ authentic questions</strong> spanning <strong>Grade 9–12</strong>, <strong>University Entrance (EUEE)</strong>, <strong>NGAT</strong>, <strong>AAU GAT</strong>, and <strong>MoE Exit Exams</strong>.
          </p>
        </div>

        {/* Quick Payment Link */}
        <button
          onClick={() => onNavigate('payment')}
          className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all flex items-center gap-2 shadow-xs self-start sm:self-auto shrink-0"
        >
          <CreditCard className="w-4 h-4 text-amber-700" />
          <span>Telebirr Instant Access</span>
        </button>
      </div>

      {/* Examination levels and filters */}
      <section className="min-w-0 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="min-w-0 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Select Examination Level</span>
            </span>
            <span className="text-xs text-slate-500">
              {filteredExams.length} matching exam{filteredExams.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex min-w-0 max-w-full items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setSelectedYear('ALL');
                    setSelectedDepartment('ALL');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 px-4 pb-4 pt-3 border-t border-slate-100 space-y-3">
        <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Year Filter */}
          <div className="min-w-0 space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>Filter by Year</span>
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="ALL">All Exam Years ({availableYears.length})</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year} National Exams</option>
              ))}
            </select>
          </div>

          {/* Department / Subject Filter */}
          <div className="min-w-0 space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Filter by Department / Subject</span>
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="ALL">All Departments & Subjects ({availableDepartments.length})</option>
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="min-w-0 space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
              <span>Sort Order</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="DEFAULT">Recommended Default</option>
              <option value="YEAR_DESC">Newest Year First</option>
              <option value="QUESTIONS_DESC">Most Questions First</option>
              <option value="TITLE_ASC">Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Keyword Search */}
          <div className="min-w-0 space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-600" />
              <span>Search Question Banks</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search calculus, vectors, optics..."
                className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Chips & Clear Button */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 font-medium">Active filters:</span>
              
              {selectedCategory !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  Level: {categories.find(c => c.value === selectedCategory)?.label}
                  <button onClick={() => setSelectedCategory('ALL')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedYear !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 font-bold border border-purple-200">
                  Year: {selectedYear}
                  <button onClick={() => setSelectedYear('ALL')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedDepartment !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
                  Dept: {selectedDepartment}
                  <button onClick={() => setSelectedDepartment('ALL')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                  Query: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={resetAllFilters}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
        </div>
      </section>

      {/* 3. EXAM GRID OR EMPTY STATE */}
      {filteredExams.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-4 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900">No matching exams found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              We couldn't find any exams matching your combination of Category, Year, Department, and search query. Try broadening your criteria.
            </p>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid min-w-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {paginatedExams.map((exam) => {
              const isUnlocked = hasExamAccess(exam.id, exam.isFree, exam.packageRequired, exam.category);
              const catPackageId = getCategoryPackageId(exam.category);
              const reqPackage = EXAM_PACKAGES.find(p => p.id === catPackageId) || EXAM_PACKAGES.find(p => p.id === exam.packageRequired);
              const badgeStyle = getCategoryBadgeStyle(exam.category);
              const deptName = exam.department || exam.subCategory;
              const questionCount = exam.totalQuestions || exam.questions.length;
              const categoryDefaultPrice = ['GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12', 'ENTRANCE'].includes(exam.category) ? 300 : 500;
              const unlockPrice = reqPackage?.priceETB || categoryDefaultPrice;

              return (
                <div
                  key={exam.id}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between overflow-hidden hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  <div className="p-5 space-y-3.5">
                    {/* Top Badges: Category + Department + Access */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider border px-2 py-0.5 rounded-lg ${badgeStyle}`}>
                          {exam.category.replace('_', ' ')}
                        </span>

                        {exam.yearOrSession && (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                            {exam.yearOrSession}
                          </span>
                        )}
                      </div>

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
                    <h3 className="text-lg sm:text-xl font-extrabold leading-tight text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2 min-h-[2.5rem]">
                      {exam.title}
                    </h3>

                    {/* Compact Metadata line */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 font-medium border-t border-slate-100 pt-2.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{exam.durationMinutes}m</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>{questionCount} Qs</span>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">
                        {exam.passMarkPercent}% Pass
                      </span>
                      {deptName && (
                        <>
                          <span>•</span>
                          <span className="text-purple-700 font-semibold flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {deptName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="p-3.5 bg-slate-50 border-t border-slate-100">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleExamClick(exam, true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Take Exam Simulation</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleExamClick(exam, false)}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Unlock Category Access ({unlockPrice} ETB)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Showing <strong>{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</strong> to <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredExams.length)}</strong> of <strong>{filteredExams.length}</strong> exams
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* Page number indicators */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = Math.min(currentPage - 2 + i, totalPages - 4 + i);
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. EXAM INSTRUCTION & START MODAL */}
      {instructionExam && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-extrabold text-sm uppercase tracking-wider">
                  Exam Simulation Briefing
                </span>
              </div>
              <button
                onClick={() => setInstructionExam(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${getCategoryBadgeStyle(instructionExam.category)}`}>
                    {instructionExam.category.replace('_', ' ')}
                  </span>
                  {instructionExam.yearOrSession && (
                    <span className="text-xs text-slate-500 font-semibold">
                      Year: {instructionExam.yearOrSession}
                    </span>
                  )}
                  {instructionExam.department && (
                    <span className="text-xs text-purple-700 font-semibold">
                      • {instructionExam.department}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {instructionExam.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {instructionExam.description}
                </p>
              </div>

              {/* Exam Parameters Card */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">Duration</div>
                  <div className="text-base font-black text-slate-900 font-mono">{instructionExam.durationMinutes} Mins</div>
                </div>
                <div className="border-x border-slate-200">
                  <div className="text-[11px] text-slate-500 mb-0.5">Total Questions</div>
                  <div className="text-base font-black text-slate-900 font-mono">
                    {instructionExam.totalQuestions || instructionExam.questions.length} Qs
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">Pass Mark</div>
                  <div className="text-base font-black text-emerald-700 font-mono">{instructionExam.passMarkPercent}%</div>
                </div>
              </div>

              {/* Test Guidelines */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Guidelines & Rules:
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>The countdown timer starts immediately upon clicking <strong>Start Exam Now</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Use the question palette to jump between questions and flag items for review.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Full step-by-step explanations and derivations are displayed after submitting.</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  disabled={isLaunching}
                  onClick={() => setInstructionExam(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>

                {hasExamAccess(instructionExam.id, false, instructionExam.packageRequired) ? (
                  <button
                    disabled={isLaunching}
                    onClick={() => handleLaunchExam(instructionExam)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {isLaunching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading Questions...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start Exam Now</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled={isLaunching}
                    onClick={() => {
                      setInstructionExam(null);
                      onNavigate('payment', { preselectedPackageId: instructionExam.packageRequired });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Purchase Access ({EXAM_PACKAGES.find(p => p.id === instructionExam.packageRequired)?.priceETB || '200'} ETB)</span>
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
