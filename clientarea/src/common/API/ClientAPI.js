// API service for clientarea to send messages directly to backend API
class ClientAPI {
  constructor() {
    this.baseUrl = 'https://cvbev2.genio.id';
    this.sessionCookie = null;
    this.pollingInterval = null;
    this.lastMessageId = null;
    this.messageCallbacks = [];
    // Track the last message sent from this client to avoid echo processing
    this.lastSent = { id: null, text: null, at: 0 };
  }

  // Set session cookie for authentication
  setSessionCookie(cookie) {
    this.sessionCookie = cookie;
    console.log('🔐 Session cookie set for clientarea API');
  }

  // Get session cookie from document.cookie or create a temporary one
  getSessionCookie() {
    if (!this.sessionCookie) {
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(cookie =>
        cookie.trim().startsWith('connect.sid')
      );
      if (sessionCookie) {
        this.sessionCookie = sessionCookie.trim();
        console.log('🔐 Retrieved session cookie from document:', this.sessionCookie.substring(0, 50) + '...');
      } else {
        // Create a temporary session cookie for clientarea
        this.sessionCookie = 'connect.sid=clientarea-temp-session';
        console.log('🔐 Created temporary session cookie for clientarea');

        // Also set it in document.cookie for consistency
        document.cookie = 'connect.sid=clientarea-temp-session; path=/; secure; samesite=strict';
      }
    }
    return this.sessionCookie;
  }

  // Send message via API instead of WebSocket
  async sendMessage(chatId, message, file = {}) {
    try {
      console.log('📤 Sending message via API:', { chatId, message, file });
      console.log('🔍 ChatId validation:', {
        chatId: chatId,
        isEmpty: !chatId,
        isString: typeof chatId === 'string',
        length: chatId?.length
      });

      // Validate chatId
      if (!chatId || chatId.trim() === '') {
        console.error('❌ ChatId is empty or invalid:', chatId);
        return { success: false, error: 'Chat ID is required', code: 'INVALID_CHAT_ID' };
      }

      // Check if file is provided (fileUrl/file_url = sudah di-upload, atau File object = kirim FormData)
      const hasFileUrl = file && (file.fileUrl || file.file_url);
      const hasFile = file && (hasFileUrl || (file instanceof File));
      const isFileObject = file instanceof File;

      let response;

      if (isFileObject) {
        // If file is a File object, send as FormData
        const formData = new FormData();
        formData.append('chatId', chatId);
        formData.append('message', message || '');
        formData.append('file', file);
        formData.append('timestamp', new Date().toISOString());
        formData.append('from', 'client');
        formData.append('user_name', 'Client');
        formData.append('user_email', 'client@example.com');

        response = await fetch(`${this.baseUrl}/api-socket/chats/${chatId}/send`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Cookie': this.getSessionCookie()
            // Don't set Content-Type for FormData, browser will set it with boundary
          },
          credentials: 'include',
          body: formData
        });
      } else if (hasFile && hasFileUrl) {
        // If file already uploaded (has fileUrl), send file info in JSON
        response = await fetch(`${this.baseUrl}/api-socket/chats/${chatId}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': this.getSessionCookie()
          },
          credentials: 'include',
          body: JSON.stringify({
            chatId: chatId,
            message: message,
            file: file,
            timestamp: new Date().toISOString(),
            from: 'client',
            user_name: 'Client',
            user_email: 'client@example.com'
          })
        });
      } else {
        // No file (text-only), kirim tanpa file agar media_data tidak ikut terisi
        response = await fetch(`${this.baseUrl}/api-socket/chats/${chatId}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': this.getSessionCookie()
          },
          credentials: 'include',
          body: JSON.stringify({
            chatId: chatId,
            message: message,
            timestamp: new Date().toISOString(),
            from: 'client',
            user_name: 'Client',
            user_email: 'client@example.com'
          })
        });
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message sent successfully via API:', data);
        // Record last sent message metadata to help polling skip echo
        try {
          this.lastSent = {
            id: String(data?.data?.messageId || ''),
            text: String(message || ''),
            at: Date.now()
          };
          // Also store in window for WebSocket validation
          window.__lastSentMessage = this.lastSent;
          console.log('🧭 Recorded lastSent for echo skip:', this.lastSent);
        } catch (_) { }
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to send message via API:', response.status, errorData);

        // Handle specific error cases
        if (response.status === 404 && errorData.message === 'Chat not found') {
          console.error('🚫 Chat not found - chat may have expired');
          return { success: false, error: 'Chat not found - please refresh and try again', code: 'CHAT_NOT_FOUND' };
        }

        return { success: false, error: `HTTP ${response.status}`, data: errorData };
      }
    } catch (error) {
      console.error('❌ Error sending message via API:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Simpan balasan AI ke backend (database) supaya muncul di chat_v2 / admin.
   * Memakai endpoint send yang sama dengan from: 'agent' dan agent_id: 'ai-assistant'.
   */
  async sendAgentMessage(chatId, message) {
    try {
      if (!chatId || !message || typeof message !== 'string' || message.trim() === '') {
        console.warn('⚠️ sendAgentMessage: chatId atau message kosong');
        return { success: false, error: 'chatId and message required' };
      }
      const response = await fetch(`${this.baseUrl}/api-socket/chats/${chatId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': this.getSessionCookie()
        },
        credentials: 'include',
        body: JSON.stringify({
          chatId: chatId,
          message: message.trim(),
          from: 'agent',
          agent_id: 'ai-assistant',
          user_name: 'Qiara',
          timestamp: new Date().toISOString()
        })
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ AI message saved to backend:', data?.data?.id ?? data?.id);
        return { success: true, data };
      }
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Failed to save AI message:', response.status, errorData);
      return { success: false, error: errorData?.message || `HTTP ${response.status}`, data: errorData };
    } catch (error) {
      console.error('❌ Error saving AI message:', error);
      return { success: false, error: error.message };
    }
  }

  // Create new chat via API
  async createChat(userData) {
    try {
      console.log('🆕 Creating new chat via API:', userData);

      // Ensure session cookie exists before making request
      const sessionCookie = this.getSessionCookie();
      if (!sessionCookie) {
        console.warn('⚠️ No session cookie found, creating temporary session...');
        // Create temporary session cookie
        document.cookie = 'connect.sid=s%3AFQSBTmSoTXccqwHq-EsjMKzGIxihRYBy.ATSMbG8QOcoNJzoKVeLN8%2FdpR7JH3rLJosEVlomOPYc; path=/; secure; samesite=strict';
      }

      // Send to API endpoint (no auth required)
      const response = await fetch(`${this.baseUrl}/api-socket/chats/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': this.getSessionCookie()
        },
        credentials: 'include', // Include cookies in request
        body: JSON.stringify({
          ...userData,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Chat created successfully via API:', data);
        return { success: true, data };
      } else {
        console.error('❌ Failed to create chat via API:', response.status);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('❌ Error creating chat via API:', error);
      return { success: false, error: error.message };
    }
  }

  // End chat via API
  async endChat(chatId) {
    try {
      console.log('🔚 Ending chat via API:', chatId);

      const sessionCookie = this.getSessionCookie();
      if (!sessionCookie) {
        throw new Error('No session cookie found');
      }

      const response = await fetch(`${this.baseUrl}/api-socket/chats/${chatId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': sessionCookie,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          chatId: chatId,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Chat ended successfully via API:', data);
        return { success: true, data };
      } else {
        console.error('❌ Failed to end chat via API:', response.status);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('❌ Error ending chat via API:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cek apakah chat sudah di-assign ke agent (jika ya, AI tidak dipanggil).
   * @returns {Promise<boolean>} true jika chat sudah assigned
   */
  async isChatAssigned(chatId) {
    try {
      const res = await this.getChatStatus(chatId);
      const inner = res.data?.data ?? res.data;
      const assigned = !!(res.success && (inner?.assignedTo ?? inner?.assigned_to));
      if (assigned) console.log('🤖 Chat sudah di-assign, AI tidak dipanggil');
      return assigned;
    } catch (e) {
      console.warn('🤖 Cek assigned status gagal:', e?.message);
      return false;
    }
  }

  // Get chat status via API
  async getChatStatus(chatId) {
    try {
      console.log('📊 Getting chat status via API:', chatId);

      const sessionCookie = this.getSessionCookie();
      if (!sessionCookie) {
        throw new Error('No session cookie found');
      }

      const response = await fetch(`${this.baseUrl}/api-socket/chats/${chatId}/status`, {
        method: 'GET',
        headers: {
          'Cookie': sessionCookie,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Chat status retrieved via API:', data);
        return { success: true, data };
      } else {
        console.error('❌ Failed to get chat status via API:', response.status);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('❌ Error getting chat status via API:', error);
      return { success: false, error: error.message };
    }
  }

  async getMessages(chatId) {
    try {
      console.log('📨 Getting messages via API:', chatId);

      // Use the new endpoint for real-time messages (no auth required)
      const response = await fetch(`${this.baseUrl}/api-socket/chats/${chatId}/messages`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cookie': this.getSessionCookie()
        },
        credentials: 'include' // Include cookies in request
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Messages retrieved via API:', data);

        // Transform the response to match expected format
        const messages = data.data?.messages || data.messages || [];
        return { success: true, messages: messages };
      } else {
        console.error('❌ Failed to get messages via API:', response.status);
        return { success: false, error: `HTTP ${response.status}`, messages: [] };
      }
    } catch (error) {
      console.error('❌ Error getting messages via API:', error);
      return { success: false, error: error.message, messages: [] };
    }
  }

  // Start polling for new messages
  startMessagePolling(chatId, callback) {
    console.log('🔄 Starting message polling for chat:', chatId);

    // Clear existing polling
    this.stopMessagePolling();

    // Add callback to list
    this.messageCallbacks.push(callback);

    // Start polling every 3 seconds
    this.pollingInterval = setInterval(async () => {
      try {
        const result = await this.getMessages(chatId);
        if (result.success && result.messages.length > 0) {
          console.log('📨 Polling messages:', result.messages.length);

          // Check for new messages - improved logic
          const newMessages = result.messages.filter(msg => {
            // If no lastMessageId, emit all messages (initial load)
            if (!this.lastMessageId) {
              console.log('📨 Initial message load, emitting all messages');
              return true;
            }
            // Otherwise, only emit messages newer than lastMessageId
            return msg.id !== this.lastMessageId;
          });

          if (newMessages.length > 0) {
            console.log('📨 New messages found:', newMessages.length);
            console.log('📨 New messages:', newMessages.map(m => ({ id: m.id, message: m.message, from: m.from })));

            // Update lastMessageId to the latest message
            this.lastMessageId = result.messages[result.messages.length - 1].id;

            // Emit new messages to all callbacks
            this.messageCallbacks.forEach(cb => {
              newMessages.forEach(msg => cb(msg));
            });
          } else {
            console.log('📨 No new messages found');
          }
        }
      } catch (error) {
        console.error('❌ Error polling messages:', error);
      }
    }, 3000); // Poll every 3 seconds
  }

  // Stop polling for messages
  stopMessagePolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('⏹️ Stopped message polling');
    }
    this.messageCallbacks = [];
    this.lastMessageId = null;
  }

  // Add message callback
  addMessageCallback(callback) {
    this.messageCallbacks.push(callback);
  }

  // Remove message callback
  removeMessageCallback(callback) {
    const index = this.messageCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageCallbacks.splice(index, 1);
    }
  }
}

// Create singleton instance
const clientAPI = new ClientAPI();

export default clientAPI;
