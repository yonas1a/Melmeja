export type UserRole = 'student' | 'admin';
export type AuthProviderType = 'google' | 'password';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  authProvider: AuthProviderType;
  emailVerified: boolean;
  role: UserRole;
  paidPackages: string[];
  allowedExams: string[];
  createdAt: string;
  phoneNumber?: string;
  universityOrCollege?: string;
}

export type ExamCategory = 'NGAT' | 'GAT' | 'EXIT' | 'ENTRANCE' | 'GRADE_9' | 'GRADE_10' | 'GRADE_11' | 'GRADE_12';

export type QuestionType = 'single_choice' | 'multi_choice' | 'true_false' | 'assertion_reason' | 'matching' | 'quantitative_comparison';

export interface Question {
  id: string;
  examId: string;
  number: number;
  questionText: string;
  questionType?: QuestionType;
  premise?: string; // Optional given information / condition for Quantitative Comparison or problem context
  columnA?: string; // Quantity in Column A (for quantitative_comparison)
  columnB?: string; // Quantity in Column B (for quantitative_comparison)
  passage?: string; // Optional reading passage, data set or background context
  codeBlock?: string; // Optional formula, code snippet or tabular text
  diagramUrl?: string; // Diagram or Image URL
  imageUrl?: string; // Alias / alternative for diagram image
  imageCaption?: string; // Caption describing the graph or diagram
  graphData?: string; // Optional SVG code, JSON points or description
  options: string[]; // Options list (e.g. [A, B, C, D])
  optionImages?: string[]; // Optional image URLs corresponding to each option
  correctAnswerIndex: number; // 0 for A, 1 for B, etc.
  correctAnswerIndices?: number[]; // For multi-select questions
  explanation: string; // Detailed pedagogical step-by-step solution
  explanationImageUrl?: string; // Optional visual explanation or formula chart
  topic: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  points?: number;
}

export interface Exam {
  id: string;
  title: string;
  category: ExamCategory;
  subCategory: string; // e.g. 'Verbal & Quantitative', 'Computer Science Exit', 'Law Exit'
  department?: string; // e.g. 'Mathematics', 'Physics', 'Biology', etc.
  grade?: string; // e.g. 'Grade 9', 'Grade 10', etc.
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  passMarkPercent: number;
  isFree?: boolean;
  packageRequired: string; // Package ID needed to unlock
  difficulty: 'Beginner' | 'Medium' | 'Advanced' | 'Standard National';
  tags: string[];
  yearOrSession?: string;
  questions: Question[];
  isCustom?: boolean;
  createdAt?: string;
  createdBy?: string;
}

export type QuestionPaletteStatus = 'active' | 'answered' | 'unanswered' | 'flagged';

export interface ExamAttempt {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  examId: string;
  examTitle: string;
  examCategory: ExamCategory;
  scorePercent: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalSkipped: number;
  totalQuestions: number;
  passed: boolean;
  timeTakenSeconds: number;
  userAnswers: Record<number, number>; // questionIndex (0-based) -> selectedOptionIndex (0-3)
  flaggedQuestions: number[]; // questionIndices
  completedAt: string;
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentSubmission {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  packageId: string;
  packageName: string;
  amountETB: number;
  receiverPhone: string; // +251963155856
  transactionId: string;
  screenshotUrl: string; // Cloud storage URL or data URI fallback
  senderPhone?: string;
  status: PaymentStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  webhookSentAt?: string;
  webhookStatus?: 'sent' | 'verified' | 'failed';
  verifiedBy?: 'admin' | 'webhook' | string;
}

export interface ExamPackage {
  id: string;
  name: string;
  category: ExamCategory | 'ALL_ACCESS';
  priceETB: number;
  originalPriceETB?: number;
  description: string;
  features: string[];
  includedExamIds: string[];
  badge?: string;
  popular?: boolean;
}
