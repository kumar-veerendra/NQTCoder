import Question, { MCQQuestion, VerbalQuestion } from '../models/Question.js';
import { getMCQQuestions, findQuestionByIdOrSlug, getMCQByFilter } from '../utils/questionLoader.js';
import SyllabusTopic from '../models/SyllabusTopic.js';
import QuestionSession from '../models/QuestionSession.js';
import UserAttempt from '../models/UserAttempt.js';
import TopicProgress from '../models/TopicProgress.js';
import RevisionQueue from '../models/RevisionQueue.js';
import Bookmark from '../models/Bookmark.js';
import Draft from '../models/Draft.js';
import DeveloperDebugLog from '../models/DeveloperDebugLog.js';
import { EmailEvaluationService, EmailRewriteService, QuestionGeneratorService, ScenarioConverterService } from '../services/aiFeatureServices.js';
import { AIProviderFactory } from '../services/aiProviderInterface.js';
import DeterministicEvaluator from '../services/deterministicEvaluator.js';

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
const CANONICAL_FILL_BLANK_SKILLS = new Set([
  'subject-verb-agreement',
  'tenses',
  'articles',
  'prepositions',
  'pronouns',
  'adjectives-adverbs',
  'conjunctions',
  'modals',
  'voice',
  'vocabulary'
]);

export const getPracticeQuestions = async (req, res) => {
  const { section, topic, difficulty, search, skill } = req.query;
  const filter = {};

  if (section) filter.section = section;
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  if (search) filter.search = search;
  if (skill && skill !== 'all' && CANONICAL_FILL_BLANK_SKILLS.has(skill.toLowerCase())) {
    filter.skill = skill.toLowerCase();
  }

  try {
    // Fetch from local and database MCQ questions list
    const questions = await getMCQByFilter(filter, req.user?._id);

    let solvedSet = new Set();
    let attemptedSet = new Set();

    if (req.user) {
      const [userSolvedIds, userAttemptedIds] = await Promise.all([
        UserAttempt.find({
          userId: req.user._id,
          questionId: { $in: questions.map(q => q._id) },
          isCorrect: true
        }).distinct('questionId'),
        UserAttempt.find({
          userId: req.user._id,
          questionId: { $in: questions.map(q => q._id) }
        }).distinct('questionId')
      ]);

      solvedSet = new Set(userSolvedIds.map(id => id.toString()));
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
      if (obj.meta && obj.meta.createdBy) {
        obj.createdBy = obj.meta.createdBy.toString();
      }
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
    let question = await findQuestionByIdOrSlug(req.params.id, req.user?._id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const qId = question._id;

    const [lastAttempt, bookmarkedDoc] = req.user ? await Promise.all([
      UserAttempt.findOne({ userId: req.user._id, questionId: qId }).sort({ attemptedAt: -1 }),
      Bookmark.findOne({ userId: req.user._id, questionId: qId })
    ]) : [null, null];

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
      if (sanitized.meta && sanitized.meta.createdBy) {
        sanitized.createdBy = sanitized.meta.createdBy.toString();
      }
      return res.json({ ...sanitized, isSolved: false, isBookmarked });
    }

    const resultObj = typeof question.toObject === 'function' ? question.toObject() : { ...question };
    if (resultObj.meta && resultObj.meta.createdBy) {
      resultObj.createdBy = resultObj.meta.createdBy.toString();
    }
    res.json({
      ...resultObj,
      isSolved: true,
      isBookmarked,
      lastAttempt: lastAttempt ? {
        _id: lastAttempt._id,
        submittedAnswer: lastAttempt.submittedAnswer,
        isCorrect: lastAttempt.isCorrect,
        verbalEvaluation: lastAttempt.verbalEvaluation,
        deterministic: lastAttempt.deterministic,
        ai: lastAttempt.ai,
        aiStatus: lastAttempt.ai?.status || 'completed',
        evaluationMode: lastAttempt.evaluationMode || 'RULE_ONLY'
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
  const { submittedAnswer, timeTakenSec, sessionId, apiKey, provider: requestedProvider } = req.body;

  if (!submittedAnswer || !Array.isArray(submittedAnswer) || submittedAnswer.length === 0) {
    return res.status(400).json({ message: 'Submitted answer is required' });
  }

  try {
    let question = await findQuestionByIdOrSlug(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // AI Cost Protection: Validate length and word bounds before LLM call
    if (question.kind === 'VerbalQuestion' && question.verbalType === 'email_writing') {
      const charCount = (submittedAnswer[0] || '').length;
      const wordCount = (submittedAnswer[0] || '').split(/\s+/).filter(Boolean).length;
      
      if (charCount > 5000) {
        return res.status(400).json({ message: 'Evaluation rejected: Email exceeds maximum of 5,000 characters.' });
      }
      if (wordCount > 300) {
        return res.status(400).json({ message: 'Evaluation rejected: Email exceeds maximum of 300 words.' });
      }
    }

    let isCorrect = false;
    let verbalEvaluation = null;
    let evaluationMode = 'shared_backend';
    let attempt = null;

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
        isCorrect = false;
      }
    } else {
      return res.status(400).json({ message: 'Unsupported question kind' });
    }

    // Resolve active session
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

    // If Verbal question and requires evaluation (Email Writing or Passage Recall)
    if (question.kind === 'VerbalQuestion' && (question.verbalType === 'passage_recall' || question.verbalType === 'email_writing')) {
      const modeParam = req.body.evaluationMode || (apiKey ? 'AI_BYOK' : (req.body.useAI ? 'AI_SHARED' : 'RULE_ONLY'));
      const activeApiKey = apiKey || null;
      const providerName = requestedProvider || 'gemini';

      // 1. Run Deterministic Evaluator Engine (<50ms)
      let deterministicResult;
      if (question.verbalType === 'email_writing') {
        deterministicResult = DeterministicEvaluator.evaluateEmail(submittedAnswer[0], {
          minWords: question.minWords || 100,
          maxWords: question.maxWords || 250,
          guidelines: question.guidelines || []
        });
      } else {
        deterministicResult = DeterministicEvaluator.evaluatePassage(
          submittedAnswer[0],
          question.passageText || question.content?.statement || '',
          question.targetKeyFacts || []
        );
      }

      // 2. Prepare Question Snapshot
      const questionSnapshot = {
        emailPrompt: question.emailPrompt || question.content?.statement || '',
        passageText: question.passageText || '',
        guidelines: question.guidelines || [],
        targetKeyFacts: question.targetKeyFacts || [],
        minWords: Math.max(question.minWords || 0, 100),
        maxWords: Math.max(question.maxWords || 0, 250)
      };

      // 3. Determine AI Status & Quota
      let aiStatus = 'skipped';
      let runAsyncAI = false;

      if (modeParam === 'AI_SHARED' || modeParam === 'shared_backend') {
        const startOfToday = new Date();
        startOfToday.setUTCHours(0, 0, 0, 0);

        const emailQuestions = await Question.find({ verbalType: 'email_writing' }).select('_id');
        const emailQuestionIds = emailQuestions.map(q => q._id);

        const count = await UserAttempt.countDocuments({
          userId: req.user._id,
          questionId: { $in: emailQuestionIds },
          attemptedAt: { $gte: startOfToday },
          evaluationMode: { $in: ['AI_SHARED', 'shared_backend'] }
        });

        const limit = parseInt(process.env.SHARED_AI_DAILY_LIMIT || '10', 10);
        if (count >= limit) {
          aiStatus = 'quota_exceeded';
        } else {
          aiStatus = 'pending';
          runAsyncAI = true;
        }
      } else if (modeParam === 'AI_BYOK' || modeParam === 'byok_client') {
        aiStatus = 'pending';
        runAsyncAI = true;
      }

      // Create attempt record immediately
      attempt = await UserAttempt.create({
        userId: req.user._id,
        questionId: question._id,
        sessionId: activeSessionId,
        questionType: question.verbalType,
        visibility: question.visibility || 'official',
        submittedAnswer,
        isCorrect: (deterministicResult.ruleScore >= 60),
        timeTakenSec: timeTakenSec || 0,
        evaluationMode: modeParam,
        evaluationVersion: 'rule_v1',
        promptVersion: question.verbalType === 'passage_recall' ? 'passage_v2' : 'email_v3',
        aiModel: 'gemini-2.5-flash',
        schemaVersion: 1,
        snapshotVersion: 1,
        questionSnapshot,
        deterministic: deterministicResult,
        ai: {
          status: aiStatus,
          feedback: aiStatus === 'quota_exceeded' 
            ? 'Daily free AI practice limit reached. Connect a personal Gemini API key for unlimited AI Coaching.'
            : (aiStatus === 'pending' ? 'AI Deep Coaching is analyzing in background...' : 'AI Coaching was skipped for this attempt.')
        },
        verbalEvaluation: {
          status: aiStatus === 'pending' ? 'completed' : aiStatus,
          score: deterministicResult.ruleScore,
          grammarScore: deterministicResult.grammarMechanicsScore,
          keyPointsMatched: deterministicResult.guidelinesMatched || [],
          keyPointsPartial: deterministicResult.guidelinesPartial || [],
          keyPointsMissed: deterministicResult.guidelinesMissed || [],
          feedback: 'Evaluated using NQTCoder Deterministic Rule Engine v2.',
          evaluatedAt: new Date()
        },
        attemptedAt: new Date()
      });

      // Clear draft on successful submission
      await Draft.deleteMany({ userId: req.user._id, questionId: question._id }).catch(() => {});

      // Response payload returned instantly (<50ms)
      const responseData = {
        attemptId: attempt._id,
        isCorrect: attempt.isCorrect,
        deterministic: deterministicResult,
        aiStatus: aiStatus,
        ai: attempt.ai,
        verbalEvaluation: attempt.verbalEvaluation,
        evaluationMode: modeParam
      };

      // 4. Run Async Background AI Worker if pending
      if (runAsyncAI) {
        setImmediate(async () => {
          try {
            let evalResult;
            if (question.verbalType === 'passage_recall') {
              const { evaluatePassageRecall } = await import('../services/llmEvaluationService.js');
              evalResult = await evaluatePassageRecall(question.passageText || '', submittedAnswer[0]);
            } else {
              const evaluationService = new EmailEvaluationService(req.user._id);
              evalResult = await evaluationService.run(providerName, activeApiKey, {
                draft: submittedAnswer[0],
                emailPrompt: question.emailPrompt || question.content?.statement || '',
                guidelines: question.guidelines || [],
                minWords: Math.max(question.minWords || 0, 100),
                maxWords: Math.max(question.maxWords || 0, 250)
              });
            }

            await UserAttempt.findByIdAndUpdate(attempt._id, {
              'ai.status': 'completed',
              'ai.toneScore': evalResult.toneScore || evalResult.clarityScore || 85,
              'ai.tcsReadiness': (evalResult.score || 0) >= 80 ? 'High' : ((evalResult.score || 0) >= 60 ? 'Medium' : 'Low'),
              'ai.feedback': evalResult.feedback || 'Good effort on this task!',
              'ai.grammarErrors': evalResult.grammarErrors || [],
              'ai.strengths': evalResult.strengths || ['Clear structure', 'Followed word bounds'],
              'ai.weaknesses': evalResult.weaknesses || ['Could improve formal tone'],
              'ai.modelSuggestedAnswer': evalResult.modelSuggestedAnswer || '',
              'ai.evaluatedAt': new Date(),
              'verbalEvaluation.status': 'completed',
              'verbalEvaluation.score': evalResult.score || deterministicResult.ruleScore,
              'verbalEvaluation.feedback': evalResult.feedback || ''
            });
          } catch (bgErr) {
            console.error('[Async AI Background Worker Error]:', bgErr.message);
            const isQuota = bgErr.message.includes('429') || bgErr.message.includes('quota') || bgErr.message.includes('RESOURCE_EXHAUSTED');
            await UserAttempt.findByIdAndUpdate(attempt._id, {
              'ai.status': isQuota ? 'quota_exceeded' : 'failed',
              'ai.feedback': isQuota 
                ? 'AI quota limit was reached during background coaching.' 
                : `AI evaluation background failure: ${bgErr.message}`,
              'ai.evaluatedAt': new Date()
            });
          }
        });
      }

      return res.json(responseData);
    } else {
      // Create standard attempt for MCQ / Sentence Completion questions
      attempt = await UserAttempt.create({
        userId: req.user._id,
        questionId: question._id,
        sessionId: activeSessionId,
        submittedAnswer,
        isCorrect,
        timeTakenSec: timeTakenSec || 0,
        attemptedAt: new Date()
      });
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
      verbalEvaluation,
      attemptId: attempt?._id
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

/**
 * @desc    Get remaining NQTCoder Shared AI evaluations for today
 * @route   GET /api/practice/quota
 * @access  Private
 */
export const getPracticeQuota = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const emailQuestions = await Question.find({ verbalType: 'email_writing' }).select('_id');
    const emailQuestionIds = emailQuestions.map(q => q._id);

    const count = await UserAttempt.countDocuments({
      userId: req.user._id,
      questionId: { $in: emailQuestionIds },
      attemptedAt: { $gte: startOfToday },
      evaluationMode: 'shared_backend'
    });

    const limit = parseInt(process.env.SHARED_AI_DAILY_LIMIT || '10', 10);

    res.json({
      used: count,
      limit,
      remaining: Math.max(0, limit - count)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Get user draft for a question
 * @route   GET /api/practice/drafts/:questionId
 * @access  Private
 */
export const getQuestionDraft = async (req, res) => {
  try {
    const draft = await Draft.findOne({
      userId: req.user._id,
      questionId: req.params.questionId
    });
    res.json(draft || { content: '', timeRemainingSec: null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Save user draft for a question
 * @route   POST /api/practice/drafts/:questionId
 * @access  Private
 */
export const saveQuestionDraft = async (req, res) => {
  const { content, timeRemainingSec, mode, deviceId } = req.body;
  try {
    const draft = await Draft.findOneAndUpdate(
      { userId: req.user._id, questionId: req.params.questionId },
      {
        content: content || '',
        timeRemainingSec,
        mode: mode || 'practice',
        deviceId: deviceId || 'unknown',
        lastSavedAt: new Date(),
        $inc: { version: 1 }
      },
      { upsert: true, new: true }
    );
    res.json(draft);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Delete user draft for a question
 * @route   DELETE /api/practice/drafts/:questionId
 * @access  Private
 */
export const deleteQuestionDraft = async (req, res) => {
  try {
    await Draft.findOneAndDelete({
      userId: req.user._id,
      questionId: req.params.questionId
    });
    res.json({ success: true, message: 'Draft cleared successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Generate a private email writing question using AI
 * @route   POST /api/practice/questions/generate-ai
 * @access  Private
 */
export const generateAIQuestion = async (req, res) => {
  const { difficulty, communicationType, apiKey, provider } = req.body;
  try {
    const activeApiKey = apiKey || null;
    const activeProvider = provider || 'gemini';

    // Limit check if NQTCoder Shared AI is used
    if (!activeApiKey) {
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);

      const emailQuestions = await Question.find({ verbalType: 'email_writing' }).select('_id');
      const emailQuestionIds = emailQuestions.map(q => q._id);

      const count = await UserAttempt.countDocuments({
        userId: req.user._id,
        questionId: { $in: emailQuestionIds },
        attemptedAt: { $gte: startOfToday },
        evaluationMode: 'shared_backend'
      });

      const limit = parseInt(process.env.SHARED_AI_DAILY_LIMIT || '10', 10);
      if (count >= limit) {
        return res.status(429).json({
          error: 'daily_quota_exhausted',
          message: 'Your free daily AI tokens are used up for today. Please come back tomorrow or add your personal free Gemini API key in /ai for unlimited practice.'
        });
      }
    }

    const generator = new QuestionGeneratorService(req.user._id);
    const data = await generator.run(activeProvider, activeApiKey, {
      difficulty: difficulty || 'medium',
      communicationType: communicationType || 'any'
    });

    const targetTopic = req.body.topic === 'passage-recall' ? 'passage-recall' : 'email-writing';
    const isPassage = targetTopic === 'passage-recall';

    // Generate unique slug & questionId
    const count = await Question.countDocuments({});
    const randomHex = Math.floor(Math.random() * 1000).toString(16).padStart(3, '0');
    const slug = `ai-generated-${isPassage ? 'passage' : 'email'}-${count}-${randomHex}`;
    const questionId = `AI-${isPassage ? 'PASSAGE' : 'EMAIL'}-${count}-${randomHex}`.toUpperCase();

    const isAdmin = req.user && req.user.role === 'admin';
    const isPublic = isAdmin ? (req.body.isPublic === true) : false;

    // Create private question record
    const newQuestion = await VerbalQuestion.create({
      questionNo: Date.now() + Math.floor(Math.random() * 1000000),
      questionId,
      slug,
      domain: 'aptitude',
      section: 'verbal',
      topic: targetTopic,
      displayName: isPassage ? 'Passage Recall' : 'Email Writing',
      difficulty: difficulty || 'medium',
      isPublic,
      meta: {
        createdBy: req.user._id,
        status: 'published'
      },
      verbalType: isPassage ? 'passage_recall' : 'email_writing',
      emailPrompt: data.emailPrompt,
      passageText: isPassage ? data.emailPrompt : undefined,
      targetKeyFacts: isPassage ? (data.guidelines || []).map(g => ({ text: g, category: 'fact' })) : undefined,
      readingDurationSec: 30,
      guidelines: data.guidelines,
      minWords: data.minWords || 100,
      maxWords: data.maxWords || 250,
      writingDurationSecEmail: data.estimatedTime || 540,
      estimatedTime: data.estimatedTime || 540,
      skills: data.skills || [],
      industry: data.industry || 'IT',
      companyStyle: data.companyStyle || 'TCS',
      communicationType: data.communicationType || 'Internal',
      tags: data.tags || ['verbal', isPassage ? 'passage-recall' : 'email', 'writing', 'ai-generated']
    });

    res.json(newQuestion);
  } catch (err) {
    console.error('generateAIQuestion error:', err.message);
    const isQuota = (err.message || '').includes('429') || (err.message || '').includes('quota') || (err.message || '').includes('RESOURCE_EXHAUSTED') || (err.message || '').includes('Quota');
    if (isQuota) {
      const errType = req.body.apiKey ? 'personal_quota_exhausted' : 'daily_quota_exhausted';
      return res.status(429).json({
        error: errType,
        message: req.body.apiKey
          ? 'Your personal Gemini API key quota is exhausted on Google\'s end.'
          : 'Your free daily AI tokens are used up for today. Please come back tomorrow or add your personal free Gemini API key in /ai for unlimited practice.'
      });
    }
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Convert custom scenario description into private question
 * @route   POST /api/practice/questions/custom-scenario
 * @access  Private
 */
export const generateCustomScenario = async (req, res) => {
  const { userScenario, apiKey, provider, topic } = req.body;
  if (!userScenario || userScenario.trim().length < 5) {
    return res.status(400).json({ message: 'Valid scenario description is required' });
  }

  try {
    const activeApiKey = apiKey || null;
    const activeProvider = provider || 'gemini';
    const targetTopic = topic === 'passage-recall' ? 'passage-recall' : 'email-writing';
    const isPassage = targetTopic === 'passage-recall';

    // Limit check if Shared AI is used
    if (!activeApiKey) {
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);

      const emailQuestions = await Question.find({ verbalType: isPassage ? 'passage_recall' : 'email_writing' }).select('_id');
      const emailQuestionIds = emailQuestions.map(q => q._id);

      const count = await UserAttempt.countDocuments({
        userId: req.user._id,
        questionId: { $in: emailQuestionIds },
        attemptedAt: { $gte: startOfToday },
        evaluationMode: 'shared_backend'
      });

      const limit = parseInt(process.env.SHARED_AI_DAILY_LIMIT || '10', 10);
      if (count >= limit) {
        return res.status(429).json({
          error: 'daily_quota_exhausted',
          message: 'Daily free AI practice limit reached. Add a personal API key to continue.'
        });
      }
    }

    const converter = new ScenarioConverterService(req.user._id);
    const data = await converter.run(activeProvider, activeApiKey, { userScenario });

    const count = await Question.countDocuments({});
    const randomHex = Math.floor(Math.random() * 1000).toString(16).padStart(3, '0');
    const slug = `custom-scenario-${isPassage ? 'passage' : 'email'}-${count}-${randomHex}`;
    const questionId = `CST-${isPassage ? 'PASSAGE' : 'EMAIL'}-${count}-${randomHex}`.toUpperCase();

    const isAdmin = req.user && req.user.role === 'admin';
    const isPublic = isAdmin ? (req.body.isPublic === true) : false;

    const newQuestion = await VerbalQuestion.create({
      questionNo: Date.now() + Math.floor(Math.random() * 1000000) + 1,
      questionId,
      slug,
      domain: 'aptitude',
      section: 'verbal',
      topic: targetTopic,
      displayName: isPassage ? 'Passage Recall' : 'Email Writing',
      difficulty: 'medium',
      isPublic,
      meta: {
        createdBy: req.user._id,
        status: 'published'
      },
      verbalType: isPassage ? 'passage_recall' : 'email_writing',
      emailPrompt: data.emailPrompt,
      passageText: isPassage ? data.emailPrompt : undefined,
      targetKeyFacts: isPassage ? (data.guidelines || []).map(g => ({ text: g, category: 'fact' })) : undefined,
      readingDurationSec: 30,
      guidelines: data.guidelines,
      minWords: data.minWords || 100,
      maxWords: data.maxWords || 250,
      writingDurationSecEmail: data.estimatedTime || 540,
      estimatedTime: data.estimatedTime || 540,
      skills: data.skills || [],
      industry: data.industry || 'Custom',
      companyStyle: data.companyStyle || 'Formal',
      communicationType: data.communicationType || 'Internal',
      tags: data.tags || ['verbal', 'email', 'writing', 'custom']
    });

    res.json(newQuestion);
  } catch (err) {
    console.error('generateCustomScenario error:', err.message);
    const isQuota = (err.message || '').includes('429') || (err.message || '').includes('quota') || (err.message || '').includes('RESOURCE_EXHAUSTED') || (err.message || '').includes('Quota');
    if (isQuota) {
      const errType = req.body.apiKey ? 'personal_quota_exhausted' : 'daily_quota_exhausted';
      return res.status(429).json({
        error: errType,
        message: req.body.apiKey
          ? 'Your personal Gemini API key quota is exhausted on Google\'s end.'
          : 'The shared AI server quota is temporarily exhausted on Google\'s end. Connect a personal free Gemini API key in Settings to continue.'
      });
    }
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Get AI Coach improvement suggestions and diffs
 * @route   POST /api/practice/questions/:id/improve
 * @access  Private
 */
export const getAICoachImprovements = async (req, res) => {
  const { attemptId, apiKey, provider } = req.body;
  try {
    const attempt = await UserAttempt.findById(attemptId).populate('questionId');
    if (!attempt) {
      return res.status(404).json({ message: 'User attempt not found' });
    }

    const activeApiKey = apiKey || null;
    const activeProvider = provider || 'gemini';

    // Shared quota check
    if (!activeApiKey) {
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);
      const verbalQuestions = await Question.find({ kind: 'VerbalQuestion' }).select('_id');
      const verbalIds = verbalQuestions.map(q => q._id);

      const count = await UserAttempt.countDocuments({
        userId: req.user._id,
        questionId: { $in: verbalIds },
        attemptedAt: { $gte: startOfToday },
        evaluationMode: 'shared_backend'
      });

      const limit = parseInt(process.env.SHARED_AI_DAILY_LIMIT || '10', 10);
      if (count >= limit) {
        return res.status(429).json({
          error: 'daily_quota_exhausted',
          message: 'Daily free AI practice limit reached (0/10 remaining). Connect a personal free Gemini API key in /ai to continue.'
        });
      }
    }

    const rewriteService = new EmailRewriteService(req.user._id);
    const data = await rewriteService.run(activeProvider, activeApiKey, {
      draft: attempt.submittedAnswer[0],
      emailPrompt: attempt.questionSnapshot?.emailPrompt || attempt.questionId?.emailPrompt || '',
      guidelines: attempt.questionSnapshot?.guidelines || attempt.questionId?.guidelines || []
    });

    res.json(data);
  } catch (err) {
    console.error('getAICoachImprovements error:', err.message);
    const isQuota = (err.message || '').includes('429') || (err.message || '').includes('quota') || (err.message || '').includes('RESOURCE_EXHAUSTED');
    if (isQuota) {
      return res.status(429).json({
        error: req.body.apiKey ? 'personal_quota_exhausted' : 'daily_quota_exhausted',
        message: req.body.apiKey
          ? 'Your personal Gemini API key quota is exhausted on Google\'s end.'
          : 'Daily free AI Coaching server quota limit reached. Connect your free Gemini API key in /ai for unlimited access.'
      });
    }
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Get 24h debug logs for administrators
 * @route   GET /api/practice/debug-logs
 * @access  Private (Admin Only)
 */
export const getAIDebugLogs = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  try {
    const logs = await DeveloperDebugLog.find({})
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Get active AI health check diagnostics
 * @route   GET /api/practice/health
 * @access  Public
 */
export const getAIHealthStatus = async (req, res) => {
  try {
    const provider = AIProviderFactory.getProvider('gemini');
    const startTime = Date.now();
    const isHealthy = await provider.healthCheck();
    const latency = Date.now() - startTime;

    res.json({
      provider: 'google-gemini',
      status: isHealthy ? 'healthy' : 'degraded',
      latencyMs: latency
    });
  } catch (err) {
    res.json({
      provider: 'google-gemini',
      status: 'degraded',
      error: err.message
    });
  }
};

/**
 * @desc    Get AI background coaching status for an attempt
 * @route   GET /api/practice/attempts/:attemptId/ai-status
 * @access  Private
 */
export const getAttemptAIStatus = async (req, res) => {
  try {
    const attempt = await UserAttempt.findOne({
      _id: req.params.attemptId,
      userId: req.user._id
    });
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    res.json({
      attemptId: attempt._id,
      aiStatus: attempt.ai?.status || 'skipped',
      ai: attempt.ai,
      deterministic: attempt.deterministic,
      verbalEvaluation: attempt.verbalEvaluation
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
