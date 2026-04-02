import ApiKey from '../models/ApiKey.js';

class ApiKeyService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000;
  }

  async getApiKey(service = 'openai') {
    try {
      const cacheKey = `${service}_api_key`;
      const cached = this.cache.get(cacheKey);

      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        return cached.apiKey;
      }

      const apiKeyRecord = await ApiKey.getApiKey(service);

      if (!apiKeyRecord) {
        throw new Error(`API key for ${service} not found`);
      }

      const apiKey = apiKeyRecord.api_key;

      this.cache.set(cacheKey, {
        apiKey: apiKey,
        timestamp: Date.now()
      });

      return apiKey;

    } catch (error) {
      console.error(`Error getting API key for ${service}:`, error);
      throw error;
    }
  }

  clearCache(service = null) {
    if (service) {
      this.cache.delete(`${service}_api_key`);
    } else {
      this.cache.clear();
    }
  }

  async testApiKey(service = 'openai') {
    try {
      await this.getApiKey(service);
      return true;
    } catch (error) {
      console.error(`API key for ${service} test failed:`, error);
      return false;
    }
  }
}

const apiKeyService = new ApiKeyService();
export default apiKeyService;
