export class AIClientManager {
  constructor() {
    this.storageKey = 'nqt_ai_providers';
  }

  // Retrieve full configuration
  getConfig() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return {
        activeProvider: 'gemini',
        providers: {
          gemini: { keys: [] }
        }
      };
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse AI configuration:', e);
      return {
        activeProvider: 'gemini',
        providers: {
          gemini: { keys: [] }
        }
      };
    }
  }

  saveConfig(config) {
    localStorage.setItem(this.storageKey, JSON.stringify(config));
  }

  // Get active/primary key object for a provider
  getActiveKey(provider = 'gemini') {
    const config = this.getConfig();
    const keys = config.providers?.[provider]?.keys || [];
    const activeKeys = keys.filter(k => k.isActive);
    const primary = activeKeys.find(k => k.isPrimary);
    
    if (primary) return primary;
    return activeKeys[0] || null;
  }

  // Rotate to the next available backup key if primary rate limits (429)
  rotateKey(failedKeyId, provider = 'gemini') {
    const config = this.getConfig();
    const keys = config.providers?.[provider]?.keys || [];
    const activeKeys = keys.filter(k => k.isActive);
    
    if (activeKeys.length <= 1) return false; // Nowhere to rotate

    const currentPrimaryIndex = keys.findIndex(k => k.id === failedKeyId);
    if (currentPrimaryIndex === -1) return false;

    // Find the next active key
    let nextPrimary = null;
    // Iterate from current index to end, and then start
    for (let i = 1; i <= keys.length; i++) {
      const idx = (currentPrimaryIndex + i) % keys.length;
      if (keys[idx].isActive && keys[idx].id !== failedKeyId) {
        nextPrimary = keys[idx];
        break;
      }
    }

    if (nextPrimary) {
      // Set all keys isPrimary to false except the next one
      const updatedKeys = keys.map(k => ({
        ...k,
        isPrimary: k.id === nextPrimary.id
      }));
      config.providers[provider].keys = updatedKeys;
      this.saveConfig(config);
      return nextPrimary;
    }
    return false;
  }

  // Validate API key by communicating directly with Google API
  async validateKey(apiKey, provider = 'gemini') {
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      throw new Error('Key cannot be empty');
    }
    const cleanKey = apiKey.trim();

    if (provider !== 'gemini') {
      throw new Error('Only Google Gemini is supported at this time.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with OK' }] }]
        })
      });

      if (response.status === 200) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) return true;
        throw new Error('Malformed AI response received.');
      } else if (response.status === 400 || response.status === 401 || response.status === 403) {
        throw new Error('Invalid API Key. Please check and try again.');
      } else if (response.status === 429) {
        throw new Error('Daily quota exceeded for this key.');
      } else {
        throw new Error(`Connection test failed: Google returned status ${response.status}`);
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        throw new Error('Network error: Browser is offline or Google API is blocked by CORS/Firewall.');
      }
      throw err;
    }
  }

  // Helper to mask key values
  maskKey(keyVal) {
    if (!keyVal) return '';
    if (keyVal.length <= 8) return '****' + keyVal.slice(-2);
    return keyVal.slice(0, 6) + '****************' + keyVal.slice(-4);
  }
}

export const aiClient = new AIClientManager();
export default aiClient;
