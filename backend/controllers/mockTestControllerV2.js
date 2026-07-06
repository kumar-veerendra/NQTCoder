import TestBlueprint from '../models/TestBlueprint.js';
import TestInstance from '../models/TestInstance.js';
import Question, { MCQQuestion, CodingQuestion } from '../models/Question.js';
import Submission from '../models/Submission.js';
import { findQuestionByIdOrSlug, getMCQByFilter } from '../utils/questionLoader.js';

const buildQuestionMapByIds = async (questionRefs, selectFields = '') => {
  const questionIds = [...new Set(
    questionRefs
      .map(ref => ref?.toString?.())
      .filter(Boolean)
  )];

  if (questionIds.length === 0) return new Map();

  let query = Question.find({ _id: { $in: questionIds } });
  if (selectFields) {
    query = query.select(selectFields);
  }

  const docs = await query.lean();
  return new Map(docs.map(doc => [doc._id.toString(), doc]));
};

/**
 * @desc    Get all active test blueprints
 * @route   GET /api/mocktests/blueprints
 * @access  Private
 */
export const getMockBlueprints = async (req, res) => {
  try {
    const blueprints = await TestBlueprint.find({}).sort({ createdAt: -1 });
    res.json(blueprints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Start or resume a mock test instance based on a blueprint
 * @route   POST /api/mocktests/blueprints/:blueprintId/start
 * @access  Private
 */
export const startMockInstance = async (req, res) => {
  const { blueprintId } = req.params;

  try {
    const blueprint = await TestBlueprint.findOne({ blueprintId });
    if (!blueprint) {
      return res.status(404).json({ message: 'Blueprint not found' });
    }

    // Check if the user already has an active session for this blueprint
    let activeInstance = await TestInstance.findOne({
      userId: req.user._id,
      blueprintId,
      status: 'in_progress'
    });

    if (activeInstance) {
      return res.json({ instance: activeInstance, resumed: true });
    }

    // Dynamic random sampling engine
    const questionsToSet = [];
    let secIdx = 0;

    for (const sec of blueprint.sections) {
      const query = { kind: sec.sourceCategory === 'programming' ? 'CodingQuestion' : 'MCQQuestion' };
      
      if (sec.sourceCategory !== 'programming') {
        query.section = sec.sourceCategory; // e.g. "quant", "logical"
      } else {
        query.domain = 'coding';
      }

      if (sec.difficultyFilter) {
        query.difficulty = sec.difficultyFilter;
      }

      // Fetch all candidate IDs matching criteria
      let candidates = [];
      if (sec.sourceCategory !== 'programming') {
        candidates = await getMCQByFilter({
          section: query.section,
          difficulty: query.difficulty
        });
      } else {
        candidates = await Question.find(query).select('_id');
      }
      
      // Sample randomly without repeats
      const itemCount = Math.min(sec.itemCount, candidates.length);
      const shuffled = candidates.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, itemCount);

      for (const item of selected) {
        questionsToSet.push({
          questionId: item._id,
          sectionIndex: secIdx,
          submittedAnswer: [],
          isCorrect: false,
          isAttempted: false,
          timeSpentSec: 0
        });
      }
      secIdx++;
    }

    const newInstance = await TestInstance.create({
      blueprintId,
      userId: req.user._id,
      status: 'in_progress',
      questions: questionsToSet,
      startedAt: new Date(),
      sectionStartedAt: new Date()
    });

    res.status(201).json({ instance: newInstance, resumed: false });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get details of a mock test instance (active or completed)
 * @route   GET /api/mocktests/instances/:instanceId
 * @access  Private
 */
export const getMockInstance = async (req, res) => {
  const { instanceId } = req.params;

  try {
    const instance = await TestInstance.findOne({
      _id: instanceId,
      userId: req.user._id
    });

    if (!instance) {
      return res.status(404).json({ message: 'Test instance not found' });
    }

    const blueprint = await TestBlueprint.findOne({ blueprintId: instance.blueprintId });

    // Auto-advance logic if resumed/polled and the active section timer has expired while away
    if (instance.status === 'in_progress' && blueprint) {
      let activeSec = blueprint.sections[instance.currentSectionIndex];
      let secondsElapsed = Math.floor((new Date() - instance.sectionStartedAt) / 1000);
      let timeLimitSec = activeSec.durationMinutes * 60;
      
      while (secondsElapsed >= timeLimitSec && instance.status === 'in_progress') {
        const nextIndex = instance.currentSectionIndex + 1;
        if (nextIndex >= blueprint.sections.length) {
          // Final section expired! Terminate & grade the session
          let calculatedScore = 0;
          let maximumScore = 0;
          const questionMap = await buildQuestionMapByIds(instance.questions.map(item => item.questionId));
          const codingQuestionIds = [];
          for (const item of instance.questions) {
            const mappedQuestion = questionMap.get(item.questionId.toString());
            if (mappedQuestion?.kind === 'CodingQuestion') {
              codingQuestionIds.push(mappedQuestion._id);
            }
          }
          const acceptedCodingSubmissions = await Submission.find({
            userId: req.user._id,
            status: 'Accepted',
            createdAt: { $gte: instance.startedAt },
            questionId: { $in: codingQuestionIds }
          }).select('questionId').lean();
          const acceptedCodingQuestionSet = new Set(
            acceptedCodingSubmissions.map(sub => sub.questionId.toString())
          );

          for (const item of instance.questions) {
            const question =
              questionMap.get(item.questionId.toString()) ||
              await findQuestionByIdOrSlug(item.questionId);
            if (!question) continue;

            if (question.kind === 'MCQQuestion') {
              const itemWeight = 1;
              maximumScore += itemWeight;

              const isCorrect =
                item.submittedAnswer?.length === question.correctAnswer?.length &&
                item.submittedAnswer.every(val => question.correctAnswer.includes(val));

              item.isCorrect = isCorrect;
              if (isCorrect) {
                calculatedScore += itemWeight;
              }
            } else if (question.kind === 'CodingQuestion') {
              const itemWeight = 10;
              maximumScore += itemWeight;
              item.isCorrect = acceptedCodingQuestionSet.has(question._id.toString());
              if (item.isCorrect) {
                calculatedScore += itemWeight;
              }
            }
          }

          instance.status = 'completed';
          instance.totalScore = calculatedScore;
          instance.maxScore = maximumScore;
          instance.endedAt = new Date();
          break;
        } else {
          // Move to next section, carry over the time overshoot
          instance.currentSectionIndex = nextIndex;
          const overshootSeconds = secondsElapsed - timeLimitSec;
          instance.sectionStartedAt = new Date(Date.now() - (overshootSeconds * 1000));
          
          activeSec = blueprint.sections[nextIndex];
          secondsElapsed = Math.floor((new Date() - instance.sectionStartedAt) / 1000);
          timeLimitSec = activeSec.durationMinutes * 60;
        }
      }

      if (instance.isModified()) {
        await instance.save();
      }
    }

    const isCompleted = instance.status === 'completed';

    // Populate question details. Strip answer keys if test is in progress
    const selectFields = isCompleted ? '' : '-correctAnswer -explanation -hiddenTestCases';
    const questionMap = await buildQuestionMapByIds(
      instance.questions.map(item => item.questionId),
      selectFields
    );
    
    // Manual populate to select specific fields based on completed status
    const populatedQuestions = [];
    for (const item of instance.questions) {
      let questionDoc = questionMap.get(item.questionId.toString());
      if (!questionDoc) {
        questionDoc = await findQuestionByIdOrSlug(item.questionId);
      }
      if (questionDoc) {
        const docObj = typeof questionDoc.toObject === 'function' ? questionDoc.toObject() : { ...questionDoc };
        if (!isCompleted) {
          delete docObj.correctAnswer;
          delete docObj.explanation;
          delete docObj.hiddenTestCases;
        }
        populatedQuestions.push({
          ...item.toObject(),
          details: docObj
        });
      }
    }

    let activeSectionTimeRemainingSec = 0;
    if (instance.status === 'in_progress' && blueprint) {
      const activeSec = blueprint.sections[instance.currentSectionIndex];
      const secondsElapsed = Math.floor((new Date() - instance.sectionStartedAt) / 1000);
      activeSectionTimeRemainingSec = Math.max(0, (activeSec.durationMinutes * 60) - secondsElapsed);
    }

    res.json({
      _id: instance._id,
      blueprintId: instance.blueprintId,
      status: instance.status,
      totalScore: instance.totalScore,
      maxScore: instance.maxScore,
      tabSwitchesCount: instance.tabSwitchesCount,
      currentSectionIndex: instance.currentSectionIndex,
      activeSectionTimeRemainingSec,
      sections: blueprint ? blueprint.sections : [],
      startedAt: instance.startedAt,
      endedAt: instance.endedAt,
      questions: populatedQuestions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Submit an answer to a single question in mock test
 * @route   POST /api/mocktests/instances/:instanceId/submit-item
 * @access  Private
 */
export const submitMockItem = async (req, res) => {
  const { instanceId } = req.params;
  const { questionId, submittedAnswer, timeSpentSec } = req.body;

  try {
    const instance = await TestInstance.findOne({
      _id: instanceId,
      userId: req.user._id,
      status: 'in_progress'
    });

    if (!instance) {
      return res.status(400).json({ message: 'Active test instance not found' });
    }

    // Find and update item in questions array
    const questionItem = instance.questions.find(
      q => q.questionId.toString() === questionId
    );

    if (!questionItem) {
      return res.status(404).json({ message: 'Question not found in test instance' });
    }

    questionItem.submittedAnswer = submittedAnswer || [];
    questionItem.isAttempted = true;
    questionItem.timeSpentSec += (timeSpentSec || 0);

    await instance.save();
    res.json({ message: 'Answer recorded successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Record tab switch/violation warning
 * @route   POST /api/mocktests/instances/:instanceId/violation
 * @access  Private
 */
export const recordMockViolation = async (req, res) => {
  const { instanceId } = req.params;

  try {
    const instance = await TestInstance.findOneAndUpdate(
      { _id: instanceId, userId: req.user._id, status: 'in_progress' },
      { $inc: { tabSwitchesCount: 1 } },
      { new: true }
    );

    if (!instance) {
      return res.status(400).json({ message: 'Active test instance not found' });
    }

    res.json({ tabSwitchesCount: instance.tabSwitchesCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Grading and finishing a mock test instance
 * @route   POST /api/mocktests/instances/:instanceId/finish
 * @access  Private
 */
const gradeMockInstanceHelper = async (instance, userId) => {
  const { evaluatePassageRecall, evaluateEmailWriting } = await import('../services/llmEvaluationService.js');
  
  let calculatedScore = 0;
  let maximumScore = 0;
  const questionMap = await buildQuestionMapByIds(instance.questions.map(item => item.questionId));
  const codingQuestionIds = [];
  for (const item of instance.questions) {
    const mappedQuestion = questionMap.get(item.questionId.toString());
    if (mappedQuestion?.kind === 'CodingQuestion') {
      codingQuestionIds.push(mappedQuestion._id);
    }
  }
  const acceptedCodingSubmissions = await Submission.find({
    userId,
    status: 'Accepted',
    createdAt: { $gte: instance.startedAt },
    questionId: { $in: codingQuestionIds }
  }).select('questionId').lean();
  const acceptedCodingQuestionSet = new Set(
    acceptedCodingSubmissions.map(sub => sub.questionId.toString())
  );

  for (const item of instance.questions) {
    const question =
      questionMap.get(item.questionId.toString()) ||
      await findQuestionByIdOrSlug(item.questionId);
    if (!question) continue;

    if (question.kind === 'MCQQuestion') {
      const itemWeight = 1;
      maximumScore += itemWeight;

      const isCorrect =
        item.submittedAnswer?.length === question.correctAnswer?.length &&
        item.submittedAnswer.every(val => question.correctAnswer.includes(val));

      item.isCorrect = isCorrect;
      if (isCorrect) {
        calculatedScore += itemWeight;
      }
    } else if (question.kind === 'CodingQuestion') {
      const itemWeight = 10;
      maximumScore += itemWeight;
      item.isCorrect = acceptedCodingQuestionSet.has(question._id.toString());
      if (item.isCorrect) {
        calculatedScore += itemWeight;
      }
    } else if (question.kind === 'VerbalQuestion') {
      const itemWeight = question.meta?.marks || 1;
      maximumScore += itemWeight;

      if (question.verbalType === 'sentence_completion') {
        const isCorrect = (question.blanks || []).every((blank, idx) => {
          const studentAns = (item.submittedAnswer?.[idx] || '').trim().toLowerCase();
          return (blank.acceptableAnswers || []).some(
            acc => acc.trim().toLowerCase() === studentAns
          );
        });
        item.isCorrect = isCorrect;
        if (isCorrect) {
          calculatedScore += itemWeight;
        }
      } else if (question.verbalType === 'passage_recall' || question.verbalType === 'email_writing') {
        // If not attempted, score is 0
        if (!item.isAttempted || !item.submittedAnswer?.[0]) {
          item.isCorrect = false;
          item.verbalEvaluation = {
            status: 'failed',
            score: 0,
            feedback: 'No response submitted.'
          };
        } else {
          // Call LLM evaluation service
          let evalResult;
          if (question.verbalType === 'passage_recall') {
            evalResult = await evaluatePassageRecall(question.passageText, item.submittedAnswer[0]);
          } else {
            evalResult = await evaluateEmailWriting(question.emailPrompt, question.guidelines, item.submittedAnswer[0]);
          }
          item.verbalEvaluation = evalResult;
          item.isCorrect = evalResult.status === 'completed' && (evalResult.score >= 60);
          if (item.isCorrect) {
            calculatedScore += itemWeight;
          }
        }
      }
    }
  }

  instance.status = 'completed';
  instance.totalScore = calculatedScore;
  instance.maxScore = maximumScore;
  instance.endedAt = new Date();
  
  // Save instance changes
  await instance.save();

  return { totalScore: calculatedScore, maxScore: maximumScore };
};

export const finishMockInstance = async (req, res) => {
  const { instanceId } = req.params;

  try {
    const instance = await TestInstance.findOne({
      _id: instanceId,
      userId: req.user._id,
      status: 'in_progress'
    });

    if (!instance) {
      return res.status(400).json({ message: 'Active test instance not found' });
    }

    const { totalScore, maxScore } = await gradeMockInstanceHelper(instance, req.user._id);

    res.json({
      message: 'Test completed and graded successfully',
      totalScore,
      maxScore
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Submit current section and advance to the next section
 * @route   POST /api/mocktests/instances/:instanceId/next-section
 * @access  Private
 */
export const nextSectionMockInstance = async (req, res) => {
  const { instanceId } = req.params;

  try {
    const instance = await TestInstance.findOne({
      _id: instanceId,
      userId: req.user._id,
      status: 'in_progress'
    });

    if (!instance) {
      return res.status(400).json({ message: 'Active test instance not found' });
    }

    const blueprint = await TestBlueprint.findOne({ blueprintId: instance.blueprintId });
    if (!blueprint) {
      return res.status(404).json({ message: 'Blueprint not found' });
    }

    const nextIndex = instance.currentSectionIndex + 1;

    if (nextIndex >= blueprint.sections.length) {
      // Completed the final section! Auto-grade and finalize the exam using helper
      const { totalScore, maxScore } = await gradeMockInstanceHelper(instance, req.user._id);

      return res.json({
        message: 'Exam finalized and graded successfully',
        completed: true,
        totalScore,
        maxScore
      });
    }

    // Move to next section
    instance.currentSectionIndex = nextIndex;
    instance.sectionStartedAt = new Date();
    await instance.save();

    res.json({
      message: 'Advanced to next section successfully',
      completed: false,
      currentSectionIndex: nextIndex
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user's mock test history
 * @route   GET /api/mocktests/instances/history
 * @access  Private
 */
export const getMockHistory = async (req, res) => {
  try {
    const history = await TestInstance.find({
      userId: req.user._id,
      status: 'completed'
    }).sort({ endedAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
