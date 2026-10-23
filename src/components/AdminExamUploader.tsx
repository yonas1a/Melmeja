import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Upload, 
  Plus, 
  FileText, 
  FileCode, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  Download, 
  Eye, 
  Image as ImageIcon, 
  BarChart3, 
  Code2, 
  BookOpen, 
  Sparkles, 
  Layers, 
  Copy, 
  CheckCircle2, 
  X, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Scale,
  PenTool
} from 'lucide-react';
import { Exam, Question, ExamCategory, QuestionType } from '../types';
import { useExam } from '../context/ExamContext';
import { EXAM_PACKAGES, INITIAL_EXAMS } from '../data/examsData';
import { RichQuestionViewer } from './RichQuestionViewer';
import { GeometryGraphDesigner } from './GeometryGraphDesigner';

const SAMPLE_TEMPLATES: Record<string, any> = {
  hawassa_gat_quant: {
    id: "hawassa_gat_quant_reasoning_2024",
    title: "Hawassa University GAT Quantitative Reasoning & Comparison Bank",
    category: "GAT",
    subCategory: "Quantitative & Analytical Reasoning",
    description: "Official comprehensive Graduate Admission Test (GAT) quantitative tutorial bank with discrete algebra, geometry, statistics, and quantitative comparisons (Column A vs Column B).",
    durationMinutes: 60,
    totalQuestions: 4,
    passMarkPercent: 60,
    difficulty: "Standard National",
    packageRequired: "GAT_ALL",
    tags: ["Hawassa University", "GAT", "Quantitative Comparison", "July 2024"],
    yearOrSession: "2024/2026",
    questions: [
      {
        id: "q_gat_qc_01",
        examId: "hawassa_gat_quant_reasoning_2024",
        number: 1,
        questionType: "quantitative_comparison",
        questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
        premise: "m and n are negative integers.",
        columnA: "m + n",
        columnB: "m / n",
        options: [
          "Quantity in Column A is greater",
          "Quantity in Column B is greater",
          "The two quantities are equal",
          "The relationship cannot be determined from the information given"
        ],
        correctAnswerIndex: 1,
        explanation: "Since m and n are negative integers: Column A = negative + negative = negative. Column B = negative / negative = positive. Any positive number is greater than any negative number, so Column B is always greater.",
        topic: "Quantitative Comparison"
      },
      {
        id: "q_gat_qc_02",
        examId: "hawassa_gat_quant_reasoning_2024",
        number: 2,
        questionType: "quantitative_comparison",
        questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
        premise: "Let x and y be real numbers such that x < y.",
        columnA: "x² + y²",
        columnB: "2xy",
        options: [
          "Quantity in Column A is greater",
          "Quantity in Column B is greater",
          "The two quantities are equal",
          "The relationship cannot be determined from the information given"
        ],
        correctAnswerIndex: 0,
        explanation: "(x² + y²) - 2xy = (x - y)². Since x < y, x - y ≠ 0, and the square of any non-zero real number is strictly positive (> 0). Therefore x² + y² > 2xy. Column A is greater.",
        topic: "Quantitative Comparison"
      },
      {
        id: "q_gat_alg_03",
        examId: "hawassa_gat_quant_reasoning_2024",
        number: 3,
        questionType: "single_choice",
        questionText: "When √98 − √50 is simplified, it is equal to:",
        options: [
          "4√3",
          "2√2",
          "4√2",
          "2√3"
        ],
        correctAnswerIndex: 1,
        explanation: "√98 = √(49 × 2) = 7√2. √50 = √(25 × 2) = 5√2. 7√2 - 5√2 = 2√2. Option (B).",
        topic: "Radical Simplification"
      },
      {
        id: "q_gat_tab_04",
        examId: "hawassa_gat_quant_reasoning_2024",
        number: 4,
        questionType: "single_choice",
        passage: "For questions 4, refer to the following frequency distribution:\n\n| Value (x) | 10 | 20 | 30 | 40 | 50 | 60 |\n| Frequency (f) | 4 | 5 | 2 | 4 | 3 | 1 |",
        questionText: "What is the arithmetic mean of the given distribution?",
        options: [
          "30",
          "40",
          "50",
          "60"
        ],
        correctAnswerIndex: 0,
        explanation: "Total frequency n = 19. Sum of (f × x) = 40 + 100 + 60 + 160 + 150 + 60 = 570. Mean = 570 / 19 = 30.",
        topic: "Data Interpretation"
      }
    ]
  },
  graph_and_quantitative: {
    id: "sample_quant_graph_2026",
    title: "NGAT Quantitative Reasoning & Graph Analysis Mock",
    category: "NGAT",
    subCategory: "Data Interpretation & Statistics",
    description: "Advanced practice exam testing data interpretation, bar graphs, coordinate geometry, and numerical estimation.",
    durationMinutes: 45,
    totalQuestions: 3,
    passMarkPercent: 65,
    difficulty: "Advanced",
    packageRequired: "NGAT_ALL",
    tags: ["NGAT", "Graph Analysis", "Data Interpretation", "Quantitative"],
    yearOrSession: "2026",
    questions: [
      {
        id: "q_quant_01",
        examId: "sample_quant_graph_2026",
        number: 1,
        questionType: "single_choice",
        questionText: "Based on the economic trade balance graph below, in which year did the export growth rate exceed the import growth rate by the largest margin?",
        diagramUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        imageCaption: "Figure 1.1: Annual Merchandise Export vs Import Trends (in Million USD)",
        options: [
          "2021",
          "2022",
          "2023",
          "2024"
        ],
        correctAnswerIndex: 2,
        explanation: "By analyzing the slope difference between exports and imports on the 2023 axis, the margin peaked at +$420M, compared to +$180M in 2021.",
        topic: "Data Interpretation"
      },
      {
        id: "q_quant_02",
        examId: "sample_quant_graph_2026",
        number: 2,
        questionType: "single_choice",
        questionText: "Consider the geometric function curve defined by f(x) = -x² + 6x - 5. What are the coordinates of the peak vertex and the x-intercepts?",
        codeBlock: "f(x) = -(x - 3)² + 4\nVertex (h, k) = (3, 4)\nRoots at f(x) = 0 => (x - 1)(x - 5) = 0",
        options: [
          "Vertex (3, 4), Intercepts at x = 1 and x = 5",
          "Vertex (3, 5), Intercepts at x = 2 and x = 4",
          "Vertex (2, 4), Intercepts at x = 1 and x = 6",
          "Vertex (4, 3), Intercepts at x = 0 and x = 5"
        ],
        correctAnswerIndex: 0,
        explanation: "Completing the square gives f(x) = -(x-3)² + 4, placing the parabola vertex at (3, 4). Factoring gives -(x-1)(x-5) = 0, so roots are x=1 and x=5.",
        topic: "Coordinate Geometry"
      },
      {
        id: "q_quant_03",
        examId: "sample_quant_graph_2026",
        number: 3,
        questionType: "true_false",
        questionText: "Assertion: In a standard normal Gaussian distribution, approximately 68% of observed data values fall within ±1 standard deviation of the population mean (μ ± 1σ).",
        options: [
          "True",
          "False"
        ],
        correctAnswerIndex: 0,
        explanation: "True. According to the Empirical Rule (68-95-99.7 rule), 68.27% of values fall within 1 standard deviation of the mean.",
        topic: "Probability & Statistics"
      }
    ]
  },
  medical_and_diagram: {
    id: "sample_exit_med_cardio",
    title: "MoE Exit Exam: Clinical Cardiology & Diagnostic Imaging",
    category: "EXIT",
    subCategory: "Medicine & Health Sciences",
    description: "Clinical vignette case studies incorporating ECG rhythm strips, anatomical diagrams, and MoE therapeutic guidelines.",
    durationMinutes: 60,
    totalQuestions: 2,
    passMarkPercent: 70,
    difficulty: "Standard National",
    packageRequired: "EXIT_ALL",
    tags: ["Exit Exam", "Medicine", "ECG", "Cardiology"],
    yearOrSession: "2026",
    questions: [
      {
        id: "q_med_01",
        examId: "sample_exit_med_cardio",
        number: 1,
        questionType: "single_choice",
        passage: "A 58-year-old male with a history of hypertension presents to the emergency outpatient department complaining of severe retrosternal squeezing chest pain radiating to his left jaw and left arm for the past 90 minutes. Vital signs: BP 90/60 mmHg, Pulse 110 bpm regular.",
        questionText: "Based on the 12-lead ECG tracing shown below, which acute coronary syndrome diagnosis is indicated, and what is the primary emergent management?",
        diagramUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
        imageCaption: "Figure 2.1: 12-Lead Diagnostic ECG demonstrating ST-segment elevations in leads II, III, and aVF",
        options: [
          "Anterior Wall STEMI; Urgent Oral Propranolol",
          "Acute Inferior Wall STEMI with Right Ventricular Involvement; Immediate Aspirin, Clopidogrel and PCI/Thrombolysis",
          "Non-ST Elevation Myocardial Infarction (NSTEMI); Discharge with sublingual Nitroglycerin",
          "Pericarditis with diffuse PR depression; Oral NSAIDs alone"
        ],
        correctAnswerIndex: 1,
        explanation: "ST elevations in II, III, and aVF indicate an Acute Inferior Wall STEMI. Standard emergent management includes dual antiplatelet therapy, IV hydration, and reperfusion.",
        topic: "Emergency Cardiology"
      },
      {
        id: "q_med_02",
        examId: "sample_exit_med_cardio",
        number: 2,
        questionType: "single_choice",
        questionText: "Identify the anatomical vascular structure marked with the red pointer in the pulmonary circulation diagram:",
        diagramUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80",
        imageCaption: "Figure 2.2: Mediastinal Circulation & Heart Chamber Anatomy",
        options: [
          "Left Pulmonary Artery carrying deoxygenated blood",
          "Ascending Aorta carrying oxygenated blood",
          "Superior Vena Cava",
          "Inferior Pulmonary Vein"
        ],
        correctAnswerIndex: 0,
        explanation: "The pulmonary artery arises from the right ventricle and carries deoxygenated blood from the heart to the lungs.",
        topic: "Cardiovascular Anatomy"
      }
    ]
  },
  cs_exit_code: {
    id: "sample_exit_cs_algo",
    title: "MoE Exit Exam: Data Structures, Algorithms & Database Systems",
    category: "EXIT",
    subCategory: "Computer Science & IT",
    description: "Algorithmic complexity, relational database normalization, SQL queries, and distributed systems architecture.",
    durationMinutes: 60,
    totalQuestions: 2,
    passMarkPercent: 65,
    difficulty: "Advanced",
    packageRequired: "EXIT_ALL",
    tags: ["Exit Exam", "CS", "Algorithms", "Databases"],
    yearOrSession: "2026",
    questions: [
      {
        id: "q_cs_01",
        examId: "sample_exit_cs_algo",
        number: 1,
        questionType: "single_choice",
        questionText: "Analyze the recursive algorithm snippet below. What is the tight asymptotic time complexity Θ(n) of this function according to the Master Theorem?",
        codeBlock: "function computeRecurse(A, n) {\n  if (n <= 1) return 1;\n  let sum = 0;\n  for (let i = 0; i < n; i++) {\n    sum += A[i];\n  }\n  return sum + 2 * computeRecurse(A, Math.floor(n / 2));\n}",
        options: [
          "Θ(n log n)",
          "Θ(n²)",
          "Θ(log n)",
          "Θ(n)"
        ],
        correctAnswerIndex: 0,
        explanation: "The recurrence relation is T(n) = 2T(n/2) + O(n). Here a=2, b=2, d=1. Since log_b(a) = log_2(2) = 1 = d (Case 2 of Master Theorem), the time complexity is Θ(n log n).",
        topic: "Algorithm Analysis"
      },
      {
        id: "q_cs_02",
        examId: "sample_exit_cs_algo",
        number: 2,
        questionType: "single_choice",
        questionText: "In the relational schema below, which normal form (NF) is violated by the functional dependency (StudentID -> DepartmentName)?",
        codeBlock: "TABLE Enrollments (\n  StudentID INT,\n  CourseID VARCHAR(10),\n  DepartmentName VARCHAR(50),\n  Grade CHAR(2),\n  PRIMARY KEY (StudentID, CourseID)\n)",
        options: [
          "1st Normal Form (1NF)",
          "2nd Normal Form (2NF)",
          "3rd Normal Form (3NF)",
          "Boyce-Codd Normal Form (BCNF) only"
        ],
        correctAnswerIndex: 1,
        explanation: "The primary key is composite (StudentID, CourseID). DepartmentName depends only on part of the candidate key (StudentID), creating a partial dependency which violates 2NF.",
        topic: "Database Normalization"
      }
    ]
  }
};

export const AdminExamUploader: React.FC = () => {
  const { 
    allExams = [], 
    customExams = [], 
    hiddenExamIds = [],
    saveExamToFirestore, 
    deleteExamFromFirestore, 
    hideBuiltinExam,
    unhideBuiltinExam,
    batchSaveExamsToFirestore 
  } = useExam();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'manual' | 'batch'>('catalog');
  
  // Feedback status
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Preview Modal
  const [previewExam, setPreviewExam] = useState<Exam | null>(null);
  const [isGraphDesignerOpen, setIsGraphDesignerOpen] = useState<boolean>(false);
  const [isAiPromptGuideOpen, setIsAiPromptGuideOpen] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Edit mode for existing exams
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Refs for the line-numbered JSON editor
  const jsonTextareaRef = useRef<HTMLTextAreaElement>(null);
  const jsonLineNumRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // BATCH JSON IMPORTER STATE
  // ==========================================
  const [rawJsonText, setRawJsonText] = useState<string>('');
  const [parsedBatchExams, setParsedBatchExams] = useState<Exam[]>([]);
  const [jsonParseErrors, setJsonParseErrors] = useState<string[]>([]);
  const [isJsonValid, setIsJsonValid] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // MANUAL EXAM BUILDER STATE
  // ==========================================
  const [manualExam, setManualExam] = useState<Exam>({
    id: `exam_custom_${Date.now()}`,
    title: '',
    category: 'NGAT',
    subCategory: '',
    description: '',
    durationMinutes: 60,
    totalQuestions: 1,
    passMarkPercent: 65,
    difficulty: 'Standard National',
    packageRequired: 'ALL_IN_ONE',
    isFree: false,
    tags: ['National Mock', '2026'],
    yearOrSession: '2026',
    questions: [
      {
        id: `q_${Date.now()}_1`,
        examId: `exam_custom_${Date.now()}`,
        number: 1,
        questionType: 'single_choice',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: '',
        topic: 'General'
      }
    ]
  });

  const [currentEditingQIndex, setCurrentEditingQIndex] = useState<number>(0);
  const [tagInput, setTagInput] = useState<string>('');

  // Helper to parse answer indices from numbers, letters ("A", "B", "C", "D"), or option text
  const resolveAnswerIndex = (val: any, options: string[]): number => {
    if (typeof val === 'number') {
      return Math.max(0, Math.min(val, Math.max(0, options.length - 1)));
    }
    if (typeof val === 'string') {
      const clean = val.trim().toUpperCase().replace(/[().\[\]]/g, '');
      if (clean.length === 1 && clean >= 'A' && clean <= 'E') {
        const idx = clean.charCodeAt(0) - 65;
        if (idx < options.length) return idx;
      }
      const num = parseInt(clean, 10);
      if (!isNaN(num) && num >= 0 && num < options.length) {
        return num;
      }
      const matchIdx = options.findIndex(opt => opt.trim().toLowerCase() === val.trim().toLowerCase());
      if (matchIdx !== -1) return matchIdx;
    }
    return 0;
  };

  // Helper to clean raw AI text before JSON parsing
  const cleanRawAiJson = (text: string): string => {
    let cleaned = text.trim();
    // 1. Remove markdown code blocks (```json ... ``` or ``` ...)
    if (cleaned.includes('```')) {
      cleaned = cleaned.replace(/```(?:json)?([\s\S]*?)```/gi, '$1').trim();
    }
    // 2. Find first [ or {
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
      startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
    }

    if (startIdx > 0) {
      cleaned = cleaned.slice(startIdx);
    }

    // 3. Find matching last } or ]
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const endIdx = Math.max(lastBrace, lastBracket);
    if (endIdx !== -1 && endIdx < cleaned.length - 1) {
      cleaned = cleaned.slice(0, endIdx + 1);
    }

    // 4. Remove trailing commas before } or ] (common AI JSON glitch)
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
    return cleaned;
  };

  // ------------------------------------------
  // BATCH IMPORT LOGIC
  // ------------------------------------------
  const handleValidateJson = (text: string) => {
    setRawJsonText(text);
    setJsonParseErrors([]);
    setParsedBatchExams([]);
    setIsJsonValid(false);

    if (!text.trim()) return;

    try {
      const sanitizedRaw = cleanRawAiJson(text);
      const parsed = JSON.parse(sanitizedRaw);
      
      let rawExamsList: any[] = [];

      // Auto-detect structure:
      // Case 1: Array of questions directly: [ { questionText: "...", ... } ]
      if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].questionText || parsed[0].question || parsed[0].prompt || parsed[0].columnA || parsed[0].column_a)) {
        rawExamsList = [{
          title: "Imported Question Bank",
          category: "GAT",
          subCategory: "General Aptitude",
          description: "AI-imported question bank.",
          questions: parsed
        }];
      } 
      // Case 2: Array of exams: [ { title: "Exam 1", questions: [...] } ]
      else if (Array.isArray(parsed)) {
        rawExamsList = parsed;
      }
      // Case 3: Object with nested questions array: { questions: [...] }
      else if (parsed && Array.isArray(parsed.questions)) {
        rawExamsList = [parsed];
      }
      // Case 4: Object with nested exam wrapper: { exam: { ... } } or { data: { ... } }
      else if (parsed && (parsed.exam || parsed.data)) {
        const inner = parsed.exam || parsed.data;
        rawExamsList = Array.isArray(inner) ? inner : [inner];
      }
      // Case 5: Single Exam object
      else if (parsed && typeof parsed === 'object') {
        rawExamsList = [parsed];
      }

      const errors: string[] = [];
      const validExams: Exam[] = [];

      const defaultQuantCompOptions = [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ];

      rawExamsList.forEach((exItem, exIdx) => {
        const itemLabel = exItem.title ? `"${exItem.title}"` : `Exam Item #${exIdx + 1}`;

        // Normalize Category
        let cat: ExamCategory = 'GAT';
        const rawCat = String(exItem.category || '').toUpperCase().trim();
        if (rawCat === 'NGAT') cat = 'NGAT';
        else if (rawCat === 'EXIT') cat = 'EXIT';
        else if (rawCat === 'ENTRANCE') cat = 'ENTRANCE';
        else cat = 'GAT';

        const rawQuestions = Array.isArray(exItem.questions) ? exItem.questions : [];
        if (rawQuestions.length === 0) {
          errors.push(`${itemLabel}: 'questions' must be a non-empty array of questions.`);
          return;
        }

        const normalizedQuestions: Question[] = [];

        rawQuestions.forEach((rawQ: any, qIdx: number) => {
          const qLabel = `${itemLabel} -> Question #${qIdx + 1}`;
          
          // Question text resolution
          const qText = rawQ.questionText || rawQ.question || rawQ.prompt || rawQ.text || rawQ.statement || rawQ.title || '';
          if (!qText && !rawQ.columnA && !rawQ.column_a) {
            errors.push(`${qLabel}: Missing question text or prompt.`);
            return;
          }

          // Question Type Resolution
          let qType: QuestionType = 'single_choice';
          const typeStr = String(rawQ.questionType || rawQ.type || rawQ.kind || '').toLowerCase();
          const colA = rawQ.columnA || rawQ.column_a || rawQ.ColumnA || rawQ.colA || rawQ.column1;
          const colB = rawQ.columnB || rawQ.column_b || rawQ.ColumnB || rawQ.colB || rawQ.column2;
          const isQuantComp = typeStr.includes('comp') || typeStr.includes('column') || colA !== undefined || colB !== undefined;

          if (isQuantComp) {
            qType = 'quantitative_comparison';
          } else if (typeStr.includes('multi') || typeStr.includes('multiple') || Array.isArray(rawQ.correctAnswerIndices)) {
            qType = 'multi_choice';
          } else if (typeStr.includes('true') || typeStr.includes('tf') || typeStr.includes('boolean')) {
            qType = 'true_false';
          } else {
            qType = 'single_choice';
          }

          // Options resolution
          let opts: string[] = [];
          const rawOpts = rawQ.options || rawQ.choices || rawQ.alternatives || rawQ.answers || rawQ.optionsList;
          if (Array.isArray(rawOpts)) {
            opts = rawOpts.map((o: any) => typeof o === 'string' ? o : String(o?.text || o?.label || o?.value || o));
          } else if (rawOpts && typeof rawOpts === 'object') {
            opts = Object.values(rawOpts).map((o: any) => String(o));
          }

          if (qType === 'quantitative_comparison') {
            if (opts.length === 0) {
              opts = defaultQuantCompOptions;
            }
          } else if (qType === 'true_false' && opts.length === 0) {
            opts = ['True', 'False'];
          }

          if (opts.length < 2) {
            errors.push(`${qLabel}: Must provide at least 2 answer choices/options.`);
            return;
          }

          // Correct Answer Index Resolution
          const rawAnswer = rawQ.correctAnswerIndex ?? rawQ.correctAnswer ?? rawQ.correct_answer ?? rawQ.answerIndex ?? rawQ.answer ?? rawQ.correctOption ?? rawQ.correct ?? rawQ.key;
          const answerIdx = resolveAnswerIndex(rawAnswer, opts);

          // Passage / Diagram / Graph Data
          const passage = rawQ.passage || rawQ.scenario || rawQ.readingPassage || rawQ.table || rawQ.context || rawQ.sharedData;
          const graphData = rawQ.graphData || rawQ.svg || rawQ.svgCode || rawQ.graph || rawQ.diagramSvg || rawQ.shape;
          const diagramUrl = rawQ.diagramUrl || rawQ.imageUrl || rawQ.image || rawQ.diagram || rawQ.figureUrl;
          const imageCaption = rawQ.imageCaption || rawQ.caption || rawQ.figureCaption || rawQ.figure;
          const premise = rawQ.premise || rawQ.condition || rawQ.given || rawQ.info;
          const codeBlock = rawQ.codeBlock || rawQ.code || rawQ.formula;
          const explanation = rawQ.explanation || rawQ.solution || rawQ.reason || rawQ.rationale || rawQ.steps || 'Step-by-step review for this question.';
          const topic = rawQ.topic || rawQ.subject || rawQ.category || rawQ.tag || 'General Aptitude';

          normalizedQuestions.push({
            id: rawQ.id || `q_${Date.now()}_${qIdx + 1}`,
            examId: exItem.id || `exam_${Date.now()}_${exIdx}`,
            number: qIdx + 1,
            questionType: qType,
            questionText: qText || "Directions: Compare Column A and Column B and select the correct alternative.",
            premise: premise || undefined,
            columnA: colA || undefined,
            columnB: colB || undefined,
            passage: passage || undefined,
            diagramUrl: diagramUrl || undefined,
            imageUrl: diagramUrl || undefined,
            imageCaption: imageCaption || undefined,
            graphData: graphData || undefined,
            codeBlock: codeBlock || undefined,
            options: opts,
            correctAnswerIndex: answerIdx,
            explanation,
            topic
          });
        });

        if (errors.length === 0) {
          const sanitizedExam: Exam = {
            id: exItem.id || `exam_${Date.now()}_${exIdx}`,
            title: exItem.title || "Imported National Exam",
            category: cat,
            subCategory: exItem.subCategory || cat,
            description: exItem.description || `Comprehensive national practice exam for ${exItem.title || 'GAT'}.`,
            durationMinutes: Number(exItem.durationMinutes) || Math.max(20, Math.round(normalizedQuestions.length * 1.5)),
            totalQuestions: normalizedQuestions.length,
            passMarkPercent: Number(exItem.passMarkPercent) || 60,
            isFree: Boolean(exItem.isFree),
            packageRequired: exItem.packageRequired || 'ALL_IN_ONE',
            difficulty: exItem.difficulty || 'Standard National',
            tags: Array.isArray(exItem.tags) ? exItem.tags : [cat, "Practice 2026"],
            yearOrSession: exItem.yearOrSession || '2026',
            questions: normalizedQuestions
          };
          validExams.push(sanitizedExam);
        }
      });

      if (errors.length > 0) {
        setJsonParseErrors(errors);
        setIsJsonValid(false);
      } else {
        setParsedBatchExams(validExams);
        setIsJsonValid(true);
      }
    } catch (err: any) {
      setJsonParseErrors([`JSON Parsing Error: ${err.message}. Ensure valid JSON syntax or paste clean question data.`]);
      setIsJsonValid(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleValidateJson(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleTemplate = (templateKey: string) => {
    const template = SAMPLE_TEMPLATES[templateKey];
    if (template) {
      const formatted = JSON.stringify(template, null, 2);
      handleValidateJson(formatted);
      setSuccessMessage(`Loaded "${template.title}" template.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleExecuteBatchUpload = async () => {
    if (parsedBatchExams.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await batchSaveExamsToFirestore(parsedBatchExams);
      if (result.success > 0 && result.failed === 0) {
        setSuccessMessage(`Successfully published ${result.success} exam(s) to Firestore!`);
        setRawJsonText('');
        setParsedBatchExams([]);
        setIsJsonValid(false);
      } else if (result.success > 0 && result.failed > 0) {
        setSuccessMessage(`Published ${result.success} exam(s). (${result.failed} failed, check console).`);
      } else {
        setErrorMessage(`Failed to publish exams. Please check console for details.`);
      }
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(`Upload failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ------------------------------------------
  // MANUAL EXAM BUILDER LOGIC
  // ------------------------------------------
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q_${Date.now()}_${manualExam.questions.length + 1}`,
      examId: manualExam.id,
      number: manualExam.questions.length + 1,
      questionType: 'single_choice',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
      topic: 'General'
    };

    const updatedQs = [...manualExam.questions, newQ];
    setManualExam({
      ...manualExam,
      questions: updatedQs,
      totalQuestions: updatedQs.length
    });
    setCurrentEditingQIndex(updatedQs.length - 1);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (manualExam.questions.length <= 1) {
      alert('An exam must have at least one question.');
      return;
    }
    const filtered = manualExam.questions.filter((_, i) => i !== idx).map((q, i) => ({
      ...q,
      number: i + 1
    }));
    setManualExam({
      ...manualExam,
      questions: filtered,
      totalQuestions: filtered.length
    });
    setCurrentEditingQIndex(Math.max(0, idx - 1));
  };

  const handleUpdateCurrentQuestion = (field: keyof Question, value: any) => {
    const updatedQs = [...manualExam.questions];
    updatedQs[currentEditingQIndex] = {
      ...updatedQs[currentEditingQIndex],
      [field]: value
    };
    setManualExam({
      ...manualExam,
      questions: updatedQs
    });
  };

  const handleOptionTextChange = (optIdx: number, text: string) => {
    const currentQ = manualExam.questions[currentEditingQIndex];
    const newOptions = [...currentQ.options];
    newOptions[optIdx] = text;
    handleUpdateCurrentQuestion('options', newOptions);
  };

  const handleAddOption = () => {
    const currentQ = manualExam.questions[currentEditingQIndex];
    if (currentQ.options.length >= 8) return;
    const newOptions = [...currentQ.options, ''];
    handleUpdateCurrentQuestion('options', newOptions);
  };

  const handleRemoveOption = (optIdx: number) => {
    const currentQ = manualExam.questions[currentEditingQIndex];
    if (currentQ.options.length <= 2) {
      alert('A question must have at least 2 options.');
      return;
    }
    const newOptions = currentQ.options.filter((_, i) => i !== optIdx);
    let newCorrect = currentQ.correctAnswerIndex;
    if (newCorrect >= newOptions.length) {
      newCorrect = 0;
    }
    handleUpdateCurrentQuestion('options', newOptions);
    handleUpdateCurrentQuestion('correctAnswerIndex', newCorrect);
  };

  const handleSaveManualExam = async () => {
    // Validate
    if (!manualExam.title.trim()) {
      alert('Please enter an exam title.');
      return;
    }
    for (let i = 0; i < manualExam.questions.length; i++) {
      const q = manualExam.questions[i];
      if (!q.questionText.trim()) {
        alert(`Question #${i + 1} has empty question text.`);
        setCurrentEditingQIndex(i);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`Question #${i + 1} has empty option fields.`);
        setCurrentEditingQIndex(i);
        return;
      }
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: Exam = {
        ...manualExam,
        totalQuestions: manualExam.questions.length,
        isCustom: true,
        createdAt: new Date().toISOString()
      };
      await saveExamToFirestore(payload);
      setSuccessMessage(`Exam "${manualExam.title}" published successfully!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setActiveSubTab('catalog');
    } catch (err: any) {
      setErrorMessage(`Error publishing exam: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ------------------------------------------
  // CATALOG ACTIONS (Export / Delete / Edit / Preview)
  // ------------------------------------------
  const handleExportExamJson = async (exam: Exam) => {
    let full = exam;
    if (!full.questions || full.questions.length === 0) {
      try {
        const res = await fetch(`/exams/${exam.id}.json`);
        if (res.ok) full = await res.json();
      } catch (e) {}
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(full, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${full.id}_exam.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleOpenPreview = async (exam: Exam) => {
    let full = exam;
    if (!full.questions || full.questions.length === 0) {
      try {
        const res = await fetch(`/exams/${exam.id}.json`);
        if (res.ok) full = await res.json();
      } catch (e) {
        console.warn('Could not fetch full exam for preview:', e);
      }
    }
    setPreviewExam(full);
  };

  const handleDeleteCustomExam = async (exam: Exam) => {
    const isCustom = exam.isCustom || customExams.some(c => c.id === exam.id);
    const label = isCustom ? 'permanently delete custom exam' : 'hide built-in exam';
    if (!confirm(`Are you sure you want to ${label} "${exam.title}"?`)) return;
    try {
      if (isCustom) {
        await deleteExamFromFirestore(exam.id);
      } else {
        await hideBuiltinExam(exam.id);
      }
      setSuccessMessage(`Exam "${exam.title}" ${isCustom ? 'deleted' : 'hidden from catalog'}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleRestoreBuiltinExam = async (examId: string) => {
    try {
      await unhideBuiltinExam(examId);
      setSuccessMessage('Exam restored to catalog.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      alert(`Error restoring exam: ${e.message}`);
    }
  };

  // ------------------------------------------
  // EDIT EXISTING EXAM: load into manual builder
  // ------------------------------------------
  const handleEditExam = async (exam: Exam) => {
    let full = exam;
    if (!full.questions || full.questions.length === 0) {
      try {
        const res = await fetch(`/exams/${exam.id}.json`);
        if (res.ok) full = await res.json();
      } catch (e) {
        console.warn('Could not fetch full exam for editing:', e);
      }
    }
    // Deep-clone the exam so edits don't mutate the original
    const cloned: Exam = JSON.parse(JSON.stringify(full));
    setManualExam(cloned);
    setCurrentEditingQIndex(0);
    setEditingExamId(exam.id);
    setActiveSubTab('manual');
    setSuccessMessage(`Editing "${exam.title}". Make changes and re-publish to save.`);
    setTimeout(() => setSuccessMessage(null), 5000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ------------------------------------------
  // JSON EDITOR SYNC SCROLL (line numbers)
  // ------------------------------------------
  const syncJsonScroll = useCallback(() => {
    if (jsonLineNumRef.current && jsonTextareaRef.current) {
      jsonLineNumRef.current.scrollTop = jsonTextareaRef.current.scrollTop;
    }
  }, []);

  const currentQ = manualExam.questions[currentEditingQIndex];

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation Sub-Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Exam & Question Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create rich national exams manually or batch upload full question banks with graphs, diagrams, formulas, and diverse MCQ formats.
          </p>
        </div>

        {/* Sub-tabs buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'catalog'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Exams Catalog ({allExams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'manual'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manual Creator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('batch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'batch'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-purple-600" />
            <span>Batch JSON Importer</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. EXAM CATALOG VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          {/* Hidden Exams Restore Banner */}
          {hiddenExamIds.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {hiddenExamIds.length} built-in exam(s) are currently hidden from the catalog.
              </div>
              <div className="flex flex-wrap gap-2">
                {hiddenExamIds.map(id => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleRestoreBuiltinExam(id)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Restore: {id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allExams.map((exam) => {
              const isCustom = exam.isCustom || customExams.some(c => c.id === exam.id);

              return (
                <div
                  key={exam.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                        {exam.category}
                      </span>
                      {isCustom ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Custom Uploaded
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          Built-in National
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {exam.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1">
                      <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-medium">
                        📝 {exam.totalQuestions || exam.questions.length} Questions
                      </span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-medium">
                        ⏱️ {exam.durationMinutes} Mins
                      </span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-medium">
                        🎯 {exam.passMarkPercent}% Pass Mark
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(exam)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditExam(exam)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Open in Manual Editor to edit questions"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExportExamJson(exam)}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Download JSON structure"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>JSON</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCustomExam(exam)}
                        className="p-1 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                        title={isCustom ? 'Delete custom exam from Firestore' : 'Hide built-in exam from catalog'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MANUAL EXAM BUILDER */}
      {/* ========================================================================= */}
      {activeSubTab === 'manual' && (
        <div className="space-y-6">
          {/* Editing mode banner */}
          {editingExamId && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-300 rounded-xl text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <Edit3 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Editing existing exam: <span className="font-extrabold">{manualExam.title || editingExamId}</span>
                  <span className="ml-2 font-normal text-indigo-700">— Re-publish to overwrite the saved version.</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingExamId(null);
                  setManualExam({
                    id: `exam_custom_${Date.now()}`,
                    title: '', category: 'NGAT', subCategory: '', description: '',
                    durationMinutes: 60, totalQuestions: 1, passMarkPercent: 65,
                    difficulty: 'Standard National', packageRequired: 'ALL_IN_ONE',
                    isFree: false, tags: ['National Mock', '2026'], yearOrSession: '2026',
                    questions: [{
                      id: `q_${Date.now()}_1`, examId: `exam_custom_${Date.now()}`,
                      number: 1, questionType: 'single_choice', questionText: '',
                      options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '', topic: 'General'
                    }]
                  });
                  setCurrentEditingQIndex(0);
                }}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-indigo-200 hover:bg-slate-50 text-indigo-800 font-bold transition-colors"
              >
                ✕ Discard &amp; New Exam
              </button>
            </div>
          )}

          {/* Exam Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Exam Configuration &amp; National Blueprint Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Exam Title *</label>
                <input
                  type="text"
                  value={manualExam.title}
                  onChange={(e) => setManualExam({ ...manualExam, title: e.target.value })}
                  placeholder="e.g. AAU GAT Mock Exam 2026 - Quantitative & Analytical Bank"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category *</label>
                <select
                  value={manualExam.category}
                  onChange={(e) => setManualExam({ ...manualExam, category: e.target.value as ExamCategory })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="NGAT">NGAT (Graduate Admission)</option>
                  <option value="GAT">AAU GAT</option>
                  <option value="GRADE_9">Grade 9 National Practice</option>
                  <option value="GRADE_10">Grade 10 National Matrix</option>
                  <option value="GRADE_11">Grade 11 Preparatory</option>
                  <option value="GRADE_12">Grade 12 Comprehensive</option>
                  <option value="ENTRANCE">Grade 12 University Entrance</option>
                  <option value="EXIT">MoE Exit Exam</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Sub-Category / Stream</label>
                <input
                  type="text"
                  value={manualExam.subCategory}
                  onChange={(e) => setManualExam({ ...manualExam, subCategory: e.target.value })}
                  placeholder="e.g. Computer Science & Software Engineering"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Duration (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={manualExam.durationMinutes}
                  onChange={(e) => setManualExam({ ...manualExam, durationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Pass Mark (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={manualExam.passMarkPercent}
                  onChange={(e) => setManualExam({ ...manualExam, passMarkPercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Package Required to Unlock</label>
                <select
                  value={manualExam.packageRequired}
                  onChange={(e) => setManualExam({ ...manualExam, packageRequired: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="ALL_IN_ONE">Master Pass (ALL_IN_ONE)</option>
                  {EXAM_PACKAGES.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name} ({pkg.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Difficulty Level</label>
                <select
                  value={manualExam.difficulty}
                  onChange={(e) => setManualExam({ ...manualExam, difficulty: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Medium">Medium</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Standard National">Standard National</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Access Tier</label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isFree"
                      checked={!manualExam.isFree}
                      onChange={() => setManualExam({ ...manualExam, isFree: false })}
                    />
                    <span className="font-semibold text-slate-800">Premium Locked</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isFree"
                      checked={manualExam.isFree}
                      onChange={() => setManualExam({ ...manualExam, isFree: true })}
                    />
                    <span className="font-semibold text-emerald-700">Free Practice</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={manualExam.description}
                  onChange={(e) => setManualExam({ ...manualExam, description: e.target.value })}
                  placeholder="Provide students with an overview of what competencies and curriculum domains this test covers."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Question Builder Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Questions Navigation Strip */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Questions ({manualExam.questions.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {manualExam.questions.map((q, idx) => {
                  const isSelected = currentEditingQIndex === idx;
                  const hasImage = Boolean(q.diagramUrl || q.imageUrl);
                  const hasCode = Boolean(q.codeBlock);
                  const hasPassage = Boolean(q.passage);

                  return (
                    <div
                      key={q.id}
                      onClick={() => setCurrentEditingQIndex(idx)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold ring-1 ring-purple-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span>Q{idx + 1}.</span>
                          <span className="truncate font-medium">
                            {q.questionText ? q.questionText.slice(0, 30) + '...' : '(Empty Question)'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                          <span>{q.topic || 'General'}</span>
                          {hasImage && <span className="text-purple-600">📷 Image</span>}
                          {hasCode && <span className="text-emerald-600">💻 Code</span>}
                          {hasPassage && <span className="text-amber-600">📖 Passage</span>}
                        </div>
                      </div>

                      {manualExam.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveQuestion(idx);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Question Editor & Visual Form */}
            {currentQ && (
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-900 font-extrabold text-xs">
                      Question {currentEditingQIndex + 1} Editor
                    </span>
                    <span className="text-xs text-slate-500">
                      Type: {currentQ.questionType || 'Single Choice MCQ'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={currentQ.questionType || 'single_choice'}
                      onChange={(e) => {
                        const newType = e.target.value;
                        if (newType === 'quantitative_comparison') {
                          handleUpdateCurrentQuestion('questionType', 'quantitative_comparison');
                          if (!currentQ.questionText) {
                            handleUpdateCurrentQuestion('questionText', 'Directions: Compare Column A and Column B and select the correct alternative.');
                          }
                          handleUpdateCurrentQuestion('options', [
                            "Quantity in Column A is greater",
                            "Quantity in Column B is greater",
                            "The two quantities are equal",
                            "The relationship cannot be determined from the information given"
                          ]);
                        } else {
                          handleUpdateCurrentQuestion('questionType', newType);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="single_choice">Standard Multiple Choice (Single Correct)</option>
                      <option value="quantitative_comparison">Quantitative Comparison (Column A vs Column B)</option>
                      <option value="multi_choice">Multiple Choice (Multi-Select Correct)</option>
                      <option value="true_false">True / False</option>
                      <option value="assertion_reason">Assertion & Reason</option>
                    </select>
                  </div>
                </div>

                {/* Quantitative Comparison Specific Inputs */}
                {currentQ.questionType === 'quantitative_comparison' && (
                  <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <span>⚖️ Quantitative Comparison Setup (GAT Standard)</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[11px] text-indigo-900">
                        Given Information / Premise (Optional condition centered above columns)
                      </label>
                      <input
                        type="text"
                        value={currentQ.premise || ''}
                        onChange={(e) => handleUpdateCurrentQuestion('premise', e.target.value)}
                        placeholder="e.g. m and n are negative integers OR Let (x + 2y)(x - 2y) = 2"
                        className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-serif"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-[11px] text-indigo-900">
                          Column A Expression / Value *
                        </label>
                        <input
                          type="text"
                          value={currentQ.columnA || ''}
                          onChange={(e) => handleUpdateCurrentQuestion('columnA', e.target.value)}
                          placeholder="e.g. m + n OR 249² − 248²"
                          className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none font-serif"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-[11px] text-purple-900">
                          Column B Expression / Value *
                        </label>
                        <input
                          type="text"
                          value={currentQ.columnB || ''}
                          onChange={(e) => handleUpdateCurrentQuestion('columnB', e.target.value)}
                          placeholder="e.g. m / n OR 1"
                          className="w-full px-3 py-1.5 rounded-lg border border-purple-200 bg-white text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none font-serif"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Text */}
                <div className="space-y-1">
                  <label className="font-bold text-xs text-slate-700">Question Prompt / Problem Statement *</label>
                  <textarea
                    rows={currentQ.questionType === 'quantitative_comparison' ? 2 : 3}
                    value={currentQ.questionText}
                    onChange={(e) => handleUpdateCurrentQuestion('questionText', e.target.value)}
                    placeholder="Enter the complete question prompt..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Optional Media & Passages Accordion */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {/* Image / Diagram URL & Vector Graph Designer */}
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                        <span>Diagram / Geometric Shape / Graph</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setIsGraphDesignerOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Visual Shape & Graph Designer</span>
                      </button>
                    </div>

                    {/* If vector graphData is present */}
                    {currentQ.graphData && (
                      <div className="p-3 bg-emerald-50/60 border border-emerald-300 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Active Vector SVG Geometric Diagram</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsGraphDesignerOpen(true)}
                              className="text-xs text-purple-700 hover:underline font-bold"
                            >
                              Edit Shape
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateCurrentQuestion('graphData', undefined);
                                handleUpdateCurrentQuestion('imageCaption', undefined);
                              }}
                              className="text-xs text-red-600 hover:underline font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div 
                          className="bg-white p-2 rounded-lg border border-emerald-200 max-w-sm mx-auto overflow-x-auto flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: currentQ.graphData }}
                        />
                      </div>
                    )}

                    <input
                      type="url"
                      value={currentQ.diagramUrl || currentQ.imageUrl || ''}
                      onChange={(e) => {
                        handleUpdateCurrentQuestion('diagramUrl', e.target.value);
                        handleUpdateCurrentQuestion('imageUrl', e.target.value);
                      }}
                      placeholder="Or paste external image URL: https://... (PNG, JPG, SVG)"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                    />
                    {(currentQ.diagramUrl || currentQ.imageUrl) && (
                      <div className="pt-1 flex items-center gap-3">
                        <img
                          src={currentQ.diagramUrl || currentQ.imageUrl}
                          alt="Diagram preview"
                          className="h-16 w-24 object-cover rounded border border-slate-300"
                        />
                        <span className="text-[11px] text-emerald-700 font-semibold">✓ Image link active</span>
                      </div>
                    )}
                  </div>

                  {/* Image Caption */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Figure / Caption Description</label>
                    <input
                      type="text"
                      value={currentQ.imageCaption || ''}
                      onChange={(e) => handleUpdateCurrentQuestion('imageCaption', e.target.value)}
                      placeholder="e.g. Figure 1: Supply and Demand Curves"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* Topic Tag */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Topic / Curriculum Area</label>
                    <input
                      type="text"
                      value={currentQ.topic || ''}
                      onChange={(e) => handleUpdateCurrentQuestion('topic', e.target.value)}
                      placeholder="e.g. Quantitative, Organic Chemistry, Civil Law"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* Optional Reading Passage */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reading Comprehension Passage / Case Scenario (Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={currentQ.passage || ''}
                      onChange={(e) => handleUpdateCurrentQuestion('passage', e.target.value)}
                      placeholder="Paste background scenario, clinical vignette, legal statute, or comprehension passage..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-serif"
                    />
                  </div>

                  {/* Optional Code Block / Formula Snippet */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Code Snippet / Formula / Table Box (Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={currentQ.codeBlock || ''}
                      onChange={(e) => handleUpdateCurrentQuestion('codeBlock', e.target.value)}
                      placeholder="Enter raw formula, code snippet, or formatted ASCII table..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Options List Builder */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-slate-800">
                      Answer Choices (Select the radio button for the correct answer)
                    </label>
                    {currentQ.options.length < 6 && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline"
                      >
                        + Add Choice Option
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {currentQ.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isCorrect = currentQ.correctAnswerIndex === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all ${
                            isCorrect ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-200' : 'bg-white border-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleUpdateCurrentQuestion('correctAnswerIndex', optIdx)}
                            className={`w-6 h-6 rounded-full border font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                              isCorrect ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
                            }`}
                            title="Click to mark as correct answer"
                          >
                            {letter}
                          </button>

                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionTextChange(optIdx, e.target.value)}
                            placeholder={`Option ${letter} text...`}
                            className="flex-1 px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />

                          {isCorrect && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                              ✓ Correct
                            </span>
                          )}

                          {currentQ.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(optIdx)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1">
                  <label className="font-bold text-xs text-slate-700">Detailed Solution & Pedagogical Explanation</label>
                  <textarea
                    rows={2}
                    value={currentQ.explanation}
                    onChange={(e) => handleUpdateCurrentQuestion('explanation', e.target.value)}
                    placeholder="Explain the step-by-step logic, formula derivation, or clinical reasoning for students after exam completion..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* Instant Real-Time Preview for this Question */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      <span>Live Question Preview (How students see it)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Updates live as you type</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <RichQuestionViewer
                      question={currentQ}
                      questionNumber={currentEditingQIndex + 1}
                      totalQuestions={manualExam.questions.length}
                      readOnly={true}
                      showAnswerFeedback={true}
                      userSelectedIndex={currentQ.correctAnswerIndex}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Exam ready with <strong>{manualExam.questions.length} question(s)</strong>.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewExam(manualExam)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Live Preview</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSaveManualExam}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? (editingExamId ? 'Updating...' : 'Publishing...')
                    : (editingExamId ? 'Update Exam in Firestore' : 'Publish Exam to Firestore')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BATCH JSON IMPORTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'batch' && (
        <div className="space-y-6">
          {/* Quick Template Cards */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-950 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <span>Ready-to-Use Ethiopian Exam JSON Blueprints</span>
              </div>
              <span className="text-[11px] text-purple-700">Click any preset to load schema instantly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleLoadSampleTemplate('hawassa_gat_quant')}
                className="p-3 bg-white hover:bg-indigo-50 border-2 border-indigo-300 rounded-lg text-left transition-all shadow-xs"
              >
                <div className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Hawassa GAT Quantitative</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Column A vs Column B, radicals & frequency tables</div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSampleTemplate('graph_and_quantitative')}
                className="p-3 bg-white hover:bg-purple-100/60 border border-purple-200 rounded-lg text-left transition-all shadow-xs"
              >
                <div className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-700" />
                  <span>NGAT Graphs & Analysis</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Data graphs, parabolic curves & Gaussian statistics</div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSampleTemplate('medical_and_diagram')}
                className="p-3 bg-white hover:bg-purple-100/60 border border-purple-200 rounded-lg text-left transition-all shadow-xs"
              >
                <div className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-700" />
                  <span>Medicine & ECG Diagrams</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Clinical case vignettes, ECG images & anatomy diagrams</div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSampleTemplate('cs_exit_code')}
                className="p-3 bg-white hover:bg-purple-100/60 border border-purple-200 rounded-lg text-left transition-all shadow-xs"
              >
                <div className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-purple-700" />
                  <span>CS Exit & Code Snippets</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Master theorem code blocks & SQL schemas</div>
              </button>
            </div>
          </div>

          {/* AI Prompt Guide & Conversion Card */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">AI Prompt Instructions for PDF & Exam Conversion</h4>
                  <p className="text-[11px] text-indigo-800">Copy this prompt and paste it into ChatGPT, Claude, or Gemini alongside any exam PDF, textbook page, or image.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiPromptGuideOpen(!isAiPromptGuideOpen)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-colors cursor-pointer"
                >
                  {isAiPromptGuideOpen ? 'Hide AI Prompt' : 'View AI Prompt'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const promptText = `You are an expert Ethiopian National Exam digitization assistant. Convert the provided exam questions, PDF pages, or textbook problems into a valid JSON array or object for the Melmeja testing platform.

OUTPUT INSTRUCTIONS:
- Output ONLY pure JSON (no markdown explanation or text outside the JSON).
- You can provide a full Exam object OR a simple array of question objects.

SCHEMA FORMAT:
{
  "title": "Exam Title (e.g. Hawassa GAT Quantitative Reasoning 2024)",
  "category": "GAT", // One of: "GAT", "NGAT", "EXIT", "ENTRANCE"
  "subCategory": "Quantitative Reasoning / Civil Law / Medicine / CS Exit",
  "description": "Comprehensive mock exam description",
  "durationMinutes": 90,
  "passMarkPercent": 60,
  "difficulty": "Standard National",
  "questions": [
    // 1. STANDARD MULTIPLE CHOICE:
    {
      "number": 1,
      "questionType": "single_choice",
      "questionText": "What is the value of x in 2x + 4 = 10?",
      "options": ["2", "3", "4", "5"],
      "correctAnswerIndex": 1, // 0 for A, 1 for B, 2 for C, 3 for D
      "explanation": "2x = 6 => x = 3. Correct answer is (B).",
      "topic": "Algebra"
    },

    // 2. QUANTITATIVE COMPARISON (COLUMN A VS COLUMN B):
    {
      "number": 2,
      "questionType": "quantitative_comparison",
      "questionText": "Directions: Compare Column A and Column B and select the correct alternative.",
      "premise": "m and n are negative integers.",
      "columnA": "m + n",
      "columnB": "m / n",
      "options": [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      "correctAnswerIndex": 1,
      "explanation": "Negative + negative is negative, negative / negative is positive. Column B is greater.",
      "topic": "Quantitative Comparison"
    },

    // 3. QUESTION WITH DIAGRAM / SVG / GEOMETRIC FIGURE:
    {
      "number": 3,
      "questionType": "single_choice",
      "questionText": "In the geometric kite shown below, diagonals are d1 = 16 cm and d2 = 9 cm. What is its area?",
      "graphData": "<svg ...>...</svg>", // Optional raw SVG string or leave for designer
      "imageCaption": "Figure: Geometric Kite with diagonals d1 and d2",
      "options": ["144 sq.cm", "72 sq.cm", "108 sq.cm", "36 sq.cm"],
      "correctAnswerIndex": 1,
      "explanation": "Area = 1/2 * (d1 * d2) = 72 sq.cm.",
      "topic": "Geometry"
    },

    // 4. QUESTION WITH READING PASSAGE OR MARKDOWN TABLE:
    {
      "number": 4,
      "questionType": "single_choice",
      "passage": "| Value (x) | 10 | 20 | 30 |\\n| Frequency (f) | 4 | 5 | 1 |",
      "questionText": "What is the weighted mean of the frequency table?",
      "options": ["17", "20", "25", "30"],
      "correctAnswerIndex": 0,
      "explanation": "Sum(f*x) = 40 + 100 + 30 = 170. Total frequency = 10. Mean = 17.",
      "topic": "Statistics"
    }
  ]
}`;
                    navigator.clipboard.writeText(promptText);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 3000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy AI Prompt'}</span>
                </button>
              </div>
            </div>

            {isAiPromptGuideOpen && (
              <div className="bg-slate-900 rounded-xl p-4 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800 space-y-2">
                <div className="text-slate-400 text-[11px] pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span>AI System Prompt for ChatGPT / Claude / Gemini</span>
                  <span className="text-[10px] text-emerald-400">JSON Schema v2.0 Ready</span>
                </div>
                <pre className="whitespace-pre text-[11px] leading-relaxed text-slate-200">
{`You are an expert Ethiopian National Exam digitization assistant. Convert the provided exam questions, PDF pages, or textbook problems into a valid JSON array or object for the Melmeja testing platform.

OUTPUT INSTRUCTIONS:
- Output ONLY pure JSON (no markdown explanation or text outside the JSON).
- You can provide a full Exam object OR a simple array of question objects.

SCHEMA FORMAT:
{
  "title": "Exam Title (e.g. Hawassa GAT Quantitative Reasoning 2024)",
  "category": "GAT", // One of: "GAT", "NGAT", "EXIT", "ENTRANCE"
  "subCategory": "Quantitative Reasoning / Civil Law / Medicine / CS Exit",
  "description": "Comprehensive mock exam description",
  "durationMinutes": 90,
  "passMarkPercent": 60,
  "difficulty": "Standard National",
  "questions": [
    // 1. STANDARD MULTIPLE CHOICE:
    {
      "number": 1,
      "questionType": "single_choice",
      "questionText": "What is the value of x in 2x + 4 = 10?",
      "options": ["2", "3", "4", "5"],
      "correctAnswerIndex": 1, // 0 for A, 1 for B, 2 for C, 3 for D
      "explanation": "2x = 6 => x = 3. Correct answer is (B).",
      "topic": "Algebra"
    },

    // 2. QUANTITATIVE COMPARISON (COLUMN A VS COLUMN B):
    {
      "number": 2,
      "questionType": "quantitative_comparison",
      "questionText": "Directions: Compare Column A and Column B and select the correct alternative.",
      "premise": "m and n are negative integers.",
      "columnA": "m + n",
      "columnB": "m / n",
      "options": [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      "correctAnswerIndex": 1,
      "explanation": "Negative + negative is negative, negative / negative is positive. Column B is greater.",
      "topic": "Quantitative Comparison"
    },

    // 3. QUESTION WITH DIAGRAM / SVG / GEOMETRIC FIGURE:
    {
      "number": 3,
      "questionType": "single_choice",
      "questionText": "In the geometric kite shown below, diagonals are d1 = 16 cm and d2 = 9 cm. What is its area?",
      "graphData": "<svg ...>...</svg>",
      "imageCaption": "Figure: Geometric Kite with diagonals d1 and d2",
      "options": ["144 sq.cm", "72 sq.cm", "108 sq.cm", "36 sq.cm"],
      "correctAnswerIndex": 1,
      "explanation": "Area = 1/2 * (d1 * d2) = 72 sq.cm.",
      "topic": "Geometry"
    },

    // 4. QUESTION WITH READING PASSAGE OR MARKDOWN TABLE:
    {
      "number": 4,
      "questionType": "single_choice",
      "passage": "| Value (x) | 10 | 20 | 30 |\\n| Frequency (f) | 4 | 5 | 1 |",
      "questionText": "What is the weighted mean of the frequency table?",
      "options": ["17", "20", "25", "30"],
      "correctAnswerIndex": 0,
      "explanation": "Sum(f*x) = 40 + 100 + 30 = 170. Total frequency = 10. Mean = 17.",
      "topic": "Statistics"
    }
  ]
}`}
                </pre>
              </div>
            )}
          </div>

          {/* JSON Upload & Input Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-600" />
                  <span>Paste JSON Text or Upload .json File</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accepts full Exam objects, raw question arrays, AI markdown code blocks, or simplified schemas.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .json File</span>
                </button>
              </div>
            </div>

            {/* Code Textarea with Line Numbers */}
            <div className="space-y-1">
              <div className="flex font-mono text-xs bg-slate-900 rounded-xl border border-slate-800 focus-within:ring-2 focus-within:ring-purple-500 shadow-inner">
                {/* Gutter / Line Numbers */}
                <div
                  ref={jsonLineNumRef}
                  className="text-slate-500 text-right py-3.5 px-3 select-none bg-slate-800/50 border-r border-slate-700 min-w-[42px] overflow-hidden leading-relaxed"
                >
                  {(rawJsonText || '\n'.repeat(11)).split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Editor */}
                <textarea
                  ref={jsonTextareaRef}
                  rows={12}
                  wrap="off"
                  value={rawJsonText}
                  onScroll={syncJsonScroll}
                  onChange={(e) => handleValidateJson(e.target.value)}
                  placeholder='Paste your JSON exam structure here (e.g. { "title": "NGAT Mock 2026", "category": "NGAT", "questions": [...] })'
                  className="flex-1 p-3.5 bg-transparent text-emerald-300 resize-none focus:outline-none leading-relaxed whitespace-pre overflow-auto"
                />
              </div>
            </div>

            {/* Validation Feedback */}
            {jsonParseErrors.length > 0 && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-red-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>Validation / Syntax Issues Found ({jsonParseErrors.length})</span>
                </div>
                <ul className="list-disc list-inside text-red-800 space-y-0.5 pl-1">
                  {jsonParseErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {isJsonValid && parsedBatchExams.length > 0 && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-3">
                <div className="font-bold text-emerald-950 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Valid Blueprint Verified! Ready to publish {parsedBatchExams.length} exam(s)</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {parsedBatchExams.map((ex, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-emerald-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{ex.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {ex.category} • {ex.questions.length} Questions • {ex.durationMinutes} Mins • Pass Mark: {ex.passMarkPercent}%
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewExam(ex)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview Questions</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Batch Publish Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                disabled={!isJsonValid || parsedBatchExams.length === 0 || isProcessing}
                onClick={handleExecuteBatchUpload}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-40"
              >
                <Upload className="w-4 h-4" />
                <span>{isProcessing ? 'Publishing to Firestore...' : `Publish ${parsedBatchExams.length || 0} Exam(s) to Firestore`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LIVE EXAM PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewExam && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                    {previewExam.category} Preview
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {previewExam.questions.length} Questions • {previewExam.durationMinutes} Minutes
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {previewExam.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setPreviewExam(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions Scrollable Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2">
              {previewExam.questions.map((q, qIdx) => (
                <div key={q.id || qIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Question {qIdx + 1} of {previewExam.questions.length}</span>
                    <span className="text-slate-500">Topic: {q.topic || 'General'}</span>
                  </div>

                  <RichQuestionViewer
                    question={q}
                    questionNumber={qIdx + 1}
                    totalQuestions={previewExam.questions.length}
                    readOnly={true}
                    showAnswerFeedback={true}
                    userSelectedIndex={q.correctAnswerIndex}
                  />

                  {q.explanation && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1 mt-2">
                      <div className="font-bold text-emerald-900">Explanation:</div>
                      <div className="text-emerald-950 leading-relaxed">{q.explanation}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setPreviewExam(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Geometry & Graph Designer Modal */}
      {isGraphDesignerOpen && (
        <GeometryGraphDesigner
          onClose={() => setIsGraphDesignerOpen(false)}
          onInsertGraph={(svgCode, captionText) => {
            handleUpdateCurrentQuestion('graphData', svgCode);
            handleUpdateCurrentQuestion('imageCaption', captionText);
            setIsGraphDesignerOpen(false);
            setSuccessMessage('Geometric shape successfully generated and inserted into question!');
            setTimeout(() => setSuccessMessage(null), 3500);
          }}
        />
      )}
    </div>
  );
};
