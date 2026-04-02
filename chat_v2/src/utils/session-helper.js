// Session helper utilities for admin panel

class SessionHelper {
  constructor() {
    this.sessionCookie = null;
  }

  // Get session cookie from current browser session
  getSessionCookie() {
    if (this.sessionCookie) {
      return this.sessionCookie;
    }

    // Try to get from document.cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'connect.sid') {
        this.sessionCookie = `connect.sid=${value}`;
        return this.sessionCookie;
      }
    }

    // Fallback to hardcoded session (for development)
    // Use the working session cookie from curl command
    this.sessionCookie = 'connect.sid=s%3AuYZii7vE2BuD4P-GhI6NqaywEtAS3baI.FOl1nG99hHqleJCF1o8OR1R4AHvAuqQvBQTqO9O%2BO2U';
    return this.sessionCookie;
  }

  // Set session cookie manually
  setSessionCookie(cookie) {
    this.sessionCookie = cookie;
  }

  // Check if session is valid
  async isSessionValid() {
    try {
      const cookie = this.getSessionCookie();
      const response = await fetch('https://cvbev2.genio.id/api-socket/chats/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  }
}

// Create singleton instance
const sessionHelper = new SessionHelper();

export default sessionHelper;
