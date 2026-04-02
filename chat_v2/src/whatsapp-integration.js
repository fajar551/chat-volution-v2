import io from 'socket.io-client';
import chatStatusService from './services/chat-status-service';

class WhatsAppIntegration {
  constructor() {
    this.baseUrl = 'https://waserverlive.genio.id';
    this.apiUrl = `${this.baseUrl}/wa1`;
    this.sockets = new Map();
    this.isConnected = false;
    this.chats = [];
    this.currentChat = null;
    this.processedMessageIds = new Set();
    this.listeners = new Map();
    this.phoneToInstance = new Map();
    this.processingAiRequests = new Set();
    this.markAsReadControllers = new Map(); // Track ongoing mark-as-read requests
    this.assignedStatusControllers = new Map(); // Track ongoing assigned-status requests (no cache for multi-agent real-time)

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.connectSockets();
  }

  connectSockets() {
    // Connect to all instances (wa1-wa6)
    const instances = ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'];
    const socketUrl = this.baseUrl;

    instances.forEach(instanceName => {
      try {
        const socketPath = `/${instanceName}/socket.io/`;

        const socket = io(socketUrl, {
          path: socketPath,
          transports: ['polling'],
          timeout: 20000,
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000
        });

        this.sockets.set(instanceName, socket);
        this.setupSocketEvents(socket, instanceName);
        console.log(`✅ Connected to ${instanceName} socket`);
      } catch (error) {
        console.error(`Error connecting to ${instanceName}:`, error);
      }
    });

    this.loadChats();
  }

  setupSocketEvents(socket, instanceName) {
    socket.on('connect', () => {
      this.isConnected = true;
      this.emit('connected', { instance: instanceName });
    });

    socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.emit('disconnected', { instance: instanceName, reason });
    });

    socket.on('message', (data) => {
      data.instance = instanceName;
      this.handleNewMessage(data);
    });

    socket.on('status', (data) => {
      this.emit('status', { ...data, instance: instanceName });
    });

    socket.on('aiResponse', (data) => {
      // Handle AI response for proper chat list update
      this.updateChatWithNewMessage(data.message);
      this.emit('aiResponse', { ...data, instance: instanceName });
    });

    // Listen for messages read events from other browsers
    socket.on('messagesRead', (data) => {
      // console.log('📖 Messages read event received:', data);
      const chat = this.chats.find(c => c.phone === data.phone);
      if (chat) {
        chat.unreadCount = data.unreadCount;
        this.emit('chatsUpdated', this.chats);
      }
    });

    socket.on('connect_error', (error) => {
      this.emit('error', { error, instance: instanceName });
    });

    socket.on('connect_timeout', () => { });
    socket.on('reconnect', (attemptNumber) => { });
    socket.on('reconnect_error', (error) => { });
  }

  setupEventListeners() {
    window.addEventListener('whatsapp:loadChats', () => {
      this.loadChats();
    });

    window.addEventListener('whatsapp:selectChat', (event) => {
      this.selectChat(event.detail.phone);
    });

    window.addEventListener('whatsapp:sendMessage', (event) => {
      this.sendMessage(event.detail.phone, event.detail.message);
    });
  }

  async loadChats() {
    try {
      const allChats = [];
      const instanceResults = [];
      const instances = ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'];

      // Fetch chats from database for all instances
      const fetchPromises = instances.map(async (instanceName) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(`${this.baseUrl}/${instanceName}/api/whatsapp/chats`, {
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();

            if (data.success && data.chats) {
              // Add instance field to each chat before pushing
              const chatsWithInstance = data.chats.map(chat => ({
                ...chat,
                instance: chat.instance || instanceName // Use instance from API if available, otherwise use instanceName from loop
              }));
              allChats.push(...chatsWithInstance);
              instanceResults.push({
                instance: instanceName,
                success: true,
                chatCount: data.chats.length
              });
              // console.log(`✅ Loaded ${data.chats.length} chats from database (${instanceName})`);
            } else {
              instanceResults.push({
                instance: instanceName,
                success: false,
                error: data.message || 'Unknown error'
              });
            }
          } else {
            instanceResults.push({
              instance: instanceName,
              success: false,
              error: `HTTP ${response.status}`
            });
          }
        } catch (error) {
          console.error(`❌ Error fetching chats from database (${instanceName}):`, error);
          instanceResults.push({
            instance: instanceName,
            success: false,
            error: error.message
          });
        }
      });

      // Wait for all fetches to complete
      await Promise.all(fetchPromises);

      // Remove duplicates - if same phone appears in both instances, keep the most recent one
      // Also preserve the instance field when keeping the most recent chat
      const phoneToChat = new Map();
      allChats.forEach(chat => {
        const existing = phoneToChat.get(chat.phone);
        if (!existing || new Date(chat.lastMessageTime || 0) > new Date(existing.lastMessageTime || 0)) {
          phoneToChat.set(chat.phone, {
            ...chat,
            instance: chat.instance || 'wa default' // Ensure instance is always set
          });
        }
      });

      // Transform chats from database format to expected format
      // Ensure instance field is preserved from the chat object
      // Filter out group messages (@g.us), newsletter, and broadcast
      this.chats = Array.from(phoneToChat.values())
        .filter(chat => {
          // Filter out group messages, newsletter, and broadcast
          const phone = chat.phone || '';
          return !phone.includes('@g.us') &&
                 !phone.includes('@newsletter') &&
                 !phone.includes('@broadcast');
        })
        .map(chat => ({
          phone: chat.phone,
          lastMessage: chat.lastMessage || 'No message',
          lastMessageTime: chat.lastMessageTime || new Date().toISOString(),
          unreadCount: chat.unreadCount || 0,
          instance: chat.instance || 'wa default', // Use instance from chat object (already set when fetching)
          isAssigned: chat.isAssigned || false,
          assignedTo: chat.assignedTo || null,
          messages: [] // Empty messages array for list view
        }));

      // Set phone to instance mapping
      this.chats.forEach(chat => {
        this.phoneToInstance.set(chat.phone, chat.instance || 'wa1');
      });

      // Load assigned status for each chat (if not already loaded from API)
      await this.loadAssignedStatus();

      // Filter out closed chats - only show open chats
      await this.filterClosedChats();

      //   console.log(`✅ Total ${this.chats.length} unique chats loaded from database`);
      this.emit('chatsLoaded', this.chats);
      this.emit('instanceResults', instanceResults);

    } catch (error) {
      console.error('❌ Error loading chats from database:', error);
      this.chats = [];
      this.emit('chatsLoaded', this.chats);
      this.emit('error', error);
    }
  }

  async selectChat(phone) {
    try {
      // Get instance from phoneToInstance map
      // IMPORTANT: If instance is known, ONLY try that instance to avoid mixing messages from different instances
      const knownInstance = this.phoneToInstance.get(phone);
      const instancesToTry = knownInstance ? [knownInstance] : ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'];

      // First try: Get messages from database via new endpoint
      // Check if this is from history (closed chat) by checking if phone is in closed chats
      for (const instanceName of instancesToTry) {
        try {
          // Try with includeClosed parameter if it's a closed chat
          let url = `${this.baseUrl}/${instanceName}/api/whatsapp/messages/${phone}`;
          let shouldIncludeClosed = false;

          try {
            const closedChatsResponse = await fetch(`${this.baseUrl}/${instanceName}/api/whatsapp/closed-chats`);
            if (closedChatsResponse.ok) {
              const closedData = await closedChatsResponse.json();
              if (closedData.success && closedData.chats) {
                // Check if phone is in closed-chats list (meaning it only has closed messages)
                const isClosed = closedData.chats.some(chat =>
                  chat.phone === phone ||
                  chat.phone === phone.replace('@c.us', '') ||
                  chat.chat_id === `whatsapp-${phone}` ||
                  chat.chat_id === `whatsapp-${phone.replace('@c.us', '')}`
                );
                if (isClosed) {
                  shouldIncludeClosed = true;
                  url += '?includeClosed=true';
                }
              }
            }
          } catch (err) {
            // Ignore error, just use default URL
          }

          // Also check active chats - if phone is NOT in active chats, it might be closed
          if (!shouldIncludeClosed) {
            try {
              const activeChatsResponse = await fetch(`${this.baseUrl}/${instanceName}/api/whatsapp/chats`);
              if (activeChatsResponse.ok) {
                const activeData = await activeChatsResponse.json();
                if (activeData.success && activeData.chats) {
                  const isInActive = activeData.chats.some(chat => {
                    const chatPhone = chat.phone?.replace('@c.us', '') || chat.phone;
                    const normalizedPhone = phone?.replace('@c.us', '') || phone;
                    return chatPhone === normalizedPhone;
                  });
                  // If not in active chats, it might be closed - include closed messages
                  if (!isInActive) {
                    shouldIncludeClosed = true;
                    url += (url.includes('?') ? '&' : '?') + 'includeClosed=true';
                  }
                }
              }
            } catch (err) {
              // Ignore error
            }
          }

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            let data;
            try {
              // Try to parse JSON response
              const responseText = await response.text();
              // console.log(`📥 Raw response from ${url}:`, responseText.substring(0, 200));

              try {
                data = JSON.parse(responseText);
              } catch (parseError) {
                console.error(`❌ Failed to parse JSON response from ${url}:`, parseError);
                console.error(`❌ Response text:`, responseText);
                // If response is not JSON, it might be an error message
                throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
              }

              if (data.success) {
                // Always return messages from database (even if empty array)
                // IMPORTANT: Filter messages by instance to ensure we only get messages from the correct instance
                let phoneMessages = data.messages || [];

                // Filter messages to only include those from the current instance
                // This prevents mixing messages from different instances when phone number is the same
                if (phoneMessages.length > 0 && instanceName) {
                  phoneMessages = phoneMessages.filter(msg => {
                    // Include message if it matches the instance or has no instance field (legacy messages)
                    return !msg.instance || msg.instance === instanceName;
                  }).map(msg => ({
                    ...msg,
                    instance: instanceName // Ensure instance is set
                  }));
                }

                // If no messages found and we haven't tried with includeClosed, try again with includeClosed
                if (phoneMessages.length === 0 && !shouldIncludeClosed) {
                  const closedUrl = `${this.baseUrl}/${instanceName}/api/whatsapp/messages/${phone}?includeClosed=true`;
                  try {
                    const closedResponse = await fetch(closedUrl, {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                      }
                    });
                    if (closedResponse.ok) {
                      const closedData = await closedResponse.json();
                      if (closedData.success && closedData.messages && closedData.messages.length > 0) {
                        // Use closed messages
                        // IMPORTANT: Filter messages by instance to ensure we only get messages from the correct instance
                        let closedMessages = closedData.messages;

                        // Filter messages to only include those from the current instance
                        if (closedMessages.length > 0 && instanceName) {
                          closedMessages = closedMessages.filter(msg => {
                            // Include message if it matches the instance or has no instance field (legacy messages)
                            return !msg.instance || msg.instance === instanceName;
                          });
                        }

                        closedMessages.sort((a, b) => {
                          const timestampA = a.timestamp ? a.timestamp * 1000 : new Date(a.receivedAt || 0).getTime();
                          const timestampB = b.timestamp ? b.timestamp * 1000 : new Date(b.receivedAt || 0).getTime();
                          return timestampA - timestampB;
                        });
                        const messagesWithInstance = closedMessages.map(msg => ({
                          ...msg,
                          instance: instanceName // Ensure instance is set
                        }));
                        this.currentChat = {
                          phone: phone,
                          messages: messagesWithInstance,
                          instance: instanceName
                        };
                        this.phoneToInstance.set(phone, instanceName);
                        this.emit('chatSelected', this.currentChat);
                        this.emit('messagesLoaded', messagesWithInstance);
                        return { success: true, messages: messagesWithInstance };
                      }
                    }
                  } catch (closedErr) {
                    // Ignore error, continue with empty messages
                  }
                }

                // Messages are already sorted and filtered by the API, but ensure correct order
                phoneMessages.sort((a, b) => {
                  const timestampA = a.timestamp ? a.timestamp * 1000 : new Date(a.receivedAt || 0).getTime();
                  const timestampB = b.timestamp ? b.timestamp * 1000 : new Date(b.receivedAt || 0).getTime();
                  return timestampA - timestampB;
                });

                // Add instance to each message
                const messagesWithInstance = phoneMessages.map(msg => ({
                  ...msg,
                  instance: instanceName
                }));

                this.currentChat = {
                  phone: phone,
                  messages: messagesWithInstance,
                  instance: instanceName
                };
                this.phoneToInstance.set(phone, instanceName);
                this.emit('chatSelected', this.currentChat);
                this.emit('messagesLoaded', messagesWithInstance);
                // console.log(`✅ Loaded ${phoneMessages.length} messages from database (${instanceName}) for phone:`, phone);
                return { success: true, messages: messagesWithInstance };
              } else {
                console.warn(`⚠️ API returned success=false:`, data.message || data.error);
              }
            } catch (parseError) {
              console.error(`❌ Error parsing response from ${url}:`, parseError);
              throw parseError;
            }
          } else {
            // If response is not ok, try to get error message
            const errorText = await response.text();
            console.error(`❌ API error (${response.status}):`, errorText.substring(0, 200));
            throw new Error(`API returned ${response.status}: ${errorText.substring(0, 100)}`);
          }
        } catch (dbError) {
          console.error(`❌ Database API call failed for ${instanceName}:`, dbError.message);
          // Continue to next instance
        }
      }

      // No fallback to memory - only use database API
      // If database is empty or returns no messages, return empty array
      // console.log(`ℹ️ No messages found in database for phone: ${phone}`);
      return { success: true, messages: [] };

    } catch (error) {
      console.error('Error loading chat messages:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async getMessagesForPhone(phone) {
    try {
      const allMessages = [];
      // Get instance from phoneToInstance map, or try all instances (wa1-wa6)
      const knownInstance = this.phoneToInstance.get(phone);
      const instancesToTry = knownInstance ? [knownInstance] : ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'];

      // Try each instance
      for (const instanceName of instancesToTry) {
        // First try: Get from database
        try {
          const response = await fetch(`${this.baseUrl}/${instanceName}/api/whatsapp/messages/${phone}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();

            if (data.success && data.messages && data.messages.length > 0) {
              const phoneMessages = data.messages;

              // Sort messages by timestamp to ensure correct order
              phoneMessages.sort((a, b) => {
                const timestampA = a.timestamp ? a.timestamp * 1000 : new Date(a.receivedAt || 0).getTime();
                const timestampB = b.timestamp ? b.timestamp * 1000 : new Date(b.receivedAt || 0).getTime();
                return timestampA - timestampB;
              });

              const messagesWithInstance = phoneMessages.map(msg => ({
                ...msg,
                instance: instanceName
              }));

              allMessages.push(...messagesWithInstance);
              this.phoneToInstance.set(phone, instanceName);
              // console.log(`✅ Loaded ${phoneMessages.length} messages from database (${instanceName}) in getMessagesForPhone`);
              // If we found messages, break (don't try other instances)
              break;
            }
          }
        } catch (dbError) {
          console.error(`❌ Database endpoint failed in ${instanceName}:`, dbError.message);
          // Continue to next instance, don't fallback to memory
        }
      }

      if (allMessages.length > 0) {
        // Get instance from the first message or from phoneToInstance map
        const foundInstance = allMessages[0]?.instance || this.phoneToInstance.get(phone) || 'wa1';

        this.currentChat = {
          phone: phone,
          messages: allMessages,
          instance: foundInstance
        };

        this.emit('chatSelected', this.currentChat);
        this.emit('messagesLoaded', allMessages);

        return {
          success: true,
          messages: allMessages,
          instance: foundInstance
        };
      } else {
        throw new Error(`No messages found for phone ${phone}`);
      }
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(phone, message, agentId = null) {
    try {
      // Get instance from phoneToInstance map, default to wa1
      const instanceName = this.phoneToInstance.get(phone) || 'wa1';
      this.phoneToInstance.set(phone, instanceName);

      try {
        const response = await fetch(`${this.baseUrl}/${instanceName}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            phone: phone,
            message: message,
            agentId: agentId || 'react-app'
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          this.emit('messageSent', {
            phone: phone,
            message: message,
            messageId: data.messageId,
            instance: instanceName
          });

          this.selectChat(phone);
          return data;
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
      } catch (error) {
        console.error(`Error sending via ${instanceName}:`, error);
        throw error;
      }

    } catch (error) {
      console.error('Error sending message:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async sendFile(phone, mediaData, agentId = null) {
    try {
      // Get instance from phoneToInstance map, default to wa1
      const instanceName = this.phoneToInstance.get(phone) || 'wa1';
      this.phoneToInstance.set(phone, instanceName);

      try {
        const response = await fetch(`${this.baseUrl}/${instanceName}/send-media`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            phone: phone,
            media: mediaData,
            agentId: agentId || 'react-app'
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          this.emit('fileSent', {
            phone: phone,
            filename: mediaData.filename,
            messageId: data.messageId,
            instance: instanceName
          });

          this.selectChat(phone);
          return data;
        } else {
          throw new Error(data.message || 'Failed to send file');
        }
      } catch (error) {
        console.error(`Error sending file via ${instanceName}:`, error);
        throw error;
      }

    } catch (error) {
      console.error('Error sending file:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async handleNewMessage(data) {
    // Filter out newsletter, broadcast, and group messages
    if (data.from && (data.from.includes('@newsletter') || data.from.includes('@broadcast') || data.from.includes('@g.us'))) {
      return;
    }

    if (this.processedMessageIds.has(data.id)) {
      return;
    }

    this.processedMessageIds.add(data.id);

    if (this.processedMessageIds.size > 100) {
      const idsArray = Array.from(this.processedMessageIds);
      this.processedMessageIds.clear();
      idsArray.slice(-50).forEach(id => this.processedMessageIds.add(id));
    }

    let phone;
    if (data.from === 'me' || data.type === 'sent') {
      phone = data.to ? data.to.replace('@c.us', '') : data.to;
    } else {
      phone = data.from ? data.from.replace('@c.us', '') : data.from;
    }

    // Update chat list with new message
    await this.updateChatWithNewMessage(data);

    // Emit newMessage event only once
    this.emit('newMessage', data);

    // AI response is now handled by backend
    // No need to process AI response in frontend

    if (this.currentChat && this.currentChat.phone === phone) {
      this.currentChat.messages.push(data);
      this.emit('chatUpdated', this.currentChat);
    }
  }

  async processAiResponse(phone, userMessage, messageId) {
    // DISABLED: AI response is now handled automatically by backend (processIncomingMessage)
    // This function is kept for backward compatibility but does nothing
    // console.log('⚠️ processAiResponse called but disabled - AI is handled by backend');
    return;
  }

  async updateChatWithNewMessage(message) {
    let phone;
    if (message.from === 'me' || message.type === 'sent') {
      phone = message.to ? message.to.replace('@c.us', '') : message.to;
    } else {
      phone = message.from ? message.from.replace('@c.us', '') : message.from;
    }

    if (!phone) {
      return;
    }

    let chat = this.chats.find(c => c.phone === phone);

    if (!chat) {
      // Create new chat for both incoming and outgoing messages
      // Handle media files - show descriptive text instead of empty body
      let lastMessage = message.body || 'No message';
      if (message.hasMedia && (!message.body || message.body.trim() === '' || message.body === '📎 Media file')) {
        const mimeType = message.mediaType || (message.media && message.media.mimetype) || '';
        const fileName = message.filename || (message.media && message.media.filename) || '';

        if (mimeType.startsWith('image/')) {
          lastMessage = '📎 Image';
        } else if (mimeType.startsWith('video/')) {
          lastMessage = '📎 Video';
        } else if (mimeType === 'application/pdf') {
          lastMessage = '📎 PDF';
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || fileName.match(/\.(xls|xlsx)$/i)) {
          lastMessage = '📎 Excel';
        } else if (mimeType.includes('word') || fileName.match(/\.(doc|docx)$/i)) {
          lastMessage = '📎 Document';
        } else if (fileName) {
          lastMessage = `📎 ${fileName}`;
        } else {
          lastMessage = '📎 Media file';
        }
      }

      // Don't add chat if it's a group, newsletter, or broadcast
      if (phone.includes('@g.us') || phone.includes('@newsletter') || phone.includes('@broadcast')) {
        return;
      }

      chat = {
        phone: phone,
        lastMessage: lastMessage,
        lastMessageTime: message.receivedAt,
        unreadCount: 0, // Will be updated below
        messages: [],
        instance: message.instance || 'wa1', // Track instance
        instances: new Set([message.instance || 'wa1']),
        isAssigned: false, // Default to unassigned for new chats
        assignedTo: null // Default to null for new chats
      };
      this.phoneToInstance.set(phone, message.instance || 'wa1');
      this.chats.unshift(chat);

      // Emit chatsUpdated immediately for new chat so it appears in UI
      this.emit('chatsUpdated', this.chats);
    } else {
      // Update instance if message has instance info
      if (message.instance) {
        chat.instance = message.instance;
        if (!chat.instances) chat.instances = new Set([chat.instance]);
        chat.instances.add(message.instance);
        this.phoneToInstance.set(phone, message.instance);
      }
      // Use timestamp if available (Unix timestamp in seconds), otherwise use receivedAt
      const msgTime = message.timestamp ? message.timestamp * 1000 : new Date(message.receivedAt || 0).getTime();
      const lastMsgTime = chat.lastMessageTime ? new Date(chat.lastMessageTime).getTime() : 0;

      // Update chat for both incoming and outgoing messages
      if (msgTime > lastMsgTime) {
        // Only update lastMessage if it's from client (not from 'me')
        if (message.from !== 'me' && message.type !== 'sent') {
          // Handle media files - show descriptive text instead of empty body
          if (message.hasMedia) {
            const mimeType = message.mediaType || (message.media && message.media.mimetype) || '';
            const fileName = message.filename || (message.media && message.media.filename) || '';

            if (mimeType.startsWith('image/')) {
              chat.lastMessage = '📎 Image';
            } else if (mimeType.startsWith('video/')) {
              chat.lastMessage = '📎 Video';
            } else if (mimeType === 'application/pdf') {
              chat.lastMessage = '📎 PDF';
            } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || fileName.match(/\.(xls|xlsx)$/i)) {
              chat.lastMessage = '📎 Excel';
            } else if (mimeType.includes('word') || fileName.match(/\.(doc|docx)$/i)) {
              chat.lastMessage = '📎 Document';
            } else if (fileName) {
              chat.lastMessage = `📎 ${fileName}`;
            } else {
              chat.lastMessage = '📎 Media file';
            }
          } else {
            chat.lastMessage = message.body || 'No message';
          }
          chat.lastMessageTime = message.receivedAt;
        }
        // Move chat to top of list
        this.chats = this.chats.filter(c => c.phone !== phone);
        this.chats.unshift(chat);
      }
    }

    // Get unread count from database for incoming messages
    if (message.from !== 'me' && message.type !== 'sent') {
      const unreadCount = await this.getUnreadCount(phone);
      chat.unreadCount = unreadCount;
      // console.log('📊 Updated unread count for', phone, ':', unreadCount);
    }

    // Load assigned status if needed (async, but don't block UI update)
    const chatInList = this.chats.find(c => c.phone === phone);
    if (!chatInList || chatInList.assignedTo === undefined) {
      // Try to get assigned status from the instance this chat belongs to
      const instance = chatInList?.instance || this.phoneToInstance.get(phone) || 'wa1';
      // Load assigned status asynchronously (don't await to avoid blocking)
      fetch(`${this.baseUrl}/${instance}/api/whatsapp/assigned-status/${phone}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          return null;
        })
        .then(data => {
          if (data && data.success && chatInList) {
            chatInList.assignedTo = data.assignedTo;
            chatInList.isAssigned = data.isAssigned;
            // Emit update after assigned status is loaded
            this.emit('chatsUpdated', this.chats);
          }
        })
        .catch(error => {
          console.warn('Failed to get assigned status:', error);
        });
    }

    // Filter out closed chats before emitting (only filter chats that are ONLY closed)
    // Don't await to avoid blocking - filterClosedChats will emit its own event if needed
    this.filterClosedChats().then(() => {
      // Emit chatsUpdated after filtering (if chat was not filtered, it will still be in list)
      this.emit('chatsUpdated', this.chats);
    }).catch(() => {
      // If filtering fails, still emit the update
      this.emit('chatsUpdated', this.chats);
    });
  }

  // Function to reset unread count when chat is opened
  async markChatAsRead(phone) {
    // Cancel any existing request for this phone to prevent duplicate requests
    const existingController = this.markAsReadControllers.get(phone);
    if (existingController) {
      existingController.controller.abort();
      if (existingController.timeoutId) {
        clearTimeout(existingController.timeoutId);
      }
    }

    try {
      // Get instance from phoneToInstance map, default to wa1
      const instance = this.phoneToInstance.get(phone) || 'wa1';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout (increased from 5s)

      // Store controller and timeout for potential cancellation
      this.markAsReadControllers.set(phone, { controller, timeoutId });

      const response = await fetch(`https://waserverlive.genio.id/${instance}/api/whatsapp/mark-read/${phone}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      // Clear timeout and remove from tracking
      clearTimeout(timeoutId);
      this.markAsReadControllers.delete(phone);

      if (response.ok) {
        // Update local chat list
        const chat = this.chats.find(c => c.phone === phone);
        if (chat) {
          chat.unreadCount = 0;
          this.emit('chatsUpdated', this.chats);
        }
      } else {
        console.error('❌ Failed to mark messages as read:', response.status, response.statusText);
        // Fallback: update local state
        const chat = this.chats.find(c => c.phone === phone);
        if (chat) {
          chat.unreadCount = 0;
          this.emit('chatsUpdated', this.chats);
        }
      }
    } catch (error) {
      // Clean up on error
      const existing = this.markAsReadControllers.get(phone);
      if (existing && existing.timeoutId) {
        clearTimeout(existing.timeoutId);
      }
      this.markAsReadControllers.delete(phone);

      // Only log non-abort errors (abort is expected when timeout occurs or request is cancelled)
      if (error.name !== 'AbortError') {
        console.error('❌ Error marking messages as read:', error);
      }

      // Fallback: just update local state without API call
      const chat = this.chats.find(c => c.phone === phone);
      if (chat) {
        chat.unreadCount = 0;
        this.emit('chatsUpdated', this.chats);
      }
    }
  }

  // Function to load assigned status for all chats
  // TIDAK menggunakan cache karena multi-agent perlu data real-time
  async loadAssignedStatus() {
    try {
      // Cancel any existing requests
      this.assignedStatusControllers.forEach((controller) => {
        controller.abort();
      });
      this.assignedStatusControllers.clear();

      // Fetch assigned status for all chats (no cache for real-time multi-agent)
      const statusPromises = this.chats.map(async (chat) => {
        try {
          // Cancel any existing request for this phone
          const existingController = this.assignedStatusControllers.get(chat.phone);
          if (existingController) {
            existingController.abort();
          }

          // Create new controller for this request
          const controller = new AbortController();
          this.assignedStatusControllers.set(chat.phone, controller);

          // Use instance from chat, or default to wa1
          const instance = chat.instance || this.phoneToInstance.get(chat.phone) || 'wa1';
          const response = await fetch(`${this.baseUrl}/${instance}/api/whatsapp/assigned-status/${chat.phone}`, {
            signal: controller.signal
          });

          // Remove controller after request completes
          this.assignedStatusControllers.delete(chat.phone);

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              return {
                phone: chat.phone,
                assignedTo: data.assignedTo,
                isAssigned: data.isAssigned
              };
            }
          }
        } catch (error) {
          // Remove controller on error
          this.assignedStatusControllers.delete(chat.phone);

          // Skip AbortError (expected when request is cancelled)
          if (error.name !== 'AbortError') {
            console.warn(`Failed to get assigned status for ${chat.phone}:`, error);
          }
        }
        return { phone: chat.phone, assignedTo: null, isAssigned: false };
      });

      const statuses = await Promise.all(statusPromises);
      const statusMap = new Map(statuses.map(s => [s.phone, s]));

      // Update chats with assigned status
      this.chats = this.chats.map(chat => {
        const status = statusMap.get(chat.phone);
        return {
          ...chat,
          assignedTo: status?.assignedTo || null,
          isAssigned: status?.isAssigned !== undefined ? status.isAssigned : false
        };
      });
    } catch (error) {
      console.warn('Unable to load assigned status:', error?.message || error);
    }
  }

  // Function to update assigned status for a specific chat immediately
  updateChatAssignedStatus(phone, assignedTo) {
    // Normalize phone number
    const normalizedPhone = phone?.replace('@c.us', '') || phone;

    // Update in chats array
    this.chats = this.chats.map(chat => {
      const chatPhone = chat.phone?.replace('@c.us', '') || chat.phone;
      if (chatPhone === normalizedPhone) {
        const isAssigned = assignedTo !== null && assignedTo !== undefined && assignedTo !== 'undefined' && assignedTo !== '';
        return {
          ...chat,
          isAssigned: isAssigned,
          assignedTo: assignedTo || null
        };
      }
      return chat;
    });

    // Emit chatsUpdated event to notify listeners
    this.emit('chatsUpdated', this.chats);
  }

  // Function to filter out closed chats from the chat list
  // Only filters chats that are ONLY closed (have no open messages)
  async filterClosedChats() {
    try {
      // Get closed chats from all instances (wa1-wa6)
      // These are chats that ONLY have closed messages (no open messages)
      const closedPhones = new Set();
      const instances = ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'];

      // Fetch from all instances in parallel
      const fetchPromises = instances.map(async (instanceName) => {
        try {
          const closedChatsResponse = await fetch(`${this.baseUrl}/${instanceName}/api/whatsapp/closed-chats`);
          if (closedChatsResponse.ok) {
            const closedData = await closedChatsResponse.json();
            if (closedData.success && closedData.chats) {
              closedData.chats.forEach(chat => {
                // Normalize phone number (remove @c.us if present)
                const normalizedPhone = chat.phone?.replace('@c.us', '') || chat.phone;
                closedPhones.add(normalizedPhone);
              });
            }
          }
        } catch (err) {
          console.warn(`Unable to fetch closed chats from ${instanceName}:`, err);
        }
      });

      await Promise.all(fetchPromises);

      if (closedPhones.size > 0) {
        // Filter out chats that are ONLY closed (have no open messages)
        // IMPORTANT: Verify that chat truly has NO open messages before filtering
        // This prevents race conditions where new open messages haven't been synced to database yet
        const beforeFilter = this.chats.length;
        const chatsToVerify = this.chats.filter(chat => {
          const normalizedPhone = chat.phone?.replace('@c.us', '') || chat.phone;
          return closedPhones.has(normalizedPhone);
        });

        // Verify each chat that appears in closed-chats list
        // Only filter if it truly has NO open messages
        const verifiedClosedPhones = new Set();
        const verificationPromises = chatsToVerify.map(async (chat) => {
          const normalizedPhone = chat.phone?.replace('@c.us', '') || chat.phone;
          const instance = chat.instance || this.phoneToInstance.get(chat.phone) || 'wa1';

          try {
            // Check if chat has any open messages
            const response = await fetch(`${this.baseUrl}/${instance}/api/whatsapp/messages/${normalizedPhone}?includeClosed=false`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.messages && data.messages.length > 0) {
                // Chat has open messages - don't filter it
                return null;
              }
            }
            // No open messages found - verify it's truly closed
            verifiedClosedPhones.add(normalizedPhone);
            return normalizedPhone;
          } catch (error) {
            // If verification fails, don't filter (safer to keep chat in list)
            console.warn(`Failed to verify closed status for ${normalizedPhone}:`, error);
            return null;
          }
        });

        await Promise.all(verificationPromises);

        // Only filter chats that are verified to have NO open messages
        this.chats = this.chats.filter(chat => {
          const normalizedPhone = chat.phone?.replace('@c.us', '') || chat.phone;
          // Only filter if verified to have NO open messages
          return !verifiedClosedPhones.has(normalizedPhone);
        });

        const afterFilter = this.chats.length;

        if (beforeFilter !== afterFilter) {
          console.log(`✅ Filtered out ${beforeFilter - afterFilter} closed chat(s) from active list (verified no open messages)`);
        }
      }
    } catch (filterErr) {
      console.warn('Unable to filter closed chats:', filterErr?.message || filterErr);
    }
  }

  // Function to get unread count from database
  async getUnreadCount(phone) {
    try {
      // Get instance from phoneToInstance map, or try all instances (wa1-wa6)
      const instance = this.phoneToInstance.get(phone);
      const instancesToTry = instance ? [instance] : ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'];

      let totalUnread = 0;

      for (const instanceName of instancesToTry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const response = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/unread-count/${phone}`, {
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            totalUnread += (data.unreadCount || 0);
          }
        } catch (err) {
          // Continue to next instance if one fails
          console.warn(`Failed to get unread count from ${instanceName}:`, err);
        }
      }

      if (totalUnread > 0) {
        return totalUnread;
      }

      // Fallback: return local unread count
      const chat = this.chats.find(c => c.phone === phone);
      return chat ? chat.unreadCount || 0 : 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      // Fallback: return local unread count
      const chat = this.chats.find(c => c.phone === phone);
      return chat ? chat.unreadCount || 0 : 0;
    }
  }

  assignChatToAgent(phone, agentId) {
    chatStatusService.assignToAgent(phone, agentId);
    this.emit('chatAssigned', { phone, agentId });
  }

  unassignChatFromAgent(phone) {
    chatStatusService.unassignFromAgent(phone);
    this.emit('chatUnassigned', { phone });
  }

  getChatStatus(phone) {
    return chatStatusService.getStatus(phone);
  }

  isChatAssigned(phone) {
    // First check from chat list (from database)
    const chat = this.chats.find(c => c.phone === phone);
    if (chat && chat.isAssigned) {
      return true;
    }
    // Fallback to chatStatusService for backward compatibility
    return chatStatusService.isAssigned(phone);
  }

  isChatUnassigned(phone) {
    return chatStatusService.isUnassigned(phone);
  }

  checkChatStatus(phone) {
    const status = chatStatusService.getStatus(phone);
    const isAssigned = chatStatusService.isAssigned(phone);
    const isUnassigned = chatStatusService.isUnassigned(phone);

    return { status, isAssigned, isUnassigned };
  }

  getAssignedChats() {
    return chatStatusService.getAssignedChats();
  }

  getUnassignedChats() {
    return chatStatusService.getUnassignedChats();
  }

  getChatStatistics() {
    return chatStatusService.getStatistics();
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  getChats() {
    return this.chats;
  }

  getCurrentChat() {
    return this.currentChat;
  }

  isConnected() {
    return this.isConnected;
  }

  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  connectToReact(reactComponent) {
    this.on('chatsLoaded', (chats) => {
      if (reactComponent.setState) {
        reactComponent.setState({ chats });
      }
    });

    this.on('chatSelected', (chat) => {
      if (reactComponent.setState) {
        reactComponent.setState({ currentChat: chat });
      }
    });

    this.on('newMessage', (message) => {
      if (reactComponent.setState) {
        reactComponent.setState(prevState => ({
          messages: [...prevState.messages, message]
        }));
      }
    });
  }
}

const whatsappIntegration = new WhatsAppIntegration();

export default whatsappIntegration;

window.WhatsAppIntegration = whatsappIntegration;
