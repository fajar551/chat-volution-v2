// Proxy for backend API calls to avoid CORS issues
class BackendProxy {
  constructor() {
    this.baseUrl = 'https://cvbev2.genio.id';
  }

  // Proxy method to get chats
  async getChats(sessionCookie) {
    try {
      console.log('Proxy 🔄 Making proxy request to backend...');

      // Create a simple proxy endpoint
      const proxyUrl = '/api/proxy/backend-chats';

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: `${this.baseUrl}/api-socket/chats/all`,
          cookie: sessionCookie
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Proxy ✅ Got data from proxy:', data);
        return data;
      } else {
        throw new Error(`Proxy error: ${response.status}`);
      }
    } catch (error) {
      console.error('Proxy ❌ Error:', error);
      throw error;
    }
  }

  // Alternative: Direct API call with JSONP (if supported)
  async getChatsWithJSONP(sessionCookie) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const callbackName = `jsonp_callback_${Date.now()}`;

      window[callbackName] = (data) => {
        document.head.removeChild(script);
        delete window[callbackName];
        resolve(data);
      };

      script.src = `${this.baseUrl}/api-socket/chats/all?callback=${callbackName}`;
      script.onerror = () => {
        document.head.removeChild(script);
        delete window[callbackName];
        reject(new Error('JSONP request failed'));
      };

      document.head.appendChild(script);
    });
  }
}

export default new BackendProxy();
