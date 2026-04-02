require('dotenv').config();

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Database imports
const { db, testConnection } = require('./config/database');
const { Op, Sequelize } = require('sequelize');
const WhatsAppMessage = require('./models/WhatsAppMessage');
const ChatChannelAccount = require('./models/ChatChannelAccount');
const ApiKey = require('./models/ApiKey');

// OpenAI Assistant Configuration
// To use a different assistant ID, set OPENAI_ASSISTANT_ID in .env file
// Default: 'asst_hKXiL8LD3dEMsjh48BOQvAyC'
// Note: Assistant must have proper configuration (e.g., vector store for file_search tool)

// Express Setup
const app = express();
const server = createServer(app);
const port = process.env.PORT || 4003;
// const WEB_SOCKET_CV = process.env.WEB_SOCKET_CV;

// Middleware
app.use(cors({
  origin: [
    'https://admin-chat.genio.id',
    'https://v2chat.genio.id',
    'https://waserverlive.genio.id',
    'https://103.102.153.200:4003',
    'http://103.102.153.200:4003',
    'https://chatvolution.my.id',
    'http://chatvolution.my.id',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Router untuk /wa2 path - duplicate semua routes dengan prefix /wa2
const wa2Router = express.Router();

// Copy semua routes ke wa2Router
wa2Router.get('/', (req, res) => {
  res.send('Hello World from fajar di wa socket v2?! ');
});

wa2Router.get('/status', async (req, res) => {
  try {
    const state = await client.getState();
    res.json({
      connected: state === 'CONNECTED',
      state: state,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

wa2Router.post('/send', async (req, res) => {
  try {
    const { phone, message, agentId } = req.body;
    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone and message are required'
      });
    }

    // If AI processing is in progress for this phone, block auto-replies from frontend
    try {
      const plainPhone = phone.replace('@c.us', '');
      console.log('📥 Incoming send request:', { phone: plainPhone, agentId, message: message.substring(0, 30) });
      console.log('🔍 AI in-progress phones:', Array.from(global.aiInProgressPhones || []));
      console.log('🔍 Is phone in AI progress?', global.aiInProgressPhones.has(plainPhone));

      if (agentId === 'react-app') {
        if (global.aiInProgressPhones.has(plainPhone)) {
          // Check if AI processing has been going on for too long (more than 30 seconds)
          const startTime = global.aiProcessingStartTime.get(plainPhone);
          const processingTime = startTime ? Date.now() - startTime : 0;

          if (processingTime > 30000) { // 30 seconds
            console.log('⏰ AI processing timeout, clearing flag for:', plainPhone);
            global.aiInProgressPhones.delete(plainPhone);
            global.aiProcessingStartTime.delete(plainPhone);
            console.log('⚠️ Allowing react-app message (AI timeout)');
          } else {
            console.log('🚫 Blocked frontend auto-reply while AI processing:', plainPhone, `(${Math.round(processingTime / 1000)}s)`);
            return res.status(409).json({
              success: false,
              message: 'AI processing in progress, blocking duplicate reply'
            });
          }
        } else {
          // Check cooldown period (10 seconds after last AI response)
          const lastResponseTime = global.lastAiResponseTime.get(plainPhone);
          const timeSinceLastResponse = lastResponseTime ? Date.now() - lastResponseTime : 0;

          if (lastResponseTime && timeSinceLastResponse < 10000) { // 10 seconds cooldown
            console.log('🚫 Blocked frontend auto-reply (cooldown period):', plainPhone, `(${Math.round(timeSinceLastResponse / 1000)}s since last AI response)`);
            return res.status(409).json({
              success: false,
              message: 'Cooldown period active, please wait before sending another message'
            });
          } else {
            console.log('⚠️ Allowing react-app message (no AI in progress, cooldown passed)');
          }
        }
      }
    } catch (error) {
      console.log('❌ Error checking AI progress:', error);
    }

    // Create request fingerprint for deduplication
    const requestFingerprint = `${phone}_${message}_${Date.now()}`;

    // Check if this exact request was already processed recently (within 5 seconds)
    const recentRequests = Array.from(global.processedRequests).filter(req =>
      req.startsWith(`${phone}_${message}_`) &&
      (Date.now() - parseInt(req.split('_').pop())) < 5000
    );

    if (recentRequests.length > 0) {
      console.log('🚫 Duplicate request detected, skipping:', requestFingerprint);
      return res.status(409).json({
        success: false,
        message: 'Duplicate request detected',
        messageId: recentRequests[0].split('_').pop()
      });
    }

    // Add to processed requests
    global.processedRequests.add(requestFingerprint);

    // Cleanup old requests (keep last 100)
    if (global.processedRequests.size > 100) {
      const requestsArray = Array.from(global.processedRequests);
      global.processedRequests.clear();
      requestsArray.slice(-50).forEach(req => global.processedRequests.add(req));
    }

    const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    console.log('📤 Sending message to:', chatId, 'Message:', message.substring(0, 50) + '...');

    const result = await client.sendMessage(chatId, message);

    // Store sent message for deduplication
    const sentMessageId = result.id._serialized;
    global.sentMessages.add(sentMessageId);

    // Cleanup old sent messages (keep last 100)
    if (global.sentMessages.size > 100) {
      const messagesArray = Array.from(global.sentMessages);
      global.sentMessages.clear();
      messagesArray.slice(-50).forEach(msg => global.sentMessages.add(msg));
    }

    console.log('✅ Message sent successfully:', sentMessageId);

    // Store sent message in database
    try {
      await WhatsAppMessage.create({
        message_id: sentMessageId,
        from_number: 'me',
        to_number: chatId.replace('@c.us', ''),
        body: message,
        timestamp: Math.floor(Date.now() / 1000),
        received_at: new Date().toISOString(),
        direction: 'outgoing',
        message_type: 'text',
        status: 'sent',
        agent_id: agentId || 'wa2-system',
        is_read: true // Outgoing messages are considered read
      });
      console.log('💾 Sent message saved to database');
    } catch (dbError) {
      console.error('❌ Database error saving sent message:', dbError);
    }

    // Add sent message to global.allMessages for real-time display
    const sentMessageData = {
      id: sentMessageId,
      from: 'me',
      to: chatId,
      body: message,
      timestamp: Math.floor(Date.now() / 1000),
      hasMedia: false,
      receivedAt: new Date().toISOString(),
      type: 'sent'
    };

    global.allMessages.push(sentMessageData);
    console.log('📝 Added sent message to global.allMessages');

    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: sentMessageId
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

wa2Router.get('/init', (req, res) => {
  try {
    client.initialize();
    res.json({ success: true, message: 'WhatsApp client initialization started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

wa2Router.get('/logout', async (req, res) => {
  try {
    await client.logout();
    res.json({ success: true, message: 'WhatsApp client logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

wa2Router.get('/scan', (req, res) => {
  res.sendFile(__dirname + '/scan.html');
});

wa2Router.get('/cleanup-auth', (req, res) => {
  try {
    const cleanupSuccess = cleanupAuthFolder();
    if (cleanupSuccess) {
      res.json({ success: true, message: 'Auth folder cleaned successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to clean auth folder' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

wa2Router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

wa2Router.get('/messages', (req, res) => {
  try {
    const messages = global.allMessages || [];
    res.json({
      success: true,
      messages: messages,
      count: messages.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
});

wa2Router.get('/messages/:phone', (req, res) => {
  try {
    const phone = req.params.phone;
    const messages = global.allMessages || [];
    const phoneMessages = messages.filter(msg =>
      msg.from === phone || msg.to === phone
    );

    res.json({
      success: true,
      messages: phoneMessages,
      count: phoneMessages.length,
      phone: phone
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get messages for phone',
      error: error.message
    });
  }
});

// Database routes
// wa2Router.get('/database/messages', async (req, res) => {
//   try {
//     const messages = await WhatsAppMessage.findAll({
//       order: [['createdAt', 'DESC']],
//       limit: 100
//     });
//     res.json({
//       success: true,
//       messages: messages,
//       count: messages.length
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get database messages',
//       error: error.message
//     });
//   }
// });

// REMOVED: All /react-chat endpoints - not used

// Client chat routes
wa2Router.get('/client-chat/health', (req, res) => {
  res.json({
    success: true,
    message: 'Client chat service is running',
    timestamp: new Date().toISOString()
  });
});

// wa2Router.post('/client-chat/send', async (req, res) => {
//   try {
//     const { phone, message, agentId } = req.body;
//     if (!phone || !message) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone and message are required'
//       });
//     }

//     // Create request fingerprint for deduplication
//     const requestFingerprint = `client_${phone}_${message}_${Date.now()}`;

//     // Check if this exact request was already processed recently (within 5 seconds)
//     const recentRequests = Array.from(global.processedRequests).filter(req =>
//       req.startsWith(`client_${phone}_${message}_`) &&
//       (Date.now() - parseInt(req.split('_').pop())) < 5000
//     );

//     if (recentRequests.length > 0) {
//       console.log('🚫 Duplicate Client request detected, skipping:', requestFingerprint);
//       return res.status(409).json({
//         success: false,
//         message: 'Duplicate request detected',
//         messageId: recentRequests[0].split('_').pop()
//       });
//     }

//     // Add to processed requests
//     global.processedRequests.add(requestFingerprint);

//     const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
//     console.log('📤 Sending Client message to:', chatId, 'Message:', message.substring(0, 50) + '...');

//     const result = await client.sendMessage(chatId, message);

//     // Store sent message for deduplication
//     const sentMessageId = result.id._serialized;
//     global.sentMessages.add(sentMessageId);

//     // Store message in database
//     try {
//       await WhatsAppMessage.create({
//         messageId: result.id._serialized,
//         from: 'me',
//         to: chatId,
//         body: message,
//         timestamp: Math.floor(Date.now() / 1000),
//         type: 'sent',
//         agentId: agentId || null
//       });
//     } catch (dbError) {
//       console.error('Database error:', dbError);
//     }

//     console.log('✅ Client message sent successfully:', sentMessageId);

//     // Add sent message to global.allMessages for real-time display
//     const sentMessageData = {
//       id: sentMessageId,
//       from: 'me',
//       to: chatId,
//       body: message,
//       timestamp: Math.floor(Date.now() / 1000),
//       hasMedia: false,
//       receivedAt: new Date().toISOString(),
//       type: 'sent'
//     };

//     global.allMessages.push(sentMessageData);
//     console.log('📝 Added client sent message to global.allMessages');

//     res.json({
//       success: true,
//       message: 'Message sent successfully',
//       messageId: result.id._serialized
//     });
//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send message',
//       error: error.message
//     });
//   }
// });

wa2Router.get('/client-chat/messages', (req, res) => {
  try {
    const messages = global.allMessages || [];
    res.json({
      success: true,
      messages: messages,
      count: messages.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
});

// AI Response deduplication endpoint
wa2Router.post('/api/ai-response', async (req, res) => {
  try {
    const { phone, userMessage, messageId } = req.body;

    if (!phone || !userMessage || !messageId) {
      return res.status(400).json({
        success: false,
        message: 'Phone, userMessage, and messageId are required'
      });
    }

    // Create AI response fingerprint for deduplication
    const aiFingerprint = `ai_${phone}_${messageId}`;

    // Check if AI response was already processed for this message
    if (global.processedAiResponses && global.processedAiResponses.has(aiFingerprint)) {
      console.log('🚫 AI response already processed, skipping:', aiFingerprint);
      return res.status(409).json({
        success: false,
        message: 'AI response already processed for this message',
        messageId: messageId
      });
    }

    // Initialize processedAiResponses if not exists
    if (!global.processedAiResponses) {
      global.processedAiResponses = new Set();
    }

    // Add to processed AI responses
    global.processedAiResponses.add(aiFingerprint);

    // Cleanup old AI responses (keep last 100)
    if (global.processedAiResponses.size > 100) {
      const responsesArray = Array.from(global.processedAiResponses);
      global.processedAiResponses.clear();
      responsesArray.slice(-50).forEach(resp => global.processedAiResponses.add(resp));
    }

    console.log('✅ AI response approved for processing:', aiFingerprint);
    res.json({
      success: true,
      message: 'AI response approved for processing',
      messageId: messageId
    });

  } catch (error) {
    console.error('Error processing AI response request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI response request',
      error: error.message
    });
  }
});

// API routes
wa2Router.get('/api/api-keys', async (req, res) => {
  try {
    const apiKeys = await ApiKey.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({
      success: true,
      apiKeys: apiKeys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get API keys',
      error: error.message
    });
  }
});

wa2Router.get('/api/api-keys/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const apiKey = await ApiKey.findOne({
      where: { service: service, is_active: true }
    });

    if (apiKey) {
      res.json({
        success: true,
        service: service,
        api_key: apiKey.api_key,
        is_active: apiKey.is_active
      });
    } else {
      res.status(404).json({
        success: false,
        message: `API key for service ${service} not found`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get API key',
      error: error.message
    });
  }
});

wa2Router.post('/api/api-keys', async (req, res) => {
  try {
    const { service, api_key, is_active = true } = req.body;

    if (!service || !api_key) {
      return res.status(400).json({
        success: false,
        message: 'Service and API key are required'
      });
    }

    // Check if API key already exists for this service
    const existingApiKey = await ApiKey.findOne({
      where: { service: service }
    });

    if (existingApiKey) {
      // Update existing API key
      await existingApiKey.update({
        api_key: api_key,
        is_active: is_active
      });
      res.json({
        success: true,
        message: 'API key updated successfully',
        apiKey: existingApiKey
      });
    } else {
      // Create new API key
      const newApiKey = await ApiKey.create({
        service: service,
        api_key: api_key,
        is_active: is_active
      });
      res.json({
        success: true,
        message: 'API key created successfully',
        apiKey: newApiKey
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save API key',
      error: error.message
    });
  }
});

wa2Router.post('/api/api-keys/test/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const apiKey = await ApiKey.findOne({
      where: { service: service, is_active: true }
    });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: `API key for service ${service} not found`
      });
    }

    // Test API key (basic validation)
    if (apiKey.api_key && apiKey.api_key.length > 10) {
      res.json({
        success: true,
        message: 'API key is valid',
        service: service
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'API key appears to be invalid'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to test API key',
      error: error.message
    });
  }
});

// Serve socket.io.js for /wa2 (Apache ProxyPass removes /wa2 prefix)
app.get('/socket.io/socket.io.js', (req, res) => {
  const fs = require('fs');
  const path = require('path');

  try {
    const socketIoPath = path.join(__dirname, 'node_modules', 'socket.io', 'client-dist', 'socket.io.js');
    const socketIoContent = fs.readFileSync(socketIoPath, 'utf8');

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(socketIoContent);
  } catch (error) {
    console.error('Error serving socket.io.js:', error);
    res.status(404).send('Socket.IO client not found');
  }
});

// Use wa2Router for /wa2 path
app.use('/wa2', wa2Router);

// ALSO handle requests without /wa2 prefix (for Apache ProxyPass)
// Apache sends /wa2/send to http://localhost:4003/send
app.use('/', wa2Router);

// WhatsApp Client Setup - Konfigurasi Stabil untuk Node.js v18
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "wa-socket-v2"
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  },
  webVersionCache: {
    type: 'none'
  },
  authTimeoutMs: 120000,
  qrMaxRetries: 3
});

// Socket.IO Setup
const io = new Server(server, {
  path: '/socket.io/',
  cors: {
    origin: [
      'https://admin-chat.genio.id',
      'https://v2chat.genio.id',
      'https://waserverlive.genio.id',
      'https://103.102.153.200:4003',
      'http://103.102.153.200:4003',
      'https://chatvolution.my.id',
      'http://chatvolution.my.id',
      'http://localhost:8000',
      'http://127.0.0.1:8000'
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// WhatsApp Event Handlers
client.on('qr', (qr) => {
  console.log('QR Code received');
  qrcodeTerminal.generate(qr, { small: true });

  qrcode.toDataURL(qr, (err, url) => {
    if (err) {
      console.error('Error generating QR code:', err);
      return;
    }
    io.emit('qr', { image: url, message: "Scan QR code to connect" });
  });
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
  io.emit('status', { status: 'connected', message: 'WhatsApp connected successfully' });
});

client.on('authenticated', () => {
  console.log('WhatsApp authenticated');
});

client.on('auth_failure', (msg) => {
  console.log('Authentication failed:', msg);
  io.emit('status', { status: 'auth_failure', message: 'Authentication failed' });
});

client.on('disconnected', (reason) => {
  console.log('WhatsApp disconnected:', reason);
  io.emit('status', { status: 'disconnected', message: 'WhatsApp disconnected' });
});

// Initialize global messages array for ALL messages (incoming + outgoing)
global.allMessages = [];

// Initialize deduplication tracking
global.processedRequests = new Set();
global.sentMessages = new Set();
// Track phones currently being processed by AI to prevent double replies
global.aiInProgressPhones = new Set();
global.aiProcessingStartTime = new Map(); // Track when AI processing started
global.lastAiResponseTime = new Map(); // Track when last AI response was sent

// Function to save message to database
const saveMessageToDatabase = async (messageData) => {
  try {
    console.log('💾 Attempting to save message to database:', {
      message_id: messageData.id,
      from: messageData.from,
      body: messageData.body?.substring(0, 50) + '...',
      direction: messageData.from === 'me' ? 'outgoing' : 'incoming'
    });

    const savedMessage = await WhatsAppMessage.create({
      message_id: messageData.id,
      from_number: messageData.from.replace('@c.us', ''),
      to_number: messageData.to ? messageData.to.replace('@c.us', '') : null,
      body: messageData.body,
      media_data: messageData.media || null,
      message_type: messageData.hasMedia ? 'image' : 'text',
      direction: messageData.from === 'me' ? 'outgoing' : 'incoming',
      timestamp: Math.floor(new Date(messageData.timestamp).getTime() / 1000),
      received_at: messageData.receivedAt,
      agent_id: messageData.agentId || null,
      chat_session_id: messageData.chatSessionId || null,
      status: 'sent',
      is_read: messageData.from === 'me' ? true : false // Incoming messages are unread by default
    });

    console.log('✅ Message saved to database with ID:', savedMessage.id);
  } catch (error) {
    console.error('❌ Error saving message to database:', error);
    console.error('❌ Message data:', messageData);
  }
};

// Function to generate AI response
const generateAIResponse = async (phone, userMessage) => {
  try {
    // Get OpenAI API key from database
    const apiKeyRecord = await ApiKey.findOne({
      where: { service: 'openai', is_active: true }
    });

    if (!apiKeyRecord) {
      console.error('❌ OpenAI API key not found');
      return null;
    }

    console.log('🤖 Using OpenAI API key:', apiKeyRecord.api_key ? `${apiKeyRecord.api_key.substring(0, 20)}...` : 'Not found');

    const openai = new OpenAI({
      apiKey: apiKeyRecord.api_key
    });

    // Create or get thread for this phone number
    let threadId = global.phoneThreads && global.phoneThreads[phone];

    if (!threadId) {
      console.log('🤖 Creating new thread for phone:', phone);
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      console.log('🤖 Thread created:', threadId);

      if (!global.phoneThreads) {
        global.phoneThreads = {};
      }
      global.phoneThreads[phone] = threadId;
    } else {
      console.log('🤖 Using existing thread for phone:', phone, 'threadId:', threadId);
    }

    // Add user message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userMessage
    });

    // Helper function to create and poll a run
    const createAndPollRun = async (retryCount = 0, assistantIdOverride = null) => {
      const maxRetries = 1; // Retry once for server_error

      // Use assistant ID from env variable or override, fallback to default
      const assistantId = assistantIdOverride || process.env.OPENAI_ASSISTANT_ID || 'asst_hKXiL8LD3dEMsjh48BOQvAyC';

      // Create and run assistant
      let run;
      try {
        run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: assistantId
        });

        if (!run || !run.id) {
          console.error('❌ Failed to create run or run.id is undefined:', run);
          return null;
        }

        console.log(`🤖 Run created successfully (attempt ${retryCount + 1}):`, {
          runId: run.id,
          threadId: run.thread_id || threadId,
          status: run.status,
          assistantId: run.assistant_id
        });
      } catch (runError) {
        console.error('❌ Error creating run:', runError);
        if (runError.response) {
          console.error('❌ OpenAI API error response:', runError.response.data);
        }
        return null;
      }

      // Poll for completion (use run.thread_id to avoid mismatch)
      const effectiveThreadId = run.thread_id || threadId;

      if (!effectiveThreadId) {
        console.error('❌ effectiveThreadId is undefined!');
        return null;
      }
      if (!run.id) {
        console.error('❌ run.id is undefined!');
        return null;
      }

      // Wait for completion with polling
      let attempts = 0;
      const maxAttempts = 30;
      let runStatus;

      while (attempts < maxAttempts) {
        try {
          // Use REST API directly like frontend does
          const statusResponse = await fetch(`https://api.openai.com/v1/threads/${effectiveThreadId}/runs/${run.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKeyRecord.api_key}`,
              'OpenAI-Beta': 'assistants=v2'
            }
          });

          if (!statusResponse.ok) {
            const errorText = await statusResponse.text();
            console.error(`❌ HTTP error ${statusResponse.status} when checking run status:`, errorText);
            return null;
          }

          runStatus = await statusResponse.json();
          console.log(`🤖 Run status: ${runStatus.status} (attempt ${attempts + 1}/${maxAttempts})`);

          if (runStatus.status === 'completed') {
            break;
          }

          if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
            console.error('❌ Run failed or cancelled:', runStatus.status);
            if (runStatus.last_error) {
              console.error('❌ Error details:', {
                code: runStatus.last_error.code,
                message: runStatus.last_error.message,
                details: runStatus.last_error
              });

              // Special handling for server_error - might be temporary
              if (runStatus.last_error.code === 'server_error') {
                console.warn('⚠️ Server error detected - this might be a temporary OpenAI issue');

                // Check if file_search tool is used but tool_resources is empty
                const hasFileSearch = runStatus.tools && runStatus.tools.some(tool => tool.type === 'file_search');
                const hasToolResources = runStatus.tool_resources && Object.keys(runStatus.tool_resources || {}).length > 0;

                if (hasFileSearch && !hasToolResources) {
                  console.error('🚨 CRITICAL ISSUE: Assistant has file_search tool but no tool_resources (vector store) configured!');
                  console.error('💡 Solution: Go to OpenAI dashboard (https://platform.openai.com/assistants)');
                  console.error(`   - Find assistant: ${assistantId}`);
                  console.error('   - Either attach a vector store to file_search tool, OR');
                  console.error('   - Remove file_search tool if not needed');
                  // Don't retry if it's a configuration issue
                  // Return a special error indicator that we can handle
                  return { error: 'CONFIG_ERROR', message: 'Assistant configuration error: file_search without vector store' };
                }

                // Retry for server_error if we haven't exceeded max retries
                if (retryCount < maxRetries) {
                  console.log(`🔄 Retrying run creation (${retryCount + 1}/${maxRetries}) after server_error...`);
                  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
                  return createAndPollRun(retryCount + 1);
                } else {
                  console.error('❌ Max retries reached for server_error');
                }
              }
            }
            // Log full run status for debugging (only on first attempt)
            if (retryCount === 0) {
              console.error('❌ Full run status:', JSON.stringify(runStatus, null, 2));
            }
            return null;
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        } catch (error) {
          console.error('❌ Error retrieving run status:', error.message);
          return null;
        }
      }

      if (runStatus && runStatus.status === 'completed') {
        // Get the assistant's response using REST API
        try {
          const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${effectiveThreadId}/messages`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKeyRecord.api_key}`,
              'OpenAI-Beta': 'assistants=v2'
            }
          });

          if (!messagesResponse.ok) {
            const errorText = await messagesResponse.text();
            console.error(`❌ HTTP error ${messagesResponse.status} when fetching messages:`, errorText);
            return null;
          }

          const messages = await messagesResponse.json();
          const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');

          if (assistantMessages.length > 0) {
            const latestMessage = assistantMessages[0];
            return latestMessage.content[0].text.value;
          }
        } catch (error) {
          console.error('❌ Error getting messages:', error.message);
          return null;
        }
      }

      return null;
    };

    // Execute the run creation and polling
    return await createAndPollRun();
  } catch (error) {
    console.error('❌ Error generating AI response:', error);
    return null;
  }
};

// Function to process incoming messages and generate AI response
const processIncomingMessage = async (messageData) => {
  try {
    const phone = messageData.from.replace('@c.us', '');
    const messageId = messageData.id;

    // Create AI response fingerprint for deduplication
    const aiFingerprint = `ai_${phone}_${messageId}`;

    // Check if AI response was already processed for this message
    if (global.processedAiResponses && global.processedAiResponses.has(aiFingerprint)) {
      console.log('🚫 AI response already processed, skipping:', aiFingerprint);
      return;
    }

    // Initialize processedAiResponses if not exists
    if (!global.processedAiResponses) {
      global.processedAiResponses = new Set();
    }

    // Add to processed AI responses
    global.processedAiResponses.add(aiFingerprint);

    // Cleanup old AI responses (keep last 100)
    if (global.processedAiResponses.size > 100) {
      const responsesArray = Array.from(global.processedAiResponses);
      global.processedAiResponses.clear();
      responsesArray.slice(-50).forEach(resp => global.processedAiResponses.add(resp));
    }

    console.log('✅ Processing AI response for incoming message:', aiFingerprint);
    // Flag already set in message handler to prevent race conditions

    // Generate AI response
    try {
      const aiResponse = await generateAIResponse(phone, messageData.body);

      // Handle configuration error
      if (aiResponse && typeof aiResponse === 'object' && aiResponse.error === 'CONFIG_ERROR') {
        console.error('🚨 Assistant configuration error detected, using fallback response');
        const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
        const fallbackMessage = 'Maaf, saya sedang mengalami gangguan teknis. Tim kami sedang memperbaikinya. Silakan coba lagi dalam beberapa saat atau hubungi customer service kami untuk bantuan lebih lanjut. 🙏';

        try {
          const result = await client.sendMessage(chatId, fallbackMessage);
          console.log('📤 Fallback message sent due to config error');

          // Store fallback message
          await WhatsAppMessage.create({
            message_id: result.id._serialized,
            from_number: 'me',
            to_number: chatId.replace('@c.us', ''),
            body: fallbackMessage,
            message_type: 'text',
            direction: 'outgoing',
            timestamp: Math.floor(Date.now() / 1000),
            received_at: new Date().toISOString(),
            status: 'sent',
            agent_id: 'ai-assistant-fallback',
            is_read: true
          });

          // Add to global messages
          const sentMessageData = {
            id: result.id._serialized,
            from: 'me',
            to: chatId,
            body: fallbackMessage,
            timestamp: Math.floor(Date.now() / 1000),
            hasMedia: false,
            receivedAt: new Date().toISOString(),
            type: 'sent'
          };
          global.allMessages.push(sentMessageData);
          io.emit('message', sentMessageData);
          io.emit('aiResponse', {
            phone: chatId.replace('@c.us', ''),
            message: sentMessageData,
            chatId: chatId
          });

          // Clear AI flag
          setTimeout(() => {
            try {
              global.aiInProgressPhones.delete(phone);
              global.aiProcessingStartTime.delete(phone);
              global.lastAiResponseTime.set(phone, Date.now());
              console.log('✅ Cleared AI in-progress flag after fallback response:', phone);
            } catch (error) {
              console.log('❌ Error clearing AI flag:', error);
            }
          }, 5000);
        } catch (error) {
          console.error('❌ Error sending fallback message:', error);
        }
        return;
      }

      if (aiResponse && typeof aiResponse === 'string' && aiResponse.trim()) {
        console.log('🤖 AI Response generated:', aiResponse.substring(0, 50) + '...');

        // Send AI response via WhatsApp
        const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
        const result = await client.sendMessage(chatId, aiResponse);

        console.log('📤 Sending message to:', chatId, 'Message:', aiResponse.substring(0, 50) + '...');
        console.log('✅ Message sent successfully:', result.id._serialized);

        // Clear AI in-progress flag after successful send with delay to prevent race conditions
        setTimeout(() => {
          try {
            console.log('🧹 About to clear AI flag for:', phone);
            global.aiInProgressPhones.delete(phone);
            global.aiProcessingStartTime.delete(phone);
            global.lastAiResponseTime.set(phone, Date.now()); // Record AI response time
            console.log('✅ Cleared AI in-progress flag after successful send:', phone);
            console.log('🔓 Remaining AI in-progress phones:', Array.from(global.aiInProgressPhones));
          } catch (error) {
            console.log('❌ Error clearing AI flag:', error);
          }
        }, 5000); // 5 second delay

        // Store sent message in database
        try {
          await WhatsAppMessage.create({
            message_id: result.id._serialized,
            from_number: 'me',
            to_number: chatId.replace('@c.us', ''),
            body: aiResponse,
            message_type: 'text',
            direction: 'outgoing',
            timestamp: Math.floor(Date.now() / 1000),
            received_at: new Date().toISOString(),
            status: 'sent',
            agent_id: 'ai-assistant',
            is_read: true // AI responses are considered read
          });
          console.log('💾 Sent message saved to database');
        } catch (dbError) {
          console.error('❌ Error saving sent message to database:', dbError);
        }

        // Add to global messages
        const sentMessageData = {
          id: result.id._serialized,
          from: 'me',
          to: chatId,
          body: aiResponse,
          timestamp: Math.floor(Date.now() / 1000), // Use current timestamp in seconds
          hasMedia: false,
          receivedAt: new Date().toISOString(),
          type: 'sent'
        };

        global.allMessages.push(sentMessageData);
        console.log('📝 Added sent message to global.allMessages');

        // Emit to socket clients
        io.emit('message', sentMessageData);

        // Also emit as AI response event for proper chat list update
        io.emit('aiResponse', {
          phone: chatId.replace('@c.us', ''),
          message: sentMessageData,
          chatId: chatId
        });
      } else {
        // No AI response generated, clear flag with delay
        setTimeout(() => {
          try {
            global.aiInProgressPhones.delete(phone);
            global.aiProcessingStartTime.delete(phone);
            global.lastAiResponseTime.set(phone, Date.now()); // Record time even for no response
            console.log('✅ Cleared AI in-progress flag (no response):', phone);
            console.log('🔓 Remaining AI in-progress phones:', Array.from(global.aiInProgressPhones));
          } catch (_) { }
        }, 5000); // 5 second delay
        console.log('⚠️ No AI response generated for:', phone);
      }
    } catch (aiError) {
      console.error('❌ Error generating AI response:', aiError);
      // Clear flag on error with delay
      setTimeout(() => {
        try {
          global.aiInProgressPhones.delete(phone);
          global.aiProcessingStartTime.delete(phone);
          global.lastAiResponseTime.set(phone, Date.now()); // Record time even for error
          console.log('✅ Cleared AI in-progress flag (error):', phone);
          console.log('🔓 Remaining AI in-progress phones:', Array.from(global.aiInProgressPhones));
        } catch (_) { }
      }, 5000); // 5 second delay
    }

  } catch (error) {
    console.error('❌ Error processing incoming message:', error);
    // Clear flag on main error with delay
    setTimeout(() => {
      try {
        const phone = messageData.from.replace('@c.us', '');
        global.aiInProgressPhones.delete(phone);
        global.aiProcessingStartTime.delete(phone);
        global.lastAiResponseTime.set(phone, Date.now()); // Record time even for main error
        console.log('✅ Cleared AI in-progress flag (main error):', phone);
        console.log('🔓 Remaining AI in-progress phones:', Array.from(global.aiInProgressPhones));
      } catch (_) { }
    }, 5000); // 5 second delay
  } finally {
    // Don't clear flag here - let it be cleared only when AI response is actually sent
    const phone = messageData.from.replace('@c.us', '');
    console.log('🔄 AI processing completed for:', phone, '- keeping flag until response sent');
  }
};

// Function to get active WhatsApp accounts
const getActiveWhatsAppAccounts = async () => {
  try {
    const accounts = await ChatChannelAccount.findAll({
      where: {
        chat_channel_id: 2, // WhatsApp channel ID
        status: 1 // Active status
      }
    });
    return accounts;
  } catch (error) {
    console.error('❌ Error getting WhatsApp accounts:', error);
    return [];
  }
};

// Function to clean up WhatsApp auth folder
const cleanupAuthFolder = () => {
  try {
    const authPath = path.join(__dirname, '.wwebjs_auth');

    if (fs.existsSync(authPath)) {
      console.log('🧹 Cleaning up WhatsApp auth folder...');

      // Remove the entire .wwebjs_auth directory
      fs.rmSync(authPath, { recursive: true, force: true });

      console.log('✅ WhatsApp auth folder cleaned successfully');
      return true;
    } else {
      console.log('ℹ️ No auth folder found to clean');
      return true;
    }
  } catch (error) {
    console.error('❌ Error cleaning up auth folder:', error);
    return false;
  }
};

client.on('message', async (message) => {
  try {
    console.log('📨 Raw message received:', {
      from: message.from,
      body: message.body?.substring(0, 50),
      hasMedia: message.hasMedia
    });

    // Filter out newsletter and broadcast messages
    if (message.from.includes('@newsletter') || message.from.includes('@broadcast')) {
      console.log('🚫 Newsletter/Broadcast message filtered out:', message.from);
      return;
    }

    const data = {
      id: message.id._serialized,
      from: message.from,
      body: message.body,
      timestamp: message.timestamp,
      hasMedia: message.hasMedia,
      receivedAt: new Date().toISOString()
    };

    if (message.hasMedia) {
      const media = await message.downloadMedia();
      data.media = media;
    }

    console.log('📝 Processed message data:', {
      id: data.id,
      from: data.from,
      body: data.body?.substring(0, 50),
      direction: 'incoming'
    });

    // Simpan pesan ke global array
    global.allMessages.push(data);

    // Simpan pesan ke database
    console.log('💾 Calling saveMessageToDatabase...');
    await saveMessageToDatabase(data);

    // Batasi jumlah pesan yang disimpan (max 1000) - HAPUS BATASAN INI
    // if (global.allMessages.length > 1000) {
    //   global.allMessages = global.allMessages.slice(-1000);
    // }

    console.log('📨 Pesan masuk dari:', message.from);
    console.log('📝 Isi pesan:', message.body);

    // Emit to socket clients FIRST for real-time display
    io.emit('message', data);

    // Check if this is an incoming message (not from 'me')
    if (data.from !== 'me' && !data.from.includes('@newsletter') && !data.from.includes('@broadcast')) {
      // Set AI in-progress flag IMMEDIATELY to prevent race conditions
      const phone = data.from.replace('@c.us', '');
      try {
        global.aiInProgressPhones.add(phone);
        global.aiProcessingStartTime.set(phone, Date.now());
        console.log('🔒 Pre-set AI in-progress flag for:', phone);
        console.log('🔒 Current AI in-progress phones:', Array.from(global.aiInProgressPhones));
      } catch (_) { }

      // Process AI response for incoming messages (async, don't wait)
      processIncomingMessage(data).catch(error => {
        console.error('❌ Error processing AI response:', error);
        // Clear flag on error with delay
        setTimeout(() => {
          try {
            global.aiInProgressPhones.delete(phone);
            global.aiProcessingStartTime.delete(phone);
            global.lastAiResponseTime.set(phone, Date.now()); // Record time even for process error
            console.log('✅ Cleared AI in-progress flag (process error):', phone);
          } catch (_) { }
        }, 5000); // 5 second delay
      });
    }

    // Send to external webhook
    // if (WEB_SOCKET_CV) {
    //   try {
    //     await axios.post(`${WEB_SOCKET_CV}/whatsapp-irsfa`, data, {
    //       headers: { 'Content-Type': 'application/json' }
    //     });
    //     console.log('✅ Message sent to webhook');
    //   } catch (error) {
    //     console.error('❌ Error sending to webhook:', error.message);
    //   }
    // }
  } catch (error) {
    console.error('❌ Error handling message:', error);
  }
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Send current status to new client
  socket.emit('status', {
    status: client.info ? 'connected' : 'disconnected',
    message: client.info ? 'WhatsApp is connected' : 'WhatsApp is not connected'
  });
});

// API Routes
app.get('/', (req, res) => {
  res.send('Hello World from fajar di wa socket v2?! ');
});

app.get('/status', async (req, res) => {
  try {
    const state = await client.getState();
    res.json({
      success: true,
      status: state,
      connected: state === 'CONNECTED',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// REMOVED: Duplicate /send route - using /wa2/send instead

app.get('/init', (req, res) => {
  try {
    client.initialize();
    res.json({ success: true, message: 'WhatsApp initialization started' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error initializing: ' + error.message });
  }
});

app.get('/logout', async (req, res) => {
  try {
    await client.logout();

    // Clean up auth folder after logout
    const cleanupSuccess = cleanupAuthFolder();

    // Emit disconnected status to all clients
    io.emit('status', { status: 'disconnected', message: 'WhatsApp logged out successfully' });

    res.json({
      success: true,
      message: 'WhatsApp logged out successfully',
      authCleaned: cleanupSuccess
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging out: ' + error.message });
  }
});

app.get('/scan', (req, res) => {
  res.sendFile(__dirname + '/scan.html');
});

// Endpoint untuk manual cleanup auth folder
app.get('/cleanup-auth', (req, res) => {
  try {
    const cleanupSuccess = cleanupAuthFolder();

    res.json({
      success: cleanupSuccess,
      message: cleanupSuccess ? 'Auth folder cleaned successfully' : 'Failed to clean auth folder'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cleaning auth folder: ' + error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// REMOVED: Duplicate /messages routes - using /wa2/messages instead

// Endpoint untuk clear pesan
app.delete('/messages', (req, res) => {
  try {
    global.allMessages = [];
    res.json({
      success: true,
      message: 'Messages cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing messages: ' + error.message
    });
  }
});

// Endpoint untuk cek database messages
// app.get('/database/messages', async (req, res) => {
//   try {
//     const { phone } = req.query;

//     let whereClause = {};
//     if (phone) {
//       whereClause = {
//         [Op.or]: [
//           { from_number: phone },
//           { to_number: phone },
//           { from_number: 'me', to_number: phone }
//         ]
//       };
//     }

//     const messages = await WhatsAppMessage.findAll({
//       where: whereClause,
//       order: [['createdAt', 'ASC']], // ASC untuk urutan kronologis
//       limit: 100
//     });

//     // Transform database messages to match frontend format
//     const transformedMessages = messages.map(msg => ({
//       id: msg.message_id,
//       body: msg.body,
//       from: msg.from_number === 'me' ? 'me' : msg.from_number,
//       to: msg.to_number,
//       receivedAt: msg.received_at,
//       type: msg.direction === 'outgoing' ? 'sent' : 'received',
//       hasMedia: msg.message_type === 'media' || msg.message_type === 'image',
//       media: msg.media_data ? JSON.parse(msg.media_data) : null,
//       mediaType: msg.media_data ? JSON.parse(msg.media_data).mimetype : null,
//       filename: msg.media_data ? JSON.parse(msg.media_data).filename : null,
//       instance: 'wa2'
//     }));

//     res.json({
//       success: true,
//       messages: transformedMessages,
//       count: transformedMessages.length
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error getting database messages: ' + error.message
//     });
//   }
// });

// REMOVED: Duplicate /react-chat/messages routes - using /wa2/react-chat/messages instead

// REMOVED: Duplicate /react-chat/send route - using /wa2/react-chat/send instead

// Endpoint untuk health check khusus client chat
app.get('/client-chat/health', (req, res) => {
  res.json({
    success: true,
    message: 'WhatsApp Socket V2 is running',
    timestamp: new Date().toISOString(),
    status: 'ready'
  });
});

// API Key endpoints
app.get('/api/api-keys', async (req, res) => {
  try {
    const apiKeys = await ApiKey.findAll({
      attributes: ['id', 'service', 'is_active', 'created_at', 'updated_at']
    });

    res.json({
      success: true,
      data: apiKeys
    });
  } catch (error) {
    console.error('Error getting API keys:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting API keys: ' + error.message
    });
  }
});

app.get('/api/api-keys/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const apiKey = await ApiKey.findOne({
      where: { service },
      attributes: ['id', 'service', 'api_key', 'is_active', 'created_at', 'updated_at']
    });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: `API key for ${service} not found`
      });
    }

    res.json({
      success: true,
      data: apiKey
    });
  } catch (error) {
    console.error('Error getting API key:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting API key: ' + error.message
    });
  }
});

app.post('/api/api-keys', async (req, res) => {
  try {
    const { service, api_key, is_active = true } = req.body;

    if (!service || !api_key) {
      return res.status(400).json({
        success: false,
        message: 'Service and API key are required'
      });
    }

    // Check if API key already exists
    const existingKey = await ApiKey.findOne({
      where: { service }
    });

    if (existingKey) {
      // Update existing
      await existingKey.update({
        api_key,
        is_active
      });
      console.log(`✅ Updated API key for ${service}`);
    } else {
      // Create new
      await ApiKey.create({
        service,
        api_key,
        is_active
      });
      console.log(`✅ Created API key for ${service}`);
    }

    res.json({
      success: true,
      message: `API key for ${service} saved successfully`
    });
  } catch (error) {
    console.error('Error saving API key:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving API key: ' + error.message
    });
  }
});

app.post('/api/api-keys/test/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const apiKey = await ApiKey.findOne({
      where: { service, is_active: true }
    });

    if (!apiKey) {
      return res.json({
        success: false,
        valid: false,
        message: `API key for ${service} not found`
      });
    }

    res.json({
      success: true,
      valid: true,
      message: `API key for ${service} is valid`
    });
  } catch (error) {
    console.error('Error testing API key:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing API key: ' + error.message
    });
  }
});

// Endpoint untuk send media files
app.post('/send-media', async (req, res) => {
  try {
    const { phone, media, agentId } = req.body;

    if (!phone || !media) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and media data are required'
      });
    }

    const state = await client.getState();
    if (state !== 'CONNECTED') {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp is not connected. Status: ' + state
      });
    }

    // Normalize phone number
    let normalizedPhone = phone;
    if (!normalizedPhone.includes('@c.us')) {
      normalizedPhone = normalizedPhone + '@c.us';
    }

    console.log('📎 Sending media file:', {
      phone: normalizedPhone,
      filename: media.filename,
      mimetype: media.mimetype,
      dataLength: media.data ? media.data.length : 0
    });

    // Create media message using WhatsApp Web.js
    const mediaMessage = new MessageMedia(media.mimetype, media.data, media.filename);
    const result = await client.sendMessage(normalizedPhone, mediaMessage);

    // Store media message in database
    try {
      await WhatsAppMessage.create({
        message_id: result.id._serialized,
        from_number: 'me',
        to_number: normalizedPhone.replace('@c.us', ''),
        body: `[MEDIA] ${media.filename}`,
        media_data: JSON.stringify(media),
        message_type: 'media',
        direction: 'outgoing',
        timestamp: Math.floor(Date.now() / 1000),
        received_at: new Date().toISOString(),
        agent_id: agentId || 'react-app',
        is_read: true // Media messages are considered read
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    res.json({
      success: true,
      message: 'Media file sent successfully',
      messageId: result.id._serialized
    });

  } catch (error) {
    console.error('Error sending media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send media: ' + error.message
    });
  }
});

// REMOVED: Duplicate /client-chat/send route - using /wa2/client-chat/send instead

// REMOVED: Duplicate /client-chat/messages route - using /wa2/client-chat/messages instead

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models without dropping existing data
    await db.sync();
    console.log('✅ Database models synchronized');

    // Database connection test completed
    console.log('✅ Database connection verified');

    // Start server
    server.listen(port, () => {
      console.log(`WhatsApp Socket Server v2 running on port ${port}`);

      // Auto initialize if enabled
      if (process.env.AUTOCONNECT_WA === '1') {
        console.log('Auto-connecting WhatsApp...');
        client.initialize();
      }
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// API endpoint to get all unread counts for real-time sync
app.get('/api/whatsapp/unread-counts', async (req, res) => {
  try {
    console.log('📊 Getting unread counts...');

    // Test database connection first
    const testQuery = await WhatsAppMessage.findOne({
      where: { direction: 'incoming' },
      attributes: ['id'],
      raw: true
    });

    console.log('📊 Database connection test:', testQuery ? 'OK' : 'No data');

    // Simple query to get unread messages
    const unreadMessages = await WhatsAppMessage.findAll({
      where: {
        direction: 'incoming',
        is_read: false
      },
      attributes: ['from_number'],
      raw: true
    });

    console.log('📊 Found unread messages:', unreadMessages.length);

    // Count messages per phone number
    const result = {};
    unreadMessages.forEach(msg => {
      const phone = msg.from_number;
      result[phone] = (result[phone] || 0) + 1;
    });

    console.log('📊 Unread counts result:', result);

    res.json({
      success: true,
      unreadCounts: result,
      totalUnread: unreadMessages.length
    });
  } catch (error) {
    console.error('Error getting unread counts:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting unread counts',
      error: error.message,
      stack: error.stack
    });
  }
});

// API endpoints for unread count management
app.get('/api/whatsapp/messages/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const normalizedPhone = phone.includes('@c.us') ? phone : `${phone}@c.us`;

    const messages = await WhatsAppMessage.findAll({
      where: {
        [Op.or]: [
          { from_number: phone },
          { to_number: phone }
        ]
      },
      order: [['received_at', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark messages as read for a specific phone number
app.post('/api/whatsapp/mark-read/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log('📖 Marking messages as read for phone (raw):', phone);

    // Normalize phone: keep digits only, handle 0/62/+62 variations
    const digitsOnly = (str) => (str || '').replace(/\D/g, '');
    const raw = digitsOnly(phone);
    // Build variants commonly found in DB
    const variants = new Set();
    if (raw) {
      variants.add(raw);
      // with leading 0
      if (raw.startsWith('62')) variants.add('0' + raw.slice(2));
      // with leading 62
      if (raw.startsWith('0')) variants.add('62' + raw.slice(1));
      // with leading +62 (DB may store '+' stripped, but keep for safety)
      if (!raw.startsWith('62')) variants.add('62' + raw);
    }

    const fromNumberWhere = { [Op.in]: Array.from(variants) };

    // First, let's check what messages exist for this phone
    const existingMessages = await WhatsAppMessage.findAll({
      where: {
        from_number: fromNumberWhere,
        direction: 'incoming'
      },
      attributes: ['id', 'from_number', 'direction', 'is_read', 'body'],
      raw: true
    });

    console.log('📖 Existing messages (normalized variants):', Array.from(variants));
    console.log('📖 Existing messages count:', existingMessages.length);

    // Find unread (including null/0/false) for visibility
    const unreadMessages = await WhatsAppMessage.findAll({
      where: {
        from_number: fromNumberWhere,
        direction: 'incoming',
        [Op.or]: [
          { is_read: false },
          { is_read: 0 },
          { is_read: null }
        ]
      },
      attributes: ['id', 'from_number', 'direction', 'is_read', 'body'],
      raw: true
    });

    console.log('📖 Unread messages (before update):', unreadMessages.length);

    // Strategy A: update by id IN (exact primary keys)
    const idsToUpdate = unreadMessages.map(m => m.id);
    let affected = 0;
    if (idsToUpdate.length > 0) {
      const [byIdAffected] = await WhatsAppMessage.update(
        { is_read: true },
        {
          where: { id: { [Op.in]: idsToUpdate } }
        }
      );
      console.log('📖 Rows affected (by id):', byIdAffected, 'ids:', idsToUpdate);
      affected = byIdAffected;
    }

    // Strategy B: if still 0, try condition update again (defensive)
    if (!affected || affected === 0) {
      const [byCondAffected] = await WhatsAppMessage.update(
        { is_read: true },
        {
          where: {
            from_number: fromNumberWhere,
            direction: 'incoming',
            [Op.or]: [
              { is_read: false },
              { is_read: 0 },
              { is_read: null }
            ]
          }
        }
      );
      console.log('📖 Rows affected (by condition):', byCondAffected);
      affected = byCondAffected;
    }

    // Fallback: if nothing updated, try force update (without is_read filter)
    let totalAffected = affected;
    if (!affected || affected === 0) {
      const [forcedAffected] = await WhatsAppMessage.update(
        { is_read: true },
        {
          where: {
            from_number: fromNumberWhere,
            direction: 'incoming'
          }
        }
      );
      console.log('📖 Rows affected (forced mark-read):', forcedAffected);
      totalAffected = forcedAffected;

      // Strategy C: Raw SQL fallback if still 0
      if ((!totalAffected || totalAffected === 0) && idsToUpdate.length > 0) {
        try {
          const placeholders = idsToUpdate.map(() => '?').join(',');
          const sql = `UPDATE whatsapp_messages SET is_read = 1 WHERE id IN (${placeholders})`;
          const [rawResult] = await db.query(sql, { replacements: idsToUpdate });
          const affectedRows = rawResult && (rawResult.affectedRows || rawResult.rowCount || 0);
          console.log('📖 Rows affected (raw SQL by id):', affectedRows, 'ids:', idsToUpdate);
          totalAffected = affectedRows || totalAffected;
        } catch (rawErr) {
          console.error('❌ Raw SQL update error:', rawErr.message);
        }
      }
    }

    // Emit to all connected clients for real-time sync
    io.emit('messagesRead', {
      phone: phone,
      unreadCount: 0
    });

    res.json({
      success: true,
      message: 'Messages marked as read',
      rowsAffected: totalAffected,
      normalizedFromNumbers: Array.from(variants)
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread count for a specific phone number
app.get('/api/whatsapp/unread-count/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    const unreadCount = await WhatsAppMessage.count({
      where: {
        from_number: phone,
        direction: 'incoming',
        is_read: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Get chats list aggregated from whatsapp_messages table
app.get('/api/whatsapp/chats', async (req, res) => {
  try {
    // Fetch recent messages to derive latest per phone
    const recentMessages = await WhatsAppMessage.findAll({
      attributes: ['from_number', 'to_number', 'body', 'received_at', 'direction', 'is_read'],
      order: [['received_at', 'DESC']],
      limit: 2000,
      raw: true
    });

    // Build latest message per phone
    const phoneToChat = new Map();
    for (const msg of recentMessages) {
      const phone = msg.direction === 'incoming' ? msg.from_number : msg.to_number;
      if (!phone) continue;
      if (!phoneToChat.has(phone)) {
        phoneToChat.set(phone, {
          phone,
          lastMessage: msg.body || 'No message',
          lastMessageTime: msg.received_at,
          unreadCount: 0
        });
      }
    }

    // Batch unread counts for all phones
    const phones = Array.from(phoneToChat.keys());
    if (phones.length > 0) {
      const unreadRows = await WhatsAppMessage.findAll({
        where: {
          direction: 'incoming',
          is_read: false,
          from_number: { [Op.in]: phones }
        },
        attributes: ['from_number', [Sequelize.fn('COUNT', Sequelize.col('id')), 'cnt']],
        group: ['from_number'],
        raw: true
      });

      for (const row of unreadRows) {
        const chat = phoneToChat.get(row.from_number);
        if (chat) chat.unreadCount = parseInt(row.cnt, 10) || 0;
      }
    }

    // Build sorted array
    const chats = Array.from(phoneToChat.values()).sort((a, b) => {
      const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return tb - ta;
    });

    return res.json({ success: true, chats, total: chats.length });
  } catch (error) {
    console.error('Error building chats list:', error);
    return res.status(500).json({ success: false, message: 'Failed to get chats', error: error.message });
  }
});

startServer();

module.exports = { client, io };
