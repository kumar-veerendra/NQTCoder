import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
import { validateQuestion } from '../utils/validator.js';

/**
 * @desc    Get all questions (with filters)
 * @route   GET /api/questions
 * @access  Public
 */
export const getQuestions = async (req, res) => {
  const { company, topic, difficulty, page, limit, search } = req.query;
  const filter = {};

  if (company) {
    // Matches if the company array contains the queried company (case-insensitive)
    filter.company = { $regex: new RegExp(company, 'i') };
  }

  if (topic) {
    filter.topic = { $regex: new RegExp(topic, 'i') };
  }

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (search) {
    filter.title = { $regex: new RegExp(search, 'i') };
  }

  try {
    // Determine if pagination is requested (opt-in)
    if (page !== undefined || limit !== undefined) {
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, parseInt(limit) || 10);
      const skipCount = (pageNum - 1) * limitNum;

      // Count matching documents
      const totalQuestions = await Question.countDocuments(filter);
      const totalPages = Math.ceil(totalQuestions / limitNum);

      // Select fields, excluding both hidden AND visible test cases for lightweight list payload
      const questions = await Question.find(filter)
        .select('-hiddenTestCases -visibleTestCases')
        .populate('createdBy', 'username')
        .skip(skipCount)
        .limit(limitNum);

      return res.json({
        questions,
        totalPages,
        currentPage: pageNum,
        totalQuestions
      });
    }

    // Default/fallback: return unpaginated array for backward compatibility
    const questions = await Question.find(filter)
      .select('-hiddenTestCases')
      .populate('createdBy', 'username');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get a single question by ID
 * @route   GET /api/questions/:id
 * @access  Public (Hidden test cases filtered for users)
 */
export const getQuestionById = async (req, res) => {
  try {
    let question = await Question.findOne({ slug: req.params.id });

    if (!question && /^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      question = await Question.findById(req.params.id);
    }

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Determine authorization level to strip hidden test cases
    // We check if Authorization header is passed to dynamically check admin role
    const authHeader = req.headers.authorization;
    let isAdmin = false;

    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || 'nqtcoder_super_secret_jwt_key_2026';
        const decoded = jwt.verify(token, jwtSecret);
        const user = await User.findById(decoded.id);
        if (user && user.role === 'admin') {
          isAdmin = true;
        }
      } catch (e) {
        // Carry on as non-admin
      }
    }

    // Strip hidden test cases for security if not admin
    if (!isAdmin) {
      const sanitizedQuestion = question.toObject();
      delete sanitizedQuestion.hiddenTestCases;
      return res.json(sanitizedQuestion);
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Import jwt and User for token parsing
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @desc    Create a new question
 * @route   POST /api/questions
 * @access  Private/Admin
 */
export const createQuestion = async (req, res) => {
  const { errors, isValid } = validateQuestion(req.body);
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  const {
    title,
    description,
    inputFormat,
    outputFormat,
    company,
    difficulty,
    topic,
    tags,
    constraints,
    examDate,
    examples,
    languagesSupported,
    visibleTestCases,
    hiddenTestCases,
    hints,
    timeLimit,
    memoryLimit,
    timerDuration,
    timerEnabled,
    status
  } = req.body;

  try {
    // Auto-assign next question number
    const lastQuestion = await Question.findOne({}).sort({ questionNo: -1 }).select('questionNo');
    const nextQuestionNo = lastQuestion ? (lastQuestion.questionNo || 0) + 1 : 1;

    const question = new Question({
      questionNo: nextQuestionNo,
      title,
      description,
      inputFormat,
      outputFormat,
      company: Array.isArray(company) ? company : [company],
      difficulty,
      topic,
      tags: Array.isArray(tags) ? tags : [],
      constraints,
      examDate,
      examples,
      languagesSupported,
      visibleTestCases,
      hiddenTestCases,
      hints,
      timeLimit,
      memoryLimit,
      timerDuration,
      timerEnabled,
      status: status || 'active',
      createdBy: req.user._id
    });

    const createdQuestion = await question.save();
    res.status(201).json(createdQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update a question
 * @route   PUT /api/questions/:id
 * @access  Private/Admin
 */
export const updateQuestion = async (req, res) => {
  const { errors, isValid } = validateQuestion(req.body);
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const {
      title,
      description,
      inputFormat,
      outputFormat,
      company,
      difficulty,
      topic,
      tags,
      constraints,
      examDate,
      examples,
      languagesSupported,
      visibleTestCases,
      hiddenTestCases,
      hints,
      timeLimit,
      memoryLimit,
      timerDuration,
      timerEnabled,
      status
    } = req.body;

    question.title           = title;
    question.description     = description;
    question.inputFormat     = inputFormat     ?? question.inputFormat;
    question.outputFormat    = outputFormat    ?? question.outputFormat;
    question.company         = Array.isArray(company) ? company : [company];
    question.difficulty      = difficulty;
    question.topic           = topic;
    question.tags            = Array.isArray(tags) ? tags : question.tags;
    question.constraints     = constraints;
    question.examDate        = examDate        ?? question.examDate;
    question.examples        = examples;
    question.languagesSupported = languagesSupported;
    question.visibleTestCases   = visibleTestCases;
    question.hiddenTestCases    = hiddenTestCases;
    question.hints           = hints           ?? question.hints;
    question.timeLimit       = timeLimit;
    question.memoryLimit     = memoryLimit;
    question.timerDuration   = timerDuration;
    question.timerEnabled    = timerEnabled;
    question.status          = status          ?? question.status;

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Increment totalSubmissions and optionally totalAccepted for a question
 * @usage   Called internally from submissionController after each submission
 */
export const updateQuestionStats = async (questionId, isAccepted) => {
  try {
    const update = { $inc: { totalSubmissions: 1 } };
    if (isAccepted) update.$inc.totalAccepted = 1;
    await Question.findByIdAndUpdate(questionId, update);
  } catch (err) {
    console.error('Failed to update question stats:', err.message);
  }
};

/**
 * @desc    Delete a question
 * @route   DELETE /api/questions/:id
 * @access  Private/Admin
 */
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await Question.deleteOne({ _id: req.params.id });
    res.json({ message: 'Question removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get total count of questions and counts per company (public, lightweight)
 * @route   GET /api/questions/count
 * @access  Public
 */
export const getQuestionsCount = async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments({});
    
    // Fetch unique topics count from database
    const uniqueTopics = await Question.distinct('topic');
    const totalTopics = uniqueTopics.filter(Boolean).length;

    // Fetch only company field to count questions per company
    const questions = await Question.find({}).select('company');
    const companyCounts = {};
    questions.forEach(q => {
      if (Array.isArray(q.company)) {
        q.company.forEach(c => {
          if (c) {
            const normalized = c.trim().toUpperCase();
            companyCounts[normalized] = (companyCounts[normalized] || 0) + 1;
          }
        });
      }
    });

    const totalCompanies = Object.keys(companyCounts).length;

    res.json({
      totalQuestions,
      companyCounts,
      totalCompanies: totalCompanies || 15, // fallback to typical count if empty
      totalTopics: totalTopics || 12        // fallback to typical count if empty
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get admin dashboard metrics/statistics
 * @route   GET /api/questions/admin/stats
 * @access  Private/Admin
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalQuestions = await Question.countDocuments({});
    const totalSubmissions = await Submission.countDocuments({});
    
    // Count unique users who submitted in the last 30 minutes
    const activeSubmissionsCount = await Submission.distinct('user', {
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
    });
    
    // Set baseline at 1 user to count the active administrator session
    const liveUsers = Math.max(1, activeSubmissionsCount.length);

    res.json({
      totalUsers,
      totalQuestions,
      totalSubmissions,
      liveUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
