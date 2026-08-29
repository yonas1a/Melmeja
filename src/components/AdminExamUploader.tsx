import React, { useState, useRef } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Exam, Question, ExamCategory, QuestionType } from '../types';
import { useExam } from '../context/ExamContext';
import { EXAM_PACKAGES, INITIAL_EXAMS } from '../data/examsData';
import { RichQuestionViewer } from './RichQuestionViewer';

const SAMPLE_TEMPLATES: Record<string, any> = {
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
    packageRequired: "NGAT_PREM",
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
    packageRequired: "EXIT_MED",
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
    packageRequired: "EXIT_CS",
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
      const parsed = JSON.parse(text);
      const examsToValidate: any[] = Array.isArray(parsed) ? parsed : [parsed];
      const errors: string[] = [];
      const validExams: Exam[] = [];

      examsToValidate.forEach((exItem, exIdx) => {
        const itemLabel = exItem.title ? `"${exItem.title}"` : `Exam Item #${exIdx + 1}`;

        if (!exItem.title || typeof exItem.title !== 'string') {
          errors.push(`${itemLabel}: Missing or invalid 'title' string.`);
        }
        if (!exItem.category || !['NGAT', 'GAT', 'EXIT', 'ENTRANCE'].includes(exItem.category)) {
          errors.push(`${itemLabel}: 'category' must be one of 'NGAT', 'GAT', 'EXIT', 'ENTRANCE'.`);
        }
        if (!Array.isArray(exItem.questions) || exItem.questions.length === 0) {
          errors.push(`${itemLabel}: 'questions' must be a non-empty array.`);
        } else {
          exItem.questions.forEach((q: any, qIdx: number) => {
            const qLabel = `${itemLabel} -> Question #${qIdx + 1}`;
            if (!q.questionText || typeof q.questionText !== 'string') {
              errors.push(`${qLabel}: Missing 'questionText'.`);
            }
            if (!Array.isArray(q.options) || q.options.length < 2) {
              errors.push(`${qLabel}: 'options' must be an array of at least 2 strings.`);
            }
            if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || (q.options && q.correctAnswerIndex >= q.options.length)) {
              errors.push(`${qLabel}: 'correctAnswerIndex' must be a valid index (0 to ${q.options?.length ? q.options.length - 1 : 1}).`);
            }
          });
        }

        if (errors.length === 0) {
          const sanitizedExam: Exam = {
            id: exItem.id || `exam_${Date.now()}_${exIdx}`,
            title: exItem.title,
            category: exItem.category as ExamCategory,
            subCategory: exItem.subCategory || exItem.category,
            description: exItem.description || `Comprehensive mock exam for ${exItem.title}.`,
            durationMinutes: Number(exItem.durationMinutes) || 60,
            totalQuestions: exItem.questions.length,
            passMarkPercent: Number(exItem.passMarkPercent) || 65,
            isFree: Boolean(exItem.isFree),
            packageRequired: exItem.packageRequired || 'ALL_IN_ONE',
            difficulty: exItem.difficulty || 'Standard National',
            tags: Array.isArray(exItem.tags) ? exItem.tags : [exItem.category],
            yearOrSession: exItem.yearOrSession || '2026',
            questions: exItem.questions.map((q: any, idx: number) => ({
              id: q.id || `q_${Date.now()}_${idx + 1}`,
              examId: exItem.id || `exam_${Date.now()}_${exIdx}`,
              number: idx + 1,
              questionType: q.questionType || (q.options?.length === 2 ? 'true_false' : 'single_choice'),
              questionText: q.questionText,
              passage: q.passage || undefined,
              diagramUrl: q.diagramUrl || q.imageUrl || undefined,
              imageUrl: q.imageUrl || q.diagramUrl || undefined,
              imageCaption: q.imageCaption || undefined,
              graphData: q.graphData || undefined,
              codeBlock: q.codeBlock || undefined,
              options: q.options,
              optionImages: q.optionImages || undefined,
              correctAnswerIndex: q.correctAnswerIndex,
              correctAnswerIndices: q.correctAnswerIndices || undefined,
              explanation: q.explanation || 'Step-by-step review for this question.',
              explanationImageUrl: q.explanationImageUrl || undefined,
              topic: q.topic || 'General Aptitude'
            }))
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
      setJsonParseErrors([`JSON Syntax Error: ${err.message}`]);
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
  // CATALOG ACTIONS (Export / Delete)
  // ------------------------------------------
  const handleExportExamJson = (exam: Exam) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exam, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${exam.id}_exam.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
                        📝 {exam.questions.length} Questions
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
                      onClick={() => setPreviewExam(exam)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-1.5">
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
          {/* Exam Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Exam Configuration & National Blueprint Details
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
                  <option value="EXIT">MoE Exit Exam</option>
                  <option value="ENTRANCE">Grade 12 Entrance</option>
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
                      onChange={(e) => handleUpdateCurrentQuestion('questionType', e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="single_choice">Standard Multiple Choice (Single Correct)</option>
                      <option value="multi_choice">Multiple Choice (Multi-Select Correct)</option>
                      <option value="true_false">True / False</option>
                      <option value="assertion_reason">Assertion & Reason</option>
                    </select>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-1">
                  <label className="font-bold text-xs text-slate-700">Question Prompt / Problem Statement *</label>
                  <textarea
                    rows={3}
                    value={currentQ.questionText}
                    onChange={(e) => handleUpdateCurrentQuestion('questionText', e.target.value)}
                    placeholder="Enter the complete question prompt..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Optional Media & Passages Accordion */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {/* Image / Diagram URL */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                      <span>Diagram / Graph / Chart Image URL (Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={currentQ.diagramUrl || currentQ.imageUrl || ''}
                      onChange={(e) => {
                        handleUpdateCurrentQuestion('diagramUrl', e.target.value);
                        handleUpdateCurrentQuestion('imageUrl', e.target.value);
                      }}
                      placeholder="https://... (PNG, JPG, SVG, or Unsplash / CDN link)"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                    />
                    {(currentQ.diagramUrl || currentQ.imageUrl) && (
                      <div className="pt-2 flex items-center gap-3">
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
                <span>{isProcessing ? 'Publishing...' : 'Publish Exam to Firestore'}</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleLoadSampleTemplate('graph_and_quantitative')}
                className="p-3 bg-white hover:bg-purple-100/60 border border-purple-200 rounded-lg text-left transition-all shadow-xs"
              >
                <div className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-700" />
                  <span>Graphs & Quantitative</span>
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

          {/* JSON Upload & Input Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-600" />
                  <span>Paste JSON Text or Upload .json File</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accepts a single Exam object or an array of Exam objects.
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

            {/* Code Textarea */}
            <div className="space-y-1">
              <textarea
                rows={12}
                value={rawJsonText}
                onChange={(e) => handleValidateJson(e.target.value)}
                placeholder='Paste your JSON exam structure here (e.g. { "title": "NGAT Mock 2026", "category": "NGAT", "questions": [...] })'
                className="w-full p-3.5 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed shadow-inner"
              />
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
    </div>
  );
};
