import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Exam, ExamAttempt, QuestionPaletteStatus } from '../types';
import { db, addDoc, collection, onSnapshot, doc, setDoc, deleteDoc, getDoc, sanitizeForFirestore, arrayUnion, arrayRemove } from '../lib/firebase';
import { INITIAL_EXAMS } from '../data/examsData';
import { useAuth } from './AuthContext';

interface ExamContextType {
  allExams: Exam[];
  customExams: Exam[];
  hiddenExamIds: string[];
  currentExam: Exam | null;
  currentQuestionIndex: number;
  userAnswers: Record<number, number>;
  flaggedQuestions: number[];
  remainingSeconds: number;
  isExamActive: boolean;
  isSubmitting: boolean;
  lastAttemptResult: ExamAttempt | null;
  startExam: (exam: Exam) => void;
  selectAnswer: (optionIndex: number) => void;
  toggleFlagCurrentQuestion: () => void;
  clearCurrentAnswer: () => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitExam: () => Promise<ExamAttempt | null>;
  exitExamToHub: () => void;
  getQuestionStatus: (index: number) => QuestionPaletteStatus;
  getStatsSummary: () => { answered: number; flagged: number; unanswered: number; total: number };
  saveExamToFirestore: (exam: Exam) => Promise<boolean>;
  deleteExamFromFirestore: (examId: string) => Promise<boolean>;
  hideBuiltinExam: (examId: string) => Promise<void>;
  unhideBuiltinExam: (examId: string) => Promise<void>;
  batchSaveExamsToFirestore: (exams: Exam[]) => Promise<{ success: number; failed: number }>;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const STORAGE_KEY_EXAM = 'ethiopian_exam_active_session_v1';

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  
  const [customExams, setCustomExams] = useState<Exam[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [hiddenExamIds, setHiddenExamIds] = useState<string[]>([]);

  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isExamActive, setIsExamActive] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastAttemptResult, setLastAttemptResult] = useState<ExamAttempt | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time Firestore sync for custom exams
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(
        collection(db, 'exams'),
        (snapshot) => {
          const loaded: Exam[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Exam;
            loaded.push({
              ...data,
              id: docSnap.id
            });
          });
          setCustomExams(loaded);

          // Merge with initial exams (custom exams override or append)
          const mergedMap = new Map<string, Exam>();
          INITIAL_EXAMS.forEach(e => mergedMap.set(e.id, e));
          loaded.forEach(e => mergedMap.set(e.id, e));
          setAllExams(Array.from(mergedMap.values()));
        },
        (err) => {
          console.warn('Could not listen to exams collection in Firestore (falling back to built-in):', err);
          setAllExams(INITIAL_EXAMS);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore exams listener setup error:', e);
      setAllExams(INITIAL_EXAMS);
    }
  }, []);

  // Real-time sync for hidden built-in exam IDs from admin config
  useEffect(() => {
    try {
      const configRef = doc(db, 'config', 'adminSettings');
      const unsubscribe = onSnapshot(configRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setHiddenExamIds(Array.isArray(data.hiddenExamIds) ? data.hiddenExamIds : []);
        } else {
          setHiddenExamIds([]);
        }
      }, (err) => {
        console.warn('Could not listen to adminSettings config:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('adminSettings listener setup error:', e);
    }
  }, []);

  // Save / Update single exam in Firestore
  const saveExamToFirestore = async (exam: Exam): Promise<boolean> => {
    try {
      const cleanExamId = exam.id?.trim() || `exam_${Date.now()}`;
      const examDocRef = doc(db, 'exams', cleanExamId);
      
      const payload: Exam = {
        ...exam,
        id: cleanExamId,
        isCustom: true,
        createdAt: exam.createdAt || new Date().toISOString(),
        createdBy: user?.email || 'admin'
      };

      const sanitized = sanitizeForFirestore(payload);
      await setDoc(examDocRef, sanitized, { merge: true });
      return true;
    } catch (err) {
      console.error('Error saving exam to Firestore:', err);
      throw err;
    }
  };

  // Delete custom exam from Firestore
  const deleteExamFromFirestore = async (examId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'exams', examId));
      return true;
    } catch (err) {
      console.error('Error deleting exam from Firestore:', err);
      throw err;
    }
  };

  // Hide a built-in (default) exam by recording its ID in admin config
  const hideBuiltinExam = async (examId: string): Promise<void> => {
    try {
      const configRef = doc(db, 'config', 'adminSettings');
      const snap = await getDoc(configRef);
      if (snap.exists()) {
        await import('../lib/firebase').then(({ updateDoc }) =>
          updateDoc(configRef, { hiddenExamIds: arrayUnion(examId) })
        );
      } else {
        await setDoc(configRef, { hiddenExamIds: [examId] });
      }
    } catch (err) {
      console.error('Error hiding built-in exam:', err);
      throw err;
    }
  };

  // Unhide / restore a previously hidden built-in exam
  const unhideBuiltinExam = async (examId: string): Promise<void> => {
    try {
      const configRef = doc(db, 'config', 'adminSettings');
      await import('../lib/firebase').then(({ updateDoc }) =>
        updateDoc(configRef, { hiddenExamIds: arrayRemove(examId) })
      );
    } catch (err) {
      console.error('Error unhiding built-in exam:', err);
      throw err;
    }
  };

  // Batch save an array of exams to Firestore
  const batchSaveExamsToFirestore = async (examsList: Exam[]): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;

    for (const exam of examsList) {
      try {
        const cleanExamId = exam.id?.trim() || `exam_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const payload: Exam = {
          ...exam,
          id: cleanExamId,
          isCustom: true,
          createdAt: exam.createdAt || new Date().toISOString(),
          createdBy: user?.email || 'admin'
        };
        const sanitized = sanitizeForFirestore(payload);
        await setDoc(doc(db, 'exams', cleanExamId), sanitized, { merge: true });
        success++;
      } catch (e) {
        console.error('Batch save exam item error:', e, exam);
        failed++;
      }
    }

    return { success, failed };
  };

  // Restore active session from localStorage on load if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXAM);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isExamActive && parsed.currentExam && parsed.remainingSeconds > 0) {
          setCurrentExam(parsed.currentExam);
          setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
          setUserAnswers(parsed.userAnswers || {});
          setFlaggedQuestions(parsed.flaggedQuestions || []);
          setRemainingSeconds(parsed.remainingSeconds);
          setIsExamActive(true);
        }
      }
    } catch (e) {
      console.warn('Could not restore saved exam session:', e);
    }
  }, []);

  // Save session state to localStorage whenever state changes
  useEffect(() => {
    if (isExamActive && currentExam) {
      try {
        localStorage.setItem(STORAGE_KEY_EXAM, JSON.stringify({
          isExamActive: true,
          currentExam,
          currentQuestionIndex,
          userAnswers,
          flaggedQuestions,
          remainingSeconds
        }));
      } catch (e) {
        console.warn('Error persisting active session:', e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY_EXAM);
    }
  }, [isExamActive, currentExam, currentQuestionIndex, userAnswers, flaggedQuestions, remainingSeconds]);

  // Countdown Timer
  useEffect(() => {
    if (isExamActive && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isExamActive, remainingSeconds]);

  const startExam = (exam: Exam) => {
    setCurrentExam(exam);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFlaggedQuestions([]);
    setRemainingSeconds(exam.durationMinutes * 60);
    setIsExamActive(true);
    setLastAttemptResult(null);
  };

  const selectAnswer = (optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const toggleFlagCurrentQuestion = () => {
    setFlaggedQuestions((prev) => {
      if (prev.includes(currentQuestionIndex)) {
        return prev.filter((i) => i !== currentQuestionIndex);
      } else {
        return [...prev, currentQuestionIndex];
      }
    });
  };

  const clearCurrentAnswer = () => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestionIndex];
      return next;
    });
  };

  const goToQuestion = (index: number) => {
    if (!currentExam) return;
    if (index >= 0 && index < currentExam.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const nextQuestion = () => {
    if (!currentExam) return;
    if (currentQuestionIndex < currentExam.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Compute status for Palette button
  const getQuestionStatus = (index: number): QuestionPaletteStatus => {
    if (index === currentQuestionIndex) {
      return 'active';
    }
    if (flaggedQuestions.includes(index)) {
      return 'flagged';
    }
    if (userAnswers[index] !== undefined) {
      return 'answered';
    }
    return 'unanswered';
  };

  const getStatsSummary = () => {
    if (!currentExam) return { answered: 0, flagged: 0, unanswered: 0, total: 0 };
    const total = currentExam.questions.length;
    const answered = Object.keys(userAnswers).length;
    const flagged = flaggedQuestions.length;
    const unanswered = total - answered;
    return { answered, flagged, unanswered, total };
  };

  const handleAutoSubmit = async () => {
    await submitExam();
  };

  const submitExam = async (): Promise<ExamAttempt | null> => {
    if (!currentExam) return null;
    setIsSubmitting(true);

    try {
      const questions = currentExam.questions;
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalSkipped = 0;

      questions.forEach((q, idx) => {
        const selected = userAnswers[idx];
        if (selected === undefined) {
          totalSkipped++;
        } else if (selected === q.correctAnswerIndex) {
          totalCorrect++;
        } else {
          totalIncorrect++;
        }
      });

      const totalQuestions = questions.length;
      const scorePercent = Math.round((totalCorrect / (totalQuestions || 1)) * 100);
      const passed = scorePercent >= currentExam.passMarkPercent;
      const timeSpentSeconds = (currentExam.durationMinutes * 60) - remainingSeconds;

      const attemptResult: ExamAttempt = {
        id: `attempt_${Date.now()}`,
        userId: user?.uid || 'guest_user',
        userEmail: user?.email || userProfile?.email || 'student@examsethiopia.com',
        userName: userProfile?.name || user?.displayName || 'Ethiopian Scholar',
        examId: currentExam.id,
        examTitle: currentExam.title,
        examCategory: currentExam.category,
        scorePercent,
        totalCorrect,
        totalIncorrect,
        totalSkipped,
        totalQuestions,
        passed,
        timeTakenSeconds: Math.max(timeSpentSeconds, 1),
        userAnswers,
        flaggedQuestions,
        completedAt: new Date().toISOString()
      };

      // Save to Firestore examAttempts collection
      try {
        if (user) {
          await addDoc(collection(db, 'examAttempts'), sanitizeForFirestore(attemptResult));
        }
      } catch (err) {
        console.warn('Could not save attempt to Firestore:', err);
      }

      // If passed, trigger celebration confetti
      if (passed) {
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }
      }

      setLastAttemptResult(attemptResult);
      setIsExamActive(false);
      localStorage.removeItem(STORAGE_KEY_EXAM);
      return attemptResult;
    } catch (error) {
      console.error('Error submitting exam:', error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const exitExamToHub = () => {
    setIsExamActive(false);
    setCurrentExam(null);
    localStorage.removeItem(STORAGE_KEY_EXAM);
  };

  // Filter hidden built-in exams from the visible list
  const visibleExams = allExams.filter(e => !hiddenExamIds.includes(e.id));

  return (
    <ExamContext.Provider value={{
      allExams: visibleExams,
      customExams,
      hiddenExamIds,
      currentExam,
      currentQuestionIndex,
      userAnswers,
      flaggedQuestions,
      remainingSeconds,
      isExamActive,
      isSubmitting,
      lastAttemptResult,
      startExam,
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
      saveExamToFirestore,
      deleteExamFromFirestore,
      hideBuiltinExam,
      unhideBuiltinExam,
      batchSaveExamsToFirestore
    }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
