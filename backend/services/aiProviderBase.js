export class AIProvider {
  /**
   * Evaluate a student submission
   * @param {Object} promptConfig - { systemPrompt, temperature }
   * @param {String} userContent - Draft to evaluate
   * @returns {Promise<Object>} JSON response
   */
  async evaluate(promptConfig, userContent) {
    throw new Error('evaluate() must be implemented by the provider.');
  }

  /**
   * Generate an assessment question
   * @param {Object} promptConfig - { systemPrompt, temperature }
   * @param {String} requestParams - e.g. "difficulty: easy, context: leave"
   * @returns {Promise<Object>} JSON response
   */
  async generate(promptConfig, requestParams) {
    throw new Error('generate() must be implemented by the provider.');
  }

  /**
   * Health check diagnostics
   * @returns {Promise<Boolean>}
   */
  async healthCheck() {
    throw new Error('healthCheck() must be implemented by the provider.');
  }
}
