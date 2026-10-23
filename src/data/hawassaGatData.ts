import { Exam } from '../types';

export const HAWASSA_GAT_QUANT_EXAM: Exam = {
  id: "hawassa_gat_quant_reasoning_2024",
  title: "Hawassa University GAT - Quantitative Reasoning Official Tutorial Bank",
  category: "GAT",
  subCategory: "Quantitative Reasoning & Data Interpretation",
  description: "Official comprehensive Graduate Admission Test (GAT) quantitative tutorial handbook covering discrete arithmetic, algebra, coordinate & plane geometry, probability, data interpretation, and quantitative comparisons (Column A vs Column B).",
  durationMinutes: 90,
  totalQuestions: 64,
  passMarkPercent: 60,
  isFree: false,
  packageRequired: "GAT_ALL",
  difficulty: "Standard National",
  tags: ["Hawassa University", "GAT", "Quantitative Reasoning", "Quantitative Comparison", "July 2024"],
  yearOrSession: "2024/2026",
  questions: [
    // --- PART 1: DISCRETE QUANTITATIVE (ARITHMETIC & RATIOS) ---
    {
      id: "hw_gat_01",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 1,
      questionType: "single_choice",
      questionText: "A bus is carrying 28 passengers, of which 18 are male. What is the ratio of female to male passengers?",
      options: [
        "5/14",
        "9/14",
        "5/9",
        "9/5"
      ],
      correctAnswerIndex: 2,
      explanation: "Total passengers = 28. Male passengers = 18. Therefore, Female passengers = 28 - 18 = 10. The ratio of female to male passengers is 10/18 = 5/9. Correct answer is (C).",
      topic: "Ratios and Proportions"
    },
    {
      id: "hw_gat_02",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 2,
      questionType: "single_choice",
      questionText: "If 60% of members of a club is men, what is the ratio of men to women in the club?",
      options: [
        "5 : 4",
        "4 : 3",
        "5 : 3",
        "3 : 2"
      ],
      correctAnswerIndex: 3,
      explanation: "Percentage of men = 60%, so percentage of women = 100% - 60% = 40%. The ratio of men to women is 60% : 40% = 60/40 = 3 : 2. Correct answer is (D).",
      topic: "Percentages and Ratios"
    },
    {
      id: "hw_gat_03",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 3,
      questionType: "single_choice",
      questionText: "A father wants to divide birr 390 to his two children A and B in the ratio 5 : 8. How much money child A and child B get, respectively?",
      options: [
        "150 and 240",
        "120 and 270",
        "130 and 260",
        "100 and 290"
      ],
      correctAnswerIndex: 0,
      explanation: "Total parts = 5 + 8 = 13 parts. 1 part = 390 / 13 = 30 birr. Child A gets 5 × 30 = 150 birr. Child B gets 8 × 30 = 240 birr. Correct answer is (A).",
      topic: "Ratio Division"
    },
    {
      id: "hw_gat_04",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 4,
      questionType: "single_choice",
      questionText: "A person wants to divide birr 4,600 for his three children in the ratio of 1/2 : 2/3 : 3/4. What are the shares in birr of each child from the smallest to the largest amount?",
      options: [
        "1200, 1400 and 2000",
        "1200, 1600 and 1800",
        "800, 1600 and 2200",
        "1000, 1600 and 2000"
      ],
      correctAnswerIndex: 1,
      explanation: "To simplify the ratio 1/2 : 2/3 : 3/4, multiply each fraction by the LCM of denominators (12): (1/2)*12 : (2/3)*12 : (3/4)*12 = 6 : 8 : 9. Sum of parts = 6 + 8 + 9 = 23 parts. Value of 1 part = 4600 / 23 = 200 birr. Shares: 6 × 200 = 1200, 8 × 200 = 1600, 9 × 200 = 1800. Correct answer is (B).",
      topic: "Fractional Ratios"
    },
    {
      id: "hw_gat_05",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 5,
      questionType: "single_choice",
      questionText: "The daily sales of a shop is birr 2,400. If the shop owner pays 4.5% sales tax, how much does he pay from his daily sales?",
      options: [
        "234",
        "180",
        "108",
        "216"
      ],
      correctAnswerIndex: 2,
      explanation: "Tax amount = 4.5% of 2,400 = 0.045 × 2400 = 108 birr. Correct answer is (C).",
      topic: "Percentage and Tax"
    },
    {
      id: "hw_gat_06",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 6,
      questionType: "single_choice",
      questionText: "A school is planning to increase the number of students from 40 to 50 per class. How much is the percentage increase?",
      options: [
        "40%",
        "25%",
        "20%",
        "10%"
      ],
      correctAnswerIndex: 1,
      explanation: "Percentage increase = ((New Value - Original Value) / Original Value) × 100% = ((50 - 40) / 40) × 100% = (10 / 40) × 100% = 25%. Correct answer is (B).",
      topic: "Percentage Increase"
    },
    {
      id: "hw_gat_07",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 7,
      questionType: "single_choice",
      questionText: "A retail store buys a shoe for 80 birr and sells at 75% profit. What is the selling price of the shoe?",
      options: [
        "100 birr",
        "120 birr",
        "130 birr",
        "140 birr"
      ],
      correctAnswerIndex: 3,
      explanation: "Profit amount = 75% of 80 = 0.75 × 80 = 60 birr. Selling price = Cost price + Profit = 80 + 60 = 140 birr. Correct answer is (D).",
      topic: "Profit and Loss"
    },
    {
      id: "hw_gat_08",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 8,
      questionType: "single_choice",
      questionText: "A shop keeper bought 5 dozen pens at 85 cents per pen and planned to sell each for 1 Birr. However, 10% of the pens were damaged and thrown away. How much was his profit?",
      options: [
        "15 birr",
        "9 birr",
        "5 birr",
        "3 birr"
      ],
      correctAnswerIndex: 3,
      explanation: "Total pens = 5 dozen = 5 × 12 = 60 pens. Total cost = 60 × 0.85 birr = 51 birr. Damaged pens = 10% of 60 = 6 pens. Remaining sold pens = 60 - 6 = 54 pens. Revenue = 54 × 1 birr = 54 birr. Profit = Revenue - Cost = 54 - 51 = 3 birr. Correct answer is (D).",
      topic: "Commercial Arithmetic"
    },
    {
      id: "hw_gat_09",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 9,
      questionType: "single_choice",
      questionText: "A person crossed a 600 meters long street in 4 minutes. What was his speed in km per hour?",
      options: [
        "8 km/hr",
        "7 km/hr",
        "6 km/hr",
        "9 km/hr"
      ],
      correctAnswerIndex: 3,
      explanation: "Speed in m/s = 600 m / (4 × 60 s) = 600 / 240 = 2.5 m/s. Converting to km/hr: 2.5 × (18/5) = 2.5 × 3.6 = 9 km/hr. Correct answer is (D).",
      topic: "Speed, Distance and Time"
    },
    {
      id: "hw_gat_10",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 10,
      questionType: "single_choice",
      questionText: "In a company, regular work time is 40 hours per week and the rate of payment for overtime work is 1 1/2 times the regular rate. How much is the payment for an employee who worked 52 hours in a week if his hourly regular rate is 30 birr?",
      options: [
        "Birr 2340",
        "Birr 2560",
        "Birr 1740",
        "Birr 1560"
      ],
      correctAnswerIndex: 2,
      explanation: "Regular hours = 40 hrs; Overtime hours = 52 - 40 = 12 hrs. Regular pay = 40 × 30 = 1,200 birr. Overtime rate = 1.5 × 30 = 45 birr/hr. Overtime pay = 12 × 45 = 540 birr. Total pay = 1,200 + 540 = 1,740 birr. Correct answer is (C).",
      topic: "Work, Wages and Overtime"
    },
    {
      id: "hw_gat_11",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 11,
      questionType: "single_choice",
      questionText: "20 friends went to a movie theatre. The average cost of the movie ticket for 19 friends was 120 birr. But one of the friends paid 38 birr more than the average cost for all the 20 friends. What was the total amount paid by all of them together?",
      options: [
        "2,438 birr",
        "2,440 birr",
        "2,204 birr",
        "2,104 birr"
      ],
      correctAnswerIndex: 1,
      explanation: "Let the average of all 20 friends be A. Total cost = 20A. The 19 friends paid 19 × 120 = 2,280 birr. The 20th friend paid A + 38. Equation: 2,280 + (A + 38) = 20A => 2,318 = 19A => A = 122 birr. Total paid = 20 × 122 = 2,440 birr. Correct answer is (B).",
      topic: "Averages"
    },
    {
      id: "hw_gat_12",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 12,
      questionType: "single_choice",
      questionText: "A retailer purchases shirts from a distributor at the rate of 300 birr per shirt and puts the label of 450 birr on each shirt. If the retailer allows some discount and still makes a profit of 23%, what is the discount percentage offered?",
      options: [
        "16%",
        "17%",
        "18%",
        "19%"
      ],
      correctAnswerIndex: 2,
      explanation: "Cost Price = 300 birr. Selling Price with 23% profit = 300 × 1.23 = 369 birr. Marked Price = 450 birr. Discount amount = 450 - 369 = 81 birr. Discount % = (81 / 450) × 100% = 18%. Correct answer is (C).",
      topic: "Discount and Markup"
    },
    {
      id: "hw_gat_13",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 13,
      questionType: "single_choice",
      questionText: "The speeds of two trains are in the ratio 6 : 7. If the second train runs 364 km in 4 hours, then the speed of the first train is:",
      options: [
        "60 km/hr",
        "72 km/hr",
        "78 km/hr",
        "84 km/hr"
      ],
      correctAnswerIndex: 2,
      explanation: "Speed of second train = 364 km / 4 hr = 91 km/hr. Since speed ratio is 6 : 7, let speeds be 6k and 7k. 7k = 91 => k = 13. Speed of first train = 6 × 13 = 78 km/hr. Correct answer is (C).",
      topic: "Ratio and Speed"
    },
    {
      id: "hw_gat_14",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 14,
      questionType: "single_choice",
      questionText: "The average of five numbers is 20. If each number is multiplied by 2, what will be the new average?",
      options: [
        "30",
        "40",
        "50",
        "60"
      ],
      correctAnswerIndex: 1,
      explanation: "By the property of arithmetic mean, if each observation in a dataset is multiplied by a constant k, the new mean is multiplied by k. Therefore, new average = 20 × 2 = 40. Correct answer is (B).",
      topic: "Mean Properties"
    },
    {
      id: "hw_gat_15",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 15,
      questionType: "single_choice",
      questionText: "A group consists of 2 males, 2 females and 3 children. The average age of the males is 67 years, that of females is 35 years, and that of children is 6 years. What is the average age of the whole group?",
      options: [
        "30.71",
        "31.71",
        "28.71",
        "35.45"
      ],
      correctAnswerIndex: 1,
      explanation: "Total age = (2 × 67) + (2 × 35) + (3 × 6) = 134 + 70 + 18 = 222 years. Total number of individuals = 2 + 2 + 3 = 7. Overall average = 222 / 7 ≈ 31.71 years. Correct answer is (B).",
      topic: "Weighted Averages"
    },
    {
      id: "hw_gat_16",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 16,
      questionType: "single_choice",
      questionText: "The average weight of a group of 5 boys is 26. If we replace a boy of weight 25 in the group with another boy so that the new average increases by 3, find the weight of the new boy.",
      options: [
        "56",
        "34",
        "40",
        "33"
      ],
      correctAnswerIndex: 2,
      explanation: "Increase in total sum of weights = number of boys × increase in average = 5 × 3 = 15. Weight of new boy = Weight of replaced boy + Total increase = 25 + 15 = 40. Correct answer is (C).",
      topic: "Averages & Replacement"
    },
    {
      id: "hw_gat_17",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 17,
      questionType: "single_choice",
      questionText: "If the price of petrol increases first by 10% and then by 15% in a particular month, what is the total percentage increase in the price of petrol?",
      options: [
        "26%",
        "26.5%",
        "27%",
        "27.5%"
      ],
      correctAnswerIndex: 1,
      explanation: "Successive percentage formula: a + b + (ab/100) = 10 + 15 + (10 × 15 / 100) = 25 + 1.5 = 26.5%. Correct answer is (B).",
      topic: "Successive Percentages"
    },
    {
      id: "hw_gat_18",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 18,
      questionType: "single_choice",
      questionText: "In an election between 2 contestants, 20% of the total votes were declared invalid and one of the contestants got 35% of the total valid votes. If the total number of votes is 4,850, how many valid votes did the other contestant get?",
      options: [
        "2,522",
        "2,512",
        "2,502",
        "2,436"
      ],
      correctAnswerIndex: 0,
      explanation: "Total valid votes = 80% of 4,850 = 0.80 × 4,850 = 3,880. Since one contestant received 35% of valid votes, the other contestant received 65%. Other contestant valid votes = 65% of 3,880 = 0.65 × 3,880 = 2,522 votes. Correct answer is (A).",
      topic: "Applied Percentages"
    },
    {
      id: "hw_gat_19",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 19,
      questionType: "single_choice",
      questionText: "Thahir spends 32% of his total income on family maintenance, 23% on personal expenses, and 70% of the remaining on children's education, and saves the remaining. What percent of his income is his savings?",
      options: [
        "13.8%",
        "13.7%",
        "13.6%",
        "13.5%"
      ],
      correctAnswerIndex: 3,
      explanation: "Initial expenditures = 32% + 23% = 55%. Remaining income = 100% - 55% = 45%. Education expenditure = 70% of 45% = 0.70 × 45% = 31.5%. Savings = 45% - 31.5% = 13.5% (or 30% of 45% = 13.5%). Correct answer is (D).",
      topic: "Compound Percentages"
    },
    {
      id: "hw_gat_20",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 20,
      questionType: "single_choice",
      questionText: "If A : B = 6 : 13 and B : C = 2 : 7, what is the value of the compound ratio A : B : C?",
      options: [
        "12 : 91 : 26",
        "12 : 26 : 91",
        "78 : 26 : 91",
        "12 : 26 : 42"
      ],
      correctAnswerIndex: 1,
      explanation: "Make the middle term B equal (LCM of 13 and 2 is 26): Multiply A:B by 2 => 12 : 26. Multiply B:C by 13 => 26 : 91. Combined ratio A : B : C = 12 : 26 : 91. Correct answer is (B).",
      topic: "Compound Ratios"
    },
    {
      id: "hw_gat_21",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 21,
      questionType: "single_choice",
      questionText: "The total share of A, B and C is 669 birr in such a way that the ratio of A to B is 17:27 and that of B to C is 2:5. What is the share of C?",
      options: [
        "405",
        "135",
        "270",
        "223"
      ],
      correctAnswerIndex: 0,
      explanation: "Make B equal (LCM of 27 and 2 = 54): A : B = (17×2) : (27×2) = 34 : 54. B : C = (2×27) : (5×27) = 54 : 135. Total ratio parts = 34 + 54 + 135 = 223 parts. 1 part = 669 / 223 = 3 birr. Share of C = 135 × 3 = 405 birr. Correct answer is (A).",
      topic: "Three-way Ratios"
    },
    {
      id: "hw_gat_22",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 22,
      questionType: "single_choice",
      questionText: "The ratio of boys to girls in a certain classroom was 2 : 3. If boys represented five more than one-third of the whole class, how many people were in the classroom?",
      options: [
        "30",
        "45",
        "75",
        "60"
      ],
      correctAnswerIndex: 2,
      explanation: "Let total students = 5k. Boys = 2k. According to the problem: Boys = (1/3) × Total + 5 => 2k = (5k/3) + 5. Multiply by 3: 6k = 5k + 15 => k = 15. Total people in classroom = 5k = 5 × 15 = 75. Correct answer is (C).",
      topic: "Algebraic Ratios"
    },
    {
      id: "hw_gat_23",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 23,
      questionType: "single_choice",
      questionText: "Which of the following fractions given in the options is the smallest?",
      options: [
        "19/23",
        "29/47",
        "4/7",
        "17/9"
      ],
      correctAnswerIndex: 2,
      explanation: "Convert each fraction to decimal values: 19/23 ≈ 0.826; 29/47 ≈ 0.617; 4/7 ≈ 0.5714; 17/9 ≈ 1.888. The smallest fraction is 4/7. Correct answer is (C).",
      topic: "Fraction Comparison"
    },

    // --- PART 2: RADICALS, POWERS & ALGEBRA ---
    {
      id: "hw_gat_24",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 24,
      questionType: "single_choice",
      questionText: "When √98 − √50 is simplified, it is equal to:",
      options: [
        "4√3",
        "2√2",
        "4√2",
        "2√3"
      ],
      correctAnswerIndex: 1,
      explanation: "√98 = √(49 × 2) = 7√2. √50 = √(25 × 2) = 5√2. Subtracting: 7√2 - 5√2 = 2√2. Correct answer is (B).",
      topic: "Radical Simplification"
    },
    {
      id: "hw_gat_25",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 25,
      questionType: "single_choice",
      questionText: "If x + 2y = 8 and −2x + 3y = 5, what is the value of x?",
      options: [
        "3",
        "-1",
        "-2",
        "2"
      ],
      correctAnswerIndex: 3,
      explanation: "Multiply the first equation by 2: 2x + 4y = 16. Add to second equation (-2x + 3y = 5): 7y = 21 => y = 3. Substitute y = 3 back into first equation: x + 2(3) = 8 => x + 6 = 8 => x = 2. Correct answer is (D).",
      topic: "Simultaneous Equations"
    },
    {
      id: "hw_gat_26",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 26,
      questionType: "single_choice",
      questionText: "At a certain fruit shop, one mango is sold for 10 Birr and one banana is sold for 5 Birr. If 30 fruits of mangoes and bananas were purchased for 200 Birr, how many of the fruits were bananas?",
      options: [
        "25",
        "15",
        "10",
        "20"
      ],
      correctAnswerIndex: 3,
      explanation: "Let m = mangoes, b = bananas. Equation 1: m + b = 30 => m = 30 - b. Equation 2: 10m + 5b = 200. Substitute m: 10(30 - b) + 5b = 200 => 300 - 10b + 5b = 200 => 300 - 5b = 200 => 5b = 100 => b = 20 bananas. Correct answer is (D).",
      topic: "Word Problems - Linear Equations"
    },
    {
      id: "hw_gat_27",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 27,
      questionType: "single_choice",
      questionText: "Suppose x and y are related by the linear equation y = -(1/2)x + 2. What happens to y if the value of x increases by 1?",
      options: [
        "y decreases by 1/2",
        "y increases by 2",
        "y decreases by 2",
        "y increases by 1/2"
      ],
      correctAnswerIndex: 0,
      explanation: "The rate of change of y with respect to x is the slope m = -1/2. For every 1-unit increase in x (Δx = +1), Δy = m × Δx = (-1/2) × 1 = -1/2 (y decreases by 1/2). Correct answer is (A).",
      topic: "Linear Functions and Slope"
    },
    {
      id: "hw_gat_28",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 28,
      questionType: "single_choice",
      questionText: "A student was asked to multiply a number by 25, but by mistake multiplied it by 45, obtaining an answer 200 more than the correct answer. What was the number?",
      options: [
        "7",
        "8",
        "10",
        "12"
      ],
      correctAnswerIndex: 2,
      explanation: "Let the number be N. Difference = 45N - 25N = 20N. Given: 20N = 200 => N = 10. Correct answer is (C).",
      topic: "Basic Algebra"
    },
    {
      id: "hw_gat_29",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 29,
      questionType: "single_choice",
      questionText: "If a + 2b = x and a − 2b = y, which of the following algebraic expressions is equal to ab?",
      options: [
        "(x² − y²) / 8",
        "(x² + y²) / 8",
        "x² − y²",
        "x² + y²"
      ],
      correctAnswerIndex: 0,
      explanation: "Recall the identity: (a + 2b)² - (a - 2b)² = (a² + 4ab + 4b²) - (a² - 4ab + 4b²) = 8ab. Since a + 2b = x and a - 2b = y: x² - y² = 8ab => ab = (x² - y²) / 8. Correct answer is (A).",
      topic: "Algebraic Identities"
    },
    {
      id: "hw_gat_30",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 30,
      questionType: "single_choice",
      questionText: "If a² = 17, then (a + 1)(a − 1) = ?",
      options: [
        "15",
        "12",
        "16",
        "9"
      ],
      correctAnswerIndex: 2,
      explanation: "(a + 1)(a - 1) = a² - 1 = 17 - 1 = 16. Correct answer is (C).",
      topic: "Difference of Squares"
    },
    {
      id: "hw_gat_31",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 31,
      questionType: "single_choice",
      questionText: "Abebe, Beletu and Hussien combined their money to purchase a laptop for 4,900 birr. Abebe paid 500 birr more than Beletu, and Beletu paid twice as much as Hussien. How much did Abebe pay?",
      options: [
        "1,080 birr",
        "1,760 birr",
        "2,260 birr",
        "2,950 birr"
      ],
      correctAnswerIndex: 2,
      explanation: "Let Hussien's payment = H. Then Beletu = 2H, and Abebe = 2H + 500. Total = (2H + 500) + 2H + H = 5H + 500 = 4900 => 5H = 4400 => H = 880 birr. Beletu = 2(880) = 1,760 birr. Abebe = 1,760 + 500 = 2,260 birr. Correct answer is (C).",
      topic: "Word Problems"
    },
    {
      id: "hw_gat_32",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 32,
      questionType: "single_choice",
      questionText: "Team members can complete a job in 20 days, but with the help of their team leader, they complete it in 15 days. In how many days can the team leader alone complete the job?",
      options: [
        "20 days",
        "40 days",
        "60 days",
        "80 days"
      ],
      correctAnswerIndex: 2,
      explanation: "Combined rate = 1/15 per day. Team rate = 1/20 per day. Leader rate = 1/15 - 1/20 = (4 - 3)/60 = 1/60 per day. Therefore, the leader alone takes 60 days. Correct answer is (C).",
      topic: "Work Rate"
    },
    {
      id: "hw_gat_35",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 33,
      questionType: "single_choice",
      questionText: "Evaluate the telescoping product: (1 - 1/2)(1 - 1/3)(1 - 1/4) ··· (1 - 1/x)",
      options: [
        "x",
        "x - 1",
        "1/x",
        "1 / (1 - x)"
      ],
      correctAnswerIndex: 2,
      explanation: "Rewrite terms: (1/2) × (2/3) × (3/4) × ··· × ((x-1)/x). In this telescoping product, all intermediate numerators and denominators cancel out, leaving only the first numerator (1) divided by the last denominator (x), yielding 1/x. Correct answer is (C).",
      topic: "Telescoping Products"
    },
    {
      id: "hw_gat_37",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 34,
      questionType: "single_choice",
      questionText: "The value of (256)^0.16 × (256)^0.09 is:",
      options: [
        "64",
        "8",
        "4",
        "16"
      ],
      correctAnswerIndex: 2,
      explanation: "Using exponent product rule: a^m × a^n = a^(m+n). (256)^(0.16 + 0.09) = (256)^0.25 = (256)^(1/4) = 4 (since 4⁴ = 256). Correct answer is (C).",
      topic: "Exponent Rules"
    },

    // --- PART 3: COORDINATE & PLANE GEOMETRY & DIAGRAMS ---
    {
      id: "hw_gat_geom_kite_01",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 35,
      questionType: "single_choice",
      questionText: "In the geometric kite shown below, the lengths of the two perpendicular diagonals are d₁ = 16 cm and d₂ = 9 cm. What is the total area of the kite?",
      graphData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 220" class="w-full h-auto max-h-60 mx-auto">
  <polygon points="40,110 130,25 390,110 130,195" fill="#f0fdf4" stroke="#15803d" stroke-width="3" stroke-linejoin="round" />
  <line x1="40" y1="110" x2="390" y2="110" stroke="#d97706" stroke-width="2.5" />
  <line x1="130" y1="25" x2="130" y2="195" stroke="#d97706" stroke-width="2.5" />
  <path d="M 130,100 L 140,100 L 140,110" fill="none" stroke="#d97706" stroke-width="1.5" />
  <text x="75" y="60" font-family="serif" font-size="16" font-weight="bold" fill="#1e293b">b</text>
  <text x="75" y="170" font-family="serif" font-size="16" font-weight="bold" fill="#1e293b">b</text>
  <text x="260" y="58" font-family="serif" font-size="16" font-weight="bold" fill="#1e293b">c</text>
  <text x="260" y="175" font-family="serif" font-size="16" font-weight="bold" fill="#1e293b">c</text>
  <text x="230" y="102" font-family="serif" font-size="15" font-weight="bold" fill="#d97706">d₁ = 16 cm</text>
  <text x="138" y="155" font-family="serif" font-size="15" font-weight="bold" fill="#d97706">d₂ = 9 cm</text>
</svg>`,
      imageCaption: "Figure 3.1: Geometric Kite with perpendicular diagonals d₁ and d₂",
      options: [
        "144 sq.cm",
        "72 sq.cm",
        "108 sq.cm",
        "36 sq.cm"
      ],
      correctAnswerIndex: 1,
      explanation: "The area of any kite with perpendicular diagonals d₁ and d₂ is given by: A = 1/2 (d₁ × d₂). Substituting: A = 1/2 (16 × 9) = 1/2 (144) = 72 sq.cm. Correct answer is (B).",
      topic: "Plane Geometry - Kite Area"
    },
    {
      id: "hw_gat_geom_trap_02",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 36,
      questionType: "single_choice",
      questionText: "In the trapezoid shown below, the parallel bases have lengths b₁ = 8 cm and b₂ = 14 cm, and the perpendicular height is h = 6 cm. What is the area of the trapezoid?",
      graphData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" class="w-full h-auto max-h-60 mx-auto">
  <polygon points="90,40 270,40 360,160 40,160" fill="#f0fdf4" stroke="#15803d" stroke-width="3" stroke-linejoin="round" />
  <line x1="90" y1="40" x2="90" y2="160" stroke="#d97706" stroke-width="2" stroke-dasharray="4 3" />
  <path d="M 90,150 L 100,150 L 100,160" fill="none" stroke="#d97706" stroke-width="1.5" />
  <text x="180" y="30" font-family="serif" font-size="15" font-weight="bold" fill="#1e293b" text-anchor="middle">b₁ = 8 cm</text>
  <text x="200" y="182" font-family="serif" font-size="15" font-weight="bold" fill="#1e293b" text-anchor="middle">b₂ = 14 cm</text>
  <text x="50" y="105" font-family="serif" font-size="14" font-weight="bold" fill="#d97706">h = 6 cm</text>
</svg>`,
      imageCaption: "Figure 3.2: Trapezoid with parallel bases b₁, b₂ and perpendicular altitude h",
      options: [
        "66 sq.cm",
        "132 sq.cm",
        "84 sq.cm",
        "44 sq.cm"
      ],
      correctAnswerIndex: 0,
      explanation: "Area of a trapezoid A = 1/2 (b₁ + b₂)h = 1/2 (8 + 14) × 6 = 1/2 (22) × 6 = 11 × 6 = 66 sq.cm. Correct answer is (A).",
      topic: "Plane Geometry - Trapezoid"
    },
    {
      id: "hw_gat_geom_para_03",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 37,
      questionType: "single_choice",
      questionText: "In the parallelogram ABCD shown below, two consecutive interior angles are 3x and 2x, and y is the exterior angle at vertex B. What are the values of x and y?",
      graphData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 200" class="w-full h-auto max-h-60 mx-auto">
  <line x1="280" y1="160" x2="330" y2="40" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3" />
  <line x1="280" y1="160" x2="310" y2="80" stroke="#15803d" stroke-width="2.5" />
  <line x1="310" y1="80" x2="330" y2="40" stroke="#6366f1" stroke-width="2" />
  <polygon points="80,160 300,160 340,60 120,60" fill="#f0fdf4" stroke="#15803d" stroke-width="3" stroke-linejoin="round" />
  <text x="65" y="170" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">D</text>
  <text x="110" y="50" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">A</text>
  <text x="350" y="60" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">B</text>
  <text x="305" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">C</text>
  <text x="135" y="80" font-family="serif" font-size="15" font-weight="bold" fill="#7c3aed">3x</text>
  <text x="95" y="150" font-family="serif" font-size="15" font-weight="bold" fill="#7c3aed">2x</text>
  <text x="315" y="55" font-family="serif" font-size="15" font-weight="bold" fill="#2563eb">y</text>
</svg>`,
      imageCaption: "Figure 3.3: Parallelogram ABCD with consecutive angles 3x, 2x and exterior angle y",
      options: [
        "x = 36°, y = 72°",
        "x = 30°, y = 60°",
        "x = 36°, y = 108°",
        "x = 45°, y = 90°"
      ],
      correctAnswerIndex: 0,
      explanation: "In any parallelogram, consecutive interior angles are supplementary: 3x + 2x = 180° => 5x = 180° => x = 36°. Angle at A = 3(36°) = 108°, and angle at D = 2(36°) = 72°. Opposite angle at B = 72°. Exterior angle y = 180° - 108° = 72°. Thus x = 36° and y = 72°. Correct answer is (A).",
      topic: "Parallelograms and Angles"
    },
    {
      id: "hw_gat_geom_shaded_04",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 38,
      questionType: "single_choice",
      questionText: "In the right-angled composite figure shown below, what is the area of the blue shaded triangular region?",
      graphData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 200" class="w-full h-auto max-h-60 mx-auto">
  <polygon points="50,160 310,160 310,40" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
  <polygon points="50,160 310,40 310,100" fill="#bae6fd" stroke="#0284c7" stroke-width="2.5" />
  <polygon points="50,160 310,160 310,100" fill="#ffffff" stroke="#94a3b8" stroke-width="2" />
  <path d="M 295,160 L 295,145 L 310,145" fill="none" stroke="#64748b" stroke-width="1.5" />
  <text x="180" y="180" font-family="serif" font-size="14" font-weight="bold" fill="#1e293b" text-anchor="middle">4 cm</text>
  <text x="325" y="135" font-family="serif" font-size="14" font-weight="bold" fill="#1e293b">3 cm</text>
  <text x="325" y="70" font-family="serif" font-size="14" font-weight="bold" fill="#1e293b">5 cm</text>
</svg>`,
      imageCaption: "Figure 3.4: Right-angled composite triangle with shaded area",
      options: [
        "16 sq.cm",
        "6 sq.cm",
        "10 sq.cm",
        "4 sq.cm"
      ],
      correctAnswerIndex: 3,
      explanation: "Area of the total outer right triangle = 1/2 × base × total height = 1/2 × 4 × 5 = 10 sq.cm. Area of the lower unshaded right triangle = 1/2 × 4 × 3 = 6 sq.cm. Shaded Area = Total Area - Unshaded Area = 10 - 6 = 4 sq.cm (or 1/2 × 4 × (5 - 3) = 4 sq.cm). Correct answer is (D).",
      topic: "Composite Geometry - Shaded Areas"
    },
    {
      id: "hw_gat_geom_circles_05",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 39,
      questionType: "single_choice",
      questionText: "In the figure below, ABCD is a rectangle containing three circles whose centers lie on line segment EG parallel to AB. The two smaller circles have equal radius which is half the radius of the larger center circle. If the area of each smaller circle is π cm², what is the area of the shaded region outside the circles?",
      graphData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" class="w-full h-auto max-h-60 mx-auto">
  <rect x="50" y="30" width="300" height="140" fill="#cbd5e1" stroke="#334155" stroke-width="2.5" rx="2" />
  <line x1="40" y1="100" x2="360" y2="100" stroke="#94a3b8" stroke-dasharray="4 3" stroke-width="1.5" />
  <circle cx="85" cy="100" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="2" />
  <circle cx="85" cy="100" r="2.5" fill="#e11d48" />
  <text x="85" y="105" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e11d48" text-anchor="middle">E</text>
  <circle cx="200" cy="100" r="70" fill="#ffffff" stroke="#1e293b" stroke-width="2.5" />
  <circle cx="200" cy="100" r="3" fill="#e11d48" />
  <text x="200" y="105" font-family="sans-serif" font-size="13" font-weight="bold" fill="#e11d48" text-anchor="middle">F</text>
  <circle cx="315" cy="100" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="2" />
  <circle cx="315" cy="100" r="2.5" fill="#e11d48" />
  <text x="315" y="105" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e11d48" text-anchor="middle">G</text>
  <text x="38" y="32" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">D</text>
  <text x="38" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">A</text>
  <text x="355" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">B</text>
  <text x="355" y="32" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">C</text>
</svg>`,
      imageCaption: "Figure 3.5: Rectangle ABCD containing three tangent circles",
      options: [
        "32 − 4π",
        "32 − 6π",
        "24 − 4π",
        "24 − 6π"
      ],
      correctAnswerIndex: 1,
      explanation: "Small circle radius r = 1 cm (Area = π). Large circle radius R = 2 cm (Area = 4π). Rectangle height = 2R = 4 cm. Rectangle length = 2r + 2R + 2r = 2 + 4 + 2 = 8 cm. Rectangle Area = 8 × 4 = 32 cm². Sum of areas of all 3 circles = π + 4π + π = 6π. Shaded region area = 32 - 6π. Correct answer is (B).",
      topic: "Circles and Rectangles"
    },
    {
      id: "hw_gat_45",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 40,
      questionType: "single_choice",
      questionText: "The distance between the coordinate points P(1, 2) and Q(4, 6) in the Cartesian plane is:",
      options: [
        "3",
        "4",
        "5",
        "6"
      ],
      correctAnswerIndex: 2,
      explanation: "Distance formula d = √((x2 - x1)² + (y2 - y1)²) = √((4 - 1)² + (6 - 2)²) = √(3² + 4²) = √(9 + 16) = √25 = 5. Correct answer is (C).",
      topic: "Coordinate Geometry - Distance"
    },
    {
      id: "hw_gat_47",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 41,
      questionType: "single_choice",
      questionText: "What is the point of intersection of the linear graph 2x + 3y = 6 and the x-axis?",
      options: [
        "(0, 2)",
        "(2, 0)",
        "(3, 0)",
        "(0, 3)"
      ],
      correctAnswerIndex: 2,
      explanation: "At the intersection with the x-axis, the y-coordinate is 0 (y = 0). Substituting y = 0 into 2x + 3(0) = 6 gives 2x = 6 => x = 3. Thus the point is (3, 0). Correct answer is (C).",
      topic: "Coordinate Geometry - Intercepts"
    },
    {
      id: "hw_gat_54",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 42,
      questionType: "single_choice",
      questionText: "What is the area of a circle whose radius is equal to the diagonal of a square of area 9?",
      options: [
        "8π",
        "18π",
        "3π",
        "36π"
      ],
      correctAnswerIndex: 1,
      explanation: "Area of square = s² = 9 => side s = 3. Diagonal of square d = s√2 = 3√2. Radius of circle r = 3√2. Area of circle = πr² = π(3√2)² = π(9 × 2) = 18π. Correct answer is (B).",
      topic: "Geometry - Circles and Squares"
    },
    {
      id: "hw_gat_56",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 43,
      questionType: "single_choice",
      questionText: "The circumference of a circle is xπ units, and the area of the circle is yπ square units. If x = y, then what is the radius of the circle?",
      options: [
        "1",
        "2",
        "3π",
        "2π"
      ],
      correctAnswerIndex: 1,
      explanation: "Circumference = 2πr = xπ => x = 2r. Area = πr² = yπ => y = r². Given x = y => 2r = r² => r(r - 2) = 0. Since radius must be positive, r = 2. Correct answer is (B).",
      topic: "Geometry - Circles"
    },
    {
      id: "hw_gat_57",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 44,
      questionType: "single_choice",
      questionText: "What is the volume of a 3D cube whose total surface area is 294?",
      options: [
        "125",
        "216",
        "294",
        "343"
      ],
      correctAnswerIndex: 3,
      explanation: "Total surface area of a cube = 6s² = 294 => s² = 49 => side length s = 7. Volume of the cube = s³ = 7³ = 343. Correct answer is (D).",
      topic: "3D Mensuration"
    },

    // --- PART 4: DATA INTERPRETATION & STATISTICS ---
    {
      id: "hw_gat_65",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 45,
      questionType: "single_choice",
      passage: "For questions 45–46, refer to the following discrete dataset:\nValues: 1, 2, 3, 5, 2, 2, 6, 3",
      questionText: "What is the arithmetic mean of the given dataset?",
      options: [
        "1",
        "2",
        "3",
        "1.5"
      ],
      correctAnswerIndex: 2,
      explanation: "Number of observations n = 8. Sum = 1 + 2 + 3 + 5 + 2 + 2 + 6 + 3 = 24. Mean = 24 / 8 = 3. Correct answer is (C).",
      topic: "Descriptive Statistics - Mean"
    },
    {
      id: "hw_gat_66",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 46,
      questionType: "single_choice",
      passage: "For questions 45–46, refer to the following discrete dataset:\nValues: 1, 2, 3, 5, 2, 2, 6, 3",
      questionText: "What is the median of the dataset?",
      options: [
        "3.5",
        "2",
        "3",
        "2.5"
      ],
      correctAnswerIndex: 3,
      explanation: "Sort data in ascending order: 1, 2, 2, 2, 3, 3, 5, 6. Since n = 8 (even), median is the average of the 4th and 5th terms: (2 + 3) / 2 = 2.5. Correct answer is (D).",
      topic: "Descriptive Statistics - Median"
    },
    {
      id: "hw_gat_68",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 47,
      questionType: "single_choice",
      passage: "For questions 47–48, refer to the following frequency distribution:\n\n| Value (x) | 10 | 20 | 30 | 40 | 50 | 60 |\n| Frequency (f) | 4 | 5 | 2 | 4 | 3 | 1 |",
      questionText: "What is the weighted mean of the given distribution?",
      options: [
        "30",
        "40",
        "50",
        "60"
      ],
      correctAnswerIndex: 0,
      explanation: "Total frequency n = 4 + 5 + 2 + 4 + 3 + 1 = 19. Sum of (f × x) = (10×4) + (20×5) + (30×2) + (40×4) + (50×3) + (60×1) = 40 + 100 + 60 + 160 + 150 + 60 = 570. Mean = 570 / 19 = 30. Correct answer is (A).",
      topic: "Frequency Table Mean"
    },
    {
      id: "hw_gat_69",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 48,
      questionType: "single_choice",
      passage: "For questions 47–48, refer to the following frequency distribution:\n\n| Value (x) | 10 | 20 | 30 | 40 | 50 | 60 |\n| Frequency (f) | 4 | 5 | 2 | 4 | 3 | 1 |",
      questionText: "What is the mode and arithmetic range of the given distribution?",
      options: [
        "Mode = 20, Range = 50",
        "Mode = 30, Range = 40",
        "Mode = 20, Range = 60",
        "Mode = 5, Range = 50"
      ],
      correctAnswerIndex: 0,
      explanation: "Mode is the value with highest frequency: f=5 occurs at x=20, so Mode = 20. Arithmetic range is Max - Min = 60 - 10 = 50. Correct answer is (A).",
      topic: "Mode and Range"
    },
    {
      id: "hw_gat_92",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 49,
      questionType: "single_choice",
      questionText: "If two fair coins are tossed simultaneously, what is the probability that at least one head turns up?",
      options: [
        "1/2",
        "3/4",
        "1/4",
        "2/3"
      ],
      correctAnswerIndex: 1,
      explanation: "Sample space S = {HH, HT, TH, TT} (4 outcomes). Outcomes with at least one head = {HH, HT, TH} (3 outcomes). Probability = 3/4. Correct answer is (B).",
      topic: "Probability"
    },
    {
      id: "hw_gat_99",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 50,
      questionType: "single_choice",
      questionText: "A committee of 3 people is to be chosen from among 8 members of a club. How many such distinct committees can be formed?",
      options: [
        "6",
        "12",
        "56",
        "42"
      ],
      correctAnswerIndex: 2,
      explanation: "Combination formula 8C3 = 8! / (3! × 5!) = (8 × 7 × 6) / (3 × 2 × 1) = 56. Correct answer is (C).",
      topic: "Combinations"
    },

    // --- PART 5: QUANTITATIVE COMPARISONS (COLUMN A VS COLUMN B) ---
    {
      id: "hw_gat_100",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 51,
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
      explanation: "Since m and n are negative integers: Column A = (negative) + (negative) = negative number. Column B = (negative) / (negative) = positive number. Any positive real number is strictly greater than any negative real number. Therefore, Column B is always greater.",
      topic: "Quantitative Comparison - Signed Integers"
    },
    {
      id: "hw_gat_101",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 52,
      questionType: "quantitative_comparison",
      questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
      columnA: "2/3 + 4/5",
      columnB: "3/2",
      options: [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      correctAnswerIndex: 1,
      explanation: "Column A: 2/3 + 4/5 = (10 + 12)/15 = 22/15 ≈ 1.4667. Column B: 3/2 = 1.5 = 22.5/15. Since 22.5/15 > 22/15, Column B is greater.",
      topic: "Quantitative Comparison - Fractions"
    },
    {
      id: "hw_gat_102",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 53,
      questionType: "quantitative_comparison",
      questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
      premise: "a, b, c and d are real numbers and a/b = c/d (with b ≠ 0, d ≠ 0)",
      columnA: "ad",
      columnB: "bc",
      options: [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      correctAnswerIndex: 2,
      explanation: "By the cross-multiplication property of proportions, if a/b = c/d, then ad = bc. Thus both quantities are identically equal.",
      topic: "Quantitative Comparison - Proportions"
    },
    {
      id: "hw_gat_103",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 54,
      questionType: "quantitative_comparison",
      questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
      premise: "x is the perimeter of a rectangle with area 54 cm² and length 6 cm.",
      columnA: "x",
      columnB: "15",
      options: [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      correctAnswerIndex: 0,
      explanation: "Width of rectangle w = Area / Length = 54 / 6 = 9 cm. Perimeter x = 2 × (length + width) = 2 × (6 + 9) = 2 × 15 = 30 cm. Column A = 30, Column B = 15. Column A is greater.",
      topic: "Quantitative Comparison - Rectangles"
    },
    {
      id: "hw_gat_105",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 55,
      questionType: "quantitative_comparison",
      questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
      columnA: "249² − 248²",
      columnB: "1",
      options: [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      correctAnswerIndex: 0,
      explanation: "Using difference of squares: a² - b² = (a - b)(a + b). Column A = (249 - 248)(249 + 248) = 1 × 497 = 497. Column B = 1. Since 497 > 1, Column A is greater.",
      topic: "Quantitative Comparison - Difference of Squares"
    },
    {
      id: "hw_gat_106",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 56,
      questionType: "quantitative_comparison",
      questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
      columnA: "2¹⁷ − 2¹⁶",
      columnB: "2¹⁶",
      options: [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      correctAnswerIndex: 2,
      explanation: "Factor Column A: 2¹⁷ - 2¹⁶ = 2¹⁶(2¹ - 1) = 2¹⁶(1) = 2¹⁶. Column B = 2¹⁶. The two quantities are equal.",
      topic: "Quantitative Comparison - Exponents"
    },
    {
      id: "hw_gat_108",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 57,
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
      explanation: "Subtract Column B from Column A: (x² + y²) - 2xy = (x - y)². Since x < y, x - y ≠ 0, and the square of any non-zero real number is strictly positive: (x - y)² > 0 => x² + y² > 2xy. Column A is greater.",
      topic: "Quantitative Comparison - Algebraic Inequalities"
    },
    {
      id: "hw_gat_113",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 58,
      questionType: "quantitative_comparison",
      questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
      premise: "a^k = 9 and 3k = 2.",
      columnA: "a",
      columnB: "27",
      options: [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      correctAnswerIndex: 2,
      explanation: "From 3k = 2 => k = 2/3. Then a^(2/3) = 9 = 3². Raise both sides to the power of 3/2: a = (3²)^(3/2) = 3³ = 27. Column A = 27, Column B = 27. The two quantities are equal.",
      topic: "Quantitative Comparison - Fractional Exponents"
    },
    {
      id: "hw_gat_116",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 59,
      questionType: "quantitative_comparison",
      questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
      columnA: "12! / (9! × 3!)",
      columnB: "220",
      options: [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      correctAnswerIndex: 2,
      explanation: "Column A = 12C3 = (12 × 11 × 10) / (3 × 2 × 1) = 1320 / 6 = 220. Column B = 220. The two quantities are equal.",
      topic: "Quantitative Comparison - Factorials"
    },
    {
      id: "hw_gat_123",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 60,
      questionType: "quantitative_comparison",
      questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
      premise: "2(a + 1) = 3(b + 1)",
      columnA: "2a",
      columnB: "3b",
      options: [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      correctAnswerIndex: 0,
      explanation: "Expand the given equation: 2a + 2 = 3b + 3 => 2a - 3b = 1 => 2a = 3b + 1. Since 2a is 1 more than 3b, 2a > 3b. Column A is greater.",
      topic: "Quantitative Comparison - Linear Relations"
    },
    {
      id: "hw_gat_124",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 61,
      questionType: "quantitative_comparison",
      questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
      columnA: "14! + 15! + 16!",
      columnB: "16!",
      options: [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      correctAnswerIndex: 0,
      explanation: "Column A is 16! + (14! + 15!). Since factorials of positive integers are strictly positive, 14! + 15! > 0, so Column A > 16!. Column A is greater.",
      topic: "Quantitative Comparison - Factorial Sums"
    },
    {
      id: "hw_gat_126",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 62,
      questionType: "quantitative_comparison",
      questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
      premise: "64^x = 16^y (where x, y ≠ 0)",
      columnA: "y / x",
      columnB: "2",
      options: [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      correctAnswerIndex: 1,
      explanation: "Express with common base 2 or 4: (4³)^x = (4²)^y => 4^(3x) = 4^(2y) => 3x = 2y => y/x = 3/2 = 1.5. Column A = 1.5, Column B = 2. Since 1.5 < 2, Column B is greater.",
      topic: "Quantitative Comparison - Exponential Equations"
    },
    {
      id: "hw_gat_127",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 63,
      questionType: "quantitative_comparison",
      questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
      premise: "Let 0 < x < y < 5 and x and y are integers.",
      columnA: "x − y",
      columnB: "-1",
      options: [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      correctAnswerIndex: 3,
      explanation: "Since x and y are distinct integers with x < y, the maximum value of x - y is -1 (e.g. if x=1, y=2 => x-y = -1). If x=1, y=3 => x-y = -2. So x - y can be equal to -1 or less than -1 (-2, -3). Hence the relationship cannot be uniquely determined.",
      topic: "Quantitative Comparison - Integer Constraints"
    },
    {
      id: "hw_gat_130",
      examId: "hawassa_gat_quant_reasoning_2024",
      number: 64,
      questionType: "quantitative_comparison",
      questionText: "Directions: Compare Column A and Column B and select the correct alternative.",
      premise: "Let (x + 2y)(x − 2y) = 2.",
      columnA: "x² − 4y²",
      columnB: "2",
      options: [
        "Quantity in Column A is greater",
        "Quantity in Column B is greater",
        "The two quantities are equal",
        "The relationship cannot be determined from the information given"
      ],
      correctAnswerIndex: 2,
      explanation: "Expanding the left side: (x + 2y)(x - 2y) = x² - 4y². Therefore x² - 4y² = 2. Column A = 2, Column B = 2. The two quantities are equal.",
      topic: "Quantitative Comparison - Algebraic Factorization"
    }
  ]
};
