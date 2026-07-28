import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client lazily to avoid throwing errors if key is initially missing
let genAI = null;

const getGenAI = () => {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined. LLM evaluation will use fallbacks.');
    return null;
  }
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
  } catch (error) {
    console.error('Failed to initialize GoogleGenerativeAI:', error.message);
    return null;
  }
};

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

/**
 * Calls Gemini with automatic fallback: tries gemini-2.5-flash first,
 * retries with gemini-1.5-flash on 503 overload errors.
 */
const generateWithFallback = async (prompt) => {
  const ai = getGenAI();
  if (!ai) return null;

  for (const modelName of MODELS) {
    try {
      const m = ai.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await m.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const is503 = err.status === 503 || (err.message || '').includes('503') || (err.message || '').includes('Service Unavailable');
      if (is503 && modelName !== MODELS[MODELS.length - 1]) {
        console.warn(`${modelName} returned 503, retrying with fallback model...`);
        continue;
      }
      throw err; // rethrow for non-503 or last model
    }
  }
};


/**
 * Helper to determine failure type based on error message
 */
const handleApiError = (error) => {
  const msg = error.message || '';
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429') || msg.includes('quota')) {
    return {
      status: 'quota_exceeded',
      score: 0,
      feedback: 'AI evaluation is temporarily unavailable due to the daily free quota limit. Your response has been saved.',
      evaluatedAt: new Date()
    };
  }
  return {
    status: 'failed',
    score: 0,
    feedback: `AI evaluation failed: ${msg}`,
    evaluatedAt: new Date()
  };
};

/**
 * Evaluates a Passage Recall response using Gemini
 */
export const evaluatePassageRecall = async (passageText, submittedAnswer) => {
  if (!getGenAI()) {
    return {
      status: 'failed',
      score: 0,
      feedback: 'Gemini API client not initialized. Check server configurations.',
      evaluatedAt: new Date()
    };
  }

  const prompt = `
You are an expert English Language examiner. Evaluate how accurately the student recalled the reference passage after a short delay. Grade strictly but provide constructive feedback.

Reference Passage:
"${passageText}"

Student Response:
"${submittedAnswer}"

You must respond with a raw JSON object containing:
{
  "score": <number, 0-100 representing overall recall quality>,
  "grammarScore": <number, 0-100 representing grammar/spelling quality>,
  "vocabularyScore": <number, 0-100 representing choice of words>,
  "contentRelevanceScore": <number, 0-100 representing how many facts and details they correctly recalled>,
  "feedback": "detailed textual analysis of memory accuracy, missing facts, and fluency",
  "grammarErrors": [
    { "originalText": "error snippet from response", "suggestedFix": "correction", "explanation": "short rule description" }
  ],
  "modelSuggestedAnswer": "a highly coherent version reflecting the original passage"
}
`;

  try {
    const responseText = await generateWithFallback(prompt);
    const parsed = JSON.parse(responseText);

    return {
      status: 'completed',
      score: parsed.score || 0,
      grammarScore: parsed.grammarScore || 0,
      vocabularyScore: parsed.vocabularyScore || 0,
      contentRelevanceScore: parsed.contentRelevanceScore || 0,
      feedback: parsed.feedback || '',
      grammarErrors: parsed.grammarErrors || [],
      modelSuggestedAnswer: parsed.modelSuggestedAnswer || '',
      evaluatedAt: new Date()
    };
  } catch (error) {
    console.error('Passage recall LLM evaluation error:', error);
    return handleApiError(error);
  }
};

/**
 * Evaluates an Email Writing response using Gemini
 */
export const evaluateEmailWriting = async (emailPrompt, guidelines, submittedAnswer) => {
  if (!getGenAI()) {
    return {
      status: 'failed',
      score: 0,
      feedback: 'Gemini API client not initialized. Check server configurations.',
      evaluatedAt: new Date()
    };
  }

  const prompt = `
You are an English corporate communication evaluator. Grade the student's email writing response based on formatting, business etiquette, clarity, and inclusion of required guidelines.

Email Prompt/Scenario:
"${emailPrompt}"

Required Guidelines/Phrases to cover:
${JSON.stringify(guidelines)}

Student Response:
"${submittedAnswer}"

You must respond with a raw JSON object containing:
{
  "score": <number, 0-100 representing overall quality>,
  "grammarScore": <number, 0-100 representing grammar/spelling quality>,
  "vocabularyScore": <number, 0-100 representing professional vocabulary and tone>,
  "contentRelevanceScore": <number, 0-100 representing how well they answered the prompt and guidelines>,
  "feedback": "detailed evaluation of tone, greeting, closing, structure, and readability",
  "grammarErrors": [
    { "originalText": "error snippet", "suggestedFix": "correction", "explanation": "short description" }
  ],
  "keyPointsMatched": ["list of guidelines covered"],
  "keyPointsMissed": ["list of guidelines omitted"],
  "modelSuggestedAnswer": "a perfect example corporate email answering the prompt"
}
`;

  try {
    const responseText = await generateWithFallback(prompt);
    const parsed = JSON.parse(responseText);

    return {
      status: 'completed',
      score: parsed.score || 0,
      grammarScore: parsed.grammarScore || 0,
      vocabularyScore: parsed.vocabularyScore || 0,
      contentRelevanceScore: parsed.contentRelevanceScore || 0,
      feedback: parsed.feedback || '',
      grammarErrors: parsed.grammarErrors || [],
      keyPointsMatched: parsed.keyPointsMatched || [],
      keyPointsMissed: parsed.keyPointsMissed || [],
      modelSuggestedAnswer: parsed.modelSuggestedAnswer || '',
      evaluatedAt: new Date()
    };
  } catch (error) {
    console.error('Email writing LLM evaluation error:', error);
    return handleApiError(error);
  }
};
