import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './aiProviderBase.js';

export class GeminiProvider extends AIProvider {
  constructor(customApiKey = null) {
    super();
    this.apiKey = customApiKey || process.env.GEMINI_API_KEY;
    this.client = null;
    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey);
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Gemini API client not initialized. Check server configuration or provide a key.');
    }
    return this.client;
  }

  _cleanJsonResponse(text) {
    if (!text) return '{}';
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
    }
    return cleaned.trim();
  }

  async _generateWithFallback(systemInstruction, prompt, temperature = 0.1) {
    const ai = this.getClient();
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    let lastError = null;

    for (const modelName of models) {
      try {
        const model = ai.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: temperature
          },
          systemInstruction: systemInstruction
        });

        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        lastError = err;
        if (modelName !== models[models.length - 1]) {
          console.warn(`[Gemini] ${modelName} failed (${err.message}), retrying with fallback model...`);
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }

  async evaluate(promptConfig, userContent) {
    const rawResponse = await this._generateWithFallback(
      promptConfig.systemPrompt,
      userContent,
      promptConfig.temperature
    );
    const cleaned = this._cleanJsonResponse(rawResponse);
    return JSON.parse(cleaned);
  }

  async generate(promptConfig, requestParams) {
    const rawResponse = await this._generateWithFallback(
      promptConfig.systemPrompt,
      requestParams,
      promptConfig.temperature
    );
    const cleaned = this._cleanJsonResponse(rawResponse);
    return JSON.parse(cleaned);
  }

  async rewrite(promptConfig, draftContext) {
    const rawResponse = await this._generateWithFallback(
      promptConfig.systemPrompt,
      draftContext,
      promptConfig.temperature
    );
    const cleaned = this._cleanJsonResponse(rawResponse);
    return JSON.parse(cleaned);
  }

  async healthCheck() {
    if (!this.apiKey) return false;
    try {
      const ai = this.getClient();
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent('Respond with OK');
      return result.response.text().trim().includes('OK');
    } catch (err) {
      console.error('[Gemini Health Check Failed]:', err.message);
      const isQuotaExceeded = err.status === 429 || (err.message || '').includes('429') || (err.message || '').includes('quota') || (err.message || '').includes('Quota');
      if (isQuotaExceeded) {
        return true; // Key is valid, just hit limits
      }
      return false;
    }
  }
}

export default GeminiProvider;
