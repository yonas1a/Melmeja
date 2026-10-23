import { Exam, ExamPackage } from '../types';
import { HAWASSA_GAT_QUANT_EXAM } from './hawassaGatData';
import { CONVERTED_EXAMS_METADATA } from './convertedExamsMetadata';

export const getCategoryPackageId = (category: ExamCategory | string): string => {
  switch (category) {
    case 'GRADE_9':
      return 'GRADE_9_ALL';
    case 'GRADE_10':
      return 'GRADE_10_ALL';
    case 'GRADE_11':
      return 'GRADE_11_ALL';
    case 'GRADE_12':
    case 'ENTRANCE':
      return 'GRADE_12_ALL';
    case 'GAT':
      return 'GAT_ALL';
    case 'NGAT':
      return 'NGAT_ALL';
    case 'EXIT':
      return 'EXIT_ALL';
    default:
      return 'ALL_IN_ONE';
  }
};

export const EXAM_PACKAGES: ExamPackage[] = [
  {
    id: 'GRADE_9_ALL',
    name: 'Grade 9 All-Inclusive Category Pass',
    category: 'GRADE_9',
    priceETB: 300,
    originalPriceETB: 450,
    badge: 'Secondary Foundation',
    description: 'Single payment unlocks ALL Grade 9 national practice exams, past papers, and chapter question banks across all subjects.',
    features: [
      'Unlocks ALL Grade 9 exams & subject question banks',
      'Mathematics, Physics, Chemistry, Biology, English & Social Sciences',
      'Step-by-step solutions and formula breakdowns',
      'Unlimited retakes & performance tracking'
    ],
    includedExamIds: []
  },
  {
    id: 'GRADE_10_ALL',
    name: 'Grade 10 National Matrix Category Pass',
    category: 'GRADE_10',
    priceETB: 300,
    originalPriceETB: 450,
    badge: 'National Examination Prep',
    description: 'Single payment unlocks ALL Grade 10 national examination papers and merged chapter banks with full step-by-step solutions.',
    features: [
      'Unlocks ALL Grade 10 exams & subject question banks',
      'Comprehensive coverage of all secondary curriculum topics',
      'Authentic past national examination papers with explanations',
      'Instant grading and performance analytics'
    ],
    includedExamIds: []
  },
  {
    id: 'GRADE_11_ALL',
    name: 'Grade 11 Preparatory Category Pass',
    category: 'GRADE_11',
    priceETB: 300,
    originalPriceETB: 450,
    badge: 'Preparatory Excellence',
    description: 'Single payment unlocks ALL Grade 11 preparatory materials and model exams for Natural & Social Science streams.',
    features: [
      'Unlocks ALL Grade 11 exams & subject question banks',
      'Rigorous Natural and Social stream problem sets',
      'Advanced derivation and concept mastery questions',
      'Full test simulation mode with timed assessments'
    ],
    includedExamIds: []
  },
  {
    id: 'GRADE_12_ALL',
    name: 'Grade 12 & EUEE Entrance Category Pass',
    category: 'GRADE_12',
    priceETB: 300,
    originalPriceETB: 500,
    badge: 'High School & University Entrance',
    popular: true,
    description: 'Single payment unlocks ALL Grade 12 past papers, preparatory models, and EUEE National University Entrance examinations.',
    features: [
      'Unlocks ALL Grade 12 & EUEE University Entrance exams',
      'Natural & Social Science national entrance past papers',
      'Calculus, Vectors, Dynamics, Electrostatics, and English Aptitude',
      'Timed national simulation mode with detailed explanations'
    ],
    includedExamIds: ['euee_nat_sci_2026', 'euee_eng_apt_2026']
  },
  {
    id: 'GAT_ALL',
    name: 'AAU GAT Comprehensive Category Pass',
    category: 'GAT',
    priceETB: 500,
    originalPriceETB: 750,
    badge: 'Addis Ababa University Standard',
    popular: true,
    description: 'Single payment unlocks ALL Addis Ababa University Graduate Admission Test (GAT) mock exams, quantitative comparison banks, and verbal reasoning tests.',
    features: [
      'Unlocks ALL GAT exams in the category (no separate exam fees)',
      'Authentic AAU GAT simulated timed tests',
      'High-yield Quantitative shortcuts & logic puzzles',
      'Full Hawassa University Quantitative & Comparison Bank included'
    ],
    includedExamIds: ['hawassa_gat_quant_reasoning_2024', 'gat_mock_01', 'gat_analytical_02']
  },
  {
    id: 'NGAT_ALL',
    name: 'NGAT Master All-Access Category Pass',
    category: 'NGAT',
    priceETB: 500,
    originalPriceETB: 750,
    badge: 'Best Value for NGAT',
    popular: true,
    description: 'Single payment unlocks ALL National Graduate Admission Test (NGAT) mock exams, advanced quantitative reasoning sets, and verbal reading sections.',
    features: [
      'Unlocks ALL NGAT exams in the category (no separate exam fees)',
      'Full-length NGAT Mock 01 & Mock 02 simulations included',
      'Quantitative & Logical Reasoning Question Bank',
      'Verbal Reasoning with authentic reading passages',
      'Step-by-step mathematical explanations & unlimited retakes'
    ],
    includedExamIds: ['ngat_mock_01', 'ngat_mock_02', 'ngat_verbal_special']
  },
  {
    id: 'EXIT_ALL',
    name: 'MoE University Exit Exam All-Fields Category Pass',
    category: 'EXIT',
    priceETB: 500,
    originalPriceETB: 850,
    badge: 'Ministry of Education Blueprint',
    popular: true,
    description: 'Single payment unlocks ALL Ministry of Education National Exit Exams across ALL academic departments — Computer Science, Law, Medicine, Accounting & more.',
    features: [
      'Unlocks ALL University Exit Exams across ALL academic fields',
      'Computer Science & IT, Law & Jurisprudence, Medicine & Health, Accounting',
      '100% matched with MoE national exit exam blueprints',
      'In-depth rationales citing Ethiopian proclamations & clinical guidelines',
      'Timed full exam simulations with instant scoring'
    ],
    includedExamIds: ['exit_cs_2026', 'exit_se_2026', 'exit_law_2026', 'exit_law_civ_2026', 'exit_med_2026', 'exit_acc_2026']
  },
  {
    id: 'ALL_IN_ONE',
    name: 'All-In-One National VIP Master Pass',
    category: 'ALL_ACCESS',
    priceETB: 1000,
    originalPriceETB: 1800,
    badge: 'ALL CATEGORIES UNLOCKED',
    popular: false,
    description: 'Complete unrestricted master pass to every single exam across all categories: Grade 9, 10, 11, 12 & Entrance, GAT, NGAT, and all MoE Exit Exams.',
    features: [
      'Unlocks every single exam in ALL categories without exception',
      'Grade 9–12, Entrance, NGAT, GAT, and all University Exit fields',
      'Priority Admin Approval via Telebirr',
      'Includes upcoming 2026/2027 national exam additions'
    ],
    includedExamIds: [
      'hawassa_gat_quant_reasoning_2024',
      'ngat_mock_01', 'ngat_mock_02', 'ngat_verbal_special',
      'gat_mock_01', 'gat_analytical_02',
      'exit_cs_2026', 'exit_se_2026',
      'exit_law_2026', 'exit_law_civ_2026',
      'exit_med_2026', 'exit_acc_2026',
      'euee_nat_sci_2026', 'euee_eng_apt_2026'
    ]
  }
];

// Backward-compatible package aliases so legacy records resolve seamlessly
export const LEGACY_PACKAGE_ALIASES: Record<string, string> = {
  'NGAT_MOCK_01': 'NGAT_ALL',
  'NGAT_MOCK_02': 'NGAT_ALL',
  'NGAT_PREM': 'NGAT_ALL',
  'GAT_BASIC': 'GAT_ALL',
  'GAT_PREM': 'GAT_ALL',
  'AAU_GAT': 'GAT_ALL',
  'EXIT_CS': 'EXIT_ALL',
  'EXIT_LAW': 'EXIT_ALL',
  'EXIT_MED': 'EXIT_ALL',
  'EXIT_ACC': 'EXIT_ALL',
  'ENTRANCE_EUEE': 'GRADE_12_ALL',
  'GRADE_9_PACK': 'GRADE_9_ALL',
  'GRADE_10_PACK': 'GRADE_10_ALL',
  'GRADE_11_PACK': 'GRADE_11_ALL',
  'GRADE_12_PACK': 'GRADE_12_ALL'
};

export const INITIAL_EXAMS: Exam[] = [
  // 0. Official Hawassa University GAT Quantitative Reasoning (Tutorial Bank)
  HAWASSA_GAT_QUANT_EXAM,

  // 1. NGAT Mock 01 (Requires NGAT_PREM or ALL_IN_ONE package)
  {
    id: 'ngat_mock_01',
    title: 'NGAT National Mock Exam 01: General Aptitude',
    category: 'NGAT',
    subCategory: 'Quantitative & Analytical Reasoning',
    description: 'Official standard simulation for Ethiopian graduate candidates testing quantitative ability, logical deduction, and verbal interpretation.',
    durationMinutes: 45,
    totalQuestions: 10,
    passMarkPercent: 70,
    isFree: false,
    packageRequired: 'NGAT_ALL',
    difficulty: 'Standard National',
    tags: ['Graduate Admission', 'Quantitative', 'Verbal Logic', 'Official Mock'],
    yearOrSession: '2026 Series',
    questions: [
      {
        id: 'ngat_q1',
        examId: 'ngat_mock_01',
        number: 1,
        questionText: 'A trader in Addis Ababa bought an item for 1,200 ETB and sold it at a profit of 25%. What was the selling price of the item?',
        options: ['1,400 ETB', '1,500 ETB', '1,600 ETB', '1,450 ETB'],
        correctAnswerIndex: 1,
        explanation: 'Profit = 25% of 1,200 ETB = 0.25 * 1,200 = 300 ETB. Selling Price = Cost Price + Profit = 1,200 + 300 = 1,500 ETB.',
        topic: 'Quantitative - Profit and Loss'
      },
      {
        id: 'ngat_q2',
        examId: 'ngat_mock_01',
        number: 2,
        questionText: 'Look at this sequence: 7, 10, 8, 11, 9, 12, ... What number should come next?',
        options: ['7', '10', '12', '13'],
        correctAnswerIndex: 1,
        explanation: 'This is an alternating addition and subtraction series: +3, -2, +3, -2, +3, -2. Next term is 12 - 2 = 10.',
        topic: 'Analytical Reasoning - Number Series'
      },
      {
        id: 'ngat_q3',
        examId: 'ngat_mock_01',
        number: 3,
        questionText: 'Select the pair of words that best expresses a relationship similar to that expressed in the original pair:\n\nCOFFEE : ETHIOPIA',
        options: ['TEA : KENYA', 'SUGAR : DESSERT', 'WATER : RIVER', 'HARVEST : RAIN'],
        correctAnswerIndex: 0,
        explanation: 'Coffee is a world-renowned primary agricultural product/origin of Ethiopia, analogous to Tea being famously associated with Kenya.',
        topic: 'Verbal Reasoning - Analogies'
      },
      {
        id: 'ngat_q4',
        examId: 'ngat_mock_01',
        number: 4,
        questionText: 'If 6 men can complete a road maintenance project in Addis Ababa in 15 days working 8 hours a day, how many days will 10 men take to complete the same work working 6 hours a day?',
        options: ['10 days', '12 days', '14 days', '16 days'],
        correctAnswerIndex: 1,
        explanation: 'Total man-hours = 6 * 15 * 8 = 720 hours. For 10 men working 6 hours/day: Days = 720 / (10 * 6) = 720 / 60 = 12 days.',
        topic: 'Quantitative - Time and Work'
      },
      {
        id: 'ngat_q5',
        examId: 'ngat_mock_01',
        number: 5,
        questionText: 'Statement: "All successful graduates in Ethiopia possess high analytical capability. Abebe possesses high analytical capability."\nConclusion:\nI. Abebe is a successful graduate.\nII. Some people with high analytical capability are graduates.',
        options: [
          'Only conclusion I follows',
          'Only conclusion II follows',
          'Either I or II follows',
          'Neither I nor II follows'
        ],
        correctAnswerIndex: 1,
        explanation: 'All graduates have high analytical ability, but having high analytical ability does not guarantee one is a graduate (affirming the consequent). However, since all graduates have it, some people with high analytical capability are indeed graduates.',
        topic: 'Logical Reasoning - Syllogism'
      },
      {
        id: 'ngat_q6',
        examId: 'ngat_mock_01',
        number: 6,
        questionText: 'Choose the word that is most nearly OPPOSITE in meaning to the word in capital letters:\n\nMETICULOUS',
        options: ['Careful', 'Sloppy', 'Punctual', 'Intelligent'],
        correctAnswerIndex: 1,
        explanation: 'Meticulous means taking or showing extreme care about minute details; precise and thorough. Its opposite is Sloppy or careless.',
        topic: 'Verbal Ability - Antonyms'
      },
      {
        id: 'ngat_q7',
        examId: 'ngat_mock_01',
        number: 7,
        questionText: 'The average age of a group of 5 students is 22 years. If a new student aged 28 joins the group, what is the new average age?',
        options: ['22.5 years', '23 years', '23.5 years', '24 years'],
        correctAnswerIndex: 1,
        explanation: 'Initial total age = 5 * 22 = 110. New total age = 110 + 28 = 138. New average = 138 / 6 = 23 years.',
        topic: 'Quantitative - Averages'
      },
      {
        id: 'ngat_q8',
        examId: 'ngat_mock_01',
        number: 8,
        questionText: 'In a coding scheme, ETHIOPIA is coded as FUIJHQJB. How would AFRICA be coded in the same scheme?',
        options: ['BGSDJB', 'BGSEDB', 'BGSJDB', 'BHSDJB'],
        correctAnswerIndex: 0,
        explanation: 'Each letter is shifted forward by +1 in the alphabet: E->F, T->U, H->I, I->J, O->P, P->Q, I->J, A->B. For AFRICA: A->B, F->G, R->S, I->J, C->D, A->B -> BGSDJB.',
        topic: 'Analytical Reasoning - Coding Decoding'
      },
      {
        id: 'ngat_q9',
        examId: 'ngat_mock_01',
        number: 9,
        questionText: 'A car travels from Addis Ababa to Hawassa (275 km) at an average speed of 55 km/h. On the return trip, it travels at 50 km/h. What is the approximate total travel time for the round trip?',
        options: ['10.5 hours', '10 hours', '11 hours', '9.5 hours'],
        correctAnswerIndex: 0,
        explanation: 'Going time = 275 / 55 = 5.0 hours. Returning time = 275 / 50 = 5.5 hours. Total time = 5.0 + 5.5 = 10.5 hours.',
        topic: 'Quantitative - Speed, Distance and Time'
      },
      {
        id: 'ngat_q10',
        examId: 'ngat_mock_01',
        number: 10,
        questionText: 'Complete the sentence with the most appropriate grammatical phrase:\n"Neither the Dean nor the committee members _____ prepared to postpone the national examination date."',
        options: ['is', 'are', 'was', 'have been'],
        correctAnswerIndex: 1,
        explanation: 'When subjects are connected by "Neither ... nor", the verb agrees in number with the closer subject ("committee members", which is plural), hence "are".',
        topic: 'Verbal Ability - Subject-Verb Agreement'
      }
    ]
  },

  // 2. NGAT Mock 02 (Paid)
  {
    id: 'ngat_mock_02',
    title: 'NGAT Premium Mock 02: Advanced Quantitative & Data Interpretation',
    category: 'NGAT',
    subCategory: 'Advanced Quantitative',
    description: 'Intensive practice with algebra, probability, data tables, and high-difficulty deductive logic questions.',
    durationMinutes: 60,
    totalQuestions: 8,
    passMarkPercent: 75,
    isFree: false,
    packageRequired: 'NGAT_ALL',
    difficulty: 'Advanced',
    tags: ['NGAT', 'Quantitative', 'Data Interpretation', 'Algebra'],
    yearOrSession: '2026 Series',
    questions: [
      {
        id: 'ngat2_q1',
        examId: 'ngat_mock_02',
        number: 1,
        questionText: 'If 2^(2x + 1) = 32, what is the value of x?',
        options: ['2', '3', '4', '1.5'],
        correctAnswerIndex: 0,
        explanation: '32 = 2^5. So 2x + 1 = 5 => 2x = 4 => x = 2.',
        topic: 'Algebra - Exponents'
      },
      {
        id: 'ngat2_q2',
        examId: 'ngat_mock_02',
        number: 2,
        questionText: 'A bag contains 5 red balls, 4 blue balls, and 3 green balls. If one ball is drawn at random, what is the probability that it is NOT blue?',
        options: ['1/3', '2/3', '3/4', '5/12'],
        correctAnswerIndex: 1,
        explanation: 'Total balls = 5 + 4 + 3 = 12. Non-blue balls = 5 + 3 = 8. Probability = 8/12 = 2/3.',
        topic: 'Probability'
      },
      {
        id: 'ngat2_q3',
        examId: 'ngat_mock_02',
        number: 3,
        questionText: 'Two pipes A and B can fill a water tank in 20 minutes and 30 minutes respectively. If both are opened together, how long will it take to fill the tank?',
        options: ['10 minutes', '12 minutes', '15 minutes', '18 minutes'],
        correctAnswerIndex: 1,
        explanation: 'Combined rate = 1/20 + 1/30 = (3+2)/60 = 5/60 = 1/12. Time = 12 minutes.',
        topic: 'Pipes and Cisterns'
      },
      {
        id: 'ngat2_q4',
        examId: 'ngat_mock_02',
        number: 4,
        questionText: 'The perimeter of a rectangular plot in Bahir Dar is 120 meters. If its length is 10 meters longer than its width, find the area of the plot.',
        options: ['875 sq m', '900 sq m', '825 sq m', '950 sq m'],
        correctAnswerIndex: 0,
        explanation: '2(L + W) = 120 => L + W = 60. Since L = W + 10 => 2W + 10 = 60 => 2W = 50 => W = 25 m, L = 35 m. Area = 25 * 35 = 875 sq m.',
        topic: 'Geometry and Mensuration'
      },
      {
        id: 'ngat2_q5',
        examId: 'ngat_mock_02',
        number: 5,
        questionText: 'Solve for y in the system of equations:\n3x + 2y = 19\nx - y = 3',
        options: ['y = 2', 'y = 4', 'y = 5', 'y = 3'],
        correctAnswerIndex: 0,
        explanation: 'From equation 2: x = y + 3. Substitute into equation 1: 3(y + 3) + 2y = 19 => 3y + 9 + 2y = 19 => 5y = 10 => y = 2 (and x = 5).',
        topic: 'Algebra - Simultaneous Equations'
      },
      {
        id: 'ngat2_q6',
        examId: 'ngat_mock_02',
        number: 6,
        questionText: 'In a class of 60 students at Jimma University, 35 study French, 25 study German, and 10 study both. How many students study neither language?',
        options: ['10', '15', '5', '8'],
        correctAnswerIndex: 0,
        explanation: 'Students studying at least one = 35 + 25 - 10 = 50. Students studying neither = 60 - 50 = 10.',
        topic: 'Set Theory and Venn Diagrams'
      },
      {
        id: 'ngat2_q7',
        examId: 'ngat_mock_02',
        number: 7,
        questionText: 'What is the sum of the first 20 terms of an arithmetic progression whose first term is 4 and common difference is 3?',
        options: ['620', '650', '680', '710'],
        correctAnswerIndex: 1,
        explanation: 'S_n = n/2 [2a + (n - 1)d] = 20/2 [2(4) + 19(3)] = 10 [8 + 57] = 10 * 65 = 650.',
        topic: 'Sequences and Series'
      },
      {
        id: 'ngat2_q8',
        examId: 'ngat_mock_02',
        number: 8,
        questionText: 'Find the standard deviation of the numbers: 2, 4, 4, 4, 5, 5, 7, 9.',
        options: ['2.0', '4.0', '1.5', '2.5'],
        correctAnswerIndex: 0,
        explanation: 'Mean = (2+4+4+4+5+5+7+9)/8 = 40/8 = 5. Squared differences from mean: 9, 1, 1, 1, 0, 0, 4, 16. Sum = 32. Variance = 32/8 = 4. Standard deviation = sqrt(4) = 2.0.',
        topic: 'Statistics - Standard Deviation'
      }
    ]
  },

  // 3. GAT Mock (Addis Ababa University Graduate Admission)
  {
    id: 'gat_mock_01',
    title: 'AAU GAT Comprehensive Mock Exam 01',
    category: 'GAT',
    subCategory: 'Verbal & Analytical Ability',
    description: 'Timed practice for AAU GAT candidates containing high-frequency verbal analogies, quantitative comparison, and deductive reasoning.',
    durationMinutes: 50,
    totalQuestions: 8,
    passMarkPercent: 70,
    isFree: false,
    packageRequired: 'GAT_ALL',
    difficulty: 'Standard National',
    tags: ['AAU GAT', 'Graduate Admission', 'Verbal Reasoning', 'Quantitative Comparison'],
    yearOrSession: '2026 AAU Format',
    questions: [
      {
        id: 'gat_q1',
        examId: 'gat_mock_01',
        number: 1,
        questionText: 'Quantity A: The perimeter of a square with area 64 cm²\nQuantity B: The circumference of a circle with radius 5 cm',
        options: [
          'Quantity A is greater',
          'Quantity B is greater',
          'The two quantities are equal',
          'The relationship cannot be determined from the information given'
        ],
        correctAnswerIndex: 0,
        explanation: 'Quantity A: Side of square = sqrt(64) = 8 cm. Perimeter = 4 * 8 = 32 cm. Quantity B: Circumference = 2 * pi * 5 = 10 * 3.1416 = 31.416 cm. Since 32 > 31.416, Quantity A is greater.',
        topic: 'Quantitative Comparison'
      },
      {
        id: 'gat_q2',
        examId: 'gat_mock_01',
        number: 2,
        questionText: 'Select the word that best completes the sentence:\n"The professor\'s lecture was so _____ that even students without a background in economics could easily grasp the core principles."',
        options: ['Lucid', 'Obscure', 'Pedantic', 'Convoluted'],
        correctAnswerIndex: 0,
        explanation: 'Lucid means clear, easily understood, and transparent in meaning. The other options imply difficulty or unnecessary complexity.',
        topic: 'Verbal - Sentence Completion'
      },
      {
        id: 'gat_q3',
        examId: 'gat_mock_01',
        number: 3,
        questionText: 'If x > 0 and y < 0, which of the following expressions MUST be negative?',
        options: ['x - y', 'x + y', 'x * y', 'x / y^2'],
        correctAnswerIndex: 2,
        explanation: 'The product of a positive number and a negative number is always negative: (positive) * (negative) = negative.',
        topic: 'Quantitative - Number Properties'
      },
      {
        id: 'gat_q4',
        examId: 'gat_mock_01',
        number: 4,
        questionText: 'Find the odd one out among the given options:',
        options: ['Lalibela', 'Axum', 'Gondar', 'Nile River'],
        correctAnswerIndex: 3,
        explanation: 'Lalibela, Axum, and Gondar are historical architectural Ethiopian UNESCO World Heritage cultural sites, whereas Nile River is a natural geographical water body.',
        topic: 'Verbal Classification'
      },
      {
        id: 'gat_q5',
        examId: 'gat_mock_01',
        number: 5,
        questionText: 'A train 180 meters long is traveling at a speed of 72 km/h. How many seconds will it take to pass a stationary telegraph post?',
        options: ['7 seconds', '8 seconds', '9 seconds', '10 seconds'],
        correctAnswerIndex: 2,
        explanation: 'Speed in m/s = 72 * (5/18) = 20 m/s. Time taken to pass post = Length / Speed = 180 / 20 = 9 seconds.',
        topic: 'Speed and Distance'
      },
      {
        id: 'gat_q6',
        examId: 'gat_mock_01',
        number: 6,
        questionText: 'Which of the following is logically equivalent to the contrapositive of: "If it rains in Mekelle, the farmers plant teff"?',
        options: [
          'If the farmers plant teff, it rains in Mekelle',
          'If the farmers do not plant teff, it does not rain in Mekelle',
          'If it does not rain in Mekelle, the farmers do not plant teff',
          'If the farmers plant teff, it does not rain in Mekelle'
        ],
        correctAnswerIndex: 1,
        explanation: 'The contrapositive of "If P, then Q" is "If not Q, then not P". Thus: "If the farmers do not plant teff, it does not rain in Mekelle".',
        topic: 'Analytical Logic - Contrapositive'
      },
      {
        id: 'gat_q7',
        examId: 'gat_mock_01',
        number: 7,
        questionText: 'What is 35% of 40% of 500?',
        options: ['60', '70', '80', '90'],
        correctAnswerIndex: 1,
        explanation: '40% of 500 = 200. 35% of 200 = 0.35 * 200 = 70.',
        topic: 'Quantitative - Percentages'
      },
      {
        id: 'gat_q8',
        examId: 'gat_mock_01',
        number: 8,
        questionText: 'Identify the grammatically correct sentence:',
        options: [
          'Each of the candidates have submitted their thesis on time.',
          'Each of the candidates has submitted his or her thesis on time.',
          'Each of the candidate has submitted their thesis on time.',
          'Each of the candidate have submitted his thesis on time.'
        ],
        correctAnswerIndex: 1,
        explanation: '"Each" is singular and takes the singular pronoun/verb "has submitted his or her".',
        topic: 'English Grammar - Pronoun Agreement'
      }
    ]
  },

  // 4. EXIT Exam: Computer Science & Software Engineering (MoE Blueprint 2026)
  {
    id: 'exit_cs_2026',
    title: 'MoE National Exit Exam: Computer Science & IT (2026)',
    category: 'EXIT',
    subCategory: 'Computer Science & Software Engineering',
    description: 'Full alignment with Ministry of Education exit exam competencies: Data Structures, Algorithms, Operating Systems, Database Systems, Computer Networks, and Object-Oriented Software Design.',
    durationMinutes: 60,
    totalQuestions: 10,
    passMarkPercent: 65,
    isFree: false,
    packageRequired: 'EXIT_ALL',
    difficulty: 'Advanced',
    tags: ['MoE Exit Exam', 'Computer Science', 'Software Engineering', 'Algorithms', 'Databases'],
    yearOrSession: '2026 MoE National Session',
    questions: [
      {
        id: 'cs_q1',
        examId: 'exit_cs_2026',
        number: 1,
        questionText: 'What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST) containing n nodes?',
        options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
        correctAnswerIndex: 1,
        explanation: 'In the worst case, an unbalanced BST degenerates into a linear linked list (skewed tree), resulting in O(n) search time complexity.',
        topic: 'Data Structures and Algorithms'
      },
      {
        id: 'cs_q2',
        examId: 'exit_cs_2026',
        number: 2,
        questionText: 'Which of the following database normal forms eliminates transitive functional dependencies on the primary key?',
        options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
        correctAnswerIndex: 2,
        explanation: '3NF requires that a relation is in 2NF and has no transitive dependency of non-prime attributes on candidate keys (X -> Y where Y is non-prime and X is not a superkey).',
        topic: 'Database Systems'
      },
      {
        id: 'cs_q3',
        examId: 'exit_cs_2026',
        number: 3,
        questionText: 'In Operating Systems, which of the following is NOT one of Coffman\'s four necessary conditions for a deadlock to occur?',
        options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
        correctAnswerIndex: 2,
        explanation: 'The four necessary conditions for deadlock are: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption (resources cannot be preempted), and 4) Circular Wait. Therefore, "Preemption Allowed" prevents deadlock.',
        topic: 'Operating Systems'
      },
      {
        id: 'cs_q4',
        examId: 'exit_cs_2026',
        number: 4,
        questionText: 'Consider the following recursive JavaScript / TypeScript function:\n\nfunction mystery(n: number): number {\n  if (n <= 1) return 1;\n  return n * mystery(n - 1);\n}\n\nWhat is returned by mystery(5)?',
        codeBlock: 'function mystery(n: number): number {\n  if (n <= 1) return 1;\n  return n * mystery(n - 1);\n}',
        options: ['24', '60', '120', '720'],
        correctAnswerIndex: 2,
        explanation: 'This computes 5! (factorial of 5) = 5 * 4 * 3 * 2 * 1 = 120.',
        topic: 'Programming & Recursion'
      },
      {
        id: 'cs_q5',
        examId: 'exit_cs_2026',
        number: 5,
        questionText: 'Which OSI model layer is responsible for end-to-end reliable communication, flow control, and error correction (e.g., TCP)?',
        options: ['Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Data Link Layer (Layer 2)', 'Session Layer (Layer 5)'],
        correctAnswerIndex: 1,
        explanation: 'The Transport Layer (Layer 4) provides host-to-host or end-to-end communication services for applications, including TCP flow control, segmentation, and error recovery.',
        topic: 'Computer Networks'
      },
      {
        id: 'cs_q6',
        examId: 'exit_cs_2026',
        number: 6,
        questionText: 'In Object-Oriented Software Design, which Gang of Four (GoF) design pattern ensures that a class has only one instance and provides a global point of access to it?',
        options: ['Factory Pattern', 'Singleton Pattern', 'Observer Pattern', 'Adapter Pattern'],
        correctAnswerIndex: 1,
        explanation: 'The Singleton pattern restricts the instantiation of a class to one single instance and provides global access.',
        topic: 'Software Engineering & Design Patterns'
      },
      {
        id: 'cs_q7',
        examId: 'exit_cs_2026',
        number: 7,
        questionText: 'What is the primary difference between a process and a thread in modern operating systems?',
        options: [
          'Processes share address space while threads do not',
          'Threads within the same process share code, data, and open files, whereas processes have isolated address spaces',
          'Processes are scheduled by CPU hardware whereas threads are not',
          'Threads cannot be executed concurrently'
        ],
        correctAnswerIndex: 1,
        explanation: 'Threads of the same process share the process\'s address space, heap memory, and file descriptors, while having their own stack, registers, and program counter.',
        topic: 'Operating Systems - Concurrency'
      },
      {
        id: 'cs_q8',
        examId: 'exit_cs_2026',
        number: 8,
        questionText: 'In relational database theory, which property of ACID guarantees that all transactions are saved permanently in non-volatile storage even in the event of a system crash?',
        options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
        correctAnswerIndex: 3,
        explanation: 'Durability ensures that once a transaction has been committed, it will remain committed even in the case of a system failure or power loss.',
        topic: 'Database Management Systems'
      },
      {
        id: 'cs_q9',
        examId: 'exit_cs_2026',
        number: 9,
        questionText: 'Which HTTP status code is returned by a REST API server when the requested resource is found but the client does not have authorization permissions to access it?',
        options: ['401 Unauthorized', '403 Forbidden', '404 Not Found', '500 Internal Server Error'],
        correctAnswerIndex: 1,
        explanation: '403 Forbidden indicates that the server understands the request but refuses to authorize it because the user lacks necessary access rights.',
        topic: 'Web Technologies & APIs'
      },
      {
        id: 'cs_q10',
        examId: 'exit_cs_2026',
        number: 10,
        questionText: 'In asymmetric public-key cryptography (like RSA), which key does the sender use to ENCRYPT a message so that ONLY the intended receiver can read it?',
        options: ['Sender\'s Private Key', 'Sender\'s Public Key', 'Receiver\'s Public Key', 'Receiver\'s Private Key'],
        correctAnswerIndex: 2,
        explanation: 'For confidentiality, the sender encrypts with the Receiver\'s Public Key. Only the receiver, possessing the corresponding Private Key, can decrypt it.',
        topic: 'Information Security'
      }
    ]
  },

  // 5. EXIT Exam: Law & Jurisprudence (MoE National Exit Exam)
  {
    id: 'exit_law_2026',
    title: 'MoE National Exit Exam: Law & Jurisprudence (2026)',
    category: 'EXIT',
    subCategory: 'Law & Governance',
    description: 'Comprehensive assessment of Ethiopian Jurisprudence: 1995 FDRE Constitution, Criminal Law, Civil Code Contracts, and Ethiopian Commercial Code.',
    durationMinutes: 60,
    totalQuestions: 8,
    passMarkPercent: 65,
    isFree: false,
    packageRequired: 'EXIT_ALL',
    difficulty: 'Advanced',
    tags: ['Law Exit Exam', 'FDRE Constitution', 'Criminal Code', 'Civil Code', 'MoE Law'],
    yearOrSession: '2026 MoE Law Blueprint',
    questions: [
      {
        id: 'law_q1',
        examId: 'exit_law_2026',
        number: 1,
        questionText: 'Under the 1995 FDRE Constitution of Ethiopia, which constitutional organ possesses the exclusive constitutional power to interpret the Constitution?',
        options: [
          'The Federal Supreme Court',
          'The House of Peoples\' Representatives (HoPR)',
          'The House of Federation (HoF) assisted by the Council of Constitutional Inquiry',
          'The Prime Minister\'s Legal Advisory Council'
        ],
        correctAnswerIndex: 2,
        explanation: 'Under Article 62(1) and Article 83 of the FDRE Constitution, the House of Federation (HoF) has the power to interpret the Constitution, supported by the Council of Constitutional Inquiry (CCI).',
        topic: 'Constitutional Law'
      },
      {
        id: 'law_q2',
        examId: 'exit_law_2026',
        number: 2,
        questionText: 'According to Article 23 of the 2004 Criminal Code of Ethiopia, what are the two cumulative basic elements required for criminal liability?',
        options: [
          'Motive and Opportunity',
          'Material/Physical element (Actus Reus) and Moral/Mental element (Mens Rea)',
          'Civil damage and Public outrage',
          'Confession and Eyewitness testimony'
        ],
        correctAnswerIndex: 1,
        explanation: 'Criminal liability requires the concurrence of the material element (the criminal act or omission) and the moral element (intention or negligence).',
        topic: 'Criminal Law'
      },
      {
        id: 'law_q3',
        examId: 'exit_law_2026',
        number: 3,
        questionText: 'Under the Ethiopian Civil Code (Article 1678), which of the following is NOT one of the essential requirements for the validity of a contract?',
        options: [
          'Capacity of the parties',
          'Consent of the parties free from defects (error, fraud, duress)',
          'Object of the contract being sufficiently defined, possible, and lawful',
          'Registration before the Federal Supreme Court in all instances'
        ],
        correctAnswerIndex: 3,
        explanation: 'Under Article 1678, the core requirements are: 1) Capacity, 2) Consent, 3) Object (lawful, defined, possible), and 4) Form prescribed by law (where applicable). General contracts do not require Supreme Court registration.',
        topic: 'Law of Contracts'
      },
      {
        id: 'law_q4',
        examId: 'exit_law_2026',
        number: 4,
        questionText: 'Under the revised 2021 Commercial Code of Ethiopia, what is the minimum number of founders/shareholders required to establish a Share Company (S.C.)?',
        options: ['2 persons', '3 persons', '5 persons', '7 persons'],
        correctAnswerIndex: 2,
        explanation: 'Under the Ethiopian Commercial Code, a Share Company (አክሲዮን ማኅበር) requires a minimum of 5 shareholders at formation.',
        topic: 'Commercial Law'
      },
      {
        id: 'law_q5',
        examId: 'exit_law_2026',
        number: 5,
        questionText: 'In Ethiopian extra-contractual liability (Tort Law, Civil Code Art. 2028), what constitutes strict (fault-free) liability?',
        options: [
          'Liability arising from intentional defamation',
          'Liability for creating abnormal or dangerous risks (e.g., keeping wild animals, operating motor vehicles)',
          'Failure to pay commercial promissory notes on time',
          'Breach of professional confidentiality'
        ],
        correctAnswerIndex: 1,
        explanation: 'Under the Ethiopian Civil Code, strict or objective liability is imposed for activities involving inherent or abnormal dangerous risks irrespective of fault or negligence.',
        topic: 'Law of Extra-Contractual Liability'
      },
      {
        id: 'law_q6',
        examId: 'exit_law_2026',
        number: 6,
        questionText: 'Under the Ethiopian Criminal Procedure Code, within what time limit must an arrested suspect be brought before a court of law after arrest?',
        options: ['12 hours', '24 hours', '48 hours', '72 hours'],
        correctAnswerIndex: 2,
        explanation: 'Under Article 19(3) of the FDRE Constitution and the Criminal Procedure Code, any arrested person has the right to be brought before a court of law within 48 hours.',
        topic: 'Criminal Procedure Law'
      },
      {
        id: 'law_q7',
        examId: 'exit_law_2026',
        number: 7,
        questionText: 'Which human rights principle is enshrined under Article 20(2) of the FDRE Constitution regarding criminal proceedings?',
        options: [
          'The right to trial by media',
          'The presumption of innocence until proven guilty according to law',
          'Immediate deportation of foreign nationals',
          'Automatic denial of bail in all offenses'
        ],
        correctAnswerIndex: 1,
        explanation: 'Article 20(2) establishes that all accused persons have the right to be presumed innocent until proven guilty according to law.',
        topic: 'Human Rights & Constitutional Rights'
      },
      {
        id: 'law_q8',
        examId: 'exit_law_2026',
        number: 8,
        questionText: 'Under Ethiopian Property Law (Civil Code), which of the following is true regarding land ownership in Ethiopia?',
        options: [
          'Land is privately owned and can be bought and sold as private merchandise.',
          'The right to ownership of rural and urban land is exclusively vested in the State and the peoples of Ethiopia.',
          'Only foreign investors may own land titles permanently.',
          'Municipalities have private commercial ownership of agricultural land.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Article 40(3) of the FDRE Constitution explicitly states that the right to ownership of rural and urban land, as well as of all natural resources, is exclusively vested in the State and the peoples of Ethiopia.',
        topic: 'Property Law'
      }
    ]
  },

  // 6. EXIT Exam: Medicine & Health Sciences
  {
    id: 'exit_med_2026',
    title: 'MoE National Medical Exit Exam: Clinical Practice (2026)',
    category: 'EXIT',
    subCategory: 'Medicine & Public Health',
    description: 'High-yield clinical case scenarios based on Ethiopian Ministry of Health Clinical Guidelines, IMNCI, Internal Medicine, and Infectious Diseases.',
    durationMinutes: 60,
    totalQuestions: 6,
    passMarkPercent: 70,
    isFree: false,
    packageRequired: 'EXIT_ALL',
    difficulty: 'Advanced',
    tags: ['Medical Exit Exam', 'Clinical Medicine', 'Pediatrics', 'IMNCI', 'Public Health'],
    yearOrSession: '2026 National Health Board',
    questions: [
      {
        id: 'med_q1',
        examId: 'exit_med_2026',
        number: 1,
        questionText: 'A 28-year-old male from Gambella presents with high intermittent fever, chills, sweating, and splenomegaly. Blood film microscopy confirms Plasmodium falciparum malaria. According to the Ethiopian National Malaria Guideline, what is the first-line treatment for uncomplicated P. falciparum malaria?',
        options: [
          'Oral Chloroquine for 3 days',
          'Artemether-Lumefantrine (Coartem) twice daily for 3 days',
          'Intravenous Quinine infusion for 7 days',
          'Oral Doxycycline monotherapy'
        ],
        correctAnswerIndex: 1,
        explanation: 'In Ethiopia, Artemether-Lumefantrine (Coartem) is the national first-line therapy for uncomplicated Plasmodium falciparum and mixed malaria.',
        topic: 'Internal Medicine - Infectious Diseases'
      },
      {
        id: 'med_q2',
        examId: 'exit_med_2026',
        number: 2,
        questionText: 'According to the WHO/Ethiopian IMNCI guidelines, which of the following respiratory rates in a 6-month-old infant is defined as Fast Breathing (Pneumonia classification threshold)?',
        options: ['30 breaths per minute or more', '40 breaths per minute or more', '50 breaths per minute or more', '60 breaths per minute or more'],
        correctAnswerIndex: 2,
        explanation: 'Under IMNCI criteria: Age 2 to 11 months: 50 breaths per minute or more is classified as fast breathing. Age 12 months to 5 years: 40 breaths/min or more.',
        topic: 'Pediatrics & IMNCI'
      },
      {
        id: 'med_q3',
        examId: 'exit_med_2026',
        number: 3,
        questionText: 'A 45-year-old female presents with progressive shortness of breath, chronic productive cough with night sweats, and significant weight loss. Sputum GeneXpert tests positive for Mycobacterium tuberculosis without rifampicin resistance. What is the standard intensive phase regimen in Ethiopia?',
        options: [
          '2 months of Rifampicin, Isoniazid, Pyrazinamide, and Ethambutol (2RHZE)',
          '6 months of Isoniazid and Rifampicin (6HR)',
          '3 months of Ciprofloxacin and Amikacin',
          '12 months of Streptomycin monotherapy'
        ],
        correctAnswerIndex: 0,
        explanation: 'Standard anti-TB treatment consists of a 2-month intensive phase with 4 drugs (2RHZE: Rifampicin, Isoniazid, Pyrazinamide, Ethambutol) followed by a 4-month continuation phase (4RH).',
        topic: 'Pulmonology & TB Control'
      },
      {
        id: 'med_q4',
        examId: 'exit_med_2026',
        number: 4,
        questionText: 'In public health epidemiology, what is the best study design to assess the incidence and relative risk of disease development among exposed vs unexposed populations?',
        options: ['Cross-Sectional Study', 'Prospective Cohort Study', 'Case-Control Study', 'Ecological Study'],
        correctAnswerIndex: 1,
        explanation: 'A Prospective Cohort Study tracks exposed and unexposed cohorts forward in time to directly measure disease incidence and compute Relative Risk (RR).',
        topic: 'Public Health & Epidemiology'
      },
      {
        id: 'med_q5',
        examId: 'exit_med_2026',
        number: 5,
        questionText: 'Which of the following is considered an obstetric emergency sign indicative of severe pre-eclampsia in a pregnant mother at 34 weeks of gestation?',
        options: [
          'Mild pedal edema in the evening',
          'Blood pressure >= 160/110 mmHg with severe persistent epigastric pain or visual disturbances',
          'Blood pressure of 120/80 mmHg',
          'Single fetal movement detected per hour'
        ],
        correctAnswerIndex: 1,
        explanation: 'Severe pre-eclampsia is characterized by severe hypertension (>= 160/110 mmHg) accompanied by symptoms of end-organ involvement (severe headaches, visual blurring, severe epigastric/RUQ pain).',
        topic: 'Obstetrics & Gynecology'
      },
      {
        id: 'med_q6',
        examId: 'exit_med_2026',
        number: 6,
        questionText: 'What is the immediate pharmacological intervention of choice in a patient presenting with acute anaphylactic shock?',
        options: [
          'Oral Cetirizine 10mg',
          'Intramuscular Epinephrine (Adrenaline) 1:1000 into the anterolateral thigh',
          'Intravenous Furosemide',
          'Sublingual Nitroglycerin'
        ],
        correctAnswerIndex: 1,
        explanation: 'Intramuscular Epinephrine (1:1000, 0.3-0.5 mg in adults) into the mid-anterolateral thigh is the first-line and most critical life-saving drug for anaphylaxis.',
        topic: 'Emergency Medicine'
      }
    ]
  },

  // 7. EUEE Grade 12 National University Entrance Exam
  {
    id: 'euee_nat_sci_2026',
    title: 'Ethiopian University Entrance Exam (EUEE): Natural Science Mock',
    category: 'ENTRANCE',
    subCategory: 'Mathematics & Physics',
    description: 'National Grade 12 university entrance exam preparation covering calculus, vectors, dynamics, and electrostatics.',
    durationMinutes: 45,
    totalQuestions: 6,
    passMarkPercent: 60,
    isFree: false,
    packageRequired: 'GRADE_12_ALL',
    difficulty: 'Standard National',
    tags: ['EUEE', 'Grade 12 Entrance', 'Natural Science', 'Mathematics', 'Physics'],
    yearOrSession: '2026 National Examination',
    questions: [
      {
        id: 'euee_q1',
        examId: 'euee_nat_sci_2026',
        number: 1,
        questionText: 'What is the derivative of the function f(x) = 3x^4 - 5x^2 + 7x - 9 with respect to x?',
        options: ['12x^3 - 10x + 7', '12x^3 - 5x + 7', '7x^3 - 10x', '12x^4 - 10x^2 + 7'],
        correctAnswerIndex: 0,
        explanation: 'Using power rule: d/dx(3x^4) = 12x^3; d/dx(-5x^2) = -10x; d/dx(7x) = 7; d/dx(-9) = 0. Derivative is 12x^3 - 10x + 7.',
        topic: 'Mathematics - Differential Calculus'
      },
      {
        id: 'euee_q2',
        examId: 'euee_nat_sci_2026',
        number: 2,
        questionText: 'A ball is thrown vertically upward with an initial velocity of 20 m/s from the ground. Taking acceleration due to gravity g = 10 m/s², what is the maximum height reached by the ball?',
        options: ['15 meters', '20 meters', '25 meters', '40 meters'],
        correctAnswerIndex: 1,
        explanation: 'At max height, v = 0. Using v^2 = u^2 - 2gh => 0 = 20^2 - 2(10)h => 400 = 20h => h = 20 meters.',
        topic: 'Physics - Kinematics'
      },
      {
        id: 'euee_q3',
        examId: 'euee_nat_sci_2026',
        number: 3,
        questionText: 'What is the value of the definite integral: ∫ (from 0 to 3) (2x + 1) dx ?',
        options: ['9', '12', '15', '18'],
        correctAnswerIndex: 1,
        explanation: 'Integral = [x^2 + x] from 0 to 3 = (3^2 + 3) - (0) = 9 + 3 = 12.',
        topic: 'Mathematics - Integral Calculus'
      },
      {
        id: 'euee_q4',
        examId: 'euee_nat_sci_2026',
        number: 4,
        questionText: 'Two point charges of +2 µC and +8 µC are separated by a distance of 0.3 meters in vacuum. (Coulomb constant k = 9 * 10^9 N m²/C²). What is the magnitude of the electrostatic force between them?',
        options: ['0.8 N', '1.6 N', '2.4 N', '3.2 N'],
        correctAnswerIndex: 1,
        explanation: 'F = k * |q1 * q2| / r^2 = (9*10^9 * 2*10^-6 * 8*10^-6) / (0.3)^2 = (9 * 16 * 10^-3) / 0.09 = 0.144 / 0.09 = 1.6 N.',
        topic: 'Physics - Electrostatics'
      },
      {
        id: 'euee_q5',
        examId: 'euee_nat_sci_2026',
        number: 5,
        questionText: 'Find the solution set for the inequality: |2x - 3| < 7',
        options: ['-2 < x < 5', '-5 < x < 2', 'x < -2 or x > 5', '-2 <= x <= 5'],
        correctAnswerIndex: 0,
        explanation: '|2x - 3| < 7 => -7 < 2x - 3 < 7 => -4 < 2x < 10 => -2 < x < 5.',
        topic: 'Mathematics - Absolute Value'
      },
      {
        id: 'euee_q6',
        examId: 'euee_nat_sci_2026',
        number: 6,
        questionText: 'According to Newton\'s second law of motion, what net force is required to accelerate a 1,200 kg car at 2.5 m/s²?',
        options: ['2,400 N', '3,000 N', '3,600 N', '4,800 N'],
        correctAnswerIndex: 1,
        explanation: 'F = m * a = 1200 kg * 2.5 m/s² = 3,000 N.',
        topic: 'Physics - Dynamics'
      }
    ]
  },

  // Auto-Converted National & Grade-Level Exam Catalog (292 exams)
  ...CONVERTED_EXAMS_METADATA
];
