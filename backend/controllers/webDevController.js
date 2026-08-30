import WebDevQuestion from '../models/WebDevQuestion.js';
import WebDevSubmission from '../models/WebDevSubmission.js';
import mongoose from 'mongoose';

/**
 * Generate a clean URL slug from string
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// ─── PUBLIC ENDPOINTS ─────────────────────────────────────────────────────────

/**
 * @desc    Get all published web development questions with optional filters
 * @route   GET /api/web-development/questions
 * @access  Public
 */
export const getPublicQuestions = async (req, res) => {
  try {
    const { difficulty, category, search } = req.query;

    const query = { status: 'published' };

    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())) {
      query.difficulty = difficulty.toLowerCase();
    }

    if (category) {
      query.category = category.toLowerCase();
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { tags: searchRegex }];
    }

    // Exclude solutionCode and internal fields
    const questions = await WebDevQuestion.find(query)
      .select('-solutionCode -createdBy -updatedBy')
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    // If user is authenticated, attach attempt/solved status
    let userSubmissionsMap = {};
    if (req.user) {
      const userSubmissions = await WebDevSubmission.find({
        user: req.user._id,
      })
        .select('question score status')
        .lean();

      userSubmissions.forEach((sub) => {
        const qId = sub.question.toString();
        if (!userSubmissionsMap[qId] || sub.score > (userSubmissionsMap[qId].bestScore || 0)) {
          userSubmissionsMap[qId] = {
            attempted: true,
            solved: sub.status === 'Passed' || sub.score === 100,
            bestScore: sub.score,
          };
        }
      });
    }

    const enhancedQuestions = questions.map((q) => {
      const userStat = userSubmissionsMap[q._id.toString()] || {
        attempted: false,
        solved: false,
        bestScore: 0,
      };

      // Exclude hidden test details from public preview list
      const sanitizedTests = (q.tests || []).map((t) => ({
        id: t.id,
        description: t.description,
        points: t.points,
        type: t.type,
      }));

      return {
        ...q,
        tests: sanitizedTests,
        testCount: (q.tests || []).length,
        userProgress: userStat,
      };
    });

    res.json({
      success: true,
      count: enhancedQuestions.length,
      questions: enhancedQuestions,
    });
  } catch (error) {
    console.error('Error fetching public web dev questions:', error);
    res.status(500).json({ success: false, message: 'Server error fetching questions' });
  }
};

/**
 * @desc    Get single web dev question by ID or Slug (Strictly excludes solutionCode)
 * @route   GET /api/web-development/questions/:idOrSlug
 * @access  Public
 */
export const getPublicQuestionByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    let question = null;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      question = await WebDevQuestion.findOne({
        _id: idOrSlug,
        status: 'published',
      })
        .select('-solutionCode')
        .lean();
    }

    if (!question) {
      question = await WebDevQuestion.findOne({
        slug: idOrSlug.toLowerCase(),
        status: 'published',
      })
        .select('-solutionCode')
        .lean();
    }

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Attach user best score & previous submission if logged in
    let lastSubmission = null;
    if (req.user) {
      lastSubmission = await WebDevSubmission.findOne({
        user: req.user._id,
        question: question._id,
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    res.json({
      success: true,
      question,
      lastSubmission,
    });
  } catch (error) {
    console.error('Error fetching single web dev question:', error);
    res.status(500).json({ success: false, message: 'Server error fetching question details' });
  }
};

// ─── AUTHENTICATED STUDENT ENDPOINTS ────────────────────────────────────────

/**
 * @desc    Submit student solution for a web dev question
 * @route   POST /api/web-development/questions/:id/submit
 * @access  Private
 */
export const submitWebDevSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      htmlCode = '',
      cssCode = '',
      javascriptCode = '',
      testResults = [],
      timeSpent = 0,
      startedAt,
    } = req.body;

    const question = await WebDevQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Calculate score from validated test results
    let pointsEarned = 0;
    let totalPoints = question.points || 100;
    let passedCount = 0;
    const totalTests = (question.tests || []).length;

    const sanitizedResults = (question.tests || []).map((test) => {
      const studentResult = (testResults || []).find((r) => r.testId === test.id);
      const passed = studentResult ? Boolean(studentResult.passed) : false;
      const earned = passed ? test.points || 0 : 0;

      if (passed) {
        passedCount += 1;
        pointsEarned += earned;
      }

      return {
        testId: test.id,
        description: test.description,
        passed,
        points: test.points || 0,
        earnedPoints: earned,
        failureMessage: passed ? '' : test.failureMessage || 'Test failed',
      };
    });

    const score = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
    const status = score === 100 ? 'Passed' : score > 0 ? 'Partial' : 'Failed';

    // Track attempt number
    const previousAttempts = await WebDevSubmission.countDocuments({
      user: req.user._id,
      question: question._id,
    });
    const attemptNumber = previousAttempts + 1;

    const submission = await WebDevSubmission.create({
      user: req.user._id,
      question: question._id,
      questionVersion: question.version || 1,
      attemptNumber,
      htmlCode,
      cssCode,
      javascriptCode,
      score,
      pointsEarned,
      totalPoints,
      passedTests: passedCount,
      totalTests,
      status,
      testResults: sanitizedResults,
      timeSpent: Number(timeSpent) || 0,
      startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - (timeSpent || 0) * 1000),
      submittedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: status === 'Passed' ? 'Challenge Solved! 100% Score!' : 'Submission evaluated',
      submission: {
        _id: submission._id,
        score,
        pointsEarned,
        totalPoints,
        passedTests: passedCount,
        totalTests,
        status,
        attemptNumber,
        testResults: sanitizedResults,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (error) {
    console.error('Error submitting web dev solution:', error);
    res.status(500).json({ success: false, message: 'Server error evaluating submission' });
  }
};

/**
 * @desc    Get user submission history for a question
 * @route   GET /api/web-development/questions/:id/submissions
 * @access  Private
 */
export const getUserSubmissions = async (req, res) => {
  try {
    const { id } = req.params;

    const submissions = await WebDevSubmission.find({
      user: req.user._id,
      question: id,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({ success: false, message: 'Server error fetching submissions' });
  }
};

// ─── ADMIN ENDPOINTS ─────────────────────────────────────────────────────────

/**
 * @desc    Get all questions for admin management (including drafts)
 * @route   GET /api/web-development/admin/questions
 * @access  Private / Admin
 */
export const getAdminQuestions = async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { slug: searchRegex }, { description: searchRegex }];
    }

    const questions = await WebDevQuestion.find(query)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    // Summary statistics
    const totalCount = await WebDevQuestion.countDocuments();
    const publishedCount = await WebDevQuestion.countDocuments({ status: 'published' });
    const draftCount = await WebDevQuestion.countDocuments({ status: 'draft' });
    const archivedCount = await WebDevQuestion.countDocuments({ status: 'archived' });

    res.json({
      success: true,
      stats: {
        totalCount,
        publishedCount,
        draftCount,
        archivedCount,
      },
      questions,
    });
  } catch (error) {
    console.error('Error fetching admin web dev questions:', error);
    res.status(500).json({ success: false, message: 'Server error fetching admin questions' });
  }
};

/**
 * @desc    Get single question by ID for admin editor (includes solutionCode)
 * @route   GET /api/web-development/admin/questions/:id
 * @access  Private / Admin
 */
export const getAdminQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await WebDevQuestion.findById(id).lean();
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error('Error fetching admin question details:', error);
    res.status(500).json({ success: false, message: 'Server error fetching question details' });
  }
};

/**
 * @desc    Create new web dev question
 * @route   POST /api/web-development/admin/questions
 * @access  Private / Admin
 */
export const createAdminQuestion = async (req, res) => {
  try {
    const {
      title,
      slug,
      difficulty = 'easy',
      category = 'html-css-javascript',
      description,
      requirements = [],
      starterCode = { html: '', css: '', javascript: '' },
      solutionCode = { html: '', css: '', javascript: '' },
      tests = [],
      points = 100,
      timeLimit = 20,
      status = 'published',
      tags = [],
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Question title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const generatedSlug = slug && slug.trim() ? generateSlug(slug) : generateSlug(title);

    // Check slug uniqueness
    const existing = await WebDevQuestion.findOne({ slug: generatedSlug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A question with slug "${generatedSlug}" already exists. Please choose a distinct title or slug.`,
      });
    }

    // Validate tests exist
    if (!tests || tests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one evaluation test is required before saving a question.',
      });
    }

    // Calculate points sum
    const totalTestPoints = tests.reduce((acc, t) => acc + (Number(t.points) || 0), 0);

    const newQuestion = await WebDevQuestion.create({
      title: title.trim(),
      slug: generatedSlug,
      difficulty: difficulty.toLowerCase(),
      category: category.toLowerCase(),
      description: description.trim(),
      requirements: requirements.filter(Boolean),
      starterCode,
      solutionCode,
      tests,
      points: totalTestPoints > 0 ? totalTestPoints : points,
      timeLimit: Number(timeLimit) || 20,
      version: 1,
      status,
      tags: tags.filter(Boolean),
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Web development question created successfully',
      question: newQuestion,
    });
  } catch (error) {
    console.error('Error creating web dev question:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating question' });
  }
};

/**
 * @desc    Update existing web dev question
 * @route   PATCH /api/web-development/admin/questions/:id
 * @access  Private / Admin
 */
export const updateAdminQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const question = await WebDevQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // If slug is changed, ensure uniqueness
    if (updates.slug && updates.slug !== question.slug) {
      const formattedSlug = generateSlug(updates.slug);
      const existing = await WebDevQuestion.findOne({ slug: formattedSlug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Slug "${formattedSlug}" is already in use by another question.`,
        });
      }
      updates.slug = formattedSlug;
    }

    // Increment version if starter code or tests were modified
    const isStarterChanged =
      updates.starterCode &&
      JSON.stringify(updates.starterCode) !== JSON.stringify(question.starterCode);
    const isTestsChanged =
      updates.tests && JSON.stringify(updates.tests) !== JSON.stringify(question.tests);

    if (isStarterChanged || isTestsChanged) {
      updates.version = (question.version || 1) + 1;
    }

    updates.updatedBy = req.user._id;

    const updatedQuestion = await WebDevQuestion.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Question updated successfully',
      question: updatedQuestion,
    });
  } catch (error) {
    console.error('Error updating web dev question:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating question' });
  }
};

/**
 * @desc    Delete a web dev question
 * @route   DELETE /api/web-development/admin/questions/:id
 * @access  Private / Admin
 */
export const deleteAdminQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await WebDevQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    await WebDevQuestion.findByIdAndDelete(id);
    await WebDevSubmission.deleteMany({ question: id });

    res.json({
      success: true,
      message: 'Question and associated submission logs deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting web dev question:', error);
    res.status(500).json({ success: false, message: 'Server error deleting question' });
  }
};
