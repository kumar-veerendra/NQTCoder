import MockTest from '../models/MockTest.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { runLocalCode, runLocalCodeMulti } from '../utils/localRunner.js';
import { runJudge0Code } from '../utils/judge0Runner.js';
import { compilerQueue } from '../utils/compilerQueue.js';

/**
 * Helper function to run code against test cases (visible + hidden)
 */
const runTestCases = async (question, code, language) => {
  const allTestCases = [...question.visibleTestCases, ...question.hiddenTestCases];
  const totalCount = allTestCases.length;
  const inputs = allTestCases.map(tc => tc.input);
  let passedCount = 0;
  let firstErrorMessage = '';
  
  const executeCodeMulti = async (inputs, timeLimit) => {
    const mode = process.env.RUN_MODE || 'local';
    if (mode === 'judge0') {
      const promises = inputs.map(input => runJudge0Code(code, language, input, timeLimit));
      return await Promise.all(promises);
    } else {
      const multiRes = await runLocalCodeMulti(code, language, inputs, timeLimit);
      if (multiRes.status === 'Compilation Error') {
        return {
          status: 'Compilation Error',
          error: multiRes.error
        };
      }
      return multiRes.results;
    }
  };

  const runResults = await executeCodeMulti(inputs, question.timeLimit);

  if (runResults.status === 'Compilation Error') {
    return { passedCount: 0, totalCount, errorMessage: runResults.error };
  }

  for (let i = 0; i < totalCount; i++) {
    const tc = allTestCases[i];
    const runResult = runResults[i];

    if (runResult.status === 'Time Limit Exceeded' || runResult.status === 'Runtime Error') {
      firstErrorMessage = runResult.error || runResult.status;
      break;
    }

    const cleanExpected = runResult.stdout ? runResult.stdout.toString().replace(/\r/g, '').trim() : '';
    const cleanExpectedOutput = tc.output ? tc.output.toString().replace(/\r/g, '').trim() : '';
    if (cleanExpected === cleanExpectedOutput) {
      passedCount++;
    } else {
      // Mark it as a failed test case
      if (!firstErrorMessage) {
        firstErrorMessage = 'Wrong Answer';
      }
    }
  }

  return { passedCount, totalCount, errorMessage: firstErrorMessage };
};

/**
 * @desc    Start a new mock test session
 * @route   POST /api/mocktests/start
 * @access  Private
 */
export const startMockTest = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if there is already an active mock test for this user
    const existingActive = await MockTest.findOne({ user: userId, status: 'active' }).populate('q1 q2', '-hiddenTestCases');
    if (existingActive) {
      return res.status(200).json(existingActive);
    }

    // Get all previously faced questions in mock tests
    const pastTests = await MockTest.find({ user: userId }).select('q1 q2');
    const facedIds = pastTests.flatMap(t => [t.q1.toString(), t.q2.toString()]);

    // Select Q1: Easy/Medium difficulty
    let q1Candidates = await Question.find({
      difficulty: { $in: ['Easy', 'Medium'] },
      _id: { $nin: facedIds }
    });

    if (q1Candidates.length === 0) {
      // Fallback: allow repeats if all have been faced
      q1Candidates = await Question.find({ difficulty: { $in: ['Easy', 'Medium'] } });
    }

    const q1 = q1Candidates[Math.floor(Math.random() * q1Candidates.length)];

    if (!q1) {
      return res.status(404).json({ message: 'No suitable Easy/Medium questions found to seed Q1' });
    }

    // Select Q2: Medium/Hard difficulty (must be distinct from Q1)
    let q2Candidates = await Question.find({
      difficulty: { $in: ['Medium', 'Hard'] },
      _id: { $nin: [...facedIds, q1._id.toString()] }
    });

    if (q2Candidates.length === 0) {
      // Fallback: allow repeats excluding Q1
      q2Candidates = await Question.find({
        difficulty: { $in: ['Medium', 'Hard'] },
        _id: { $ne: q1._id }
      });
    }

    const q2 = q2Candidates[Math.floor(Math.random() * q2Candidates.length)];

    if (!q2) {
      return res.status(404).json({ message: 'No suitable Medium/Hard questions found to seed Q2' });
    }

    const mockTest = await MockTest.create({
      user: userId,
      q1: q1._id,
      q2: q2._id,
      q1Status: 'started',
      q1StartedAt: Date.now(),
      q2Status: 'pending'
    });

    // Populate metadata for frontend
    const populated = await MockTest.findById(mockTest._id).populate('q1 q2', '-hiddenTestCases');
    res.status(201).json(populated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get the current active mock test session
 * @route   GET /api/mocktests/current
 * @access  Private
 */
export const getCurrentMockTest = async (req, res) => {
  try {
    const activeTest = await MockTest.findOne({ user: req.user._id, status: 'active' })
      .populate('q1 q2', '-hiddenTestCases');
      
    res.json(activeTest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Submit mock test question code (queued execution)
 * @route   POST /api/mocktests/:id/submit
 * @access  Private
 */
export const submitMockTestQuestion = async (req, res) => {
  const { questionNumber, code, language, timeSpent } = req.body;
  const mockTestId = req.params.id;

  if (!questionNumber || code === undefined || !language) {
    return res.status(400).json({ message: 'Question number, code, and language are required' });
  }

  try {
    const mockTest = await MockTest.findOne({ _id: mockTestId, user: req.user._id, status: 'active' });
    if (!mockTest) {
      return res.status(404).json({ message: 'Active mock test not found or already completed.' });
    }

    const targetQuestionId = questionNumber === 1 ? mockTest.q1 : mockTest.q2;
    const question = await Question.findById(targetQuestionId);
    if (!question) {
      return res.status(404).json({ message: 'Target question not found.' });
    }

    // Queue-based execution wrapper
    const runFn = async () => {
      const evaluation = await runTestCases(question, code, language);
      const score = evaluation.totalCount > 0 
        ? Math.round((evaluation.passedCount / evaluation.totalCount) * 100) 
        : 0;

      const user = await User.findById(req.user._id);

      if (questionNumber === 1) {
        mockTest.q1Status = 'completed';
        mockTest.q1Code = code;
        mockTest.q1Language = language;
        mockTest.q1PassedCount = evaluation.passedCount;
        mockTest.q1TotalCount = evaluation.totalCount;
        mockTest.q1Score = score;
        mockTest.q1TimeSpent = timeSpent || 0;
        
        // Unlock Question 2
        mockTest.q2Status = 'started';
        mockTest.q2StartedAt = Date.now();

        if (score === 100 && user && !user.solvedQuestions.includes(mockTest.q1.toString())) {
          user.solvedQuestions.push(mockTest.q1);
          if (!user.solvedCount) user.solvedCount = { easy: 0, medium: 0, hard: 0 };
          const diff = question.difficulty.toLowerCase();
          if (diff === 'easy') user.solvedCount.easy += 1;
          if (diff === 'medium') user.solvedCount.medium += 1;
          if (diff === 'hard') user.solvedCount.hard += 1;
          await user.save();
        }
      } else {
        mockTest.q2Status = 'completed';
        mockTest.q2Code = code;
        mockTest.q2Language = language;
        mockTest.q2PassedCount = evaluation.passedCount;
        mockTest.q2TotalCount = evaluation.totalCount;
        mockTest.q2Score = score;
        mockTest.q2TimeSpent = timeSpent || 0;

        // Finish mock test
        mockTest.status = 'completed';
        mockTest.totalScore = mockTest.q1Score + score;
        mockTest.completedAt = Date.now();

        if (score === 100 && user && !user.solvedQuestions.includes(mockTest.q2.toString())) {
          user.solvedQuestions.push(mockTest.q2);
          if (!user.solvedCount) user.solvedCount = { easy: 0, medium: 0, hard: 0 };
          const diff = question.difficulty.toLowerCase();
          if (diff === 'easy') user.solvedCount.easy += 1;
          if (diff === 'medium') user.solvedCount.medium += 1;
          if (diff === 'hard') user.solvedCount.hard += 1;
          await user.save();
        }
      }

      await mockTest.save();
      return mockTest;
    };

    const jobStatus = compilerQueue.enqueue(runFn);
    res.status(202).json(jobStatus);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Record focus switch violation (blurred screen)
 * @route   POST /api/mocktests/:id/violation
 * @access  Private
 */
export const recordMockTestViolation = async (req, res) => {
  try {
    const mockTest = await MockTest.findOne({ _id: req.params.id, user: req.user._id, status: 'active' });
    if (!mockTest) {
      return res.status(404).json({ message: 'Active mock test not found.' });
    }

    mockTest.tabSwitchesCount += 1;

    if (mockTest.tabSwitchesCount >= 3) {
      // Auto-submit and terminate the mock test immediately
      if (mockTest.q1Status === 'started') {
        mockTest.q1Status = 'completed';
      }
      if (mockTest.q2Status === 'started' || mockTest.q2Status === 'pending') {
        mockTest.q2Status = 'completed';
      }
      
      mockTest.status = 'completed';
      mockTest.totalScore = mockTest.q1Score + mockTest.q2Score;
      mockTest.completedAt = Date.now();
      
      await mockTest.save();
      return res.json({ 
        autoSubmitted: true, 
        tabSwitchesCount: mockTest.tabSwitchesCount,
        mockTest 
      });
    }

    await mockTest.save();
    res.json({ autoSubmitted: false, tabSwitchesCount: mockTest.tabSwitchesCount });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user completed mock tests history
 * @route   GET /api/mocktests/history
 * @access  Private
 */
export const getMockTestHistory = async (req, res) => {
  try {
    const history = await MockTest.find({ user: req.user._id, status: 'completed' })
      .populate('q1 q2')
      .sort({ completedAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
