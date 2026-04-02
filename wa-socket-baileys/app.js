require('dotenv').config();

// Import crypto untuk Baileys (required)
const crypto = require('crypto');
// Ensure crypto is available globally for Baileys
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto;
}

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore } = require('@whiskeysockets/baileys');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

// Database imports
const { db, testConnection } = require('./config/database');
const { Op, Sequelize } = require('sequelize');
const WhatsAppMessage = require('./models/WhatsAppMessage');
const ChatChannelAccount = require('./models/ChatChannelAccount');
const ApiKey = require('./models/ApiKey');

// Express Setup
const app = express();
const server = createServer(app);
const port = process.env.PORT || 4003;

// Middleware
app.use(cors({
  origin: [
    'https://admin-chat.genio.id',
    'https://v2chat.genio.id',
    'https://waserverlive.genio.id',
    'https://103.102.153.200:4004',
    'http://103.102.153.200:4004',
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

// Router untuk /wa1 path - untuk Apache/Nginx proxy
const wa1Router = express.Router();

// Socket.IO Setup - path tanpa prefix karena proxy akan handle routing
// Proxy akan route /wa1/socket.io/ ke /socket.io/ di server
const io = new Server(server, {
  path: '/socket.io/', // Proxy akan route /wa1/socket.io/ ke /socket.io/
  cors: {
    origin: [
      'https://admin-chat.genio.id',
      'https://v2chat.genio.id',
      'https://waserverlive.genio.id',
      'https://103.102.153.200:4004',
      'http://103.102.153.200:4004',
      'https://chatvolution.my.id',
      'http://chatvolution.my.id',
      'http://localhost:8000',
      'http://127.0.0.1:8000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Global variables
let sock = null;
let qrCodeData = null;
let isConnected = false;
let connectionState = 'disconnected';
let isConnecting = false; // Flag to prevent multiple simultaneous connections
// Disabled auto-reconnect - user will manually scan QR fresh
const AUTO_RECONNECT_ENABLED = false;

// Pino logger with minimal output
const logger = pino({ level: 'silent' });

// Store for managing chats (optional but recommended)
const store = makeInMemoryStore({ logger });

// Helper functions
const normalizePhoneNumber = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle Indonesian numbers
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
};

const formatPhoneToJID = (phone) => {
  const normalized = normalizePhoneNumber(phone);
  return `${normalized}@s.whatsapp.net`;
};

// Global AI tracking variables
global.phoneThreads = {}; // Store thread IDs by phone
global.processedAiResponses = new Set(); // Track processed AI responses
global.aiInProgressPhones = new Set(); // Phones currently being processed by AI
global.aiProcessingStartTime = new Map(); // Track when AI processing started
global.lastAiResponseTime = new Map(); // Track when last AI response was sent

// Global deduplication tracking
global.processedRequests = new Set(); // Track processed requests to prevent duplicates
global.sentMessages = new Set(); // Track sent messages to prevent duplicates
global.allMessages = []; // Store all messages (incoming + outgoing)

// AI Integration Functions

/**
 * Fetch OpenAI API key from database
 */
const getOpenAIKey = async () => {
  try {
    const apiKeyRecord = await ApiKey.findOne({
      where: { service: 'openai', is_active: true }
    });

    if (!apiKeyRecord || !apiKeyRecord.api_key) {
      console.error('❌ OpenAI API key not found in database');
      return null;
    }

    console.log('✅ OpenAI API key retrieved from database');
    return apiKeyRecord.api_key;
  } catch (error) {
    console.error('❌ Error fetching OpenAI API key:', error);
    return null;
  }
};

/**
 * Create OpenAI thread for a phone number
 */
const createThread = async (apiKey) => {
  try {
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to create thread:', error);
      return null;
    }

    const thread = await response.json();
    console.log('✅ Thread created:', thread.id);
    return thread.id;
  } catch (error) {
    console.error('❌ Error creating thread:', error);
    return null;
  }
};

/**
 * Add message to thread
 */
const addMessageToThread = async (apiKey, threadId, message) => {
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: message
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to add message to thread:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error adding message to thread:', error);
    return false;
  }
};

/**
 * Create and run assistant
 */
const createRun = async (apiKey, threadId, assistantId) => {
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to create run:', error);
      return null;
    }

    const run = await response.json();
    console.log('✅ Run created:', run.id);
    return run;
  } catch (error) {
    console.error('❌ Error creating run:', error);
    return null;
  }
};

/**
 * Check run status
 */
const getRunStatus = async (apiKey, threadId, runId) => {
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to get run status:', error);
      return null;
    }

    const runStatus = await response.json();
    return runStatus;
  } catch (error) {
    console.error('❌ Error getting run status:', error);
    return null;
  }
};

/**
 * Get messages from thread
 */
const getThreadMessages = async (apiKey, threadId) => {
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to get messages:', error);
      return null;
    }

    const messages = await response.json();
    return messages.data;
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    return null;
  }
};

/**
 * Generate AI response using OpenAI Assistant
 */
const generateAIResponse = async (phone, userMessage) => {
  try {
    console.log('🤖 Generating AI response for:', phone);

    // Get API key from database
    const apiKey = await getOpenAIKey();
    if (!apiKey) {
      return null;
    }

    // Get or create thread for this phone
    let threadId = global.phoneThreads[phone];

    if (!threadId) {
      threadId = await createThread(apiKey);
      if (!threadId) {
        return null;
      }
      global.phoneThreads[phone] = threadId;
    }

    console.log('🤖 Using thread:', threadId);

    // Add user message to thread
    const messageAdded = await addMessageToThread(apiKey, threadId, userMessage);
    if (!messageAdded) {
      return null;
    }

    // Create run with assistant
    const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_hKXiL8LD3dEMsjh48BOQvAyC';
    const run = await createRun(apiKey, threadId, assistantId);
    if (!run || !run.id) {
      return null;
    }

    // Poll for completion
    const maxAttempts = 30;
    let attempts = 0;
    let runStatus = null;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;

      runStatus = await getRunStatus(apiKey, threadId, run.id);
      if (!runStatus) {
        return null;
      }

      console.log(`🤖 Run status: ${runStatus.status} (${attempts}/${maxAttempts})`);

      if (runStatus.status === 'completed') {
        break;
      }

      if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
        console.error('❌ Run failed or cancelled:', runStatus.last_error);
        return null;
      }
    }

    if (runStatus && runStatus.status === 'completed') {
      // Get assistant's response
      const messages = await getThreadMessages(apiKey, threadId);
      if (!messages || messages.length === 0) {
        return null;
      }

      // Find latest assistant message
      const assistantMessage = messages.find(msg => msg.role === 'assistant');
      if (assistantMessage && assistantMessage.content && assistantMessage.content.length > 0) {
        const responseText = assistantMessage.content[0].text.value;
        console.log('🤖 AI response generated:', responseText.substring(0, 100) + '...');
        return responseText;
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Error generating AI response:', error);
    return null;
  }
};

/**
 * Process incoming message and send AI response
 */
const processIncomingMessage = async (messageData) => {
  try {
    const phone = messageData.phone;
    const messageId = messageData.messageId;

    // Create fingerprint for deduplication
    const aiFingerprint = `ai_${phone}_${messageId}`;

    // Check if already processed
    if (global.processedAiResponses.has(aiFingerprint)) {
      console.log('🚫 AI response already processed:', aiFingerprint);
      return;
    }

    // Check if AI is already processing for this phone
    if (global.aiInProgressPhones.has(phone)) {
      console.log('🚫 AI already processing for:', phone);
      return;
    }

    // Mark as processed and in progress
    global.processedAiResponses.add(aiFingerprint);
    global.aiInProgressPhones.add(phone);
    global.aiProcessingStartTime.set(phone, Date.now()); // Track when AI processing started

    // Cleanup old fingerprints (keep last 100)
    if (global.processedAiResponses.size > 100) {
      const array = Array.from(global.processedAiResponses);
      global.processedAiResponses.clear();
      array.slice(-50).forEach(fp => global.processedAiResponses.add(fp));
    }

    console.log('🤖 Processing AI response for:', phone);

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(phone, messageData.message);

      if (aiResponse && aiResponse.trim()) {
        // Send via WhatsApp
        const jid = formatPhoneToJID(phone);
        const result = await sock.sendMessage(jid, { text: aiResponse });

        console.log('✅ AI response sent to:', phone);

        // Record AI response time and clear in-progress flag
        global.lastAiResponseTime.set(phone, Date.now());
        global.aiInProgressPhones.delete(phone);
        global.aiProcessingStartTime.delete(phone);

        // Store in database
        try {
          const normalizedPhone = normalizePhoneNumber(phone);
          const now = new Date();
          const mysqlDatetime = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');

          await WhatsAppMessage.create({
            from_number: 'me',
            to_number: normalizedPhone,
            message: aiResponse,
            direction: 'outgoing',
            status: 'sent',
            message_id: result.key.id,
            from_me: true,
            timestamp: mysqlDatetime,
            has_media: false
          });
        } catch (dbError) {
          console.error('❌ Database storage error:', dbError.message);
        }

        // Emit to Socket.IO clients
        io.emit('message', {
          from: 'me',
          to: jid,
          message: aiResponse,
          hasMedia: false,
          timestamp: new Date(),
          messageId: result.key.id
        });

        io.emit('aiResponse', {
          phone: phone,
          message: aiResponse,
          timestamp: new Date()
        });
      } else {
        console.log('⚠️ No AI response generated for:', phone);
        // Clear in-progress flag even if no response
        global.aiInProgressPhones.delete(phone);
        global.aiProcessingStartTime.delete(phone);
        global.lastAiResponseTime.set(phone, Date.now()); // Record time even for no response
      }
    } catch (aiError) {
      console.error('❌ Error in AI processing:', aiError);
      // Clear in-progress flag on error
      global.aiInProgressPhones.delete(phone);
      global.aiProcessingStartTime.delete(phone);
      global.lastAiResponseTime.set(phone, Date.now()); // Record time even for error
    } finally {
      // Additional cleanup after delay (safety net)
      setTimeout(() => {
        if (global.aiInProgressPhones.has(phone)) {
          console.log('⚠️ Force clearing AI in-progress flag for:', phone);
          global.aiInProgressPhones.delete(phone);
          global.aiProcessingStartTime.delete(phone);
        }
      }, 30000); // 30 seconds timeout
    }
  } catch (error) {
    console.error('❌ Error processing incoming message:', error);
    // Clear flag on error
    const phone = messageData.phone;
    global.aiInProgressPhones.delete(phone);
    global.aiProcessingStartTime.delete(phone);
    global.lastAiResponseTime.set(phone, Date.now()); // Record time even for main error
  }
};

// Initialize WhatsApp Connection
async function connectToWhatsApp() {
  // Prevent multiple simultaneous connections
  if (isConnecting) {
    console.log('⚠️ Connection already in progress, skipping...');
    return;
  }

  try {
    isConnecting = true;

    console.log('🔄 Initializing Baileys WhatsApp connection...');
    console.log('📊 Current connection state:', connectionState);
    console.log('📊 Is connected:', isConnected);
    console.log('📊 Socket exists:', !!sock);

    // Clean up existing socket if any
    if (sock) {
      try {
        sock.end(undefined);
      } catch (e) {
        // Ignore cleanup errors
      }
      sock = null;
    }

    // Check if auth folder exists and is valid
    const authPath = path.join(__dirname, 'auth_info_baileys');
    const credsPath = path.join(authPath, 'creds.json');

    // If creds.json exists, validate it before using
    if (fs.existsSync(credsPath)) {
      try {
        const credsContent = fs.readFileSync(credsPath, 'utf8');
        const creds = JSON.parse(credsContent);

        // Check if creds are valid - must have me.id and noiseKey
        const isValid = creds &&
          creds.me &&
          creds.me.id &&
          creds.noiseKey &&
          creds.noiseKey.length > 0;

        if (!isValid) {
          console.log('⚠️ Invalid auth credentials detected (missing required fields), clearing auth folder...');
          if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true });
            console.log('✅ Auth folder cleared due to invalid credentials');
          }
        } else {
          // Additional check: verify noiseKey is not empty
          if (!creds.noiseKey || creds.noiseKey.length === 0) {
            console.log('⚠️ Empty noiseKey detected, clearing auth folder...');
            if (fs.existsSync(authPath)) {
              fs.rmSync(authPath, { recursive: true, force: true });
              console.log('✅ Auth folder cleared due to empty noiseKey');
            }
          }
        }
      } catch (e) {
        console.log('⚠️ Error reading/parsing auth credentials, clearing auth folder...');
        console.log('📊 Error:', e.message);
        if (fs.existsSync(authPath)) {
          fs.rmSync(authPath, { recursive: true, force: true });
          console.log('✅ Auth folder cleared due to read/parse error');
        }
      }
    }

    let { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    // Validate state - if invalid, clear auth and reload
    // Don't modify state manually - let Baileys handle it
    let needsFreshState = false;

    if (!state || !state.creds) {
      console.log('⚠️ Invalid state structure, clearing auth folder...');
      needsFreshState = true;
    } else {
      // Check if state has me.id (authenticated)
      const hasMe = state.creds.me && state.creds.me.id;

      // Check if noiseKey exists and is valid
      const hasNoiseKey = state.creds.noiseKey &&
        Array.isArray(state.creds.noiseKey) &&
        state.creds.noiseKey.length > 0;

      // If not authenticated but has noiseKey, check if noiseKey is valid
      if (!hasMe) {
        // For fresh QR scan, we should not have noiseKey or it should be empty
        // But if noiseKey exists and is empty array, it will cause "Zero-length key" error
        if (state.creds.noiseKey && Array.isArray(state.creds.noiseKey) && state.creds.noiseKey.length === 0) {
          console.log('⚠️ State has empty noiseKey (will cause Zero-length key error), clearing auth folder...');
          needsFreshState = true;
        } else if (state.creds.noiseKey && !Array.isArray(state.creds.noiseKey)) {
          console.log('⚠️ State has invalid noiseKey format, clearing auth folder...');
          needsFreshState = true;
        }
        // If no noiseKey, that's OK for fresh connection
      } else if (hasMe && !hasNoiseKey) {
        // If authenticated but no valid noiseKey, clear auth
        console.log('⚠️ Authenticated state has invalid noiseKey, clearing auth folder...');
        needsFreshState = true;
      }
    }

    if (needsFreshState) {
      const authPathToClear = path.join(__dirname, 'auth_info_baileys');
      if (fs.existsSync(authPathToClear)) {
        fs.rmSync(authPathToClear, { recursive: true, force: true });
        console.log('✅ Auth folder cleared');
      }
      // Wait longer to ensure folder is fully deleted and filesystem is synced
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify folder is actually deleted
      if (fs.existsSync(authPathToClear)) {
        console.log('⚠️ Auth folder still exists, force deleting again...');
        fs.rmSync(authPathToClear, { recursive: true, force: true });
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Reload with fresh state - this should create a completely empty state
      const freshAuth = await useMultiFileAuthState('auth_info_baileys');
      state = freshAuth.state;
      saveCreds = freshAuth.saveCreds;

      // For fresh QR scan, ensure state is clean but keep structure
      // Don't make it completely empty - Baileys needs proper structure
      console.log('⚠️ Cleaning state for fresh QR scan (keeping structure)...');

      // Only remove invalid properties, keep the structure
      if (state.creds) {
        // Remove noiseKey if it exists (will cause errors if invalid)
        if (state.creds.noiseKey !== undefined) {
          delete state.creds.noiseKey;
        }
        // Remove other potentially problematic keys if they're invalid
        // But keep the creds object structure
        if (!state.creds.me || !state.creds.me.id) {
          // Not authenticated - remove ALL keys for fresh QR scan
          // Baileys will generate everything during QR scan
          // Keep creds as empty object (not undefined)
          state.creds = {};
        }
      }

      // Ensure keys exists (even if empty)
      if (!state.keys) {
        state.keys = {};
      }

      console.log('✅ State cleaned for fresh QR scan (structure preserved)');

      console.log('✅ Fresh auth state loaded');
    }

    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`📱 Using WA version ${version.join('.')}, isLatest: ${isLatest}`);

    // Don't modify state - use it as-is from useMultiFileAuthState
    // Baileys will handle empty state correctly

    // Reset connection state
    isConnected = false;
    connectionState = 'connecting';
    qrCodeData = null;

    // CRITICAL: For fresh QR scan (not authenticated), clean state but keep structure
    // Don't make it completely empty - Baileys needs proper structure
    if (state.creds) {
      const hasMe = state.creds.me && state.creds.me.id;

      if (!hasMe) {
        // Not authenticated - clean state but keep structure
        console.log('⚠️ Not authenticated - cleaning state for fresh QR scan (keeping structure)...');
        const originalKeys = Object.keys(state.creds || {});
        console.log('📊 Original creds keys:', originalKeys);

        // Remove ALL keys for fresh QR scan - Baileys will generate everything
        // But keep creds as empty object (not undefined)
        state.creds = {};
        
        // Ensure keys exists and is empty (for fresh QR scan)
        state.keys = {};

        console.log('✅ State cleaned (empty creds and keys, will generate during QR scan)');
        console.log('📊 New creds keys:', Object.keys(state.creds || {}));
        console.log('📊 New keys keys:', Object.keys(state.keys || {}));
      } else {
        // Authenticated - check if noiseKey is valid
        const hasValidNoiseKey = state.creds.noiseKey &&
          Array.isArray(state.creds.noiseKey) &&
          state.creds.noiseKey.length > 0;

        if (!hasValidNoiseKey && state.creds.noiseKey !== undefined) {
          console.log('⚠️ Removing invalid noiseKey from authenticated state...');
          delete state.creds.noiseKey;
        }
      }
    }

    console.log('📊 Final state before socket creation:', {
      hasCreds: !!state.creds,
      credsKeys: state.creds ? Object.keys(state.creds) : [],
      hasMe: !!(state.creds && state.creds.me),
      hasMeId: !!(state.creds && state.creds.me && state.creds.me.id),
      hasKeys: !!state.keys,
      hasNoiseKey: !!(state.creds && state.creds.noiseKey),
      noiseKeyLength: state.creds && state.creds.noiseKey ? (Array.isArray(state.creds.noiseKey) ? state.creds.noiseKey.length : 'not-array') : 'none'
    });

    // Create socket with error handling
    // Baileys expects state with { creds: {}, keys: {} } structure
    try {
      sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: state, // State should have { creds: {}, keys: {} } structure
        browser: ['Chatvolution', 'Chrome', '120.0.0'],
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
      });
    } catch (socketError) {
      console.error('❌ Error creating socket:', socketError.message);

      // If error is related to state/auth or Zero-length key, clear and retry
      if (socketError.message.includes('undefined') ||
        socketError.message.includes('public') ||
        socketError.message.includes('private') ||
        socketError.message.includes('Cannot read') ||
        socketError.message.includes('Zero-length key') ||
        socketError.message.includes('DataError')) {
        console.log('🔧 Socket creation error related to state/crypto, clearing auth and retrying...');
        const authPathToClear = path.join(__dirname, 'auth_info_baileys');
        if (fs.existsSync(authPathToClear)) {
          fs.rmSync(authPathToClear, { recursive: true, force: true });
          console.log('✅ Auth folder cleared due to socket creation error');
        }

        // Wait a bit to ensure folder is fully deleted
        await new Promise(resolve => setTimeout(resolve, 100));
        // Reload with completely empty state
        const freshAuth = await useMultiFileAuthState('auth_info_baileys');
        state = freshAuth.state;
        saveCreds = freshAuth.saveCreds;

        // For fresh QR scan, clean state but keep structure
        if (state.creds) {
          const hasMe = state.creds.me && state.creds.me.id;
          if (!hasMe) {
            console.log('⚠️ Cleaning state for fresh QR scan (retry, removing all keys)...');
            // Remove ALL keys for fresh QR scan
            const allKeys = Object.keys(state.creds || {});
            allKeys.forEach(key => {
              delete state.creds[key];
            });
          }
        } else {
          state.creds = {};
        }
        // Ensure keys exists
        if (!state.keys) {
          state.keys = {};
        }

        // Retry socket creation
        sock = makeWASocket({
          version,
          logger,
          printQRInTerminal: true,
          auth: state, // Use cleaned state
          browser: ['Chatvolution', 'Chrome', '120.0.0'],
          defaultQueryTimeoutMs: 60000,
          connectTimeoutMs: 60000,
          keepAliveIntervalMs: 10000,
          generateHighQualityLinkPreview: false,
          syncFullHistory: false,
        });
        console.log('✅ Socket created with minimal auth state');
      } else {
        throw socketError; // Re-throw if not state-related
      }
    }

    // Bind store to socket
    store.bind(sock.ev);

    // Handle credentials update
    sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
      let connection, lastDisconnect, qr, isNewLogin, isOnline;

      try {
        // Extract variables from update
        connection = update.connection;
        lastDisconnect = update.lastDisconnect;
        qr = update.qr;
        isNewLogin = update.isNewLogin;
        isOnline = update.isOnline;

        console.log('📊 Connection update:', {
          connection,
          hasQR: !!qr,
          isNewLogin,
          isOnline,
          hasLastDisconnect: !!lastDisconnect
        });

        // Handle errors in connection update (especially crypto errors)
        if (update.error) {
          const errorMsg = update.error.message || update.error.toString() || '';
          console.error('❌ Connection update error:', errorMsg);

          // If error is related to crypto/key/undefined, clear auth
          if (errorMsg.includes('Zero-length key') ||
            errorMsg.includes('DataError') ||
            errorMsg.includes('crypto') ||
            errorMsg.includes('DOMException') ||
            errorMsg.includes('Cannot read properties of undefined') ||
            errorMsg.includes('reading \'public\'') ||
            errorMsg.includes('reading \'private\'')) {
            console.log('🔧 Crypto/state error detected, clearing auth for fresh start...');
            const authPath = path.join(__dirname, 'auth_info_baileys');
            if (fs.existsSync(authPath)) {
              fs.rmSync(authPath, { recursive: true, force: true });
              console.log('✅ Auth folder cleared due to crypto/state error');
            }
            connectionState = 'disconnected';
            isConnecting = false;
            qrCodeData = null;
            if (sock) {
              try {
                sock.end(undefined);
              } catch (e) {
                // Ignore
              }
              sock = null;
            }
            io.emit('status', {
              status: 'disconnected',
              message: 'Auth error detected. Please click Connect again to scan fresh QR code.',
              error: 'Crypto/state error - auth cleared',
              requiresManualReconnect: true
            });
            return;
          }
        }

        if (qr) {
          console.log('📱 QR Code received, scan to authenticate');
          qrCodeData = qr;
          connectionState = 'qr'; // Update state to 'qr' when QR is available

          // Generate QR code image
          try {
            const qrImage = await qrcode.toDataURL(qr);
            console.log('✅ QR code image generated, emitting to clients...');
            console.log('📊 Connected Socket.IO clients:', io.sockets.sockets.size);

            // Emit to all connected clients
            io.emit('qr', {
              qr: qrImage,
              image: qrImage, // Frontend expects 'image' property
              message: 'Scan this QR code with WhatsApp'
            });

            // Also emit status update
            io.emit('status', {
              status: 'qr',
              message: 'QR code ready. Please scan to connect.',
              hasQR: true
            });

            console.log('✅ QR code emitted to all clients');
          } catch (err) {
            console.error('❌ QR code generation error:', err);
          }
        }

        if (connection === 'close') {
          let shouldReconnect = false;
          let statusCode = undefined;
          let errorMessage = 'Unknown error';

          try {
            shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            statusCode = lastDisconnect?.error?.output?.statusCode;
            errorMessage = lastDisconnect?.error?.message || 'Unknown error';
          } catch (e) {
            // If we can't read error properties, it's likely a state error
            console.error('❌ Error reading disconnect info:', e.message);
            errorMessage = e.message || 'Cannot read disconnect error';
          }

          console.log('❌ Connection closed.');
          console.log('📊 Status code:', statusCode);
          console.log('📊 Error:', errorMessage);
          console.log('📊 Should reconnect:', shouldReconnect);
          console.log('📊 QR Code available:', !!qrCodeData);
          console.log('📊 Previous state:', connectionState);

          // If error is "Cannot read properties of undefined", clear auth
          if (errorMessage.includes('Cannot read properties of undefined') ||
            errorMessage.includes('reading \'public\'') ||
            errorMessage.includes('reading \'private\'')) {
            console.log('🔧 Undefined property error detected, clearing auth...');
            const authPath = path.join(__dirname, 'auth_info_baileys');
            if (fs.existsSync(authPath)) {
              fs.rmSync(authPath, { recursive: true, force: true });
              console.log('✅ Auth folder cleared due to undefined property error');
            }
          }

          isConnected = false;
          isConnecting = false;

          // If QR code is available, keep it and re-emit (don't clear it)
          if (qrCodeData) {
            console.log('📱 QR code still available after close, re-emitting...');
            connectionState = 'qr'; // Keep state as 'qr' if QR is available
            try {
              const qrImage = await qrcode.toDataURL(qrCodeData);
              io.emit('qr', {
                qr: qrImage,
                image: qrImage,
                message: 'Scan this QR code with WhatsApp'
              });
              io.emit('status', {
                status: 'qr',
                message: 'QR code ready. Please scan to connect.',
                hasQR: true
              });
            } catch (err) {
              console.error('❌ Error re-emitting QR code:', err);
              connectionState = 'disconnected';
              qrCodeData = null; // Clear QR if error
              io.emit('status', {
                status: 'disconnected',
                message: 'WhatsApp disconnected. Please click Connect to get QR code.',
                error: errorMessage,
                requiresManualReconnect: true
              });
            }
          } else {
            // No QR code available - reset state
            console.log('⚠️ Connection closed without QR code - resetting state');

            // If error is "Connection Terminated" with status 428, it might be crypto error
            // Clear auth to force fresh QR scan
            if (statusCode === 428 || errorMessage.includes('Connection Terminated')) {
              console.log('🔧 Connection terminated error detected, clearing auth for fresh start...');
              const authPath = path.join(__dirname, 'auth_info_baileys');
              if (fs.existsSync(authPath)) {
                fs.rmSync(authPath, { recursive: true, force: true });
                console.log('✅ Auth folder cleared due to connection terminated error');
              }
            }

            connectionState = 'disconnected';
            qrCodeData = null;
            io.emit('status', {
              status: 'disconnected',
              message: 'WhatsApp disconnected. Please click Connect to scan QR code.',
              error: errorMessage,
              requiresManualReconnect: true
            });
          }

          // Handle different disconnect reasons
          // Auto-reconnect disabled - user will manually scan QR fresh
          if (statusCode === DisconnectReason.loggedOut) {
            console.log('🚪 Logged out, clearing auth and QR...');
            // Clear auth files
            const authPath = path.join(__dirname, 'auth_info_baileys');
            if (fs.existsSync(authPath)) {
              fs.rmSync(authPath, { recursive: true, force: true });
              console.log('✅ Auth folder cleared');
            }
            // Clear QR code data for fresh scan
            qrCodeData = null;
            io.emit('status', {
              status: 'disconnected',
              message: 'Logged out. Please click Connect to scan QR code again.',
              requiresManualReconnect: true
            });
          } else {
            // No auto-reconnect - user must manually click Connect
            // Keep QR code if available, but don't auto-reconnect
            console.log('⏸️ Connection closed. Please click Connect to scan QR code manually.');
            // QR code will be kept if available (already handled above)
          }
        } else if (connection === 'open') {
          isConnecting = false;
          console.log('✅ WhatsApp connection opened successfully!');
          console.log('📱 Phone:', sock.user?.id || 'N/A');
          console.log('📱 Name:', sock.user?.name || 'N/A');

          isConnected = true;
          connectionState = 'connected';
          qrCodeData = null;

          io.emit('status', {
            status: 'connected',
            message: 'WhatsApp connected successfully',
            phone: sock.user?.id || null,
            name: sock.user?.name || null
          });

          io.emit('authenticated', {
            phone: sock.user?.id || null,
            name: sock.user?.name || null
          });
        } else if (connection === 'connecting') {
          console.log('🔄 Connecting to WhatsApp...');
          connectionState = 'connecting';
          io.emit('status', {
            status: 'connecting',
            message: 'Connecting to WhatsApp...'
          });

          // Set timeout for connecting state - if no QR or connection after 30 seconds, reset
          setTimeout(() => {
            if (connectionState === 'connecting' && !qrCodeData && !isConnected) {
              console.log('⏱️ Connection timeout - no QR code received after 30 seconds');
              connectionState = 'disconnected';
              isConnecting = false;
              io.emit('status', {
                status: 'disconnected',
                message: 'Connection timeout. Please click Connect again.',
                requiresManualReconnect: true
              });
            }
          }, 30000); // 30 seconds timeout
        }
      } catch (handlerError) {
        // Catch any errors in the handler itself
        const errorMsg = handlerError?.message || handlerError?.toString() || String(handlerError);
        console.error('❌ Error in connection.update handler:', errorMsg);

        // If error is related to undefined properties, clear auth
        if (errorMsg.includes('Cannot read properties of undefined') ||
          errorMsg.includes('reading \'public\'') ||
          errorMsg.includes('reading \'private\'') ||
          errorMsg.includes('qr is not defined') ||
          errorMsg.includes('connection is not defined')) {
          console.log('🔧 Undefined property error in handler, clearing auth...');
          const authPath = path.join(__dirname, 'auth_info_baileys');
          if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true });
            console.log('✅ Auth folder cleared due to handler error');
          }
          connectionState = 'disconnected';
          isConnecting = false;
          qrCodeData = null;
          if (sock) {
            try {
              sock.end(undefined);
            } catch (e) {
              // Ignore
            }
            sock = null;
          }
          io.emit('status', {
            status: 'disconnected',
            message: 'Connection error. Please click Connect again to scan fresh QR code.',
            error: 'Handler error - auth cleared',
            requiresManualReconnect: true
          });
        }
      }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        if (type !== 'notify') return;

        for (const msg of messages) {
          if (!msg.message) continue;
          if (msg.key.fromMe) continue; // Skip own messages

          console.log('📨 New message received');
          console.log('From:', msg.key.remoteJid);
          console.log('Message:', msg.message);

          // Extract message details
          const from = msg.key.remoteJid;
          const messageText = msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            '';

          const hasMedia = !!(msg.message.imageMessage ||
            msg.message.videoMessage ||
            msg.message.documentMessage ||
            msg.message.audioMessage);

          // Store in database
          const normalizedPhone = normalizePhoneNumber(from.replace('@s.whatsapp.net', ''));

          try {
            await WhatsAppMessage.create({
              from_number: normalizedPhone,
              to_number: 'me',
              message: messageText || '[Media]',
              direction: 'incoming',
              status: 'received',
              message_id: msg.key.id,
              from_me: false,
              timestamp: new Date(msg.messageTimestamp * 1000).toISOString(), // Fix: Convert to ISO string
              has_media: hasMedia
            });

            console.log('✅ Message stored in database');
          } catch (dbError) {
            console.error('❌ Database storage error:', dbError.message);
          }

          // Emit to Socket.IO clients
          io.emit('message', {
            from: from,
            message: messageText,
            hasMedia: hasMedia,
            timestamp: new Date(msg.messageTimestamp * 1000).toISOString(),
            messageId: msg.key.id
          });

          // Process AI response for incoming messages (async, don't wait)
          const messageData = {
            phone: normalizedPhone,
            message: messageText,
            messageId: msg.key.id,
            hasMedia: hasMedia
          };

          processIncomingMessage(messageData).catch(error => {
            console.error('❌ Error processing AI response:', error);
          });
        }
      } catch (error) {
        console.error('❌ Message processing error:', error);
      }
    });

    console.log('✅ WhatsApp event listeners registered');

  } catch (error) {
    console.error('❌ WhatsApp connection error:', error);
    isConnecting = false;
    connectionState = 'disconnected';

    // If error is related to crypto/key, clear auth
    if (error.message && (
      error.message.includes('Zero-length key') ||
      error.message.includes('DataError') ||
      error.message.includes('crypto') ||
      error.message.includes('DOMException')
    )) {
      console.log('🔧 Crypto error in connection, clearing auth...');
      const authPath = path.join(__dirname, 'auth_info_baileys');
      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
        console.log('✅ Auth folder cleared due to crypto error');
      }
      qrCodeData = null;
    }

    // No auto-retry - user must manually click Connect
    io.emit('status', {
      status: 'disconnected',
      message: 'Connection failed. Please click Connect to try again.',
      error: error.message,
      requiresManualReconnect: true
    });
  }
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('🔌 Socket.IO client connected:', socket.id);

  // Send current status on connect
  socket.emit('status', {
    status: connectionState,
    message: isConnected ? 'WhatsApp connected' : 'WhatsApp disconnected',
    phone: sock?.user?.id || null
  });

  // Send QR if available when client connects
  if (qrCodeData) {
    console.log('📱 Sending existing QR code to new client:', socket.id);
    qrcode.toDataURL(qrCodeData).then(qrImage => {
      socket.emit('qr', {
        qr: qrImage,
        image: qrImage, // Frontend expects 'image' property
        message: 'Scan this QR code with WhatsApp'
      });
      console.log('✅ QR code sent to client:', socket.id);
    }).catch(err => {
      console.error('❌ Error sending QR to client:', err);
    });
  } else {
    console.log('ℹ️ No QR code available to send to client:', socket.id);
  }

  socket.on('disconnect', () => {
    console.log('❌ Socket.IO client disconnected:', socket.id);
  });
});

// Serve socket.io.js for /wa1 (Apache ProxyPass compatibility)
app.get('/wa1/socket.io/socket.io.js', (req, res) => {
  try {
    const socketIoPath = path.join(__dirname, 'node_modules', 'socket.io', 'client-dist', 'socket.io.min.js');
    const socketIoContent = fs.readFileSync(socketIoPath, 'utf8');

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(socketIoContent);
  } catch (error) {
    console.error('Error serving socket.io.js:', error);
    res.status(404).send('Socket.IO client not found');
  }
});

// Also serve at root for backward compatibility
app.get('/socket.io/socket.io.js', (req, res) => {
  try {
    const socketIoPath = path.join(__dirname, 'node_modules', 'socket.io', 'client-dist', 'socket.io.min.js');
    const socketIoContent = fs.readFileSync(socketIoPath, 'utf8');

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(socketIoContent);
  } catch (error) {
    console.error('Error serving socket.io.js:', error);
    res.status(404).send('Socket.IO client not found');
  }
});

// Copy all routes to wa1Router for / wa1 prefix support
// Home route
wa1Router.get('/', (req, res) => {
  res.json({
    service: 'WhatsApp Socket Server (Baileys)',
    version: '1.0.0',
    port: port,
    status: isConnected ? 'connected' : 'disconnected'
  });
});

// Get status (root path)
app.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    state: connectionState,
    phone: sock?.user?.id || null,
    name: sock?.user?.name || null,
    hasQR: !!qrCodeData,
    timestamp: new Date().toISOString()
  });
});

// Get status (wa1 path) - dengan format yang sesuai frontend
wa1Router.get('/status', (req, res) => {
  res.json({
    success: true,
    connected: isConnected,
    status: connectionState,
    phone: sock?.user?.id || null,
    name: sock?.user?.name || null,
    hasQR: !!qrCodeData,
    timestamp: new Date().toISOString()
  });
});

// Scan page
wa1Router.get('/scan', (req, res) => {
  res.sendFile(path.join(__dirname, 'scan.html'));
});

// Get QR code
wa1Router.get('/qr', async (req, res) => {
  try {
    console.log('📱 QR endpoint called');
    console.log('📊 QR Code Data available:', !!qrCodeData);
    console.log('📊 Connection state:', connectionState);
    console.log('📊 Is connected:', isConnected);
    console.log('📊 Is connecting:', isConnecting);

    if (!qrCodeData) {
      // If not connecting and not connected, suggest initialization
      if (!isConnecting && !isConnected) {
        return res.status(200).json({
          success: false,
          message: 'No QR code available. Please click Connect to initialize.',
          requiresInit: true,
          state: connectionState
        });
      }

      return res.status(200).json({
        success: false,
        message: 'No QR code available. Already authenticated or QR expired. Please click Connect to get new QR code.',
        connected: isConnected,
        state: connectionState
      });
    }

    const qrImage = await qrcode.toDataURL(qrCodeData);
    console.log('✅ QR code image generated successfully');

    res.json({
      success: true,
      qr: qrImage,
      image: qrImage, // Frontend might also expect 'image' property
      message: 'Scan this QR code with your WhatsApp'
    });
  } catch (error) {
    console.error('❌ QR code generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
});

// Initialize/Reconnect - Support both GET and POST
const initHandler = async (req, res) => {
  try {
    console.log('🔄 Init request received');

    if (isConnected) {
      console.log('ℹ️ Already connected, returning current status');
      return res.json({
        success: true,
        message: 'Already connected',
        phone: sock?.user?.id || null
      });
    }

    // Reset connection state when manually initializing
    isConnecting = false;

    if (!sock || connectionState === 'disconnected') {
      console.log('🚀 Starting WhatsApp connection...');
      connectToWhatsApp();
    } else if (isConnecting) {
      console.log('ℹ️ Connection already in progress...');
    } else {
      console.log('ℹ️ Socket exists but not connected, reconnecting...');
      connectToWhatsApp();
    }

    res.json({
      success: true,
      message: 'Initialization started. Check /status or /qr endpoint.'
    });
  } catch (error) {
    console.error('❌ Init handler error:', error);
    isConnecting = false;
    res.status(500).json({
      success: false,
      message: 'Initialization failed',
      error: error.message
    });
  }
};

wa1Router.get('/init', initHandler);
wa1Router.post('/init', initHandler);

// Send message
wa1Router.post('/send', async (req, res) => {
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
      const plainPhone = normalizePhoneNumber(phone);

      if (agentId === 'react-app') {
        if (global.aiInProgressPhones.has(plainPhone)) {
          // Check if AI processing has been going on for too long (more than 30 seconds)
          const startTime = global.aiProcessingStartTime.get(plainPhone);
          const processingTime = startTime ? Date.now() - startTime : 0;

          if (processingTime > 30000) { // 30 seconds
            console.log('⏰ AI processing timeout, clearing flag for:', plainPhone);
            global.aiInProgressPhones.delete(plainPhone);
            global.aiProcessingStartTime.delete(plainPhone);
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
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking AI progress:', error);
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

    if (!isConnected || !sock) {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp is not connected',
        requiresReinit: true
      });
    }

    const jid = formatPhoneToJID(phone);

    console.log(`📤 Sending message to ${jid}`);

    const result = await sock.sendMessage(jid, { text: message });

    // Store in database
    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      const now = new Date();
      const mysqlDatetime = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');

      await WhatsAppMessage.create({
        from_number: 'me', // Add from_number
        to_number: normalizedPhone, // Add to_number
        message: message,
        direction: 'outgoing',
        status: 'sent',
        message_id: result.key.id,
        from_me: true,
        timestamp: new Date().toISOString(),
        has_media: false
      });
    } catch (dbError) {
      console.error('❌ Database storage error:', dbError.message);
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: result.key.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Send media
wa1Router.post('/send-media', async (req, res) => {
  try {
    const { phone, mediaUrl, caption, mediaType } = req.body;

    if (!phone || !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'Phone and mediaUrl are required'
      });
    }

    if (!isConnected || !sock) {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp is not connected',
        requiresReinit: true
      });
    }

    const jid = formatPhoneToJID(phone);

    console.log(`📤 Sending media to ${jid}`);

    // Download media
    const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // Determine message type
    let messageContent = {};

    if (mediaType === 'image' || mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
      messageContent = {
        image: buffer,
        caption: caption || ''
      };
    } else if (mediaType === 'video' || mediaUrl.match(/\.(mp4|avi|mov)$/i)) {
      messageContent = {
        video: buffer,
        caption: caption || ''
      };
    } else if (mediaType === 'document' || mediaUrl.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
      const fileName = path.basename(mediaUrl);
      messageContent = {
        document: buffer,
        fileName: fileName,
        caption: caption || ''
      };
    } else {
      // Default to document
      const fileName = path.basename(mediaUrl);
      messageContent = {
        document: buffer,
        fileName: fileName,
        caption: caption || ''
      };
    }

    const result = await sock.sendMessage(jid, messageContent);

    // Store in database
    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      const now = new Date();
      const mysqlDatetime = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');

      await WhatsAppMessage.create({
        from_number: 'me', // Add from_number
        to_number: normalizedPhone, // Add to_number
        message: caption || '[Media]',
        direction: 'outgoing',
        status: 'sent',
        message_id: result.key.id,
        from_me: true,
        timestamp: new Date().toISOString(),
        has_media: true,
        media_url: mediaUrl
      });
    } catch (dbError) {
      console.error('❌ Database storage error:', dbError.message);
    }

    res.json({
      success: true,
      message: 'Media sent successfully',
      messageId: result.key.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Send media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send media',
      error: error.message
    });
  }
});

// Logout - Support both GET and POST
const logoutHandler = async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
    }

    // Clear auth files
    const authPath = path.join(__dirname, 'auth_info_baileys');
    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
    }

    isConnected = false;
    connectionState = 'disconnected';
    sock = null;
    qrCodeData = null;

    io.emit('status', {
      status: 'disconnected',
      message: 'Logged out successfully'
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

wa1Router.get('/logout', logoutHandler);
wa1Router.post('/logout', logoutHandler);

// Get messages from database
wa1Router.get('/messages', async (req, res) => {
  try {
    const { phone, limit = 50, offset = 0 } = req.query;

    const where = phone ? { from_number: normalizePhoneNumber(phone) } : {};

    const messages = await WhatsAppMessage.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: messages.length,
      messages: messages
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Get messages by phone (from global.allMessages)
wa1Router.get('/messages/:phone', (req, res) => {
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

// Cleanup auth folder
wa1Router.get('/cleanup-auth', (req, res) => {
  try {
    // Disconnect and cleanup socket first
    if (sock) {
      try {
        sock.end(undefined);
      } catch (e) {
        // Ignore cleanup errors
      }
      sock = null;
    }

    // Reset connection state
    isConnected = false;
    connectionState = 'disconnected';
    isConnecting = false;
    reconnectAttempts = 0;
    qrCodeData = null;

    // Clear auth files
    const authPath = path.join(__dirname, 'auth_info_baileys');
    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
      console.log('✅ Auth folder cleaned successfully');
      res.json({ success: true, message: 'Auth folder cleaned successfully' });
    } else {
      console.log('ℹ️ Auth folder does not exist');
      res.json({ success: true, message: 'Auth folder does not exist' });
    }

    // Emit status update
    io.emit('status', {
      status: 'disconnected',
      message: 'Auth cleared. Please reinitialize.'
    });
  } catch (error) {
    console.error('❌ Cleanup auth error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check endpoint
wa1Router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// AI Response deduplication endpoint
wa1Router.post('/api/ai-response', async (req, res) => {
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

// API routes for API keys
wa1Router.get('/api/api-keys', async (req, res) => {
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

wa1Router.get('/api/api-keys/:service', async (req, res) => {
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

wa1Router.post('/api/api-keys', async (req, res) => {
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

wa1Router.post('/api/api-keys/test/:service', async (req, res) => {
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

    // Test API key based on service
    let testResult = false;
    if (service === 'openai') {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey.api_key}`
          }
        });
        testResult = response.ok;
      } catch (error) {
        testResult = false;
      }
    }

    res.json({
      success: true,
      service: service,
      testResult: testResult,
      message: testResult ? 'API key is valid' : 'API key test failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to test API key',
      error: error.message
    });
  }
});

// Get messages from database by phone (for chat_v2)
wa1Router.get('/api/whatsapp/messages/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { includeClosed } = req.query;
    const normalizedPhone = normalizePhoneNumber(phone);

    const whereClause = { from_number: normalizedPhone };

    if (includeClosed !== 'true') {
      whereClause.chat_status = 'open';
    }

    const messages = await WhatsAppMessage.findAll({
      where: whereClause,
      order: [['timestamp', 'ASC']]
    });

    const transformedMessages = messages.map(msg => ({
      id: msg.message_id,
      from: msg.from_number === 'me' ? 'me' : `${msg.from_number}@s.whatsapp.net`,
      to: msg.to_number ? `${msg.to_number}@s.whatsapp.net` : null,
      body: msg.message,
      timestamp: msg.timestamp,
      type: msg.direction === 'outgoing' ? 'sent' : 'received',
      hasMedia: msg.has_media,
      is_read: msg.is_read || false,
      chat_status: msg.chat_status || 'open',
      instance: 'wa1'
    }));

    res.json({
      success: true,
      messages: transformedMessages,
      phone: normalizedPhone,
      count: transformedMessages.length
    });
  } catch (error) {
    console.error('❌ Error fetching messages by phone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Get messages by instance
wa1Router.get('/api/whatsapp/messages-by-instance/:instance', async (req, res) => {
  try {
    const { instance } = req.params;
    const { includeClosed } = req.query;

    const whereClause = {
      instance: instance || 'wa1'
    };

    if (includeClosed !== 'true') {
      whereClause.chat_status = 'open';
    }

    const messages = await WhatsAppMessage.findAll({
      where: whereClause,
      order: [['timestamp', 'ASC']]
    });

    const transformedMessages = messages.map(msg => ({
      id: msg.message_id,
      from: msg.from_number === 'me' ? 'me' : `${msg.from_number}@s.whatsapp.net`,
      to: msg.to_number ? `${msg.to_number}@s.whatsapp.net` : null,
      body: msg.message,
      timestamp: msg.timestamp,
      type: msg.direction === 'outgoing' ? 'sent' : 'received',
      hasMedia: msg.has_media,
      is_read: msg.is_read || false,
      chat_status: msg.chat_status || 'open',
      instance: instance || 'wa1'
    }));

    res.json({
      success: true,
      messages: transformedMessages,
      instance: instance || 'wa1',
      count: transformedMessages.length
    });
  } catch (error) {
    console.error('❌ Error fetching messages by instance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Get unread count for a phone number
wa1Router.get('/api/whatsapp/unread-count/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    // Normalize phone: handle variations (0/62/+62)
    const digitsOnly = (str) => (str || '').replace(/\D/g, '');
    const raw = digitsOnly(phone);
    const variants = new Set();
    if (raw) {
      variants.add(raw);
      if (raw.startsWith('62')) variants.add('0' + raw.slice(2));
      if (raw.startsWith('0')) variants.add('62' + raw.slice(1));
      if (!raw.startsWith('62')) variants.add('62' + raw);
    }

    const unreadCount = await WhatsAppMessage.count({
      where: {
        from_number: { [Op.in]: Array.from(variants) },
        direction: 'incoming',
        instance: 'wa1',
        is_read: false,
        chat_status: 'open'
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Get assigned status for a phone number
wa1Router.get('/api/whatsapp/assigned-status/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    // Normalize phone: handle variations (0/62/+62)
    const digitsOnly = (str) => (str || '').replace(/\D/g, '');
    const raw = digitsOnly(phone);
    const variants = new Set();
    if (raw) {
      variants.add(raw);
      if (raw.startsWith('62')) variants.add('0' + raw.slice(2));
      if (raw.startsWith('0')) variants.add('62' + raw.slice(1));
      if (!raw.startsWith('62')) variants.add('62' + raw);
    }

    const phoneVariants = Array.from(variants);

    // Get the most recent message to check assigned_to
    const message = await WhatsAppMessage.findOne({
      where: {
        [Op.or]: [
          { from_number: { [Op.in]: phoneVariants } },
          { to_number: { [Op.in]: phoneVariants } }
        ],
        chat_status: 'open'
      },
      order: [['received_at', 'DESC']],
      limit: 1,
      attributes: ['assigned_to']
    });

    res.json({
      success: true,
      assignedTo: message?.assigned_to || null,
      isAssigned: !!message?.assigned_to
    });
  } catch (error) {
    console.error('❌ Error checking assigned status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check assigned status',
      error: error.message
    });
  }
});

// Assign chat to agent (disable AI response) - supports multiple agents (comma-separated)
wa1Router.post('/api/whatsapp/assign-chat/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID is required'
      });
    }

    // Normalize phone: handle variations (0/62/+62)
    const digitsOnly = (str) => (str || '').replace(/\D/g, '');
    const raw = digitsOnly(phone);
    const variants = new Set();
    if (raw) {
      variants.add(raw);
      if (raw.startsWith('62')) variants.add('0' + raw.slice(2));
      if (raw.startsWith('0')) variants.add('62' + raw.slice(1));
      if (!raw.startsWith('62')) variants.add('62' + raw);
    }

    const phoneVariants = Array.from(variants);

    // Get existing assigned_to to append new agent
    const existingMessage = await WhatsAppMessage.findOne({
      where: {
        [Op.or]: [
          { from_number: { [Op.in]: phoneVariants } },
          { to_number: { [Op.in]: phoneVariants } }
        ],
        chat_status: 'open',
        assigned_to: { [Op.ne]: null }
      },
      attributes: ['assigned_to'],
      order: [['received_at', 'DESC']],
      limit: 1
    });

    let newAssignedTo = String(agentId);

    if (existingMessage && existingMessage.assigned_to) {
      // Parse existing assigned_to (comma-separated)
      const existingAgents = existingMessage.assigned_to.split(',').map(a => a.trim()).filter(a => a);

      // Check if agentId already in the list
      if (!existingAgents.includes(String(agentId))) {
        // Append new agent ID
        existingAgents.push(String(agentId));
        newAssignedTo = existingAgents.join(',');
      } else {
        // Agent already assigned, no change needed
        newAssignedTo = existingMessage.assigned_to;
      }
    }

    // Update all messages for this phone to assigned status
    const [affectedRows] = await WhatsAppMessage.update(
      { assigned_to: newAssignedTo },
      {
        where: {
          [Op.or]: [
            { from_number: { [Op.in]: phoneVariants } },
            { to_number: { [Op.in]: phoneVariants } }
          ],
          chat_status: 'open'
        }
      }
    );

    res.json({
      success: true,
      message: 'Chat assigned successfully',
      phone: phone,
      agentId: agentId,
      assignedTo: newAssignedTo,
      affectedRows: affectedRows
    });
  } catch (error) {
    console.error('❌ Error assigning chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign chat',
      error: error.message
    });
  }
});

// Mark messages as read for a specific phone number
wa1Router.post('/api/whatsapp/mark-read/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    // Normalize phone: keep digits only, handle 0/62/+62 variations
    const digitsOnly = (str) => (str || '').replace(/\D/g, '');
    const raw = digitsOnly(phone);
    const variants = new Set();
    if (raw) {
      variants.add(raw);
      if (raw.startsWith('62')) variants.add('0' + raw.slice(2));
      if (raw.startsWith('0')) variants.add('62' + raw.slice(1));
      if (!raw.startsWith('62')) variants.add('62' + raw);
    }

    const phoneVariants = Array.from(variants);

    // Update all unread incoming messages for this phone
    const [affectedRows] = await WhatsAppMessage.update(
      { is_read: true },
      {
        where: {
          from_number: { [Op.in]: phoneVariants },
          direction: 'incoming',
          instance: 'wa1',
          is_read: false,
          chat_status: 'open'
        }
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
      phone: phone,
      affectedRows: affectedRows
    });
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

// Close chat for a specific phone number
wa1Router.post('/api/whatsapp/close-chat/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    // Normalize phone: handle variations (0/62/+62)
    const digitsOnly = (str) => (str || '').replace(/\D/g, '');
    const raw = digitsOnly(phone);
    const variants = new Set();
    if (raw) {
      variants.add(raw);
      if (raw.startsWith('62')) variants.add('0' + raw.slice(2));
      if (raw.startsWith('0')) variants.add('62' + raw.slice(1));
      if (!raw.startsWith('62')) variants.add('62' + raw);
    }

    const phoneVariants = Array.from(variants);

    // Update all messages for this phone to closed status
    const [affectedRows] = await WhatsAppMessage.update(
      { chat_status: 'closed' },
      {
        where: {
          [Op.or]: [
            { from_number: { [Op.in]: phoneVariants } },
            { to_number: { [Op.in]: phoneVariants } }
          ],
          chat_status: 'open'
        }
      }
    );

    res.json({
      success: true,
      message: 'Chat closed successfully',
      phone: phone,
      affectedRows: affectedRows
    });
  } catch (error) {
    console.error('❌ Error closing chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close chat',
      error: error.message
    });
  }
});

// Set chat as pending for a specific phone number
wa1Router.post('/api/whatsapp/pending-chat/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { isPending = true } = req.body;

    // Normalize phone: handle variations (0/62/+62)
    const digitsOnly = (str) => (str || '').replace(/\D/g, '');
    const raw = digitsOnly(phone);
    const variants = new Set();
    if (raw) {
      variants.add(raw);
      if (raw.startsWith('62')) variants.add('0' + raw.slice(2));
      if (raw.startsWith('0')) variants.add('62' + raw.slice(1));
      if (!raw.startsWith('62')) variants.add('62' + raw);
    }

    const phoneVariants = Array.from(variants);

    // Update latest message for this phone to set is_pending
    const [affectedRows] = await WhatsAppMessage.update(
      { is_pending: isPending ? 1 : 0 },
      {
        where: {
          [Op.or]: [
            { from_number: { [Op.in]: phoneVariants } },
            { to_number: { [Op.in]: phoneVariants } }
          ],
          chat_status: 'open'
        },
        order: [['received_at', 'DESC']],
        limit: 1
      }
    );

    res.json({
      success: true,
      message: `Chat ${isPending ? 'set as pending' : 'removed from pending'} successfully`,
      phone: phone,
      isPending: isPending,
      affectedRows: affectedRows
    });
  } catch (error) {
    console.error('❌ Error setting chat pending:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set chat pending',
      error: error.message
    });
  }
});

// Get closed chats
wa1Router.get('/api/whatsapp/closed-chats', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Get distinct phone numbers with closed chats
    const closedChats = await WhatsAppMessage.findAll({
      where: {
        chat_status: 'closed',
        instance: 'wa1'
      },
      attributes: [
        'from_number',
        [Sequelize.fn('MAX', Sequelize.col('received_at')), 'last_message_at']
      ],
      group: ['from_number'],
      order: [[Sequelize.fn('MAX', Sequelize.col('received_at')), 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      chats: closedChats,
      count: closedChats.length
    });
  } catch (error) {
    console.error('❌ Error fetching closed chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch closed chats',
      error: error.message
    });
  }
});

// Get all chats (open and closed)
wa1Router.get('/api/whatsapp/chats', async (req, res) => {
  try {
    const { includeClosed = false } = req.query;

    const whereClause = {
      instance: 'wa1'
    };

    if (includeClosed !== 'true') {
      whereClause.chat_status = 'open';
    }

    // Get distinct phone numbers
    const chats = await WhatsAppMessage.findAll({
      where: whereClause,
      attributes: [
        'from_number',
        [Sequelize.fn('MAX', Sequelize.col('received_at')), 'last_message_at'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'message_count']
      ],
      group: ['from_number'],
      order: [[Sequelize.fn('MAX', Sequelize.col('received_at')), 'DESC']]
    });

    res.json({
      success: true,
      chats: chats,
      count: chats.length
    });
  } catch (error) {
    console.error('❌ Error fetching chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
});

// Get agent info
wa1Router.get('/api/whatsapp/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;

    // Get all chats assigned to this agent
    const assignedChats = await WhatsAppMessage.findAll({
      where: {
        assigned_to: { [Op.like]: `%${agentId}%` },
        chat_status: 'open',
        instance: 'wa1'
      },
      attributes: [
        'phone',
        [Sequelize.fn('MAX', Sequelize.col('received_at')), 'last_message_at']
      ],
      group: ['phone'],
      order: [[Sequelize.fn('MAX', Sequelize.col('received_at')), 'DESC']]
    });

    res.json({
      success: true,
      agentId: agentId,
      assignedChats: assignedChats,
      count: assignedChats.length
    });
  } catch (error) {
    console.error('❌ Error fetching agent info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent info',
      error: error.message
    });
  }
});

// Mount wa1Router for /wa1 prefix and root path
app.use('/wa1', wa1Router);
app.use('/', wa1Router);

// Error handlers for unhandled errors (especially crypto errors)
process.on('unhandledRejection', (reason, promise) => {
  const errorMsg = reason?.message || reason?.toString() || String(reason);
  console.error('❌ Unhandled Rejection:', errorMsg);

  // If error is related to crypto/key, clear auth
  if (errorMsg.includes('Zero-length key') ||
    errorMsg.includes('DataError') ||
    errorMsg.includes('crypto') ||
    errorMsg.includes('DOMException')) {
    console.log('🔧 Crypto error detected in unhandled rejection, clearing auth...');
    const authPath = path.join(__dirname, 'auth_info_baileys');
    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
      console.log('✅ Auth folder cleared due to crypto error');
    }
    connectionState = 'disconnected';
    isConnecting = false;
    qrCodeData = null;
    if (sock) {
      try {
        sock.end(undefined);
      } catch (e) {
        // Ignore
      }
      sock = null;
    }
    io.emit('status', {
      status: 'disconnected',
      message: 'Auth error detected. Please click Connect again to scan fresh QR code.',
      error: 'Crypto error - auth cleared',
      requiresManualReconnect: true
    });
  }
});

process.on('uncaughtException', (error) => {
  const errorMsg = error?.message || error?.toString() || String(error);
  console.error('❌ Uncaught Exception:', errorMsg);

  // If error is related to crypto/key, clear auth
  if (errorMsg.includes('Zero-length key') ||
    errorMsg.includes('DataError') ||
    errorMsg.includes('crypto') ||
    errorMsg.includes('DOMException')) {
    console.log('🔧 Crypto error detected in uncaught exception, clearing auth...');
    const authPath = path.join(__dirname, 'auth_info_baileys');
    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
      console.log('✅ Auth folder cleared due to crypto error');
    }
    connectionState = 'disconnected';
    isConnecting = false;
    qrCodeData = null;
  }

  // Don't exit on uncaught exception, just log it
  // process.exit(1); // Commented out to prevent server crash
});

// Server startup
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models
    await db.sync();
    console.log('✅ Database models synchronized');

    // Verify database
    try {
      await db.query('SELECT 1');
      console.log('✅ Database connection verified');
    } catch (error) {
      console.error('❌ Database verification failed:', error.message);
    }

    // Start server
    server.listen(port, () => {
      console.log('=====================================');
      console.log('🚀 WhatsApp Socket Server (Baileys) running on port', port);
      console.log('📡 Environment:', process.env.NODE_ENV || 'development');
      console.log('🔌 AUTOCONNECT_WA:', process.env.AUTOCONNECT_WA || '0');
      console.log('=====================================');

      // Auto-connect if enabled
      if (process.env.AUTOCONNECT_WA === '1') {
        console.log('🔄 Auto-connecting WhatsApp client...');
        connectToWhatsApp();
      } else {
        console.log('⏸️  Auto-connect disabled. Use /init endpoint to connect manually.');
      }
    });

  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { sock, io };
