#!/usr/bin/env node
/**
 * ============================================================================
 * Melmeja Exam Converter - Multi-Tier Categorization & Deployment
 * ============================================================================
 * Converts ALL JSON exam files in Exam/NotConverted/assets/ into Melmeja
 * platform format and outputs them to:
 *   1. Exam/Converted/ (Full JSON storage & bundle)
 *   2. public/exams/   (Served on-demand to web app client)
 *   3. src/data/convertedExamsMetadata.ts (Instant in-memory catalog index)
 *
 * Categorization Hierarchy:
 *   - Category: NGAT, GAT, EXIT, GRADE_9, GRADE_10, GRADE_11, GRADE_12, ENTRANCE
 *   - Year: 2014, 2015, 2016, 2017, 2018, 2024, 2026
 *   - Department: Mathematics, Physics, Chemistry, Biology, English, History,
 *                 Geography, Economics, Civics & Ethics, General Aptitude
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================
const ROOT_DIR = path.join(__dirname, '..');
const SOURCE_DIR = path.join(__dirname, 'NotConverted', 'assets');
const OUTPUT_DIR = path.join(__dirname, 'Converted');
const PUBLIC_EXAMS_DIR = path.join(ROOT_DIR, 'public', 'exams');
const METADATA_OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'data', 'convertedExamsMetadata.ts');

// ============================================================================
// SUBJECT / DEPARTMENT DETECTION
// ============================================================================
function detectDepartment(filename) {
  const f = filename.toLowerCase();
  
  if (f.includes('physics') || f.startsWith('p2') || f.startsWith('p_') || f.includes('_p2'))
    return 'Physics';
  if (f.includes('chemistry') || f.startsWith('c2') || f === 'c.json' || f === 'q.json' || f.includes('_c2'))
    return 'Chemistry';
  if (f.includes('biology') || f.startsWith('b2') || f.includes('bio') || f.includes('_b2'))
    return 'Biology';
  if (f.includes('math') || f.startsWith('m2') || f === 'questions.json' || f.includes('_m2') || f.startsWith('ms2'))
    return 'Mathematics';
  if (f.includes('english') || f.startsWith('eng') || f.startsWith('e20') || f.includes('_eng'))
    return 'English';
  if (f.includes('geography') || f.startsWith('geo') || f.includes('geo'))
    return 'Geography';
  if (f.includes('history') || f.startsWith('hist') || f.includes('hist'))
    return 'History';
  if (f.includes('civic'))
    return 'Civics & Ethics';
  if (f.includes('econ'))
    return 'Economics';
  if (f.includes('aptitude') || f.startsWith('apt') || f.includes('sat') || f.includes('natural') || f.includes('social'))
    return 'General Aptitude';
  
  return 'General Aptitude';
}

// ============================================================================
// CATEGORY DETECTION
// ============================================================================
function detectCategory(filename) {
  const f = filename.toLowerCase();

  // Explicit Postgrad & Exit
  if (f.includes('ngat')) return 'NGAT';
  if (f.includes('gat')) return 'GAT';
  if (f.includes('exit')) return 'EXIT';

  // Specific Grade Levels
  if (f.includes('g9') || f.includes('grade9') || f.includes('grade_9'))
    return 'GRADE_9';
  if (f.includes('g10') || f.includes('grade10') || f.includes('grade_10'))
    return 'GRADE_10';
  if (f.includes('g11') || f.includes('grade11') || f.includes('grade_11'))
    return 'GRADE_11';
  if (f.includes('g12') || f.includes('grade12') || f.includes('grade_12')) {
    // If it's explicitly national university entrance
    if (f.includes('entrance') || f.includes('euee')) {
      return 'ENTRANCE';
    }
    return 'GRADE_12';
  }
  
  // University Entrance & Models
  if (f.includes('entrance') || f.includes('sat2') || f.includes('sat_') || f.includes('model') || f.includes('aptitude') || f.includes('euee')) {
    return 'ENTRANCE';
  }

  return 'ENTRANCE'; // default
}

// ============================================================================
// YEAR DETECTION
// ============================================================================
function detectYear(filename) {
  const match = filename.match(/(20\d{2})/);
  if (match) return match[1];
  const match2 = filename.match(/(\d{4})/);
  if (match2) return match2[1];
  return '2024';
}

// ============================================================================
// GRADE DETECTION
// ============================================================================
function detectGrade(filename, category) {
  if (category === 'GRADE_9') return 'Grade 9';
  if (category === 'GRADE_10') return 'Grade 10';
  if (category === 'GRADE_11') return 'Grade 11';
  if (category === 'GRADE_12') return 'Grade 12';
  if (category === 'ENTRANCE') return 'Grade 12 Entrance';
  return null;
}

// ============================================================================
// TITLE GENERATION
// ============================================================================
function generateTitle(filename, department, year, category, grade) {
  const f = filename.replace('.json', '');
  
  if (category === 'GRADE_9') {
    return `Grade 9 ${department} National Exam & Practice ${year}`;
  }
  if (category === 'GRADE_10') {
    return `Grade 10 ${department} National Exam & Practice ${year}`;
  }
  if (category === 'GRADE_11') {
    return `Grade 11 ${department} National Exam & Practice ${year}`;
  }
  if (category === 'GRADE_12') {
    return `Grade 12 ${department} Comprehensive Exam ${year}`;
  }
  
  if (f.toLowerCase().includes('entrance')) {
    if (f.toLowerCase().includes('social')) {
      return `Ethiopian ${department} Social Stream Entrance ${year}`;
    }
    if (f.toLowerCase().includes('natural')) {
      return `Ethiopian ${department} Natural Stream Entrance ${year}`;
    }
    return `Ethiopian ${department} University Entrance Exam ${year}`;
  }
  
  if (f.toLowerCase().includes('model')) {
    const num = f.match(/\d+$/)?.[0] || '';
    return `${department} National Model Exam ${num} ${year}`.trim();
  }
  
  if (f.toLowerCase().includes('english_exam')) {
    const num = f.match(/\d+$/)?.[0] || '';
    return `Ethiopian English University Entrance Practice Test ${num} ${year}`.trim();
  }
  
  return `Ethiopian ${department} National Practice Exam ${year}`;
}

// ============================================================================
// SAFE JSON PARSER (handles all edge cases)
// ============================================================================
function safeParseJson(rawText) {
  if (!rawText || !rawText.trim()) return null;
  
  let text = rawText.trim();
  
  // 1. Remove BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  
  // 2. Strip markdown code fences
  if (text.includes('```')) {
    text = text.replace(/```(?:json)?([\s\S]*?)```/gi, '$1').trim();
  }
  
  // 3. Handle double open braces {{ -> {
  text = text.replace(/\{\s*\{/g, '{');
  
  // 4. Handle concatenated arrays: ][  or ],  [
  if (text.includes('][') || /\]\s*,?\s*\[/.test(text)) {
    const parts = text.split(/\]\s*,?\s*\[/);
    if (parts.length > 1) {
      text = '[' + parts.map((p, i) => {
        let clean = p.trim();
        if (i === 0 && clean.startsWith('[')) clean = clean.slice(1);
        if (i === parts.length - 1 && clean.endsWith(']')) clean = clean.slice(0, -1);
        return clean;
      }).join(',') + ']';
    }
  }
  
  // 5. Remove trailing commas before ] or }
  text = text.replace(/,\s*([\]}])/g, '$1');
  
  // 6. Fix missing commas between } { (across newlines)
  text = text.replace(/\}\s*\n\s*\{/g, '},\n{');
  
  try {
    return JSON.parse(text);
  } catch (e) {
    try {
      if (text.startsWith('{')) {
        return JSON.parse('[' + text + ']');
      }
    } catch (e2) {}
    return null;
  }
}

// ============================================================================
// LETTER PREFIX STRIPPER
// ============================================================================
function stripLetterPrefix(optionText) {
  if (!optionText || typeof optionText !== 'string') return String(optionText || '');
  const match = optionText.match(/^([A-Ea-e])[.):\s]+\s*(.*)/);
  if (match) return match[2].trim() || optionText.trim();
  return optionText.trim();
}

// ============================================================================
// RESOLVE ANSWER INDEX
// ============================================================================
function resolveAnswerIndex(answer, options) {
  if (answer === null || answer === undefined) return 0;
  
  if (typeof answer === 'number') {
    const idx = Math.floor(answer);
    if (idx >= 0 && idx < options.length) return idx;
    return 0;
  }
  
  if (typeof answer === 'string') {
    const clean = answer.trim();
    if (/^[A-Ea-e]$/.test(clean)) {
      return clean.toUpperCase().charCodeAt(0) - 65;
    }
    if (/^\d+$/.test(clean)) {
      const idx = parseInt(clean, 10);
      if (idx >= 0 && idx < options.length) return idx;
      return 0;
    }
    const lowerClean = clean.toLowerCase();
    const idx = options.findIndex(opt =>
      opt.toLowerCase().trim() === lowerClean ||
      stripLetterPrefix(opt).toLowerCase().trim() === lowerClean
    );
    if (idx !== -1) return idx;
    return 0;
  }
  
  return 0;
}

// ============================================================================
// NORMALIZE A SINGLE QUESTION OBJECT
// ============================================================================
function normalizeQuestion(rawQ, index, examId, filename, department) {
  const questionText = rawQ.question || rawQ.questionText || rawQ.prompt || rawQ.text || rawQ.statement || '';
  if (!questionText) return null;
  
  const instruction = rawQ.instruction || '';
  const fullQuestionText = instruction
    ? `${instruction}\n\n${questionText}`
    : questionText;
  
  let rawOptions = rawQ.options || rawQ['options '] || rawQ[' options'] || rawQ.choices || [];
  let options = [];
  
  if (Array.isArray(rawOptions)) {
    options = rawOptions.map(o => typeof o === 'string' ? stripLetterPrefix(o) : String(o));
  } else if (rawOptions && typeof rawOptions === 'object') {
    const keys = Object.keys(rawOptions).sort();
    options = keys.map(k => String(rawOptions[k]));
  }
  
  let questionType = 'single_choice';
  if (options.length === 2) {
    const lowerOpts = options.map(o => o.toLowerCase().trim());
    if (lowerOpts.includes('true') && lowerOpts.includes('false')) {
      questionType = 'true_false';
    }
  }
  
  if (options.length < 2) return null;
  
  const rawAnswer = rawQ.answer ?? rawQ.correctAnswerIndex ?? rawQ.correct_answer ?? rawQ.correctAnswer ?? 0;
  const correctAnswerIndex = resolveAnswerIndex(rawAnswer, options);
  const explanation = rawQ.explanation || rawQ.solution || rawQ.rationale || rawQ.alternative_explanation || 'Step-by-step conceptual review for this question.';
  
  let imageUrl = rawQ.image || rawQ.imageUrl || rawQ.diagramUrl || rawQ.diagram || null;
  const passage = rawQ.passage || rawQ.passage_reference || rawQ.context || rawQ.scenario || undefined;
  let topic = rawQ.topic || rawQ.subject || department;
  
  return {
    id: `q_${examId}_${index + 1}`,
    examId: examId,
    number: index + 1,
    questionType: questionType,
    questionText: fullQuestionText,
    ...(passage ? { passage } : {}),
    ...(imageUrl ? { imageUrl, diagramUrl: imageUrl } : {}),
    ...(rawQ.imageCaption ? { imageCaption: rawQ.imageCaption } : {}),
    ...(rawQ.graphData ? { graphData: rawQ.graphData } : {}),
    ...(rawQ.codeBlock || rawQ.code ? { codeBlock: rawQ.codeBlock || rawQ.code } : {}),
    options: options,
    correctAnswerIndex: correctAnswerIndex,
    explanation: explanation,
    topic: topic
  };
}

// ============================================================================
// CONVERT A SINGLE SOURCE FILE
// ============================================================================
function convertFile(filePath) {
  const filename = path.basename(filePath);
  const rawText = fs.readFileSync(filePath, 'utf-8');
  
  if (!rawText.trim()) {
    return { skipped: true, reason: 'Empty file', filename };
  }
  
  const parsed = safeParseJson(rawText);
  if (!parsed) {
    return { skipped: true, reason: 'JSON parse failed', filename };
  }
  
  let rawQuestions = [];
  if (Array.isArray(parsed)) {
    rawQuestions = parsed;
  } else if (parsed.questions && Array.isArray(parsed.questions)) {
    rawQuestions = parsed.questions;
  } else if (typeof parsed === 'object') {
    rawQuestions = [parsed];
  }
  
  if (rawQuestions.length > 0 && rawQuestions[0].type === 'note') {
    return { skipped: true, reason: 'Study notes file', filename };
  }
  
  if (rawQuestions.length === 0) {
    return { skipped: true, reason: 'Empty question array', filename };
  }
  
  const department = detectDepartment(filename);
  const category = detectCategory(filename);
  const year = detectYear(filename);
  const grade = detectGrade(filename, category);
  
  const examId = filename.replace('.json', '').replace(/\s+/g, '_').toLowerCase() + '_melmeja';
  const title = generateTitle(filename, department, year, category, grade);
  
  const questions = [];
  rawQuestions.forEach((rawQ, idx) => {
    const normalized = normalizeQuestion(rawQ, idx, examId, filename, department);
    if (normalized) {
      questions.push(normalized);
    }
  });
  
  if (questions.length === 0) {
    return { skipped: true, reason: 'No valid questions after normalization', filename };
  }
  
  return {
    skipped: false,
    exam: {
      id: examId,
      title: title,
      category: category,
      subCategory: department,
      department: department,
      grade: grade || undefined,
      description: `${title} featuring ${questions.length} authentic questions with step-by-step solutions. Designed for Ethiopian national exam mastery.`,
      durationMinutes: Math.max(20, Math.round(questions.length * 1.5)),
      totalQuestions: questions.length,
      passMarkPercent: 60,
      isFree: false,
      packageRequired: 'ALL_IN_ONE',
      difficulty: 'Standard National',
      tags: [department, category, year, ...(grade ? [grade] : []), 'Ethiopian National Exam'],
      yearOrSession: year,
      questions: questions
    },
    filename
  };
}

// ============================================================================
// GROUPING STRATEGY
// ============================================================================
function getGroupKey(filename) {
  const f = filename.replace('.json', '');
  
  // Standalone entrance exams (keep intact)
  if (f.toLowerCase().match(/^sat\d{4}entrance/)) return null;
  if (f.toLowerCase().match(/^physics\d{4}entrance/)) return null;
  if (f.toLowerCase().match(/^physics\d{4}_entrance/)) return null;
  if (f.toLowerCase().match(/^maths\d{4}_entrance/)) return null;
  if (f.toLowerCase().match(/^english\d{4}entrance/)) return null;
  if (f.toLowerCase().match(/^geography\d{4}entrance/)) return null;
  if (f.toLowerCase().match(/^civics\d{4}entrance/)) return null;
  if (f.toLowerCase().match(/^economics\d{4}entrance/)) return null;
  if (f.toLowerCase().match(/^history/i)) return null;
  if (f.toLowerCase().match(/^aptitude\d{4}social\./)) return null;
  if (f.toLowerCase().match(/^aptitude\d{4}_social\.json/)) return null;
  if (f.toLowerCase().match(/model/i)) return null;
  if (f.toLowerCase().match(/^physics\s/)) return null;

  // Chapter files: SAT2014_NATC1 -> SAT2014_NAT
  const chapterMatch = f.match(/^(.+?)C(\d+)$/i);
  if (chapterMatch) return chapterMatch[1];
  
  // Grade unit round files: P2018_G12U1_R1 -> P2018_G12
  const gradeUnitMatch = f.match(/^(.+?_G\d+)U\d+/i);
  if (gradeUnitMatch) return gradeUnitMatch[1];
  
  // Grade chapter files: g12biologychapter2 -> g12biology  
  const gradeChapterMatch = f.match(/^(g\d+\w+?)chapter\d+/i);
  if (gradeChapterMatch) return gradeChapterMatch[1];
  
  return null;
}

// ============================================================================
// MAIN CONVERSION PIPELINE
// ============================================================================
function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       MELMEJA MULTI-TIER EXAM CONVERTER & PUBLISHER         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log();
  
  // Create directories
  [OUTPUT_DIR, PUBLIC_EXAMS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Prepared directory: ${dir}`);
    }
  });
  
  // Scan source
  const allJsonFiles = [];
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'dexopt') scanDir(fullPath);
      } else if (entry.name.endsWith('.json')) {
        allJsonFiles.push(fullPath);
      }
    }
  }
  scanDir(SOURCE_DIR);
  
  console.log(`📁 Source JSON files: ${allJsonFiles.length}`);
  console.log();
  
  // PHASE 1: Parse & Convert
  const results = [];
  const skipped = [];
  const errors = [];
  
  for (const filePath of allJsonFiles) {
    const filename = path.basename(filePath);
    if (filename.includes('_NOTE') || filename.startsWith('ENG_')) {
      skipped.push({ filename, reason: 'Study notes file' });
      continue;
    }
    try {
      const result = convertFile(filePath);
      if (result.skipped) {
        skipped.push({ filename: result.filename, reason: result.reason });
      } else {
        results.push(result);
      }
    } catch (err) {
      errors.push({ filename, error: err.message });
    }
  }
  
  console.log(`✅ Successfully converted: ${results.length} files`);
  console.log(`⏭️  Skipped: ${skipped.length} files`);
  console.log(`❌ Parse errors: ${errors.length} files`);
  console.log();
  
  // PHASE 2: Grouping
  const groups = {};
  const standalone = [];
  
  for (const result of results) {
    const groupKey = getGroupKey(result.filename);
    if (groupKey) {
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(result);
    } else {
      standalone.push(result);
    }
  }
  
  // PHASE 3: Merge grouped
  const mergedExams = [];
  for (const [groupKey, groupResults] of Object.entries(groups)) {
    groupResults.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));
    const baseExam = groupResults[0].exam;
    const allQuestions = [];
    for (const gr of groupResults) {
      allQuestions.push(...gr.exam.questions);
    }
    allQuestions.forEach((q, idx) => {
      q.number = idx + 1;
      q.id = `q_${baseExam.id}_${idx + 1}`;
      q.examId = baseExam.id;
    });
    
    const mergedId = groupKey.toLowerCase().replace(/\s+/g, '_') + '_merged_melmeja';
    const mergedExam = {
      ...baseExam,
      id: mergedId,
      title: baseExam.title.replace(/\s*\(.*?\)/g, '') + ` (${groupResults.length} Chapters Combined)`,
      description: `Comprehensive examination bank combining ${groupResults.length} chapters (${allQuestions.length} questions). Official Ethiopian national curriculum.`,
      totalQuestions: allQuestions.length,
      durationMinutes: Math.max(30, Math.round(allQuestions.length * 1.5)),
      questions: allQuestions
    };
    mergedExam.questions.forEach(q => { q.examId = mergedId; });
    mergedExams.push({ exam: mergedExam, sourceFiles: groupResults.map(r => r.filename) });
  }
  
  // Combine all final exams
  const finalExams = [
    ...standalone.map(r => r.exam),
    ...mergedExams.map(m => m.exam)
  ];
  
  // PHASE 4: Write full exam files to Exam/Converted AND public/exams/
  let writtenExamsCount = 0;
  let writtenQuestionsCount = 0;
  
  for (const exam of finalExams) {
    const jsonStr = JSON.stringify(exam, null, 2);
    // 1. Output to Exam/Converted
    fs.writeFileSync(path.join(OUTPUT_DIR, `${exam.id}.json`), jsonStr, 'utf-8');
    // 2. Output to public/exams/ for client on-demand fetch
    fs.writeFileSync(path.join(PUBLIC_EXAMS_DIR, `${exam.id}.json`), jsonStr, 'utf-8');
    
    writtenExamsCount++;
    writtenQuestionsCount += exam.questions.length;
  }
  
  // PHASE 5: Write _ALL_EXAMS_BUNDLE.json
  const bundlePath = path.join(OUTPUT_DIR, '_ALL_EXAMS_BUNDLE.json');
  fs.writeFileSync(bundlePath, JSON.stringify(finalExams, null, 2), 'utf-8');
  
  // PHASE 6: Write lightweight catalog metadata file for the React app
  // Each entry has full metadata, but questions: [] to keep initial bundle tiny (~60KB)
  const metadataList = finalExams.map(e => ({
    id: e.id,
    title: e.title,
    category: e.category,
    subCategory: e.subCategory,
    department: e.department,
    grade: e.grade,
    description: e.description,
    durationMinutes: e.durationMinutes,
    totalQuestions: e.totalQuestions,
    passMarkPercent: e.passMarkPercent,
    isFree: e.isFree,
    packageRequired: e.packageRequired,
    difficulty: e.difficulty,
    tags: e.tags,
    yearOrSession: e.yearOrSession,
    questions: []
  }));
  
  const tsContent = `// Auto-generated by Melmeja Exam Converter
// Do not edit manually - run node Exam/convert_all.cjs to update
import { Exam } from '../types';

export const CONVERTED_EXAMS_METADATA: Exam[] = ${JSON.stringify(metadataList, null, 2)};
`;
  fs.writeFileSync(METADATA_OUTPUT_PATH, tsContent, 'utf-8');
  console.log(`✅ Written metadata catalog index: ${METADATA_OUTPUT_PATH}`);
  
  // PHASE 7: Category & Department Breakdown Report
  const catBreakdown = {};
  const deptBreakdown = {};
  const yearBreakdown = {};
  
  finalExams.forEach(e => {
    catBreakdown[e.category] = (catBreakdown[e.category] || 0) + 1;
    deptBreakdown[e.department || 'Other'] = (deptBreakdown[e.department || 'Other'] || 0) + 1;
    yearBreakdown[e.yearOrSession || 'Unknown'] = (yearBreakdown[e.yearOrSession || 'Unknown'] || 0) + 1;
  });
  
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalExams: writtenExamsCount,
      totalQuestions: writtenQuestionsCount,
      categories: catBreakdown,
      departments: deptBreakdown,
      years: yearBreakdown
    }
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, '_CONVERSION_REPORT.json'), JSON.stringify(report, null, 2), 'utf-8');
  
  console.log();
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     DEPLOYMENT SUMMARY                       ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Exams Created:       ${String(writtenExamsCount).padStart(6)}                         ║`);
  console.log(`║  Total Questions Ingested:  ${String(writtenQuestionsCount).padStart(6)}                         ║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  CATEGORIES:                                                 ║');
  Object.entries(catBreakdown).forEach(([k, v]) => {
    console.log(`║    - ${k.padEnd(16)}: ${String(v).padStart(4)} exams                       ║`);
  });
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  DEPARTMENTS:                                                ║');
  Object.entries(deptBreakdown).forEach(([k, v]) => {
    console.log(`║    - ${k.padEnd(16)}: ${String(v).padStart(4)} exams                       ║`);
  });
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  YEARS:                                                      ║');
  Object.entries(yearBreakdown).forEach(([k, v]) => {
    console.log(`║    - ${k.padEnd(16)}: ${String(v).padStart(4)} exams                       ║`);
  });
  console.log('╚══════════════════════════════════════════════════════════════╝');
}

main();
