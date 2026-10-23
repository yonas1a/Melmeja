import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  CreditCard, 
  ArrowRight, 
  Award, 
  Layers, 
  Flame,
  Check,
  ChevronRight,
  BarChart3,
  PhoneCall,
  Zap,
  CheckCircle,
  LayoutDashboard,
  Lock,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { EXAM_PACKAGES, INITIAL_EXAMS } from '../data/examsData';

interface LandingPageProps {
  onNavigate: (view: string, extraData?: any) => void;
  onOpenAuth: () => void;
}

// Animation Variants for Staggered Containers
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const cardHoverVariant = {
  rest: { y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  hover: { 
    y: -6, 
    boxShadow: '0 16px 30px -10px rgba(0, 0, 0, 0.08)',
    transition: { duration: 0.25, ease: 'easeOut' } 
  }
};

// Intro animation — each hero element enters in sequence
const heroIntroContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    }
  }
};

const heroIntroItem = {
  hidden: { opacity: 0, y: 28, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
  }
};

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { user } = useAuth();
  
  // Simulated dynamic ticking timer in preview card
  const [previewSeconds, setPreviewSeconds] = useState(2652); // ~44m 12s
  const [selectedMockOption, setSelectedMockOption] = useState<'A' | 'B'>('A');

  useEffect(() => {
    const timer = setInterval(() => {
      setPreviewSeconds(prev => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPreviewTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `00:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartExamOrAuth = (examId?: string) => {
    if (!user) {
      onOpenAuth();
    } else {
      onNavigate('hub', { selectedExamId: examId });
    }
  };

  const handlePurchasePackage = (packageId: string) => {
    onNavigate('payment', { preselectedPackageId: packageId });
  };

  return (
    <AnimatePresence>
    <motion.div 
      key="landing"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-16 pb-20 overflow-hidden"
    >
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-12 lg:pt-16 lg:pb-16 border-b border-slate-200 bg-white">
        {/* Animated Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              x: [0, 30, -20, 0],
              y: [0, -40, 20, 0],
              scale: [1, 1.1, 0.95, 1]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-100/60 blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, -35, 25, 0],
              y: [0, 30, -30, 0],
              scale: [1, 0.95, 1.08, 1]
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-amber-100/50 blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, 20, -30, 0],
              y: [0, 25, -15, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-purple-100/40 blur-3xl"
          />
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:pl-28 lg:pr-0 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-start">
            {/* Left Content Column — staggered intro */}
            <motion.div
              variants={heroIntroContainer}
              initial="hidden"
              animate="visible"
              className="lg:col-span-5 text-center lg:text-left space-y-5 lg:pr-0 lg:-mr-24 relative z-20"
            >

              {/* Top Tag */}
              <motion.div 
                variants={heroIntroItem}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs"
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                </motion.span>
                <span>National Examination Preparation Standard 2026</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 
                variants={heroIntroItem}
                className="text-4xl sm:text-5xl lg:text-[3.2rem] font-black text-slate-900 tracking-tight leading-[1.12]"
              >
                Ace Your{' '}
                <span className="text-emerald-700">
                  NGAT, GAT & EXIT
                </span>{' '}
                Exams
              </motion.h1>

              {/* Subtext */}
              <motion.p 
                variants={heroIntroItem}
                className="text-base text-slate-500 max-w-sm mx-auto lg:mx-0 font-normal leading-relaxed"
              >
                Practice with authentic timed mock exams, review step-by-step solutions, and track your readiness.
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                variants={heroIntroItem}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate('hub')}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Exams</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate('payment')}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  <span>Telebirr Payment</span>
                </motion.button>
              </motion.div>

              {/* Trust Metrics Bar */}
              <motion.div 
                variants={heroIntroItem}
                className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100"
              >
                {[
                  { val: '94.8%', label: 'Pass Rate 2026', color: 'text-slate-900' },
                  { val: '100%', label: 'MoE Aligned', color: 'text-emerald-700' },
                  { val: '5 Mins', label: 'Telebirr Time', color: 'text-amber-800' },
                  { val: '12,000+', label: 'Candidates', color: 'text-purple-800' }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="p-3 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-xs text-center lg:text-left"
                  >
                    <div className={`text-xl font-black ${stat.color}`}>{stat.val}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column: Hero Animation (Unclipped Right Side) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="lg:col-span-6 relative w-full h-[380px] xs:h-[420px] sm:h-[540px] lg:h-[760px] flex items-center justify-center pointer-events-none mt-2 lg:-mt-24"
            >
              {/* Moving Big Blurred #0d8400 Green Circle */}
              <motion.div
                animate={{
                  x: [0, 45, -35, 25, 0],
                  y: [0, -40, 45, -25, 0],
                  scale: [1, 1.25, 0.9, 1.18, 1],
                  opacity: [0.45, 0.7, 0.4, 0.65, 0.45]
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[580px] lg:h-[580px] rounded-full bg-[#0d8400] blur-[85px] sm:blur-[110px] pointer-events-none z-0"
              />

              <iframe
                src="/hero-section.html"
                title="Hero Section Animation"
                scrolling="no"
                className="w-full h-full border-0 bg-transparent overflow-hidden relative z-10"
                style={{ background: 'transparent' }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Exam Showcase Cards */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={itemFadeUp} className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Official Exam Programs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Comprehensive testing simulations calibrated exactly to Ethiopian Ministry of Education benchmarks.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Card 1: NGAT */}
          <motion.div 
            variants={itemFadeUp}
            whileHover="hover"
            initial="rest"
            animate="rest"
            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between group"
          >
            <div>
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-3"
              >
                <Award className="w-5 h-5" />
              </motion.div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">NGAT Master</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Full Prep Pack
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors">
                National Graduate Admission Test
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Quantitative shortcuts, verbal reasoning analogies, and complex analytical logic puzzles for MSc & PhD entry.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 mb-5">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Quantitative Reasoning (Birr/Ratios)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Analytical & Verbal Deductions</span>
                </li>
              </ul>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('hub', { category: 'NGAT' })}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white text-xs font-bold border border-emerald-200 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Practice NGAT</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>

          {/* Card 2: GAT (AAU) */}
          <motion.div 
            variants={itemFadeUp}
            whileHover="hover"
            initial="rest"
            animate="rest"
            className="bg-white border border-slate-200 hover:border-amber-500 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between group"
          >
            <div>
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-3"
              >
                <GraduationCap className="w-5 h-5" />
              </motion.div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs uppercase font-bold text-amber-800 tracking-wider">AAU GAT</span>
                <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                  Timed 50m
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-amber-800 transition-colors">
                Graduate Admission Test (AAU)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Directly aligned with Addis Ababa University testing center criteria, vocabulary levels, and speed drills.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 mb-5">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Quantitative Comparison questions</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Advanced English Sentence Equivalence</span>
                </li>
              </ul>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('hub', { category: 'GAT' })}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white text-xs font-bold border border-amber-200 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Practice GAT</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>

          {/* Card 3: EXIT Exams */}
          <motion.div 
            variants={itemFadeUp}
            whileHover="hover"
            initial="rest"
            animate="rest"
            className="bg-white border border-slate-200 hover:border-purple-500 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between group"
          >
            <div>
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mb-3"
              >
                <ShieldCheck className="w-5 h-5" />
              </motion.div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs uppercase font-bold text-purple-800 tracking-wider">MoE EXIT</span>
                <span className="text-[10px] bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                  Mandatory
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-purple-800 transition-colors">
                University Exit Exams 2026
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Mandatory Ministry of Education graduation benchmarks for Law, CS & IT, Medicine, and Accounting.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 mb-5">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>FDRE Constitution & Criminal Law</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>CS Algorithms, DBs & Networks</span>
                </li>
              </ul>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('hub', { category: 'EXIT' })}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-900 hover:text-white text-xs font-bold border border-purple-200 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Practice Exit Exams</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>

          {/* Card 4: Entrance Exams */}
          <motion.div 
            variants={itemFadeUp}
            whileHover="hover"
            initial="rest"
            animate="rest"
            className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between group"
          >
            <div>
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mb-3"
              >
                <Layers className="w-5 h-5" />
              </motion.div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs uppercase font-bold text-blue-800 tracking-wider">EUEE Grade 12</span>
                <span className="text-[10px] bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                  High School
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-blue-800 transition-colors">
                University Entrance Exam
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Natural & Social Sciences curriculum prep: Calculus, Classical Physics, General Aptitude & English grammar.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 mb-5">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Calculus, Mechanics & Electrostatics</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Step-by-step mathematical proofs</span>
                </li>
              </ul>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('hub', { category: 'ENTRANCE' })}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-900 hover:text-white text-xs font-bold border border-blue-200 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Practice Entrance</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* 3. Live Workspace Feature Highlights */}
      <motion.section 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50/50 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-5">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Real CBT Exam Simulator</span>
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Engineered to replicate the exact Ethiopian national testing experience
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Never be surprised on exam day. Our live workspace gives you the official split-screen palette, time alerts, question flagging, and instant grading.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  { num: '1', title: '4-State Question Palette', desc: 'Blue (Active), Green (Answered), Red (Flagged), Slate (Unanswered).', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { num: '2', title: 'Live Countdown Timer', desc: 'Accurate HH:MM:SS timer with auto-submit safeguard.', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { num: '3', title: 'In-Depth Explanations', desc: 'Every question includes a complete pedagogical review.', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                  { num: '4', title: 'Telebirr Direct Activation', desc: 'Fast verification with receiver phone +251963155856.', bg: 'bg-purple-50 text-purple-700 border-purple-200' }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 3, transition: { duration: 0.2 } }}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className={`w-6 h-6 rounded-lg ${item.bg} flex items-center justify-center font-bold text-xs shrink-0 border`}>
                      {item.num}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.03, x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate('hub')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                >
                  <span>Explore Exam Programs</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Visual preview mockup with live interactive controls */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-slate-800 ml-1.5">Live Exam Simulation</span>
                </div>
                {/* Real-time ticking indicator */}
                <motion.div 
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="px-2.5 py-0.5 bg-red-50 border border-red-200 text-red-700 font-mono text-xs rounded-lg font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  <span>⏱ {formatPreviewTime(previewSeconds)}</span>
                </motion.div>
              </div>

              <div className="space-y-2.5 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Question 3 of 10 • Verbal Logic</div>
                  <span className="text-[10px] text-slate-400 font-medium">Single Choice</span>
                </div>
                <p className="text-xs text-slate-900 font-medium leading-relaxed">
                  Select the pair of words that best expresses a relationship similar to <strong className="text-slate-950">COFFEE : ETHIOPIA</strong>
                </p>
                <div className="space-y-2 text-xs pt-1">
                  <motion.div 
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedMockOption('A')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      selectedMockOption === 'A'
                        ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-lg font-bold text-[10px] flex items-center justify-center transition-colors ${
                        selectedMockOption === 'A' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>A</span>
                      <span>TEA : KENYA</span>
                    </div>
                    {selectedMockOption === 'A' && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">Selected</span>
                    )}
                  </motion.div>

                  <motion.div 
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedMockOption('B')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      selectedMockOption === 'B'
                        ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-lg font-bold text-[10px] flex items-center justify-center transition-colors ${
                        selectedMockOption === 'B' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>B</span>
                      <span>SUGAR : DESSERT</span>
                    </div>
                    {selectedMockOption === 'B' && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">Selected</span>
                    )}
                  </motion.div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Question Palette:</span>
                  <span className="text-[9px] text-emerald-700 font-medium">Click to navigate</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center font-bold text-xs font-mono">
                  <motion.div whileHover={{ scale: 1.1 }} className="py-1.5 rounded-lg bg-emerald-600 text-white shadow-2xs cursor-pointer">1</motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} className="py-1.5 rounded-lg bg-emerald-600 text-white shadow-2xs cursor-pointer">2</motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} className="py-1.5 rounded-lg bg-white border-2 border-blue-600 text-blue-700 shadow-2xs cursor-pointer">3</motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} className="py-1.5 rounded-lg bg-red-600 text-white shadow-2xs cursor-pointer">4</motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} className="py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 cursor-pointer">5</motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 4. Packages & Telebirr Pricing Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={itemFadeUp} className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5 text-amber-700" />
            <span>Telebirr Direct Transfer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Affordable National Exam Packages
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Pay easily via Telebirr to receiver <span className="font-mono font-bold text-amber-900">+251963155856</span>. Upload your receipt and get approved within minutes.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {EXAM_PACKAGES.filter(p => ['GRADE_12_ALL', 'NGAT_ALL', 'GAT_ALL', 'EXIT_ALL'].includes(p.id)).map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={itemFadeUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`bg-white rounded-2xl p-5 border flex flex-col justify-between transition-all shadow-xs ${
                pkg.popular 
                  ? 'border-emerald-500 relative ring-2 ring-emerald-500/20' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {pkg.popular && (
                <motion.span 
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-0.5 rounded-full shadow-sm"
                >
                  Most Popular
                </motion.span>
              )}

              <div>
                <div className="text-[11px] uppercase font-bold text-emerald-700 mb-1">{pkg.category}</div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{pkg.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{pkg.description}</p>

                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-2xl font-black text-slate-900 font-mono">{pkg.priceETB} ETB</span>
                  {pkg.originalPriceETB && (
                    <span className="text-xs text-slate-400 line-through font-mono">{pkg.originalPriceETB} ETB</span>
                  )}
                </div>

                <ul className="space-y-1.5 text-xs text-slate-700 mb-5">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePurchasePackage(pkg.id)}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay via Telebirr</span>
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* All-In-One VIP Pass Callout with interactive shine */}
        <motion.div 
          variants={itemFadeUp}
          whileHover={{ y: -3 }}
          className="mt-6 bg-gradient-to-r from-purple-50 via-purple-50/80 to-indigo-50/60 border border-purple-200 rounded-2xl p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs relative overflow-hidden"
        >
          <div className="space-y-1.5 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-bold">
              <motion.span
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-purple-700" />
              </motion.span>
              <span>Full National Access</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Ethiopia All-In-One VIP Pass — 1000 ETB
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Unlock every single exam across Grade 9, 10, 11, 12 &amp; Entrance, NGAT, AAU GAT, and all University Exit Exams (Law, CS, Medicine, Accounting). Includes instant priority Telebirr approval.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handlePurchasePackage('ALL_IN_ONE')}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-700/20 transition-all shrink-0 flex items-center justify-center gap-2 relative z-10"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Get All-In-One Pass</span>
          </motion.button>
        </motion.div>
      </motion.section>

      {/* 5. Telebirr Payment Instruction Highlight */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold uppercase tracking-wider">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Telebirr Official Merchant Number</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                How to Pay and Unlock Your Exams
              </h3>
              <p className="text-xs text-slate-700 max-w-xl leading-relaxed">
                1. Dial <span className="font-bold text-slate-900 font-mono">*127#</span> or open the Telebirr App.<br />
                2. Send the exact package amount to Receiver: <span className="font-bold text-amber-900 font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">+251963155856</span>.<br />
                3. Take a screenshot of the confirmation SMS and upload it on our Telebirr Payment Page.<br />
                4. Your exam access will unlock automatically upon admin verification!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('payment')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Submit Telebirr Receipt</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
    </AnimatePresence>
  );
};

