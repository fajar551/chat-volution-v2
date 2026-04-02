import {
  actionResolveMessage,
  actionSaveMessage,
  actionsUpdateStateStatusConnect,
  actionsUpdateStateTransfer,
} from './CLientUpdateState';

const ClientListens = (Socket) => {
  Socket.on('client.chat.ongoing', (response) => {
    actionsUpdateStateStatusConnect(response);
  });

  Socket.on('client.chat.transferresult', (response) => {
    actionsUpdateStateTransfer(response);
  });

  Socket.on('client.room.joinresult', (response) => {
    actionsUpdateStateStatusConnect(response);
  });

  /* listen message from agent */
  Socket.on('message', (response) => {
    console.log('📨 Received message via WebSocket:', response);

    // Validate message before processing
    if (!response || !response.message) {
      console.log('🚫 Invalid WebSocket message, skipping');
      return;
    }

    // Enhanced duplicate detection with message ID
    const messageId = response.id || response.messageId || `${response.message}_${response.timestamp}_${response.from}`;

    // Initialize processed messages if not exists
    if (!window.__processedWebSocketMessages) {
      window.__processedWebSocketMessages = new Set();
    }

    // Check for duplicate messages
    if (window.__processedWebSocketMessages.has(messageId)) {
      console.log('🚫 Duplicate WebSocket message detected, skipping:', messageId);
      return;
    }

    // Mark as processed
    window.__processedWebSocketMessages.add(messageId);

    // Clean up old processed messages (keep only last 100)
    if (window.__processedWebSocketMessages.size > 100) {
      const messagesArray = Array.from(window.__processedWebSocketMessages);
      window.__processedWebSocketMessages = new Set(messagesArray.slice(-50));
    }

    // Check if this is an echo of client's own message
    try {
      const lastSent = window.__lastSentMessage || null;

      // Check if this is a client message (not from agent)
      const currentUserEmail = window.__currentUserEmail || null;
      const isClientMessage = response.from === 'client' ||
        (currentUserEmail && response.from === currentUserEmail) ||
        (response.from && response.from.includes('@') && response.from !== 'agent');

      // Check if message is from current user
      const isCurrentUser = currentUserEmail && response.from === currentUserEmail;

      // Check if message matches last sent (within 30 seconds)
      const withinWindow = lastSent && (Date.now() - (lastSent.at || 0)) <= 30000;
      const isEchoMessage = lastSent && (isClientMessage || isCurrentUser) &&
        response.message === lastSent.text && withinWindow;

      if (isEchoMessage) {
        console.log('🚫 Skipping WebSocket echo message:', {
          from: response.from,
          message: response.message,
          lastSent: lastSent.text,
          isClientMessage,
          isCurrentUser,
          withinWindow,
          currentUserEmail
        });
        return;
      }

      // Additional check: if message is from client and matches any recent sent message
      if ((isClientMessage || isCurrentUser) && lastSent && response.message === lastSent.text) {
        console.log('🚫 Skipping WebSocket echo message (text match):', {
          from: response.from,
          message: response.message,
          lastSent: lastSent.text,
          isClientMessage,
          isCurrentUser
        });
        return;
      }
    } catch (error) {
      console.log('⚠️ Error checking echo message:', error);
    }

    actionSaveMessage(response);
  });

  Socket.on('logoutresult', (response) => { });

  Socket.on('client.chat.endresult', (response) => {
    actionResolveMessage(response);
  });

  /* list history chat */
  Socket.on('client.chat.resolve', (response) => { });

  Socket.on('rating.updateresult', (response) => { });

  Socket.on('rating.updateresult', (response) => { });

  // Connection state management
  let isConnected = false;
  let reconnectAttempts = 0;
  let hasEmittedChatNew = false;
  let chatNewTimeout = null;
  const maxReconnectAttempts = 5;

  const emitChatNew = () => {
    // Only emit when there is an active chat session flag
    const hasActiveChat = Boolean(window.__activeChatId);
    if (!hasEmittedChatNew && isConnected && hasActiveChat) {
      Socket.emit('chat.new');
      hasEmittedChatNew = true;
      console.log('Emitted chat.new after connection');
    }
  };

  Socket.on('connect', () => {
    console.log('✅ WebSocket connected');
    console.log('🔗 Socket ID:', Socket.id);
    console.log('🔗 Transport:', Socket.io.engine.transport.name);
    isConnected = true;
    reconnectAttempts = 0;

    // Clear any existing timeout
    if (chatNewTimeout) {
      clearTimeout(chatNewTimeout);
    }

    // Start heartbeat mechanism
    startHeartbeat();

    // Only emit chat.new once per connection
    if (!hasEmittedChatNew) {
      chatNewTimeout = setTimeout(() => {
        emitChatNew();
      }, 5000); // 5 seconds delay
    }
  });

  Socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason);
    console.log('🔗 Socket ID before disconnect:', Socket.id);
    isConnected = false;
    hasEmittedChatNew = false; // Reset flag on disconnect

    // Clear any existing timeout
    if (chatNewTimeout) {
      clearTimeout(chatNewTimeout);
      chatNewTimeout = null;
    }

    // Stop heartbeat on disconnect
    stopHeartbeat();

    // Only attempt reconnection if not manually disconnected
    if (reason !== 'io client disconnect') {
      console.log('🔄 Attempting to reconnect...');
    }
  });

  Socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
    isConnected = false;
  });

  // Handle pong response from server
  Socket.on('pong', () => {
    console.log('💓 Received pong from server');
    // Clear timeout and reset missed heartbeats
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = null;
    }
    missedHeartbeats = 0;
  });

  Socket.on('reconnect', (attemptNumber) => {
    console.log('WebSocket reconnected after', attemptNumber, 'attempts');
    isConnected = true;
    reconnectAttempts = 0;

    // Clear any existing timeout
    if (chatNewTimeout) {
      clearTimeout(chatNewTimeout);
    }

    // Only emit chat.new once per reconnection
    if (!hasEmittedChatNew) {
      chatNewTimeout = setTimeout(() => {
        emitChatNew();
      }, 5000); // 5 seconds delay
    }
  });

  Socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('WebSocket reconnection attempt:', attemptNumber);
    reconnectAttempts = attemptNumber;
  });

  Socket.on('reconnect_error', (error) => {
    console.error('WebSocket reconnection error:', error);
  });

  Socket.on('reconnect_failed', () => {
    console.error('WebSocket reconnection failed after', maxReconnectAttempts, 'attempts');
    isConnected = false;
  });

  // Manual reconnection if needed
  const manualReconnect = () => {
    if (!isConnected && reconnectAttempts < maxReconnectAttempts) {
      console.log('Manual reconnection attempt...');
      Socket.connect();
    }
  };

  // Expose manual reconnect function
  window.manualReconnect = manualReconnect;

  // Enhanced heartbeat mechanism to keep connection alive
  let heartbeatInterval = null;
  let heartbeatTimeout = null;
  let missedHeartbeats = 0;
  const maxMissedHeartbeats = 3;
  const heartbeatIntervalMs = 10000; // Send heartbeat every 10 seconds
  const heartbeatTimeoutMs = 5000; // Wait 5 seconds for response

  const startHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }

    heartbeatInterval = setInterval(() => {
      if (isConnected) {
        Socket.emit('heartbeat');
        console.log('💓 Sent heartbeat to server');

        // Set timeout for heartbeat response
        heartbeatTimeout = setTimeout(() => {
          missedHeartbeats++;
          console.warn(`💔 Missed heartbeat ${missedHeartbeats}/${maxMissedHeartbeats}`);

          if (missedHeartbeats >= maxMissedHeartbeats) {
            console.error('💔 Too many missed heartbeats, attempting reconnection');
            Socket.disconnect();
            Socket.connect();
            missedHeartbeats = 0;
          }
        }, heartbeatTimeoutMs);
      }
    }, heartbeatIntervalMs);
  };

  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = null;
    }
    missedHeartbeats = 0;
  };

  // Listen for heartbeat response
  Socket.on('pong', () => {
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = null;
    }
    missedHeartbeats = 0;
    console.log('💓 Received heartbeat response from server');
  });
};
export default ClientListens;
