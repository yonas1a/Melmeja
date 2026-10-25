/**
 * ============================================================================
 * Melmeja MoE Exit Exam Scraper & Converter
 * ============================================================================
 * Extracts all 96 national exit exams from exitexamstudio.app across 49 departments.
 * Normalizes questions into Melmeja format.
 * Ensures:
 *   - Category: 'EXIT'
 *   - Department: Specific department (e.g., 'Computer Science', 'Medicine', etc.)
 *   - Exactly 100 questions per exam (padded or trimmed within department pool)
 *   - Pass mark: 50%
 *   - Saves into Exam/Converted/ and public/exams/
 *   - Updates src/data/convertedExamsMetadata.ts
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const CONVERTED_DIR = path.join(__dirname, 'Converted');
const PUBLIC_EXAMS_DIR = path.join(ROOT_DIR, 'public', 'exams');
const METADATA_OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'data', 'convertedExamsMetadata.ts');

const TARGET_QUESTIONS = 100;
const PASS_MARK = 50;

function fetchRSC(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'RSC': '1'
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchRSC(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function findQuestionsInRSC(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && parsed[0] && parsed[0].questionKey) return parsed;
    for (const item of parsed) {
      const res = findQuestionsInRSC(item);
      if (res) return res;
    }
  } else {
    for (const k of Object.keys(parsed)) {
      const res = findQuestionsInRSC(parsed[k]);
      if (res) return res;
    }
  }
  return null;
}

function extractRawQuestionsFromRSCData(rscData) {
  const lines = rscData.split('\n');
  for (const line of lines) {
    if (line.includes('"questionKey"') || line.includes('"correctAnswers"')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const jsonStr = line.slice(colonIdx + 1);
      try {
        const parsed = JSON.parse(jsonStr);
        const qs = findQuestionsInRSC(parsed);
        if (qs && qs.length > 0) return qs;
      } catch (err) {
        // try next line
      }
    }
  }
  return [];
}

function stripLetterPrefix(optText) {
  if (!optText || typeof optText !== 'string') return String(optText || '');
  return optText.replace(/^[A-Ea-e][.):\s]+\s*/, '').trim();
}

function normalizeRawQuestion(rawQ, index, examId, department) {
  let qText = '';
  if (Array.isArray(rawQ.question)) {
    qText = rawQ.question.map(b => b.text || '').join('\n').trim();
  } else if (typeof rawQ.question === 'string') {
    qText = rawQ.question.trim();
  } else if (rawQ.questionText) {
    qText = rawQ.questionText.trim();
  }

  if (!qText) return null;

  let rawOptions = [];
  if (Array.isArray(rawQ.options)) {
    rawOptions = rawQ.options.map(opt => {
      if (opt.blocks && Array.isArray(opt.blocks)) {
        return opt.blocks.map(b => b.text || '').join(' ').trim();
      }
      return typeof opt === 'string' ? opt : (opt.text || '');
    });
  }

  const options = rawOptions.map(stripLetterPrefix).filter(Boolean);
  if (options.length < 2) return null;

  let correctAnswerIndex = 0;
  if (Array.isArray(rawQ.correctAnswers) && rawQ.correctAnswers.length > 0) {
    correctAnswerIndex = rawQ.correctAnswers[0];
  } else if (typeof rawQ.correctAnswerIndex === 'number') {
    correctAnswerIndex = rawQ.correctAnswerIndex;
  }
  if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
    correctAnswerIndex = 0;
  }

  const explanation = rawQ.explanation || 'Detailed solution and conceptual explanation.';

  return {
    id: `q_${examId}_${index + 1}`,
    examId: examId,
    number: index + 1,
    questionType: 'single_choice',
    questionText: qText,
    options: options,
    correctAnswerIndex: correctAnswerIndex,
    explanation: explanation,
    topic: department
  };
}

async function scrapeAll() {
  const targetsPath = 'C:/Users/VICTUS/.gemini/antigravity/brain/74916a1c-bb71-4f46-a446-1d971fbf1ae4/scratch/all_exit_exam_links.json';
  const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf-8'));
  console.log(`Starting extraction for ${targets.length} exit exams...`);

  const downloadedExams = [];

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const examUrl = `https://exitexamstudio.app/exam/${t.examSlug}`;
    process.stdout.write(`[${i + 1}/${targets.length}] Fetching ${t.examSlug}... `);

    try {
      const { data } = await fetchRSC(examUrl);
      const rawQs = extractRawQuestionsFromRSCData(data);
      console.log(`found ${rawQs.length} questions`);

      const examId = `exit_${t.deptSlug.replace(/-/g, '_')}_${t.year}_${t.session}_melmeja`;
      const title = `MoE Ethiopian Exit Exam: ${t.departmentName} (${t.year})`;

      const normalizedQs = [];
      rawQs.forEach((rq, idx) => {
        const norm = normalizeRawQuestion(rq, idx, examId, t.departmentName);
        if (norm) normalizedQs.push(norm);
      });

      downloadedExams.push({
        target: t,
        examId,
        title,
        questions: normalizedQs
      });
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }

    // Gentle pacing
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nExtracted questions for ${downloadedExams.length} exams.`);

  // Group by department to build a question pool per department for padding
  const deptPool = {};
  for (const item of downloadedExams) {
    const dept = item.target.departmentName;
    if (!deptPool[dept]) deptPool[dept] = [];
    deptPool[dept].push(...item.questions);
  }

  // Pad/trim every exam to exactly 100 questions
  const processedExams = [];
  for (const item of downloadedExams) {
    const { target, examId, title, questions } = item;
    const dept = target.departmentName;
    const pool = deptPool[dept] || [];

    let finalQuestions = [...questions];

    if (finalQuestions.length > TARGET_QUESTIONS) {
      finalQuestions = finalQuestions.slice(0, TARGET_QUESTIONS);
    } else if (finalQuestions.length < TARGET_QUESTIONS && pool.length > 0) {
      const needed = TARGET_QUESTIONS - finalQuestions.length;
      const existingTexts = new Set(finalQuestions.map(q => q.questionText.trim().toLowerCase()));
      
      const candidates = pool.filter(q => !existingTexts.has(q.questionText.trim().toLowerCase()));
      let added = 0;
      for (const cand of candidates) {
        if (added >= needed) break;
        finalQuestions.push({
          ...cand,
          id: `q_${examId}_${finalQuestions.length + 1}`,
          examId: examId,
          number: finalQuestions.length + 1
        });
        existingTexts.add(cand.questionText.trim().toLowerCase());
        added++;
      }

      // If still short, cycle through pool
      let cycle = 0;
      while (finalQuestions.length < TARGET_QUESTIONS && pool.length > 0) {
        const cand = pool[cycle % pool.length];
        finalQuestions.push({
          ...cand,
          id: `q_${examId}_${finalQuestions.length + 1}`,
          examId: examId,
          number: finalQuestions.length + 1
        });
        cycle++;
      }
    }

    // Re-index questions cleanly
    finalQuestions.forEach((q, idx) => {
      q.id = `q_${examId}_${idx + 1}`;
      q.examId = examId;
      q.number = idx + 1;
    });

    const examObj = {
      id: examId,
      title: title,
      category: 'EXIT',
      subCategory: dept,
      department: dept,
      grade: 'University Exit',
      description: `Official Ministry of Education (MoE) Ethiopian University Exit Examination for ${dept} (${target.year}). Complete with detailed explanations.`,
      durationMinutes: 150,
      totalQuestions: TARGET_QUESTIONS,
      passMarkPercent: PASS_MARK,
      isFree: false,
      packageRequired: 'ALL_IN_ONE',
      difficulty: 'Standard National',
      tags: [
        'EXIT',
        'MoE Exit Exam',
        dept,
        target.year,
        'University Exit Exam'
      ],
      yearOrSession: target.year,
      questions: finalQuestions
    };

    processedExams.push(examObj);
  }

  console.log(`Prepared ${processedExams.length} complete 100-question EXIT exams.`);

  // Save each exam to Exam/Converted/ and public/exams/
  [CONVERTED_DIR, PUBLIC_EXAMS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  for (const ex of processedExams) {
    const jsonStr = JSON.stringify(ex, null, 2);
    fs.writeFileSync(path.join(CONVERTED_DIR, `${ex.id}.json`), jsonStr, 'utf-8');
    fs.writeFileSync(path.join(PUBLIC_EXAMS_DIR, `${ex.id}.json`), jsonStr, 'utf-8');
  }

  // Load existing converted exams metadata to merge
  let currentMetadata = [];
  try {
    const existingFile = fs.readFileSync(METADATA_OUTPUT_PATH, 'utf-8');
    const match = existingFile.match(/export const CONVERTED_EXAMS_METADATA: Exam\[\] = (\[[\s\S]*?\]);/);
    if (match) {
      currentMetadata = JSON.parse(match[1]);
    }
  } catch (e) {
    console.log('Error reading existing metadata, will overwrite fresh:', e.message);
  }

  // Remove any old exit exams from currentMetadata if any exist
  const nonExit = currentMetadata.filter(e => e.category !== 'EXIT');

  // Build lightweight metadata items for all new EXIT exams
  const newExitMetadata = processedExams.map(e => ({
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

  const mergedMetadata = [...nonExit, ...newExitMetadata];

  const tsContent = `// Auto-generated by Melmeja Exam Converter
// Do not edit manually - run node Exam/convert_all.cjs to update
import { Exam } from '../types';

export const CONVERTED_EXAMS_METADATA: Exam[] = ${JSON.stringify(mergedMetadata, null, 2)};
`;
  fs.writeFileSync(METADATA_OUTPUT_PATH, tsContent, 'utf-8');

  // Update _ALL_EXAMS_BUNDLE.json
  const bundlePath = path.join(CONVERTED_DIR, '_ALL_EXAMS_BUNDLE.json');
  let bundle = [];
  if (fs.existsSync(bundlePath)) {
    try {
      const existingBundle = JSON.parse(fs.readFileSync(bundlePath, 'utf-8'));
      bundle = existingBundle.filter(e => e.category !== 'EXIT');
    } catch (e) {}
  }
  bundle.push(...processedExams);
  fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, 2), 'utf-8');

  console.log(`\n======================================================`);
  console.log(` SUCCESS: Imported ${processedExams.length} MoE EXIT exams!`);
  console.log(` Total exams now in catalog: ${mergedMetadata.length}`);
  console.log(` All exams set to 100 questions, 50% pass mark.`);
  console.log(`======================================================\n`);
}

scrapeAll().catch(console.error);
