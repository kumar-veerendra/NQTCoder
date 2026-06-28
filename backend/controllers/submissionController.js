import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { runLocalCode, runLocalCodeMulti, getCompilerVersions } from '../utils/localRunner.js';
import { runJudge0Code } from '../utils/judge0Runner.js';
import { compilerQueue } from '../utils/compilerQueue.js';
import { updateQuestionStats } from './questionController.js';

/**
 * Normalizes output string for comparison:
 * Removes carriage returns (\r), trims trailing whitespaces on each line, and trims overall.
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toString()
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trimRight())
    .join('\n')
    .trim();
};

/**
 * Helper to execute code on either local runner or Judge0
 */
const executeCode = async (code, language, input, timeLimit) => {
  const mode = process.env.RUN_MODE || (process.env.NODE_ENV === 'production' ? 'judge0' : 'local');
  if (mode === 'judge0') {
    return await runJudge0Code(code, language, input, timeLimit);
  } else {
    return await runLocalCode(code, language, input, timeLimit);
  }
};

const executeCodeMulti = async (code, language, inputs, timeLimit) => {
  const mode = process.env.RUN_MODE || (process.env.NODE_ENV === 'production' ? 'judge0' : 'local');
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

/**
 * @desc    Run code against visible test cases or custom input
 * @route   POST /api/submissions/run
 * @access  Private
 */
export const runCode = async (req, res) => {
  const { code, language, questionId, customInput } = req.body;

  if (!code || !language || !questionId) {
    return res.status(400).json({ message: 'Code, language, and question ID are required' });
  }

  try {
    let question = await Question.findOne({ slug: questionId });
    if (!question && /^[0-9a-fA-F]{24}$/.test(questionId)) {
      question = await Question.findById(questionId);
    }
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Wrap execution context inside a queue job function
    const runFn = async () => {
      // 1. If custom input is provided, run only that
      if (customInput !== undefined && customInput !== null && customInput.trim() !== '') {
        const runResult = await executeCode(code, language, customInput, question.timeLimit);
        return {
          isCustom: true,
          runResult: {
            input: customInput,
            stdout: runResult.stdout,
            error: runResult.error,
            status: runResult.status
          }
        };
      }

      // 2. Otherwise, run all visible test cases
      const visibleCases = question.visibleTestCases;
      const inputs = visibleCases.map(tc => tc.input);
      const runResults = await executeCodeMulti(code, language, inputs, question.timeLimit);

      if (runResults.status === 'Compilation Error') {
        return {
          isCustom: false,
          status: 'Compilation Error',
          error: runResults.error,
          testResults: []
        };
      }

      const testResults = [];
      for (let i = 0; i < visibleCases.length; i++) {
        const tc = visibleCases[i];
        const runResult = runResults[i];

        const cleanExpected = normalizeText(tc.output);
        const cleanActual = normalizeText(runResult.stdout);
        
        let verdict = runResult.status;
        if (runResult.status === 'Accepted' && cleanExpected !== cleanActual) {
          verdict = 'Wrong Answer';
        }

        testResults.push({
          testCaseIndex: i + 1,
          input: tc.input,
          expectedOutput: tc.output,
          actualOutput: runResult.stdout,
          error: runResult.error,
          status: verdict
        });
      }

      const failedCase = testResults.find((r) => r.status !== 'Accepted');
      const overallStatus = failedCase ? failedCase.status : 'Accepted';

      return {
        isCustom: false,
        status: overallStatus,
        testResults
      };
    };

    const jobStatus = compilerQueue.enqueue(runFn);
    return res.status(202).json(jobStatus);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Submit code against all test cases (visible + hidden)
 * @route   POST /api/submissions/submit
 * @access  Private
 */
export const submitCode = async (req, res) => {
  const { code, language, questionId } = req.body;
  const userId = req.user._id;

  if (!code || !language || !questionId) {
    return res.status(400).json({ message: 'Code, language, and question ID are required' });
  }

  try {
    let question = await Question.findOne({ slug: questionId });
    if (!question && /^[0-9a-fA-F]{24}$/.test(questionId)) {
      question = await Question.findById(questionId);
    }
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const runFn = async () => {
      // Combine visible and hidden test cases
      const allTestCases = [...question.visibleTestCases, ...question.hiddenTestCases];
      const totalCount = allTestCases.length;
      const inputs = allTestCases.map(tc => tc.input);

      const startAll = Date.now();
      const runResults = await executeCodeMulti(code, language, inputs, question.timeLimit);
      const totalExecutionTime = (Date.now() - startAll) / 1000;

      let passedCount = 0;
      let overallVerdict = 'Accepted';
      let firstErrorMessage = '';
      let runTimeMax = 0;

      const hasCompilationError = Array.isArray(runResults)
        ? runResults.some(r => r.status === 'Compilation Error')
        : runResults.status === 'Compilation Error';

      if (hasCompilationError) {
        overallVerdict = 'Compilation Error';
        firstErrorMessage = Array.isArray(runResults)
          ? runResults.find(r => r.status === 'Compilation Error').error
          : runResults.error;
      } else {
        for (let i = 0; i < totalCount; i++) {
          const tc = allTestCases[i];
          const runResult = runResults[i];
          const executionTime = totalExecutionTime / totalCount;
          
          if (executionTime > runTimeMax) {
            runTimeMax = executionTime;
          }

          if (runResult.status === 'Time Limit Exceeded') {
            overallVerdict = 'Time Limit Exceeded';
            firstErrorMessage = runResult.error || 'Time Limit Exceeded';
            break;
          }

          if (runResult.status === 'Runtime Error') {
            overallVerdict = 'Runtime Error';
            firstErrorMessage = runResult.error || 'Runtime Error';
            break;
          }

          if (runResult.status === 'Compilation Error') {
            overallVerdict = 'Compilation Error';
            firstErrorMessage = runResult.error || 'Compilation Error';
            break;
          }

          const cleanExpected = normalizeText(tc.output);
          const cleanActual = normalizeText(runResult.stdout);

          if (cleanExpected === cleanActual) {
            passedCount++;
          } else {
            overallVerdict = 'Wrong Answer';
          }
        }
      }

      // Adjust verdict if some but not all passed in case of Wrong Answer
      if (overallVerdict === 'Accepted' && passedCount < totalCount) {
        overallVerdict = 'Wrong Answer';
      }

      // Save submission
      const isAccepted = overallVerdict === 'Accepted';

      // Check if this user already solved this question before (for isFirstAccepted)
      const user = await User.findById(userId);
      const alreadySolved = user.solvedQuestions.some(
        (id) => id.toString() === question._id.toString()
      );
      const isFirstAccepted = isAccepted && !alreadySolved;

      const submission = await Submission.create({
        user: userId,
        question: question._id,
        code,
        language,
        status: overallVerdict,
        passedCount,
        totalCount,
        errorMessage: firstErrorMessage,
        runTime: runTimeMax,
        isFirstAccepted
      });

      // Auto-update Question stats (totalSubmissions + totalAccepted)
      await updateQuestionStats(question._id, isAccepted);

      // Update User statistics
      user.submissionsCount += 1;

      if (isAccepted) {
        if (!alreadySolved) {
          user.solvedQuestions.push(question._id);
          
          // Update solved difficulty counts
          const diff = question.difficulty.toLowerCase();
          if (diff === 'easy')   user.solvedCount.easy   += 1;
          if (diff === 'medium') user.solvedCount.medium += 1;
          if (diff === 'hard')   user.solvedCount.hard   += 1;
        }
      }

      await user.save();
      return submission;
    };

    const jobStatus = compilerQueue.enqueue(runFn);
    return res.status(202).json(jobStatus);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get the execution status of a compiler queue job
 * @route   GET /api/submissions/status/:jobId
 * @access  Private
 */
export const getQueueJobStatus = async (req, res) => {
  try {
    const jobStatus = compilerQueue.getJobStatus(req.params.jobId);
    if (!jobStatus) {
      return res.status(404).json({ message: 'Compiler job not found' });
    }
    return res.json(jobStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get live server queue load (no auth — used for public load indicator)
 * @route   GET /api/submissions/load
 * @access  Public
 */
export const getQueueLoad = (req, res) => {
  try {
    const load = compilerQueue.getQueueLoad();
    // Classify load level for frontend badge
    let level = 'low';    // green  — 0-1 jobs
    if (load.total >= 2 && load.total <= 4) level = 'medium'; // yellow
    if (load.total >= 5) level = 'high';   // red
    res.json({ ...load, level });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompilersStatus = async (req, res) => {
  try {
    const versions = await getCompilerVersions();
    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user submission history for a specific question
 * @route   GET /api/submissions/question/:questionId
 * @access  Private
 */
export const getUserQuestionSubmissions = async (req, res) => {
  try {
    let question = await Question.findOne({ slug: req.params.questionId });
    if (!question && /^[0-9a-fA-F]{24}$/.test(req.params.questionId)) {
      question = await Question.findById(req.params.questionId);
    }
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const submissions = await Submission.find({
      user: req.user._id,
      question: question._id
    }).sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all submissions for the logged-in user
 * @route   GET /api/submissions/user
 * @access  Private
 */
export const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('question', 'title difficulty topic company')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
