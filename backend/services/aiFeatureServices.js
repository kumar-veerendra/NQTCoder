import { AIProviderFactory } from './aiProviderInterface.js';
import { getPrompt } from './promptRegistry.js';
import DeveloperDebugLog from '../models/DeveloperDebugLog.js';

class AIFeatureService {
  constructor(userId = null) {
    this.userId = userId;
  }

  async _logDebug(providerName, modelName, latencyMs, retryCount, promptVersion, success, errorReason = null) {
    try {
      await DeveloperDebugLog.create({
        userId: this.userId,
        provider: providerName,
        model: modelName,
        latencyMs,
        retryCount,
        promptVersion,
        validationSuccess: success,
        errorReason
      });
    } catch (err) {
      console.error('[Debug Logger Failed]:', err.message);
    }
  }

  /**
   * Run the service execution with retry and validation policies
   */
  async run(providerName, apiKey, requestPayload) {
    throw new Error('run() must be implemented.');
  }
}

export class EmailEvaluationService extends AIFeatureService {
  async run(providerName, apiKey, { draft, emailPrompt, guidelines, minWords, maxWords }) {
    const provider = AIProviderFactory.getProvider(providerName, apiKey);
    const promptConfig = getPrompt('email_evaluation');
    const userContent = `Scenario Prompt: "${emailPrompt}"
Guidelines to cover: ${JSON.stringify(guidelines)}
Word Limits: ${minWords} - ${maxWords} words

Student Submission:
<student_draft>
${draft}
</student_draft>`;

    let retryCount = 0;
    const startTime = Date.now();
    const modelUsed = providerName.toLowerCase().includes('gemini') ? 'gemini-2.5-flash' : 'default';

    while (retryCount <= 1) {
      try {
        const result = await provider.evaluate(promptConfig, userContent);
        
        // Validation
        const isValid = this._validate(result);
        if (isValid) {
          const latencyMs = Date.now() - startTime;
          await this._logDebug(providerName, modelUsed, latencyMs, retryCount, promptConfig.version, true);
          
          // Map metrics block into top level to retain legacy frontend compatibility
          return {
            status: 'completed',
            score: result.score,
            grammarScore: result.metrics?.grammar ?? 0,
            vocabularyScore: result.metrics?.vocabulary ?? 0,
            contentRelevanceScore: result.metrics?.relevance ?? 0,
            toneScore: result.metrics?.tone ?? 0,
            structureScore: result.metrics?.structure ?? 0,
            clarityScore: result.metrics?.clarity ?? 0,
            concisenessScore: result.metrics?.conciseness ?? 0,
            tcsReadiness: result.tcsReadiness || 'Medium',
            feedback: result.feedback || '',
            grammarErrors: result.grammarErrors || [],
            keyPointsMatched: result.keyPointsMatched || [],
            keyPointsMissed: result.keyPointsMissed || [],
            modelSuggestedAnswer: result.modelSuggestedAnswer || '',
            provider: providerName,
            model: modelUsed,
            promptVersion: promptConfig.version,
            temperature: promptConfig.temperature
          };
        } else {
          throw new Error('AI response schema validation failed');
        }
      } catch (err) {
        console.warn(`[Evaluation Service] Attempt ${retryCount + 1} failed: ${err.message}`);
        retryCount++;
        if (retryCount > 1) {
          const latencyMs = Date.now() - startTime;
          await this._logDebug(providerName, modelUsed, latencyMs, retryCount - 1, promptConfig.version, false, err.message);
          throw err;
        }
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  _validate(data) {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.score !== 'number' || data.score < 0 || data.score > 100) return false;
    if (!data.metrics || typeof data.metrics !== 'object') return false;
    
    const requiredMetrics = ['grammar', 'vocabulary', 'tone', 'structure', 'relevance'];
    for (const m of requiredMetrics) {
      if (typeof data.metrics[m] !== 'number' || data.metrics[m] < 0 || data.metrics[m] > 100) return false;
    }
    
    if (typeof data.feedback !== 'string') return false;
    if (!Array.isArray(data.grammarErrors)) return false;
    if (!Array.isArray(data.keyPointsMatched) || !Array.isArray(data.keyPointsMissed)) return false;
    if (typeof data.modelSuggestedAnswer !== 'string') return false;
    
    return true;
  }
}

export class EmailRewriteService extends AIFeatureService {
  async run(providerName, apiKey, { draft, emailPrompt, guidelines }) {
    const provider = AIProviderFactory.getProvider(providerName, apiKey);
    const promptConfig = getPrompt('email_rewrite');
    const userContent = `Scenario: "${emailPrompt}"
Guidelines: ${JSON.stringify(guidelines)}
Draft: "${draft}"`;

    let retryCount = 0;
    const startTime = Date.now();
    const modelUsed = providerName.toLowerCase().includes('gemini') ? 'gemini-2.5-flash' : 'default';

    while (retryCount <= 1) {
      try {
        const result = await provider.rewrite(promptConfig, userContent);
        if (result && typeof result.improvedEmail === 'string' && Array.isArray(result.coachingSteps)) {
          const latencyMs = Date.now() - startTime;
          await this._logDebug(providerName, modelUsed, latencyMs, retryCount, promptConfig.version, true);
          return result;
        } else {
          throw new Error('AI rewrite schema validation failed');
        }
      } catch (err) {
        console.warn(`[Rewrite Service] Attempt ${retryCount + 1} failed: ${err.message}`);
        retryCount++;
        if (retryCount > 1) {
          const latencyMs = Date.now() - startTime;
          await this._logDebug(providerName, modelUsed, latencyMs, retryCount - 1, promptConfig.version, false, err.message);
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

export class QuestionGeneratorService extends AIFeatureService {
  async run(providerName, apiKey, { difficulty, communicationType }) {
    const provider = AIProviderFactory.getProvider(providerName, apiKey);
    const promptConfig = getPrompt('question_generation');
    const params = `difficulty: ${difficulty}, communicationType: ${communicationType || 'any'}`;

    let retryCount = 0;
    const startTime = Date.now();
    const modelUsed = providerName.toLowerCase().includes('gemini') ? 'gemini-2.5-flash' : 'default';

    while (retryCount <= 1) {
      try {
        const result = await provider.generate(promptConfig, params);
        const isValid = this._validate(result);
        if (isValid) {
          const latencyMs = Date.now() - startTime;
          await this._logDebug(providerName, modelUsed, latencyMs, retryCount, promptConfig.version, true);
          return result;
        } else {
          throw new Error('AI question generation validation failed');
        }
      } catch (err) {
        console.warn(`[Question Gen Service] Attempt ${retryCount + 1} failed: ${err.message}`);
        retryCount++;
        if (retryCount > 1) {
          const latencyMs = Date.now() - startTime;
          await this._logDebug(providerName, modelUsed, latencyMs, retryCount - 1, promptConfig.version, false, err.message);
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  _validate(data) {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.emailPrompt !== 'string' || data.emailPrompt.length < 20) return false;
    if (!Array.isArray(data.guidelines) || data.guidelines.length < 3) return false;
    if (typeof data.minWords !== 'number' || typeof data.maxWords !== 'number') return false;
    if (data.minWords >= data.maxWords) return false;
    return true;
  }
}

export class ScenarioConverterService extends AIFeatureService {
  async run(providerName, apiKey, { userScenario }) {
    const provider = AIProviderFactory.getProvider(providerName, apiKey);
    const promptConfig = getPrompt('scenario_conversion');

    let retryCount = 0;
    const startTime = Date.now();
    const modelUsed = providerName.toLowerCase().includes('gemini') ? 'gemini-2.5-flash' : 'default';

    while (retryCount <= 1) {
      try {
        const result = await provider.generate(promptConfig, `User Situation: "${userScenario}"`);
        if (result && typeof result.emailPrompt === 'string' && Array.isArray(result.guidelines)) {
          const latencyMs = Date.now() - startTime;
          await this._logDebug(providerName, modelUsed, latencyMs, retryCount, promptConfig.version, true);
          return result;
        } else {
          throw new Error('AI scenario conversion validation failed');
        }
      } catch (err) {
        console.warn(`[Scenario Converter Service] Attempt ${retryCount + 1} failed: ${err.message}`);
        retryCount++;
        if (retryCount > 1) {
          const latencyMs = Date.now() - startTime;
          await this._logDebug(providerName, modelUsed, latencyMs, retryCount - 1, promptConfig.version, false, err.message);
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}
