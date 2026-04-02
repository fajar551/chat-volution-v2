// API Key model for React app
// This is a client-side model that communicates with backend API

class ApiKey {
  constructor(data = {}) {
    this.id = data.id;
    this.service = data.service;
    this.api_key = data.api_key;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Static method to fetch API key from backend
  static async getApiKey(service = 'openai') {
    try {
      const response = await fetch(`https://waserverlive.genio.id/wa1/api/api-keys/${service}`);

      const result = await response.json();

      if (result.success) {
        return new ApiKey(result);
      } else {
        console.error('API key fetch failed:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
      throw error;
    }
  }

  // Static method to save API key to backend
  static async saveApiKey(service, apiKey, isActive = true) {
    try {
      const response = await fetch('https://waserverlive.genio.id/wa1/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service,
          api_key: apiKey,
          is_active: isActive
        })
      });

      const result = await response.json();

      if (result.success) {
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  }

  // Static method to test API key
  static async testApiKey(service = 'openai') {
    try {
      const response = await fetch(`https://waserverlive.genio.id/wa1/api/api-keys/test/${service}`, {
        method: 'POST'
      });

      const result = await response.json();
      return result.success && result.valid;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }
}

export default ApiKey;
