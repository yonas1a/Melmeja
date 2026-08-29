import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  CreditCard, 
  Play, 
  TrendingUp, 
  Calendar,
  Sparkles,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { EXAM_PACKAGES, INITIAL_EXAMS } from '../data/examsData';
import { ExamAttempt } from '../types';
import { db, collection, query, where, onSnapshot } from '../lib/firebase';
import { EmailVerificationNotice } from '../components/EmailVerificationNotice';

interface UserProfilePageProps {
  onNavigate: (view: string, extraData?: any) => void;
  onOpenAuth: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, userProfile, isEmailVerified, isAdmin, signOut, switchRoleDemo, sendVerificationEmail, verifyEmailManually } = useAuth();
  const { startExam } = useExam();

  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  // Fetch attempts for current user from Firestore
  useEffect(() => {
    if (!user) {
      setAttempts([]);
      setLoadingAttempts(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'examAttempts'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: ExamAttempt[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        setAttempts(list);
        setLoadingAttempts(false);
      }, (err) => {
        console.warn('Error listening to attempts:', err);
        setLoadingAttempts(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn(e);
      setLoadingAttempts(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <User className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Please Sign In to Access Your Profile</h2>
        <p className="text-xs text-slate-500">View your active packages, exam certificates, and historical scores.</p>
        <button
          onClick={onOpenAuth}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-xs"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  // Calculate statistics
  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.scorePercent, 0) / totalAttempts) 
    : 0;
  const highestScore = totalAttempts > 0 
    ? Math.max(...attempts.map(a => a.scorePercent)) 
    : 0;
  const passedCount = attempts.filter(a => a.passed).length;

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  const handleRetakeExam = (examId: string) => {
    const target = INITIAL_EXAMS.find(e => e.id === examId);
    if (target) {
      startExam(target);
      onNavigate('workspace');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      {/* Email verification notice */}
      <EmailVerificationNotice />

      {/* 1. Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center font-bold text-lg text-purple-700 shrink-0">
              {userProfile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  {userProfile?.name || 'Ethiopian Student'}
                </h1>
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-600" /> Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Student
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {isEmailVerified ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Email Verified
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-amber-600" /> Unverified Email
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => onNavigate('payment')}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              <span>Unlock Packages</span>
            </button>

            <button
              onClick={() => signOut()}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Performance Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center space-y-0.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Exams Attempted</div>
          <div className="text-xl font-bold text-slate-900">{totalAttempts}</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center space-y-0.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Average Score</div>
          <div className="text-xl font-bold text-emerald-700">{avgScore}%</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center space-y-0.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Highest Score</div>
          <div className="text-xl font-bold text-purple-700">{highestScore}%</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center space-y-0.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Tests Passed</div>
          <div className="text-xl font-bold text-blue-700">{passedCount}</div>
        </div>
      </div>

      {/* 3. Active Paid Packages & Unlocked Exams List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Active Paid Packages & Unlocked Exam Access</span>
            </h3>
            <p className="text-xs text-slate-500">
              Exams currently accessible for full simulation testing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {userProfile?.paidPackages?.map((pkgId) => {
            const pkg = EXAM_PACKAGES.find(p => p.id === pkgId);
            return (
              <span key={pkgId} className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-900 text-xs font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{pkg ? pkg.name : pkgId}</span>
              </span>
            );
          })}

          {userProfile?.allowedExams?.map((exId) => {
            const examObj = INITIAL_EXAMS.find(e => e.id === exId);
            if (!examObj) return null;
            return (
              <span key={exId} className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>{examObj.title}</span>
              </span>
            );
          })}

          {(!userProfile?.paidPackages?.length && !userProfile?.allowedExams?.length) && (
            <div className="text-xs text-slate-500 py-1">
              No paid exam packages unlocked yet.{' '}
              <button onClick={() => onNavigate('payment')} className="text-amber-700 hover:underline font-semibold">
                Submit Telebirr payment to unlock full exam access.
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Exam Attempt History Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Exam Attempt History</span>
            </h3>
            <p className="text-xs text-slate-500">
              Exam Title | Date Taken | Score (%) | Time Spent
            </p>
          </div>
          <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-mono font-medium">
            {attempts.length} Record{attempts.length === 1 ? '' : 's'}
          </span>
        </div>

        {loadingAttempts ? (
          <div className="text-center py-6 text-xs text-slate-500">Loading attempt history...</div>
        ) : attempts.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2">
            <BookOpen className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">You have not taken any exams yet.</p>
            <button
              onClick={() => onNavigate('hub')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg mt-1 shadow-xs"
            >
              Start First Practice Exam
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Exam Title</th>
                  <th className="py-2.5 px-3 font-bold">Category</th>
                  <th className="py-2.5 px-3 font-bold">Date Taken</th>
                  <th className="py-2.5 px-3 font-bold">Score (%)</th>
                  <th className="py-2.5 px-3 font-bold">Result</th>
                  <th className="py-2.5 px-3 font-bold">Time Spent</th>
                  <th className="py-2.5 px-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800 max-w-xs truncate">
                      {attempt.examTitle}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {attempt.examCategory}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(attempt.completedAt).toLocaleDateString()} {new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {attempt.scorePercent}%
                    </td>
                    <td className="py-2.5 px-3">
                      {attempt.passed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Passed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>Not Passed</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {formatTime(attempt.timeTakenSeconds)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleRetakeExam(attempt.examId)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-purple-50 text-purple-700 text-xs font-bold border border-slate-200 hover:border-purple-200 transition-all inline-flex items-center gap-1 shadow-xs"
                      >
                        <Play className="w-3 h-3" />
                        <span>Retake</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
