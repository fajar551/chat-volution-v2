// WhatsApp Socket V2 Integration Injection for Client Chat
(function () {
  'use strict';

  console.log('Injecting WhatsApp Socket V2 Integration...');

  // Configuration
  const CONFIG = {
    socketUrl: 'http://103.102.153.200:4005',
    apiUrl: 'http://103.102.153.200:4005',
    autoConnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  };

  // Check if we're on the right page
  if (!window.location.href.includes('chat-with-client')) {
    console.log('Not on client chat page, skipping injection');
    return;
  }

  // Load Socket.IO if not already loaded
  if (typeof io === 'undefined') {
    const socketScript = document.createElement('script');
    socketScript.src = 'https://cdn.socket.io/4.7.4/socket.io.min.js';
    socketScript.onload = initIntegration;
    document.head.appendChild(socketScript);
  } else {
    initIntegration();
  }

  function initIntegration() {
    console.log('Initializing WhatsApp Socket V2 Integration...');

    // Create integration instance
    window.WhatsAppSocketV2 = new WhatsAppSocketV2Integration();

    // Add visual indicator
    addConnectionIndicator();
  }

  // WhatsApp Socket V2 Integration Class
  class WhatsAppSocketV2Integration {
    constructor() {
      this.socketUrl = CONFIG.socketUrl;
      this.apiUrl = CONFIG.apiUrl;
      this.socket = null;
      this.isConnected = false;
      this.processedMessageIds = new Set();
      this.currentChatPhone = null;
      this.reconnectAttempts = 0;

      this.init();
    }

    init() {
      this.connectSocket();
      this.setupEventListeners();
    }

    connectSocket() {
      try {
        console.log('Connecting to WhatsApp Socket V2:', this.socketUrl);
        this.socket = io(this.socketUrl);
        this.setupSocketEvents();
      } catch (error) {
        console.error('Error connecting to WhatsApp Socket V2:', error);
        this.scheduleReconnect();
      }
    }

    setupSocketEvents() {
      this.socket.on('connect', () => {
        console.log('✅ Connected to WhatsApp Socket V2');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.updateConnectionStatus('Connected to WhatsApp Socket V2', 'success');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from WhatsApp Socket V2');
        this.isConnected = false;
        this.updateConnectionStatus('Disconnected from WhatsApp Socket V2', 'danger');
        this.scheduleReconnect();
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
        this.scheduleReconnect();
      });
    }

    scheduleReconnect() {
      if (this.reconnectAttempts < CONFIG.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${CONFIG.maxReconnectAttempts})...`);
        setTimeout(() => {
          this.connectSocket();
        }, CONFIG.reconnectInterval);
      } else {
        console.error('❌ Max reconnection attempts reached');
        this.updateConnectionStatus('Failed to connect to WhatsApp Socket V2', 'danger');
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

      // Display message in chat interface
      this.displayMessage(data);
    }

    displayMessage(data) {
      // Try to find chat container and add message
      const chatContainer = document.querySelector('.chat-container, .messages-container, .conversation-container');
      if (chatContainer) {
        const messageElement = this.createMessageElement(data);
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      } else {
        console.log('Chat container not found, message not displayed');
      }
    }

    createMessageElement(data) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${data.from === 'me' ? 'sent' : 'received'}`;
      messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${data.body}</div>
                    <div class="message-time">${new Date(data.receivedAt).toLocaleString()}</div>
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
      const indicator = document.getElementById('whatsapp-status-indicator');
      if (indicator) {
        indicator.textContent = message;
        indicator.className = `whatsapp-status-indicator ${type}`;
      }
    }

    // Send message method
    async sendMessage(phone, message) {
      try {
        const response = await fetch(`${this.apiUrl}/client-chat/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone, message })
        });

        const result = await response.json();
        if (result.success) {
          console.log('✅ Message sent successfully:', result.messageId);
          return result;
        } else {
          console.error('❌ Failed to send message:', result.message);
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }
    }
  }

  // Add connection indicator to page
  function addConnectionIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'whatsapp-status-indicator';
    indicator.className = 'whatsapp-status-indicator';
    indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            z-index: 9999;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            color: #6c757d;
        `;
    indicator.textContent = 'Connecting to WhatsApp Socket V2...';
    document.body.appendChild(indicator);
  }

  // Add CSS for message styling
  const style = document.createElement('style');
  style.textContent = `
        .whatsapp-status-indicator.success {
            background: #d4edda !important;
            border-color: #c3e6cb !important;
            color: #155724 !important;
        }
        .whatsapp-status-indicator.danger {
            background: #f8d7da !important;
            border-color: #f5c6cb !important;
            color: #721c24 !important;
        }
        .whatsapp-status-indicator.warning {
            background: #fff3cd !important;
            border-color: #ffeaa7 !important;
            color: #856404 !important;
        }
        .message {
            margin: 10px 0;
            padding: 10px;
            border-radius: 8px;
            max-width: 70%;
        }
        .message.sent {
            background: #007bff;
            color: white;
            margin-left: auto;
        }
        .message.received {
            background: #f8f9fa;
            color: #333;
            margin-right: auto;
        }
        .message-time {
            font-size: 11px;
            opacity: 0.7;
            margin-top: 5px;
        }
    `;
  document.head.appendChild(style);

  console.log('WhatsApp Socket V2 Integration injection completed');
})();
