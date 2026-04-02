// WhatsApp Socket V2 Integration for React App
class ReactWhatsAppIntegration {
  constructor() {
    this.apiUrl = 'https://waserverlive.genio.id';
    this.socketUrl = 'https://waserverlive.genio.id';
    this.socket = null;
    this.isConnected = false;
    this.chats = [];
    this.currentChat = null;
    this.processedMessageIds = new Set();

    this.init();
  }

  init() {
    console.log('Initializing React WhatsApp Integration...');
    this.connectSocket();
    this.setupEventListeners();
    this.loadChats();
  }

  connectSocket() {
    try {
      console.log('Connecting to WhatsApp Socket V2...');
      this.socket = io(this.socketUrl);
      this.setupSocketEvents();
    } catch (error) {
      console.error('Error connecting to WhatsApp Socket V2:', error);
    }
  }

  setupSocketEvents() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to WhatsApp Socket V2');
      this.isConnected = true;
      this.updateConnectionStatus('Connected to WhatsApp Socket V2', 'success');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WhatsApp Socket V2');
      this.isConnected = false;
      this.updateConnectionStatus('Disconnected from WhatsApp Socket V2', 'danger');
    });

    this.socket.on('message', (data) => {
      console.log('📨 New WhatsApp message received:', data);
      this.handleNewMessage(data);
    });

    this.socket.on('status', (data) => {
      console.log('📊 WhatsApp status update:', data);
      this.handleStatusUpdate(data);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.updateConnectionStatus('Connection error: ' + error.message, 'danger');
    });
  }

  setupEventListeners() {
    // Listen for React app events
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
      console.log('Loading chats from WhatsApp Socket V2...');
      const response = await fetch(`${this.apiUrl}/react-chat/messages`);
      const data = await response.json();

      if (data.success) {
        this.chats = data.chats;
        console.log('📋 Loaded chats:', this.chats.length);
        this.updateChatList();
        this.dispatchEvent('whatsapp:chatsLoaded', { chats: this.chats });
      } else {
        console.error('❌ Failed to load chats:', data.message);
      }
    } catch (error) {
      console.error('❌ Error loading chats:', error);
    }
  }

  async selectChat(phone) {
    try {
      console.log('Selecting chat for phone:', phone);
      const response = await fetch(`${this.apiUrl}/react-chat/messages/${phone}`);
      const data = await response.json();

      if (data.success) {
        this.currentChat = {
          phone: phone,
          messages: data.messages
        };
        console.log('💬 Loaded messages for chat:', data.messages.length);
        this.updateChatMessages();
        this.dispatchEvent('whatsapp:chatSelected', { chat: this.currentChat });
      } else {
        console.error('❌ Failed to load chat messages:', data.message);
      }
    } catch (error) {
      console.error('❌ Error loading chat messages:', error);
    }
  }

  async sendMessage(phone, message) {
    try {
      console.log('Sending message to:', phone, 'Message:', message);
      const response = await fetch(`${this.apiUrl}/react-chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phone,
          message: message,
          agentId: 'react-app'
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Message sent successfully:', data.messageId);
        this.dispatchEvent('whatsapp:messageSent', {
          phone: phone,
          message: message,
          messageId: data.messageId
        });
        return data;
      } else {
        console.error('❌ Failed to send message:', data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  handleNewMessage(data) {
    // Filter out newsletter messages
    if (data.from && data.from.includes('@newsletter')) {
      console.log('🚫 Newsletter message filtered out:', data.from);
      return;
    }

    // Check for duplicate messages
    if (this.processedMessageIds.has(data.id)) {
      console.log('🚫 Duplicate message ignored:', data.id);
      return;
    }

    this.processedMessageIds.add(data.id);

    // Update chats list
    this.updateChatWithNewMessage(data);

    // Update current chat if it matches
    if (this.currentChat && this.currentChat.phone === data.from.replace('@c.us', '')) {
      this.currentChat.messages.push(data);
      this.updateChatMessages();
    }

    // Dispatch event for React app
    this.dispatchEvent('whatsapp:newMessage', { message: data });
  }

  updateChatWithNewMessage(message) {
    const phone = message.from.replace('@c.us', '');
    let chat = this.chats.find(c => c.phone === phone);

    if (!chat) {
      // Create new chat
      chat = {
        phone: phone,
        lastMessage: message.body,
        lastMessageTime: message.receivedAt,
        unreadCount: 0,
        messages: []
      };
      this.chats.unshift(chat);
    } else {
      // Update existing chat
      chat.lastMessage = message.body;
      chat.lastMessageTime = message.receivedAt;

      // Move to top
      this.chats = this.chats.filter(c => c.phone !== phone);
      this.chats.unshift(chat);
    }

    // Count unread messages
    if (message.from !== 'me' && message.type !== 'sent') {
      chat.unreadCount++;
    }

    this.updateChatList();
  }

  updateChatList() {
    // Try to find React chat list container
    const chatListContainer = document.querySelector('[data-testid="chat-list"], .chat-list, .conversation-list');

    if (chatListContainer) {
      // Clear existing content
      chatListContainer.innerHTML = '';

      // Add chats
      this.chats.forEach(chat => {
        const chatItem = this.createChatItem(chat);
        chatListContainer.appendChild(chatItem);
      });

      console.log('📋 Updated chat list with', this.chats.length, 'chats');
    } else {
      console.log('⚠️ Chat list container not found');
    }
  }

  createChatItem(chat) {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.style.cssText = `
      padding: 12px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
    `;

    chatItem.innerHTML = `
      <div class="chat-avatar" style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #007bff;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      ">
        ${chat.phone.substring(chat.phone.length - 2)}
      </div>
      <div class="chat-content" style="flex: 1;">
        <div class="chat-phone" style="font-weight: bold; margin-bottom: 4px;">
          ${chat.phone}
        </div>
        <div class="chat-last-message" style="color: #666; font-size: 14px;">
          ${chat.lastMessage}
        </div>
      </div>
      <div class="chat-meta" style="text-align: right;">
        <div class="chat-time" style="font-size: 12px; color: #999;">
          ${new Date(chat.lastMessageTime).toLocaleTimeString()}
        </div>
        ${chat.unreadCount > 0 ? `
          <div class="unread-badge" style="
            background: #007bff;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            margin-top: 4px;
          ">
            ${chat.unreadCount}
          </div>
        ` : ''}
      </div>
    `;

    // Add click handler
    chatItem.addEventListener('click', () => {
      this.selectChat(chat.phone);
    });

    return chatItem;
  }

  updateChatMessages() {
    if (!this.currentChat) return;

    const messagesContainer = document.querySelector('[data-testid="messages"], .messages, .chat-messages');

    if (messagesContainer) {
      messagesContainer.innerHTML = '';

      this.currentChat.messages.forEach(message => {
        const messageElement = this.createMessageElement(message);
        messagesContainer.appendChild(messageElement);
      });

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      console.log('💬 Updated chat messages:', this.currentChat.messages.length);
    }
  }

  createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.from === 'me' ? 'sent' : 'received'}`;
    messageDiv.style.cssText = `
      margin: 8px 0;
      padding: 8px 12px;
      border-radius: 8px;
      max-width: 70%;
      ${message.from === 'me' ?
        'background: #007bff; color: white; margin-left: auto;' :
        'background: #f8f9fa; color: #333; margin-right: auto;'
      }
    `;

    messageDiv.innerHTML = `
      <div class="message-text">${message.body}</div>
      <div class="message-time" style="font-size: 11px; opacity: 0.7; margin-top: 4px;">
        ${new Date(message.receivedAt).toLocaleTimeString()}
      </div>
    `;

    return messageDiv;
  }

  handleStatusUpdate(data) {
    if (data.status === 'connected') {
      this.updateConnectionStatus('WhatsApp connected', 'success');
    } else if (data.status === 'disconnected') {
      this.updateConnectionStatus('WhatsApp disconnected', 'warning');
    }
  }

  updateConnectionStatus(message, type) {
    console.log('📊 Status update:', message, type);

    // Try to find status indicator
    const statusIndicator = document.querySelector('[data-testid="status"], .status-indicator');
    if (statusIndicator) {
      statusIndicator.textContent = message;
      statusIndicator.className = `status-indicator ${type}`;
    }
  }

  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  // Public methods for React app
  getChats() {
    return this.chats;
  }

  getCurrentChat() {
    return this.currentChat;
  }

  isConnected() {
    return this.isConnected;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  console.log('Initializing React WhatsApp Integration...');
  window.ReactWhatsApp = new ReactWhatsAppIntegration();
});

// Export for global access
window.ReactWhatsAppIntegration = ReactWhatsAppIntegration;
