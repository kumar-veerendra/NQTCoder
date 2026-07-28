import { GeminiProvider } from './geminiProvider.js';
import { AIProvider } from './aiProviderBase.js';

export { AIProvider };

export class AIProviderFactory {
  /**
   * Instantiate appropriate provider
   * @param {String} providerName - e.g., 'gemini'
   * @param {String} apiKey - optional custom key
   */
  static getProvider(providerName, apiKey = null) {
    const name = (providerName || '').toLowerCase().trim();
    if (name === 'gemini' || name === 'google-gemini') {
      return new GeminiProvider(apiKey);
    }
    // Future providers (OpenAI, Claude) can be added here
    throw new Error(`AI Provider '${providerName}' is not currently supported.`);
  }
}
