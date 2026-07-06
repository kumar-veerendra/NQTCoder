import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Question, { MCQQuestion, CodingQuestion } from '../models/Question.js';
import Submission from '../models/Submission.js';
import { validateQuestion } from '../utils/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getQuestions = async (req, res) => {
  const { company, topic, difficulty, page, limit, search, domain } = req.query;
  const filter = {};

  if (domain && domain !== 'all') {
    filter.domain = domain;
  } else if (!domain) {
    filter.domain = 'coding';
  }

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

  const isMcq = req.body.domain === 'aptitude';

  try {
    // Auto-assign next question number
    const lastQuestion = await Question.findOne({}).sort({ questionNo: -1 }).select('questionNo');
    const nextQuestionNo = lastQuestion ? (lastQuestion.questionNo || 0) + 1 : 1;

    let question;

    if (isMcq) {
      const {
        questionId,
        slug,
        domain,
        section,
        topic,
        displayName,
        subTopic,
        difficulty,
        applicableCompanies,
        content,
        source,
        meta,
        options,
        correctAnswer,
        explanation
      } = req.body;

      question = new MCQQuestion({
        questionNo: nextQuestionNo,
        questionId,
        slug,
        domain,
        section,
        topic,
        displayName,
        subTopic,
        difficulty,
        applicableCompanies: Array.isArray(applicableCompanies) ? applicableCompanies : [applicableCompanies],
        content,
        source,
        meta,
        options,
        correctAnswer,
        explanation,
        createdBy: req.user ? req.user._id : null
      });
    } else {
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

      question = new CodingQuestion({
        questionNo: nextQuestionNo,
        title,
        description,
        inputFormat,
        outputFormat,
        company: Array.isArray(company) ? company : [company],
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
        status: status || 'active',
        domain: 'coding',
        section: 'programming',
        createdBy: req.user ? req.user._id : null
      });
    }

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

    const isMcq = question.kind === 'MCQQuestion';

    if (isMcq) {
      const {
        questionId,
        slug,
        section,
        topic,
        displayName,
        subTopic,
        difficulty,
        applicableCompanies,
        content,
        source,
        meta,
        options,
        correctAnswer,
        explanation
      } = req.body;

      question.questionId = questionId ?? question.questionId;
      question.slug = slug ?? question.slug;
      question.section = section ?? question.section;
      question.topic = topic ?? question.topic;
      question.displayName = displayName ?? question.displayName;
      question.subTopic = subTopic ?? question.subTopic;
      question.difficulty = difficulty ?? question.difficulty;
      question.applicableCompanies = Array.isArray(applicableCompanies) ? applicableCompanies : [applicableCompanies];
      question.content = content ?? question.content;
      question.source = source ?? question.source;
      question.meta = meta ?? question.meta;
      question.options = options ?? question.options;
      question.correctAnswer = correctAnswer ?? question.correctAnswer;
      question.explanation = explanation ?? question.explanation;
    } else {
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
    }

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
    const totalQuestions = await Question.countDocuments({ domain: 'coding' });
    
    // Fetch unique topics count from database
    const uniqueTopics = await Question.distinct('topic', { domain: 'coding' });
    const totalTopics = uniqueTopics.filter(Boolean).length;

    // Aggregate counts of coding questions per company directly on MongoDB Atlas
    const companyAgg = await Question.aggregate([
      { $match: { domain: 'coding' } },
      { $unwind: '$company' },
      { $group: { _id: { $toUpper: { $trim: { input: '$company' } } }, count: { $sum: 1 } } }
    ]);

    const companyCounts = {};
    companyAgg.forEach(c => {
      if (c._id) companyCounts[c._id] = c.count;
    });

    // Fetch counts from MongoDB Atlas dynamically
    const totalQuantQuestions = await Question.countDocuments({ section: 'quant' });
    const totalLogicalQuestions = await Question.countDocuments({ section: 'logical' });
    const totalVerbalQuestions = await Question.countDocuments({ section: 'verbal' });

    const totalCompanies = Object.keys(companyCounts).length;

    res.json({
      totalQuestions,
      totalCodingQuestions: totalQuestions,
      totalQuantQuestions,
      totalLogicalQuestions,
      totalVerbalQuestions,
      companyCounts,
      totalCompanies: totalCompanies || 15,
      totalTopics: totalTopics || 12
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

    // Calculate user registration trend for the last 7 days
    const userTrend = await User.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const startCount = await User.countDocuments({
      role: 'user',
      createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = userTrend.find(t => t._id === dateStr);
      trendData.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: match ? match.count : 0
      });
    }

    let cumulative = startCount;
    const userRegistrationTrend = trendData.map(item => {
      cumulative += item.users;
      return {
        label: item.date,
        count: cumulative
      };
    });

    // Calculate compilation workload / language share
    const languageCounts = await Submission.aggregate([
      {
        $group: {
          _id: "$language",
          count: { $sum: 1 }
        }
      }
    ]);

    const languageShare = {
      cpp: 15, // Baseline to prevent empty charts
      java: 10,
      python: 20
    };

    languageCounts.forEach(item => {
      if (item._id) {
        const lang = item._id.toLowerCase();
        if (lang.includes('cpp') || lang.includes('c++') || lang === 'c') {
          languageShare.cpp += item.count;
        } else if (lang.includes('java')) {
          languageShare.java += item.count;
        } else if (lang.includes('python') || lang.includes('py')) {
          languageShare.python += item.count;
        }
      }
    });

    res.json({
      totalUsers,
      totalQuestions,
      totalSubmissions,
      liveUsers,
      userRegistrationTrend,
      languageShare
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
