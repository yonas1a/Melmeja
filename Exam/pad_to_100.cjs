#!/usr/bin/env node
/**
 * ============================================================================
 * Melmeja Exam Padder — Ensure All Exams Have Exactly 100 Questions
 * ============================================================================
 * 
 * For each *_melmeja.json exam in Exam/Converted:
 *   1. If < 100 questions → pad with questions from other exams of the
 *      SAME department (and same grade level if possible)
 *   2. If > 100 questions → trim to 100
 *   3. Set passMarkPercent = 50
 *   4. Update totalQuestions, durationMinutes, description
 *
 * Writes updated files to:
 *   - Exam/Converted/
 *   - public/exams/
 *   - src/data/convertedExamsMetadata.ts
 *
 * Usage: node Exam/pad_to_100.cjs
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const CONVERTED_DIR = path.join(__dirname, 'Converted');
const PUBLIC_EXAMS_DIR = path.join(ROOT_DIR, 'public', 'exams');
const METADATA_OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'data', 'convertedExamsMetadata.ts');

const TARGET_QUESTIONS = 100;
const PASS_MARK = 50;

// ============================================================================
// PHASE 1: Load all _melmeja.json exams & build a question pool per department
// ============================================================================
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║           MELMEJA EXAM PADDER — PAD TO 100 QUESTIONS       ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log();

const melmejaFiles = fs.readdirSync(CONVERTED_DIR)
  .filter(f => f.endsWith('_melmeja.json'));

console.log(`📁 Found ${melmejaFiles.length} _melmeja.json exam files`);

// Load all exams
const allExams = [];
for (const f of melmejaFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(CONVERTED_DIR, f), 'utf-8'));
    allExams.push({ file: f, exam: data });
  } catch (err) {
    console.log(`  ⚠️ Could not parse ${f}: ${err.message}`);
  }
}

// Build question pool per department (and optionally per grade)
const deptPool = {};      // department → question[]
const deptGradePool = {}; // department:grade → question[]

for (const { exam } of allExams) {
  const dept = exam.department || exam.subCategory || 'General';
  const grade = exam.grade || 'Unknown';
  const key = `${dept}:${grade}`;

  if (!deptPool[dept]) deptPool[dept] = [];
  if (!deptGradePool[key]) deptGradePool[key] = [];

  for (const q of (exam.questions || [])) {
    deptPool[dept].push(q);
    deptGradePool[key].push(q);
  }
}

console.log();
console.log('📊 Question pools by department:');
for (const [dept, qs] of Object.entries(deptPool)) {
  console.log(`   ${dept}: ${qs.length} questions`);
}
console.log();

// ============================================================================
// PHASE 2: Pad / Trim each exam to exactly 100 questions
// ============================================================================
let padded = 0;
let trimmed = 0;
let unchanged = 0;

/**
 * Deep-clone a question and assign new IDs for the target exam
 */
function cloneQuestion(sourceQ, newExamId, newNumber) {
  return {
    ...JSON.parse(JSON.stringify(sourceQ)),
    id: `q_${newExamId}_${newNumber}`,
    examId: newExamId,
    number: newNumber,
  };
}

/**
 * Pick `count` questions from the pool that are NOT already in `existingTexts`.
 * Falls back to pool questions that may already exist if not enough unique ones.
 */
function pickFromPool(pool, count, existingTexts) {
  const unique = [];
  const fallback = [];

  // Shuffle pool to get variety
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  for (const q of shuffled) {
    const text = (q.questionText || '').trim().toLowerCase();
    if (!existingTexts.has(text)) {
      unique.push(q);
      existingTexts.add(text); // prevent dups within this pick batch
      if (unique.length >= count) break;
    } else {
      fallback.push(q);
    }
  }

  // If not enough unique, add from fallback (with slight variation marker)
  while (unique.length < count && fallback.length > 0) {
    const fb = fallback.shift();
    unique.push(fb);
  }

  // If still not enough (very small pool), repeat-cycle from pool
  let cycleIdx = 0;
  while (unique.length < count && pool.length > 0) {
    unique.push(pool[cycleIdx % pool.length]);
    cycleIdx++;
  }

  return unique.slice(0, count);
}

for (const entry of allExams) {
  const { exam } = entry;
  const examId = exam.id;
  const currentCount = exam.questions.length;
  const dept = exam.department || exam.subCategory || 'General';
  const grade = exam.grade || 'Unknown';

  // Always set pass mark to 50
  exam.passMarkPercent = PASS_MARK;

  if (currentCount === TARGET_QUESTIONS) {
    unchanged++;
  } else if (currentCount > TARGET_QUESTIONS) {
    // Trim to 100
    exam.questions = exam.questions.slice(0, TARGET_QUESTIONS);
    exam.questions.forEach((q, idx) => {
      q.number = idx + 1;
      q.id = `q_${examId}_${idx + 1}`;
    });
    trimmed++;
    console.log(`  ✂️  ${entry.file}: ${currentCount} → 100 (trimmed)`);
  } else {
    // Pad to 100
    const needed = TARGET_QUESTIONS - currentCount;
    const existingTexts = new Set(exam.questions.map(q => (q.questionText || '').trim().toLowerCase()));

    // Try grade-specific pool first, then department pool
    const gradeKey = `${dept}:${grade}`;
    let pool = deptGradePool[gradeKey] || [];
    if (pool.length < needed) {
      pool = deptPool[dept] || [];
    }

    if (pool.length === 0) {
      console.log(`  ⚠️ ${entry.file}: No pool questions for ${dept}. Cannot pad.`);
      continue;
    }

    const additions = pickFromPool(pool, needed, existingTexts);
    for (let i = 0; i < additions.length; i++) {
      const newNum = currentCount + i + 1;
      const cloned = cloneQuestion(additions[i], examId, newNum);
      exam.questions.push(cloned);
    }

    padded++;
    console.log(`  ➕ ${entry.file}: ${currentCount} → ${exam.questions.length} (padded +${needed})`);
  }

  // Update metadata fields
  exam.totalQuestions = exam.questions.length;
  exam.durationMinutes = Math.max(20, Math.round(exam.questions.length * 1.5));
  // Update description to reflect new count
  exam.description = exam.description
    .replace(/featuring \d+ authentic/, `featuring ${exam.totalQuestions} authentic`)
    .replace(/\d+ questions\)/, `${exam.totalQuestions} questions)`);
}

console.log();
console.log(`✅ Padded:    ${padded} exams`);
console.log(`✂️  Trimmed:   ${trimmed} exams`);
console.log(`🟰 Unchanged: ${unchanged} exams`);
console.log();

// ============================================================================
// PHASE 3: Write updated files
// ============================================================================

// Ensure output dirs exist
[CONVERTED_DIR, PUBLIC_EXAMS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

let writtenCount = 0;
const finalExams = allExams.map(e => e.exam);

for (const exam of finalExams) {
  const jsonStr = JSON.stringify(exam, null, 2);
  // Write to Exam/Converted
  fs.writeFileSync(path.join(CONVERTED_DIR, `${exam.id}.json`), jsonStr, 'utf-8');
  // Write to public/exams
  fs.writeFileSync(path.join(PUBLIC_EXAMS_DIR, `${exam.id}.json`), jsonStr, 'utf-8');
  writtenCount++;
}

// Write bundle
const bundlePath = path.join(CONVERTED_DIR, '_ALL_EXAMS_BUNDLE.json');
fs.writeFileSync(bundlePath, JSON.stringify(finalExams, null, 2), 'utf-8');

// ============================================================================
// PHASE 4: Regenerate metadata catalog (convertedExamsMetadata.ts)
// ============================================================================
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

console.log(`✅ Written ${writtenCount} exam files to Converted/ and public/exams/`);
console.log(`✅ Regenerated metadata: ${METADATA_OUTPUT_PATH}`);
console.log();

// ============================================================================
// PHASE 5: Verification Report
// ============================================================================
let allAt100 = 0;
let notAt100 = [];
for (const exam of finalExams) {
  if (exam.questions.length === 100 && exam.totalQuestions === 100) {
    allAt100++;
  } else {
    notAt100.push({ id: exam.id, count: exam.questions.length });
  }
}

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║                   VERIFICATION REPORT                       ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log(`║  Exams at exactly 100 questions:  ${String(allAt100).padStart(4)}                      ║`);
console.log(`║  Exams NOT at 100 questions:      ${String(notAt100.length).padStart(4)}                      ║`);
console.log(`║  Pass mark set to:                  ${PASS_MARK}%                     ║`);
console.log('╚══════════════════════════════════════════════════════════════╝');

if (notAt100.length > 0) {
  console.log();
  console.log('⚠️  Still not at 100:');
  notAt100.forEach(e => console.log(`   - ${e.id}: ${e.count} questions`));
}
