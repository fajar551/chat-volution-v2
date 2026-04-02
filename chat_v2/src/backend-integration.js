import { EventEmitter } from 'events';

class BackendIntegration extends EventEmitter {
  constructor() {
    super();
    this.baseUrl = 'https://cvbev2.genio.id';
    this.chats = [];
    this.isConnected = false;
    this.sessionCookie = null;
    this.socket = null;
    this.isSocketConnected = false;
    this.refreshInterval = null;
    this.messagePollingInterval = null;
    this.processedMessages = new Set();
  }

  // Set session cookie for authentication
  setSessionCookie(cookie) {
    // Prevent multiple calls with same cookie
    if (this.sessionCookie === cookie) {
      //   console.log('Backend 🔐 Session cookie already set, skipping...');
      return;
    }

    this.sessionCookie = cookie;
    // console.log('🔐 Session cookie set for backend integration');
    // Don't connect WebSocket, just load chats directly
    this.loadChats();
    this.startApiRefresh();
  }

  // Start periodic refresh for API-only mode
  startApiRefresh() {
    // Clear existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Refresh chats every 10 seconds
    this.refreshInterval = setInterval(() => {
      if (this.isConnected) {
        // console.log('🔄 Periodic API refresh of chats...');
        this.loadChats();
      }
    }, 10000);
  }

  // Start message polling for real-time updates
  startMessagePolling() {
    // console.log('🚀 Starting message polling...');
    // console.log('🔍 Connection status:', this.isConnected);
    // console.log('🔍 Chats count:', this.chats.length);

    // Clear existing interval
    if (this.messagePollingInterval) {
      clearInterval(this.messagePollingInterval);
    }

    // Poll for new messages every 2 seconds (more frequent)
    this.messagePollingInterval = setInterval(async () => {
      // console.log('⏰ Polling interval triggered');
      // console.log('🔍 isConnected:', this.isConnected);
      // console.log('🔍 chats.length:', this.chats.length);

      if (this.isConnected && this.chats.length > 0) {
        // console.log('🔄 Polling for new messages...');

        // Check each chat for new messages
        for (const chat of this.chats) {
          try {
            // console.log('🔍 Checking messages for chat:', chat.chat_id);
            const messages = await this.loadMessages(chat.chat_id);
            // console.log('📨 Loaded messages for chat:', chat.chat_id, 'count:', messages.length);
            if (messages.length > 0) {
              // Filter and emit only new messages
              messages.forEach(message => {
                // console.log('📨 Processing message:', {
                //   id: message.id,
                //   body: message.body,
                //   from: message.from,
                //   action_name: message.action_name
                // });

                const messageKey = `${chat.chat_id}_${message.id || message.timestamp}_${message.body}`;

                // Skip if already processed
                if (this.processedMessages.has(messageKey)) {
                  // console.log('🚫 Message already processed, skipping:', messageKey);
                  return;
                }

                // Skip encrypted/system messages and action messages
                if (message.body.includes('chatisencrypted:') ||
                  message.body.includes('U2FsdGVkX1+') ||
                  !message.body.trim() ||
                  message.action_name === 'newchat') {
                  // console.log('🚫 Filtering out message:', message.body, 'reason:', message.action_name || 'encrypted/system');
                  return;
                }

                // Mark as processed
                this.processedMessages.add(messageKey);

                // console.log('📨 New message from client:', message.body, 'from:', message.from);
                // console.log('📨 Chat ID:', chat.chat_id);
                // console.log('📨 Message details:', {
                //   id: message.id,
                //   body: message.body,
                //   from: message.from,
                //   receivedAt: message.receivedAt
                // });

                // Emit new message event with proper attribution
                const eventData = {
                  chatId: chat.chat_id,
                  message: message.body,
                  from: message.from,
                  timestamp: message.receivedAt,
                  messageId: message.id || Date.now() // Add unique message ID
                };

                // console.log('📨 Emitting newMessage event:', eventData);
                this.emit('newMessage', eventData);
              });
            }
          } catch (error) {
            // console.error('❌ Error polling messages for chat:', chat.chat_id, error);
          }
        }
      }
    }, 2000); // Reduced to 2 seconds for faster sync
  }

  // Start periodic refresh of chats
  startPeriodicRefresh() {
    // Clear existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Refresh chats every 30 seconds
    this.refreshInterval = setInterval(() => {
      if (this.isConnected) {
        // console.log('🔄 Periodic refresh of chats...');
        this.loadChats();
      }
    }, 30000);
  }

  // Stop periodic refresh
  stopPeriodicRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      // console.log('⏹️ Stopped periodic refresh');
    }
  }

  // API-only mode - no WebSocket needed

  // Load chats from backend API
  async loadChats() {
    try {
      // console.log('Backend 📋 Loading chats from backend API...');

      if (!this.sessionCookie) {
        // console.error('Backend ❌ No session cookie provided');
        this.emit('error', new Error('No session cookie provided'));
        return;
      }

      // console.log('Backend 🌐 Making request to:', `${this.baseUrl}/api-socket/chats/all-public`);

      // Use public endpoint that doesn't require authentication
      const response = await fetch(`${this.baseUrl}/api-socket/chats/all-public`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      // console.log('Backend 📡 API response status:', response.status);
      // console.log('Backend 📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        // console.log('Backend ✅ Response OK, parsing JSON...');
        const data = await response.json();
        // console.log('Backend 📊 API response data:', data);

        if (data.success && data.data && data.data.length > 0) {
          // console.log('Backend 📋 Raw data length:', data.data.length);

          // Filter out history_chat_actions and response_times entries
          const validChats = data.data.filter(chat =>
            chat.chat_id !== 'history_chat_actions' &&
            chat.chat_id !== 'response_times' &&
            chat.user_name &&
            chat.user_name !== 'undefined'
          );

          // console.log('Backend 📋 Filtered valid chats:', validChats.length);
          // console.log('Backend 📋 Valid chat IDs:', validChats.map(c => c.chat_id));

          // Transform backend data to match WhatsApp format
          const transformedChats = validChats.map(chat => ({
            chat_id: chat.chat_id,
            user_name: chat.user_name,
            client_name: chat.client_name,
            last_message: chat.last_message,
            last_message_time: chat.last_message_time,
            unread_count: chat.unread_count || 0,
            unread_count_agent: chat.unread_count_agent || 0,
            type: 'backend',
            email: chat.email,
            message: chat.message,
            formatted_date: chat.formatted_date,
            status: chat.status,
            department_name: chat.department_name,
            topic_name: chat.topic_name,
            company_name: chat.company_name,
            avatar: chat.avatar,
            channel_id: chat.channel_id,
            phone: chat.email, // Use email as phone for backend chats
            instances: ['backend']
          }));

          // Deduplicate chats by email/user_name to prevent duplicate entries
          const deduplicatedChats = [];
          const seenUsers = new Set();

          transformedChats.forEach(chat => {
            // Use email as primary key for deduplication
            const userKey = chat.email || chat.user_name;

            if (!seenUsers.has(userKey)) {
              seenUsers.add(userKey);
              deduplicatedChats.push(chat);
            } else {
              // If duplicate found, keep the one with more recent activity
              const existingIndex = deduplicatedChats.findIndex(existing =>
                (existing.email || existing.user_name) === userKey
              );

              if (existingIndex !== -1) {
                const existing = deduplicatedChats[existingIndex];
                const currentTime = new Date(chat.last_message_time || 0);
                const existingTime = new Date(existing.last_message_time || 0);

                if (currentTime > existingTime) {
                  // console.log('🔄 Replacing older chat with newer one for user:', userKey);
                  deduplicatedChats[existingIndex] = chat;
                } else {
                  // console.log('🔄 Keeping existing chat for user:', userKey);
                }
              }
            }
          });

          // console.log('Backend 📋 Deduplicated chats:', deduplicatedChats.length);
          // console.log('Backend 📋 Removed duplicates:', transformedChats.length - deduplicatedChats.length);

          // Replace all chats with deduplicated data
          this.chats = deduplicatedChats;

          this.isConnected = true;

          // console.log('Backend ✅ Total chats:', this.chats.length);
          // console.log('Backend 🎯 Emitting chatsLoaded event with', this.chats.length, 'chats');
          this.emit('chatsLoaded', this.chats);
          this.emit('connected');

          // Start message polling for real-time updates
          // console.log('🚀 Starting message polling after chats loaded...');
          this.startMessagePolling();
        } else {
          // console.log('Backend ⚠️ No valid chats found in backend API response');
          // console.log('Backend 📊 Data structure:', { success: data.success, dataLength: data.data?.length });
          // Still emit connected event even if no chats found
          this.isConnected = true;
          this.emit('chatsLoaded', []);
          this.emit('connected');
        }
      } else {
        // console.log('Backend ⚠️ HTTP error from backend API:', response.status);
        const errorText = await response.text();
        // console.log('Backend ❌ Error response:', errorText);

        // Handle specific error cases
        if (response.status === 403) {
          // console.log('Backend 🔄 Trying alternative authentication method...');
          // Try to get fresh session cookie from current domain
          this.tryAlternativeAuth();
        } else if (response.status === 401) {
          this.emit('error', new Error('Authentication failed - Please check your session'));
        } else {
          this.emit('error', new Error(`HTTP ${response.status}: ${errorText}`));
        }
      }
    } catch (error) {
      // console.error('Backend ❌ Error fetching from backend API:', error);
      // console.error('Backend 🔍 Error details:', error.message, error.stack);
      this.emit('error', error);
    }
  }

  // Check if connected
  isConnectedToBackend() {
    return this.isConnected;
  }

  // API-only mode - always connected
  isSocketConnectedToBackend() {
    return true; // Always connected in API mode
  }

  // Stop API refresh
  stopApiRefresh() {
    this.stopPeriodicRefresh();
    if (this.messagePollingInterval) {
      clearInterval(this.messagePollingInterval);
      this.messagePollingInterval = null;
    }
    // console.log('⏹️ Stopped API refresh and message polling');
  }

  // Disconnect (cleanup)
  disconnect() {
    this.stopApiRefresh();
    // console.log('🔌 Backend integration disconnected');
  }

  // Send message to clientarea via API (no WebSocket)
  async sendMessageToClient(chatId, message, from = 'agent') {
    try {
      // console.log('📤 Sending message to clientarea via API:', { chatId, message, from });

      // Send message via API endpoint
      const response = await fetch(`${this.baseUrl}/api-socket/chats/${chatId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.sessionCookie || '',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          from: from,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        await response.json();
        // console.log('✅ Message sent successfully via API:', data);

        // Update local chat with message
        const chat = this.getChatById(chatId);
        if (chat) {
          chat.last_message = message;
          chat.last_message_time = new Date().toISOString();
          this.emit('chatsLoaded', this.chats);
        }

        return true;
      } else {
        // console.error('❌ Failed to send message via API:', response.status);
        return false;
      }
    } catch (error) {
      // console.error('❌ Error sending message via API:', error);
      return false;
    }
  }

  // Manual refresh chats
  async refreshChats() {
    // console.log('🔄 Manual refresh of chats...');
    await this.loadChats();
  }

  // Get all chats
  getChats() {
    return this.chats;
  }

  // Get chat by ID
  getChatById(chatId) {
    // console.log('🔍 getChatById called with:', chatId);
    // console.log('🔍 Available chat IDs:', this.chats.map(c => c.chat_id));
    const found = this.chats.find(chat => chat.chat_id === chatId);
    // console.log('🔍 Found chat:', found ? 'YES' : 'NO');
    return found;
  }

  // Update chat status
  updateChatStatus(chatId, status) {
    const chat = this.getChatById(chatId);
    if (chat) {
      chat.status = status;
      this.emit('chatsLoaded', this.chats);
      return true;
    }
    return false;
  }

  // Send agent message to clientarea via API
  async sendAgentMessage(chatId, message) {
    return await this.sendMessageToClient(chatId, message, 'agent');
  }

  // API-only mode - no alternative auth needed

  // API-only mode - no proxy needed

  // API-only mode - no mock data needed

  // API-only mode - no real-time message handling needed

  // API-only mode - no real-time event handling needed

  // Load messages for specific chat via API
  async loadMessages(chatId) {
    try {
      // console.log('📨 Loading messages for chat via API:', chatId);
      // console.log('🔍 Session cookie available:', !!this.sessionCookie);
      // console.log('🔍 Base URL:', this.baseUrl);

      // Get chat info from the chats list
      const chat = this.getChatById(chatId);
      if (!chat) {
        // console.log('❌ Chat not found:', chatId);
        // console.log('🔍 Available chats:', this.chats.map(c => c.chat_id));
        return [];
      }

      // Load messages from API endpoint (no auth required)
      const response = await fetch(`${this.baseUrl}/api-socket/chats/${chatId}/messages`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cookie': this.sessionCookie || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        // console.log('📨 Messages loaded from API:', data);

        // Transform backend format to frontend format
        const messages = data.data?.messages || data.messages || [];
        return messages.map(msg => ({
          id: msg.id || Date.now(),
          body: msg.message || msg.body || msg.messsage,
          from: msg.from, // Keep original from field
          receivedAt: msg.created_at || msg.timestamp || new Date().toISOString(),
          type: msg.from === 'client' ? 'received' : 'sent',
          is_sender: msg.from === 'client' // Fix positioning
        }));
      } else {
        // console.log('⚠️ Messages API endpoint failed, trying alternative endpoint');

        // Try alternative endpoint
        try {
          const altResponse = await fetch(`${this.baseUrl}/api-socket/chats/${chatId}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Cookie': this.sessionCookie || ''
            }
          });

          if (altResponse.ok) {
            const altData = await altResponse.json();
            // console.log('📨 Messages loaded from alternative API:', altData);

            if (altData.data && altData.data.messages) {
              return altData.data.messages.map(msg => ({
                id: msg.id || Date.now(),
                body: msg.message || msg.body || msg.messsage,
                from: msg.from,
                receivedAt: msg.created_at || msg.timestamp || new Date().toISOString(),
                type: msg.from === 'client' ? 'received' : 'sent',
                is_sender: msg.from === 'client'
              }));
            }
          }
        } catch (altError) {
          // console.log('⚠️ Alternative endpoint also failed:', altError);
        }

        // Final fallback to chat info
        // console.log('⚠️ Using chat info as fallback');
        const messages = [
          {
            id: '1',
            body: chat.last_message || 'No messages yet',
            from: 'customer',
            receivedAt: chat.last_message_time || new Date().toISOString(),
            type: 'received',
            is_sender: false
          }
        ];
        return messages;
      }
    } catch (error) {
      // console.error('❌ Error loading messages:', error);
      return [];
    }
  }
}

// Create singleton instance
const backendIntegration = new BackendIntegration();

export default backendIntegration;
