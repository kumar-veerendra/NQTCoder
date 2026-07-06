import Question, { MCQQuestion } from '../models/Question.js';
import { getMCQQuestions, findQuestionByIdOrSlug, getMCQByFilter } from '../utils/questionLoader.js';
import SyllabusTopic from '../models/SyllabusTopic.js';
import QuestionSession from '../models/QuestionSession.js';
import UserAttempt from '../models/UserAttempt.js';
import TopicProgress from '../models/TopicProgress.js';
import RevisionQueue from '../models/RevisionQueue.js';
import Bookmark from '../models/Bookmark.js';

/**
 * @desc    Get all syllabus topics for practice
 * @route   GET /api/practice/topics
 * @access  Private
 */
export const getSyllabusTopics = async (req, res) => {
  try {
    const topics = await SyllabusTopic.find({ domain: 'aptitude' })
      .sort({ displayOrder: 1 });

    // Aggregate counts of questions per topic in database
    const counts = await Question.aggregate([
      { $group: { _id: '$topic', count: { $sum: 1 } } }
    ]);

    const countsMap = {};
    counts.forEach(c => {
      if (c._id) countsMap[c._id] = c.count;
    });

    const topicsWithCount = topics.map(t => {
      const obj = t.toObject ? t.toObject() : { ...t };
      obj.questionCount = countsMap[t.topic] || 0;
      return obj;
    });

    res.json(topicsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get list of questions in practice mode
 * @route   GET /api/practice/questions
 * @access  Private
 */
export const getPracticeQuestions = async (req, res) => {
  const { section, topic, difficulty, search } = req.query;
  const filter = {};

  if (section) filter.section = section;
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  if (search) filter.search = search;

  try {
    // Fetch from local and database MCQ questions list
    const questions = await getMCQByFilter(filter);

    let solvedSet = new Set();
    let attemptedSet = new Set();

    if (req.user) {
      // Fetch solved attempt questionIds
      const userSolvedIds = await UserAttempt.find({
        userId: req.user._id,
        questionId: { $in: questions.map(q => q._id) },
        isCorrect: true
      }).distinct('questionId');

      solvedSet = new Set(userSolvedIds.map(id => id.toString()));

      // Fetch all attempted questionIds
      const userAttemptedIds = await UserAttempt.find({
        userId: req.user._id,
        questionId: { $in: questions.map(q => q._id) }
      }).distinct('questionId');

      attemptedSet = new Set(userAttemptedIds.map(id => id.toString()));
    }
    
    // Map with solved status and remove correct answer & explanation
    const mapped = questions.map(q => {
      const obj = { ...q };
      delete obj.correctAnswer;
      delete obj.explanation;
      if (obj.blanks) {
        obj.blanks = obj.blanks.map(b => {
          const newB = { ...b };
          delete newB.acceptableAnswers;
          return newB;
        });
      }
      obj.isSolved = solvedSet.has(obj._id.toString());
      obj.isAttempted = attemptedSet.has(obj._id.toString()) && !obj.isSolved;
      return obj;
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get a single practice question by ID or slug
 * @route   GET /api/practice/questions/:id
 * @access  Private
 */
export const getPracticeQuestionById = async (req, res) => {
  try {
    let question = await findQuestionByIdOrSlug(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const qId = question._id;

    // Find the latest attempt by the user for this question
    const lastAttempt = req.user ? await UserAttempt.findOne({
      userId: req.user._id,
      questionId: qId
    }).sort({ attemptedAt: -1 }) : null;

    const bookmarkedDoc = req.user ? await Bookmark.findOne({ userId: req.user._id, questionId: qId }) : null;
    const isBookmarked = !!bookmarkedDoc;

    const hasAttempted = !!lastAttempt;
    const isAdmin = req.user && req.user.role === 'admin';

    // Strip answers and explanations if not attempted and not admin
    if (!hasAttempted && !isAdmin) {
      const sanitized = typeof question.toObject === 'function' ? question.toObject() : { ...question };
      delete sanitized.correctAnswer;
      delete sanitized.explanation;
      if (sanitized.blanks) {
        sanitized.blanks = sanitized.blanks.map(b => {
          const newB = { ...b };
          delete newB.acceptableAnswers;
          return newB;
        });
      }
      return res.json({ ...sanitized, isSolved: false, isBookmarked });
    }

    const resultObj = typeof question.toObject === 'function' ? question.toObject() : { ...question };
    res.json({
      ...resultObj,
      isSolved: true,
      isBookmarked,
      lastAttempt: lastAttempt ? {
        submittedAnswer: lastAttempt.submittedAnswer,
        isCorrect: lastAttempt.isCorrect,
        verbalEvaluation: lastAttempt.verbalEvaluation
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Start a practice session
 * @route   POST /api/practice/sessions
 * @access  Private
 */
export const startPracticeSession = async (req, res) => {
  const { section, topic, difficulty } = req.body;

  if (!section) {
    return res.status(400).json({ message: 'Section is required' });
  }

  try {
    // Complete/close any existing active sessions in this section for the user
    await QuestionSession.updateMany(
      { userId: req.user._id, section, status: 'active' },
      { status: 'abandoned', endedAt: new Date() }
    );

    const session = await QuestionSession.create({
      userId: req.user._id,
      mode: 'practice',
      section,
      topic,
      difficulty,
      status: 'active',
      startedAt: new Date()
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Submit answer to a practice question
 * @route   POST /api/practice/questions/:id/submit
 * @access  Private
 */
export const submitPracticeAnswer = async (req, res) => {
  const { submittedAnswer, timeTakenSec, sessionId } = req.body;

  if (!submittedAnswer || !Array.isArray(submittedAnswer) || submittedAnswer.length === 0) {
    return res.status(400).json({ message: 'Submitted answer is required' });
  }

  try {
    let question = await findQuestionByIdOrSlug(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    let isCorrect = false;
    let verbalEvaluation = null;

    if (question.kind === 'MCQQuestion') {
      // Evaluate answer (array equality)
      isCorrect =
        submittedAnswer.length === (question.correctAnswer || []).length &&
        submittedAnswer.every(val => (question.correctAnswer || []).includes(val));
    } else if (question.kind === 'VerbalQuestion') {
      if (question.verbalType === 'sentence_completion') {
        // All blanks must match an acceptable answer
        isCorrect = (question.blanks || []).every((blank, idx) => {
          const studentAns = (submittedAnswer[idx] || '').trim().toLowerCase();
          return (blank.acceptableAnswers || []).some(
            acc => acc.trim().toLowerCase() === studentAns
          );
        });
      } else if (question.verbalType === 'passage_recall' || question.verbalType === 'email_writing') {
        // Initially set isCorrect as false and status as pending
        isCorrect = false;
      }
    } else {
      return res.status(400).json({ message: 'Unsupported question kind' });
    }

    // Resolve or find active session
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      let activeSession = await QuestionSession.findOne({
        userId: req.user._id,
        section: question.section,
        status: 'active'
      });
      if (!activeSession) {
        activeSession = await QuestionSession.create({
          userId: req.user._id,
          mode: 'practice',
          section: question.section,
          topic: question.topic,
          status: 'active'
        });
      }
      activeSessionId = activeSession._id;
    }

    // Record attempt
    const attempt = await UserAttempt.create({
      userId: req.user._id,
      questionId: question._id,
      sessionId: activeSessionId,
      submittedAnswer,
      isCorrect,
      timeTakenSec: timeTakenSec || 0,
      attemptedAt: new Date(),
      verbalEvaluation: question.kind === 'VerbalQuestion' && (question.verbalType === 'passage_recall' || question.verbalType === 'email_writing') ? { status: 'pending' } : null
    });

    // If it requires AI evaluation, call the evaluation service
    if (question.kind === 'VerbalQuestion' && (question.verbalType === 'passage_recall' || question.verbalType === 'email_writing')) {
      const { evaluatePassageRecall, evaluateEmailWriting } = await import('../services/llmEvaluationService.js');
      
      let evalResult;
      if (question.verbalType === 'passage_recall') {
        evalResult = await evaluatePassageRecall(question.passageText, submittedAnswer[0]);
      } else {
        evalResult = await evaluateEmailWriting(question.emailPrompt, question.guidelines, submittedAnswer[0]);
      }
      
      attempt.verbalEvaluation = evalResult;
      attempt.isCorrect = evalResult.status === 'completed' && (evalResult.score >= 60);
      await attempt.save();

      isCorrect = attempt.isCorrect;
      verbalEvaluation = evalResult;
    }

    // Increment raw counters on Question document (only if it's in MongoDB)
    if (question.domain !== 'aptitude') {
      await Question.findByIdAndUpdate(question._id, {
        $inc: {
          'analytics.attempts': 1,
          'analytics.correct': isCorrect ? 1 : 0,
          'analytics.wrong': isCorrect ? 0 : 1
        }
      });
    }

    // Update TopicProgress using local MCQs if domain is aptitude
    let topicQIds = [];
    if (question.domain === 'aptitude') {
      topicQIds = await getMCQByFilter({ topic: question.topic });
    } else {
      topicQIds = await Question.find({ topic: question.topic, domain: 'coding' }).select('_id');
    }
    const totalQuestionsInTopic = topicQIds.length;

    // Fetch attempts by user on this topic
    const userAttempts = await UserAttempt.find({
      userId: req.user._id,
      questionId: { $in: topicQIds.map(q => q._id) }
    });

    // Calculate aggregates
    const correctAttemptsCount = userAttempts.filter(att => att.isCorrect).length;
    const totalAttemptsCount = userAttempts.length;

    // Find unique questions solved correctly
    const solvedQuestionIds = new Set(
      userAttempts.filter(att => att.isCorrect).map(att => att.questionId.toString())
    );

    const averageTime = totalAttemptsCount > 0
      ? Math.round(userAttempts.reduce((sum, att) => sum + att.timeTakenSec, 0) / totalAttemptsCount)
      : 0;

    const accuracy = totalAttemptsCount > 0
      ? Math.round((correctAttemptsCount / totalAttemptsCount) * 100)
      : 0;

    const isTopicCompleted = solvedQuestionIds.size === totalQuestionsInTopic;

    await TopicProgress.findOneAndUpdate(
      { userId: req.user._id, section: question.section, topic: question.topic },
      {
        totalQuestions: totalQuestionsInTopic,
        solved: solvedQuestionIds.size,
        correct: correctAttemptsCount,
        accuracy,
        averageTime,
        completedAt: isTopicCompleted ? new Date() : null
      },
      { upsert: true, new: true }
    );

    // If correct, remove from revision queue, otherwise add to queue if wrong twice
    if (isCorrect) {
      await RevisionQueue.findOneAndDelete({ userId: req.user._id, questionId: question._id });
    } else {
      const wrongCount = userAttempts.filter(att => att.questionId.toString() === question._id.toString() && !att.isCorrect).length;
      if (wrongCount >= 2) {
        await RevisionQueue.findOneAndUpdate(
          { userId: req.user._id, questionId: question._id },
          {
            reason: 'wrong_twice',
            wrongAttemptsCount: wrongCount,
            lastAttemptedAt: new Date()
          },
          { upsert: true }
        );
      }
    }

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      blanks: question.kind === 'VerbalQuestion' ? question.blanks : undefined,
      verbalEvaluation
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get aggregated topic progress for the current user
 * @route   GET /api/practice/progress
 * @access  Private
 */
export const getPracticeProgress = async (req, res) => {
  try {
    const progress = await TopicProgress.find({ userId: req.user._id });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Toggle question bookmark for user
 * @route   POST /api/practice/questions/:id/bookmark
 * @access  Private
 */
export const toggleBookmark = async (req, res) => {
  const questionId = req.params.id;
  try {
    const existing = await Bookmark.findOne({ userId: req.user._id, questionId });
    if (existing) {
      await Bookmark.findOneAndDelete({ userId: req.user._id, questionId });
      return res.json({ bookmarked: false, message: 'Bookmark removed' });
    }
    await Bookmark.create({ userId: req.user._id, questionId });
    res.json({ bookmarked: true, message: 'Bookmark added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user bookmarked questions
 * @route   GET /api/practice/bookmarks
 * @access  Private
 */
export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate('questionId');
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user revision queue questions
 * @route   GET /api/practice/revision-queue
 * @access  Private
 */
export const getRevisionQueue = async (req, res) => {
  try {
    const queue = await RevisionQueue.find({ userId: req.user._id })
      .populate('questionId');
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
