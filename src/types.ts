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

export type ExamCategory = 'NGAT' | 'GAT' | 'EXIT' | 'ENTRANCE';

export type QuestionType = 'single_choice' | 'multi_choice' | 'true_false' | 'assertion_reason' | 'matching';

export interface Question {
  id: string;
  examId: string;
  number: number;
  questionText: string;
  questionType?: QuestionType;
  passage?: string; // Optional reading passage or background context
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
