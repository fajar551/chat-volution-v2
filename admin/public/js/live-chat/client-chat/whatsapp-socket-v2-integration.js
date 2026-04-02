// WhatsApp Socket V2 Integration for Client Chat
class WhatsAppSocketV2Integration {
  constructor() {
    this.socketUrl = 'http://103.102.153.200:4005';
    this.apiUrl = 'http://103.102.153.200:4005';
    this.socket = null;
    this.isConnected = false;
    this.processedMessageIds = new Set();
    this.currentChatPhone = null;

    this.init();
  }

  init() {
    this.connectSocket();
    this.setupEventListeners();
  }

  connectSocket() {
    try {
      this.socket = io(this.socketUrl);
      this.setupSocketEvents();
    } catch (error) {
      console.error('Error connecting to WhatsApp Socket V2:', error);
    }
  }

  setupSocketEvents() {
    this.socket.on('connect', () => {
      console.log('Connected to WhatsApp Socket V2');
      this.isConnected = true;
      this.updateConnectionStatus('Connected to WhatsApp Socket V2', 'success');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WhatsApp Socket V2');
      this.isConnected = false;
      this.updateConnectionStatus('Disconnected from WhatsApp Socket V2', 'danger');
    });

    this.socket.on('message', (data) => {
      console.log('New WhatsApp message received:', data);
      this.handleNewMessage(data);
    });

    this.socket.on('status', (data) => {
      console.log('WhatsApp status update:', data);
      this.handleStatusUpdate(data);
    });
  }

  setupEventListeners() {
    // Listen for chat selection events
    document.addEventListener('click', (e) => {
      if (e.target.closest('.chat-item') || e.target.closest('.message-item')) {
        const chatElement = e.target.closest('.chat-item') || e.target.closest('.message-item');
        if (chatElement) {
          const phone = this.extractPhoneFromElement(chatElement);
          if (phone) {
            this.selectChat(phone);
          }
        }
      }
    });

    // Listen for message send events
    document.addEventListener('submit', (e) => {
      if (e.target.matches('#chatForm') || e.target.matches('.message-form')) {
        e.preventDefault();
        this.handleSendMessage(e.target);
      }
    });
  }

  extractPhoneFromElement(element) {
    // Try to extract phone number from various possible selectors
    const phoneSelectors = [
      '.phone-number',
      '.chat-phone',
      '.contact-phone',
      '[data-phone]',
      '.chat-title'
    ];

    for (const selector of phoneSelectors) {
      const phoneElement = element.querySelector(selector);
      if (phoneElement) {
        let phone = phoneElement.textContent || phoneElement.getAttribute('data-phone');
        if (phone) {
          // Clean phone number
          phone = phone.replace(/[^\d]/g, '');
          if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
          } else if (phone.startsWith('8')) {
            phone = '62' + phone;
          }
          return phone;
        }
      }
    }

    return null;
  }

  selectChat(phone) {
    this.currentChatPhone = phone;
    console.log('Selected chat with phone:', phone);
    this.loadChatMessages(phone);
  }

  async loadChatMessages(phone) {
    try {
      const response = await fetch(`${this.apiUrl}/client-chat/messages?phone=${phone}`);
      const data = await response.json();

      if (data.success) {
        this.displayChatMessages(data.messages, phone);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  }

  displayChatMessages(messages, phone) {
    // Find chat container
    const chatContainer = document.querySelector('.chat-messages') ||
      document.querySelector('.messages-container') ||
      document.querySelector('#chatMessages');

    if (!chatContainer) {
      console.log('Chat container not found');
      return;
    }

    // Clear existing messages
    chatContainer.innerHTML = '';

    // Sort messages by timestamp
    messages.sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt));

    // Display messages
    messages.forEach(message => {
      const messageElement = this.createMessageElement(message, phone);
      chatContainer.appendChild(messageElement);
    });

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  createMessageElement(message, phone) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';

    const isFromMe = message.from === 'me' || message.type === 'sent';
    const messageClass = isFromMe ? 'message-sent' : 'message-received';

    messageDiv.innerHTML = `
            <div class="message ${messageClass}">
                <div class="message-content">${message.body}</div>
                <div class="message-time">${new Date(message.receivedAt).toLocaleString()}</div>
            </div>
        `;

    return messageDiv;
  }

  handleNewMessage(message) {
    // Check for duplicate messages
    if (this.processedMessageIds.has(message.id)) {
      console.log('🚫 Duplicate message ignored:', message.id);
      return;
    }

    // Filter out newsletter messages
    if (message.from && message.from.includes('@newsletter')) {
      console.log('🚫 Newsletter message filtered out:', message.from);
      return;
    }

    // Mark message as processed
    this.processedMessageIds.add(message.id);

    // If this message is for current chat, display it
    if (this.currentChatPhone && this.isMessageForCurrentChat(message)) {
      this.addMessageToCurrentChat(message);
    }

    // Update chat list if message is from a new contact
    this.updateChatList(message);
  }

  isMessageForCurrentChat(message) {
    if (!this.currentChatPhone) return false;

    const normalizedPhone = this.currentChatPhone.replace('@c.us', '');
    const messageFrom = message.from.replace('@c.us', '');
    const messageTo = message.to ? message.to.replace('@c.us', '') : '';

    return messageFrom === normalizedPhone ||
      messageTo === normalizedPhone ||
      (message.from === 'me' && messageTo === normalizedPhone) ||
      (message.type === 'sent' && messageTo === normalizedPhone);
  }

  addMessageToCurrentChat(message) {
    const chatContainer = document.querySelector('.chat-messages') ||
      document.querySelector('.messages-container') ||
      document.querySelector('#chatMessages');

    if (chatContainer) {
      const messageElement = this.createMessageElement(message, this.currentChatPhone);
      chatContainer.appendChild(messageElement);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  updateChatList(message) {
    // Find or create chat list item for this contact
    const chatList = document.querySelector('.chat-list') ||
      document.querySelector('.conversations-list') ||
      document.querySelector('#chatList');

    if (!chatList) return;

    const phone = message.from.replace('@c.us', '');
    let chatItem = chatList.querySelector(`[data-phone="${phone}"]`);

    if (!chatItem) {
      chatItem = this.createChatListItem(phone, message);
      chatList.insertBefore(chatItem, chatList.firstChild);
    } else {
      this.updateChatListItem(chatItem, message);
    }
  }

  createChatListItem(phone, message) {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.setAttribute('data-phone', phone);

    chatItem.innerHTML = `
            <div class="chat-info">
                <div class="chat-phone">${phone}</div>
                <div class="chat-preview">${message.body.substring(0, 50)}...</div>
                <div class="chat-time">${new Date(message.receivedAt).toLocaleString()}</div>
            </div>
        `;

    return chatItem;
  }

  updateChatListItem(chatItem, message) {
    const preview = chatItem.querySelector('.chat-preview');
    const time = chatItem.querySelector('.chat-time');

    if (preview) preview.textContent = message.body.substring(0, 50) + '...';
    if (time) time.textContent = new Date(message.receivedAt).toLocaleString();
  }

  async handleSendMessage(form) {
    const messageInput = form.querySelector('input[type="text"], textarea');
    const message = messageInput ? messageInput.value.trim() : '';

    if (!message || !this.currentChatPhone) {
      console.log('No message or phone number');
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/client-chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: this.currentChatPhone,
          message: message,
          agentId: this.getCurrentAgentId()
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('Message sent successfully');
        if (messageInput) messageInput.value = '';

        // Add sent message to current chat
        const sentMessage = {
          id: data.messageId,
          from: 'me',
          to: `${this.currentChatPhone}@c.us`,
          body: message,
          timestamp: Math.floor(Date.now() / 1000),
          receivedAt: new Date().toISOString(),
          type: 'sent'
        };

        this.addMessageToCurrentChat(sentMessage);
      } else {
        console.error('Failed to send message:', data.message);
        this.showError('Failed to send message: ' + data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.showError('Error sending message');
    }
  }

  getCurrentAgentId() {
    // Try to get current agent ID from various possible sources
    const agentIdElement = document.querySelector('[data-agent-id]') ||
      document.querySelector('.agent-id') ||
      document.querySelector('#agentId');

    return agentIdElement ? agentIdElement.textContent || agentIdElement.getAttribute('data-agent-id') : 'unknown';
  }

  handleStatusUpdate(data) {
    if (data.status === 'connected') {
      this.updateConnectionStatus('WhatsApp connected', 'success');
    } else if (data.status === 'disconnected') {
      this.updateConnectionStatus('WhatsApp disconnected', 'danger');
    }
  }

  updateConnectionStatus(message, type) {
    // Try to find status indicator in the UI
    const statusElement = document.querySelector('.whatsapp-status') ||
      document.querySelector('.connection-status') ||
      document.querySelector('#whatsappStatus');

    if (statusElement) {
      statusElement.innerHTML = `<span class="badge badge-${type}">${message}</span>`;
    }

    console.log(`WhatsApp Status: ${message}`);
  }

  showError(message) {
    // Try to show error message in UI
    const errorContainer = document.querySelector('.error-message') ||
      document.querySelector('.alert-container') ||
      document.querySelector('#errorMessage');

    if (errorContainer) {
      errorContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
      setTimeout(() => {
        if (errorContainer) errorContainer.innerHTML = '';
      }, 5000);
    }

    console.error(message);
  }
}

// Initialize WhatsApp Socket V2 Integration when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Only initialize if we're on the client chat page
  if (window.location.pathname.includes('/chat-with-client') ||
    document.querySelector('.chat-container') ||
    document.querySelector('#chatMessages')) {

    window.whatsappSocketV2 = new WhatsAppSocketV2Integration();
    console.log('WhatsApp Socket V2 Integration initialized');
  }
});
