import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { CodingQuestion } from '../models/Question.js';

const questions = [
  {
    questionNo: 294,
    slug: 'compare-two-prices-and-print-maximum',
    title: 'Compare Two Prices – Find the Maximum',
    description:
      'A customer is comparing prices of two products in an online store. Given the prices of two items, help the customer find which one is more expensive. If both are equal, print either price. The store manager uses this to identify the costlier product for promotional offers. This problem was asked in TCS NQT June 2026 shift.',
    inputFormat: 'Two space-separated integers: price1 and price2.',
    outputFormat: 'The maximum price among the two.',
    constraints: '1 ≤ price1, price2 ≤ 10⁶',
    difficulty: 'Easy',
    topic: 'Math / Conditionals',
    tags: ['math', 'conditional', 'max'],
    company: ['TCS'],
    examDate: '2026-06',
    examples: [
      { input: '150 200', output: '200', explanation: '200 is greater than 150.' },
      { input: '100 100', output: '100', explanation: 'Both are equal, print either.' },
      { input: '75 50',  output: '75',  explanation: '75 is greater than 50.' }
    ],
    hints: [
      'Use if-else or Math.max() function.',
      'Simply compare the two numbers and print the larger one.',
      'If equal, print the same value.'
    ],
    visibleTestCases: [
      { input: '150 200', output: '200' },
      { input: '100 100', output: '100' },
      { input: '75 50',  output: '75'  }
    ],
    hiddenTestCases: [
      { input: '1 2',           output: '2'       },
      { input: '999999 1',      output: '999999'  },
      { input: '500 500',       output: '500'     },
      { input: '1 1000000',     output: '1000000' },
      { input: '10 20',         output: '20'      }
    ],
    languagesSupported: ['cpp', 'java', 'python'],
    timeLimit: 2,
    memoryLimit: 256,
    timerDuration: 20,
    timerEnabled: true,
    totalSubmissions: 0,
    totalAccepted: 0,
    status: 'active',
    // Base schema fields
    domain: 'coding',
    section: 'programming',
    kind: 'CodingQuestion'
  },
  {
    questionNo: 295,
    slug: 'postfix-evaluation-arithmetic-expression',
    title: 'Postfix Evaluation (Reverse Polish Notation)',
    description:
      "A calculator program needs to process arithmetic expressions written in postfix notation (Reverse Polish Notation), commonly used in stack-based calculations. Given an array of strings representing a valid postfix expression, evaluate it and return the integer result. The operators supported are '+', '-', '*', '/', and '^' (exponentiation). Division uses floor division (toward negative infinity). It is guaranteed that the result and all intermediate calculations fit in a 32-bit signed integer. This problem was asked in TCS NQT 2026.",
    inputFormat:
      'First line: integer N (size of array). Second line: N space-separated strings representing the postfix expression.',
    outputFormat: 'A single integer: the evaluated result.',
    constraints:
      "3 ≤ N ≤ 10³, Each token is either an operator ('+', '-', '*', '/', '^') or an integer in the range [-10⁴, 10⁴].",
    difficulty: 'Medium',
    topic: 'Stack',
    tags: ['stack', 'postfix', 'expression-evaluation'],
    company: ['TCS'],
    examDate: '2026-06',
    examples: [
      { input: '7\n2 3 1 * + 9 -', output: '-4', explanation: 'Expression: 2 + (3 * 1) - 9 = 5 - 9 = -4.' },
      { input: '5\n2 3 ^ 1 +',     output: '9',  explanation: '2^3 + 1 = 8 + 1 = 9.'                     },
      { input: '5\n10 5 / 3 +',    output: '5',  explanation: '(10 / 5) + 3 = 2 + 3 = 5.'               }
    ],
    hints: [
      'Use a stack of integers to store operands.',
      'Iterate through each token: if it is a number, push it onto the stack. If it is an operator, pop the top two operands (right operand first, then left operand), apply the operator, and push the result back.',
      'For exponentiation, use a fast exponentiation method or Math.pow and convert to integer; note that the result is guaranteed to fit.',
      'For division, use floor division (integer division rounding toward negative infinity). In Python, "//" does that. In Java, use Math.floorDiv(a, b) for integers.',
      'At the end, the top of the stack contains the final result.'
    ],
    visibleTestCases: [
      { input: '7\n2 3 1 * + 9 -', output: '-4' },
      { input: '5\n2 3 ^ 1 +',     output: '9'  },
      { input: '5\n10 5 / 3 +',    output: '5'  }
    ],
    hiddenTestCases: [
      { input: '3\n4 5 +',                          output: '9'  },
      { input: '9\n5 1 2 + 4 * + 3 -',             output: '14' },
      { input: '5\n-10 3 / -2 *',                   output: '8'  },
      { input: '5\n2 3 ^ 4 +',                      output: '12' },
      { input: '13\n5 1 2 + 4 * + 3 - 4 2 ^ +',   output: '30' }
    ],
    languagesSupported: ['cpp', 'java', 'python'],
    timeLimit: 2,
    memoryLimit: 256,
    timerDuration: 30,
    timerEnabled: true,
    totalSubmissions: 0,
    totalAccepted: 0,
    status: 'active',
    // Base schema fields
    domain: 'coding',
    section: 'programming',
    kind: 'CodingQuestion'
  }
];

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not set in .env');

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected.\n');

    for (const q of questions) {
      const exists = await CodingQuestion.findOne({ questionNo: q.questionNo });
      if (exists) {
        console.log(`⚠️  Question #${q.questionNo} already exists – skipping.`);
        continue;
      }
      const doc = await CodingQuestion.create(q);
      console.log(`✅  Question #${doc.questionNo} "${doc.title}" inserted (id: ${doc._id})`);
    }

    await mongoose.disconnect();
    console.log('\nDone. Connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();
