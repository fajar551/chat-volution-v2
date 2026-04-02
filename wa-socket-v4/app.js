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

// Database imports
const { db, testConnection } = require('./config/database');
const { Op, Sequelize } = require('sequelize');
const WhatsAppMessage = require('./models/WhatsAppMessage');
const ChatChannelAccount = require('./models/ChatChannelAccount');
const ApiKey = require('./models/ApiKey');

// Express Setup
const app = express();
const server = createServer(app);
const port = process.env.PORT || 4006;
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

// Router untuk /wa4 path - duplicate semua routes dengan prefix /wa4
const wa4Router = express.Router();

// Copy semua routes ke wa4Router
wa4Router.get('/', (req, res) => {
  res.send('Hello World from fajar di wa socket v2?! ');
});

wa4Router.get('/status', async (req, res) => {
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

wa4Router.post('/send', async (req, res) => {
  try {
    const { phone, message, agentId } = req.body;
    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone and message are required'
      });
    }

    // AI response disabled - manual replies only
    const plainPhone = phone.replace('@c.us', '');
    console.log('📥 Incoming send request:', { phone: plainPhone, agentId, message: message.substring(0, 30) });

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
      const toPhone = chatId.replace('@c.us', '');

      // Inherit assigned_to from existing open messages for this phone
      let assignedTo = null;
      const digitsOnly = (str) => (str || '').replace(/\D/g, '');
      const raw = digitsOnly(toPhone);
      const variants = new Set();
      if (raw) {
        variants.add(raw);
        if (raw.startsWith('62')) variants.add('0' + raw.slice(2));
        if (raw.startsWith('0')) variants.add('62' + raw.slice(1));
        if (!raw.startsWith('62')) variants.add('62' + raw);
      }

      const phoneVariants = Array.from(variants);

      // Check if any existing message for this phone has assigned_to
      const existingAssignedMessage = await WhatsAppMessage.findOne({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { from_number: { [Op.in]: phoneVariants } },
                { to_number: { [Op.in]: phoneVariants } }
              ]
            },
            { chat_status: 'open' },
            { assigned_to: { [Op.ne]: null } }
          ]
        },
        attributes: ['assigned_to'],
        order: [['received_at', 'DESC']],
        limit: 1
      });

      if (existingAssignedMessage && existingAssignedMessage.assigned_to) {
        assignedTo = existingAssignedMessage.assigned_to;
        console.log('👤 Inheriting assigned_to from existing message:', assignedTo, 'for phone:', toPhone);
      }

      await WhatsAppMessage.create({
        message_id: sentMessageId,
        from_number: 'me',
        to_number: toPhone,
        body: message,
        timestamp: Math.floor(Date.now() / 1000),
        received_at: new Date().toISOString(),
        direction: 'outgoing',
        message_type: 'text',
        status: 'sent',
        agent_id: agentId || 'wa4-system',
        is_read: true, // Outgoing messages are considered read
        chat_status: 'open', // New messages are open by default
        assigned_to: assignedTo, // Inherit assigned_to if chat is already assigned
        instance: 'wa4' // Set instance to wa4 for wa-socket-v4
      });
      console.log('💾 Sent message saved to database', assignedTo ? `(assigned to ${assignedTo})` : '');
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

wa4Router.get('/init', (req, res) => {
  try {
    client.initialize();
    res.json({ success: true, message: 'WhatsApp client initialization started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

wa4Router.get('/logout', async (req, res) => {
  try {
    await client.logout();
    res.json({ success: true, message: 'WhatsApp client logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

wa4Router.get('/scan', (req, res) => {
  res.sendFile(__dirname + '/scan.html');
});

wa4Router.get('/cleanup-auth', (req, res) => {
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

wa4Router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

wa4Router.get('/messages', (req, res) => {
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

// New endpoint: Get messages by instance
wa4Router.get('/api/whatsapp/messages-by-instance/:instance', async (req, res) => {
  try {
    const { instance } = req.params;
    const { includeClosed } = req.query;
    console.log(`📥 Fetching messages from instance ${instance}, includeClosed:`, includeClosed);

    // Build query conditions
    const whereClause = {
      instance: instance
    };

    if (includeClosed !== 'true') {
      // Only show open messages by default
      whereClause.chat_status = 'open';
    }

    const dbMessages = await WhatsAppMessage.findAll({
      where: whereClause,
      order: [
        ['received_at', 'ASC'],
        ['id', 'ASC']
      ]
    });

    console.log(`📊 Found ${dbMessages.length} messages from instance ${instance}`);

    // Transform messages to match expected format
    const transformedMessages = dbMessages.map(msg => ({
      id: msg.message_id,
      from: msg.from_number === 'me' ? 'me' : `${msg.from_number}@c.us`,
      to: msg.to_number ? `${msg.to_number}@c.us` : null,
      body: msg.body,
      timestamp: msg.timestamp,
      receivedAt: msg.received_at,
      type: msg.direction === 'outgoing' ? 'sent' : 'received',
      hasMedia: !!msg.media_data,
      media: msg.media_data ? (typeof msg.media_data === 'string' ? JSON.parse(msg.media_data) : msg.media_data) : null,
      is_read: msg.is_read,
      chat_status: msg.chat_status,
      instance: msg.instance || 'wa4'
    }));

    return res.json({
      success: true,
      messages: transformedMessages,
      instance: instance,
      count: transformedMessages.length
    });
  } catch (error) {
    console.error('❌ Error fetching messages by instance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// New endpoint: Get messages from database (for chat_v2)
wa4Router.get('/api/whatsapp/messages/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { includeClosed } = req.query; // Allow fetching closed messages for history view
    console.log('📥 Fetching messages from database for phone:', phone, 'includeClosed:', includeClosed);

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

    // Get messages from database
    const phoneVariants = Array.from(variants);

    // Build query conditions
    const queryConditions = [
      // Incoming messages: from this phone to me (or null)
      {
        from_number: { [Op.in]: phoneVariants },
        direction: 'incoming'
      },
      // Outgoing messages: from me to this phone
      {
        from_number: 'me',
        to_number: { [Op.in]: phoneVariants },
        direction: 'outgoing'
      }
    ];

    // Build where clause - include closed messages if requested
    const whereClause = {
      [Op.or]: queryConditions
    };

    if (includeClosed !== 'true') {
      // Only show open messages by default
      whereClause.chat_status = 'open';
    } else {
      // When includeClosed=true, show both open and closed messages
      // This allows viewing closed messages in history view
      whereClause.chat_status = { [Op.in]: ['open', 'closed'] };
    }

    const dbMessages = await WhatsAppMessage.findAll({
      where: whereClause,
      order: [
        ['received_at', 'ASC'],
        ['id', 'ASC'] // Use ID as tiebreaker for messages with same timestamp
      ]
    });

    console.log('📊 Found', dbMessages.length, 'messages in database for phone:', phone);

    // Debug: Log message order before transformation
    if (dbMessages.length > 0) {
      console.log('📋 Messages order from DB (wa4Router):');
      dbMessages.forEach((msg, idx) => {
        console.log(`  ${idx + 1}. ${msg.direction} | received_at: ${msg.received_at} | timestamp: ${msg.timestamp} | body: ${msg.body?.substring(0, 30)}`);
      });
    }

    // Transform database messages to format expected by frontend
    const transformedMessages = dbMessages.map((msg, index) => {
      const fromPhone = msg.from_number === 'me' ? 'me' :
        (msg.from_number ? `${msg.from_number}@c.us` : '');
      const toPhone = msg.to_number ? `${msg.to_number}@c.us` : '';

      // Use received_at only for sorting (most reliable)
      const receivedAtDate = msg.received_at ? new Date(msg.received_at) : new Date();
      const receivedAtMs = receivedAtDate.getTime();

      // Safely parse media_data JSON
      let mediaData = null;
      if (msg.media_data) {
        try {
          // Try to parse as JSON
          if (typeof msg.media_data === 'string') {
            // Check if it's already a JSON string
            const trimmed = msg.media_data.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
              mediaData = JSON.parse(msg.media_data);
            } else {
              // If it's not JSON, treat as plain string or URL
              console.warn(`⚠️ media_data is not JSON for message ${msg.message_id}:`, msg.media_data.substring(0, 50));
              mediaData = { data: msg.media_data, url: msg.media_data };
            }
          } else if (typeof msg.media_data === 'object') {
            // Already an object, use directly
            mediaData = msg.media_data;
          }
        } catch (parseError) {
          console.error(`❌ Failed to parse media_data for message ${msg.message_id}:`, parseError.message);
          console.error(`❌ media_data value:`, msg.media_data?.substring ? msg.media_data.substring(0, 100) : msg.media_data);
          // If parsing fails, try to use as URL or data
          mediaData = { data: msg.media_data, url: typeof msg.media_data === 'string' ? msg.media_data : null };
        }
      }

      return {
        id: msg.message_id,
        from: fromPhone,
        to: toPhone,
        body: msg.body || '',
        timestamp: Math.floor(receivedAtMs / 1000), // Convert received_at to Unix timestamp in seconds
        hasMedia: msg.message_type === 'image' || msg.message_type === 'media' || !!msg.media_data,
        receivedAt: msg.received_at || new Date().toISOString(),
        type: msg.direction === 'outgoing' ? 'sent' : 'received',
        media: mediaData,
        media_data: msg.media_data || null, // Include raw media_data for fallback parsing
        message_type: msg.message_type || null, // Include message_type for type detection
        agentId: msg.agent_id || null,
        agent_id: msg.agent_id || null, // Also include as agent_id for compatibility
        instance: msg.instance || 'wa4', // Include instance from database
        chat_status: msg.chat_status || null, // Include chat_status from database
        is_pending: msg.is_pending || false, // Include is_pending from database
        _sortIndex: index // Additional sort index from database
      };
    });

    // Filter is already done by database query, but ensure all messages match
    // The query already filters correctly, so we can use all transformed messages
    const phoneMessages = transformedMessages;

    // Sort messages by received_at only (most reliable) to ensure chronological order
    // This prevents grouping by type - messages will appear in exact time order
    phoneMessages.sort((a, b) => {
      // Primary sort: received_at in milliseconds
      const timeA = new Date(a.receivedAt || 0).getTime();
      const timeB = new Date(b.receivedAt || 0).getTime();

      if (timeA !== timeB) {
        return timeA - timeB;
      }

      // If timestamps are equal, use sort index from database query
      if (a._sortIndex !== undefined && b._sortIndex !== undefined) {
        return a._sortIndex - b._sortIndex;
      }

      // Final fallback: use ID
      return (a.id || '').localeCompare(b.id || '');
    });

    // Debug: Log message order after sorting
    if (phoneMessages.length > 0) {
      phoneMessages.forEach((msg, idx) => {
        console.log(`  ${idx + 1}. ${msg.type} | receivedAt: ${msg.receivedAt} | timestamp: ${msg.timestamp} | body: ${msg.body?.substring(0, 30)}`);
      });
    }

    // Remove temporary sort index before sending
    phoneMessages.forEach(msg => delete msg._sortIndex);

    console.log('✅ Returning', phoneMessages.length, 'filtered messages for phone:', phone);

    res.json({
      success: true,
      messages: phoneMessages,
      count: phoneMessages.length,
      phone: phone,
      source: 'database'
    });
  } catch (error) {
    console.error('❌ Error fetching messages from database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages from database',
      error: error.message
    });
  }
});

wa4Router.get('/messages/:phone', (req, res) => {
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

// API routes
wa4Router.get('/api/api-keys', async (req, res) => {
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

wa4Router.get('/api/api-keys/:service', async (req, res) => {
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

wa4Router.post('/api/api-keys', async (req, res) => {
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

wa4Router.post('/api/api-keys/test/:service', async (req, res) => {
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

// Serve socket.io.js for /wa4 (Apache ProxyPass removes /wa4 prefix)
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

// Use wa4Router for /wa4 path
app.use('/wa4', wa4Router);

app.use('/', wa4Router);

// WhatsApp Client Setup - Konfigurasi Stabil untuk Node.js v18
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "wa-socket-v4"
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

// Function to save message to database
const saveMessageToDatabase = async (messageData) => {
  try {
    // ('💾 Attempting to save message to database:', {
    //   message_id: messageData.id,
    //   from: messageData.from,
    //   body: messageData.body?.substring(0, 50) + '...',
    //   direction: messageData.from === 'me' ? 'outgoing' : 'incoming'
    // });

    const phone = messageData.from.replace('@c.us', '');

    // Check if chat is assigned - get assigned_to from existing messages
    let assignedTo = null;
    let chatStatus = 'open'; // Default to open
    let isRatingMessage = false;
    let isPending = false; // Default to false

    if (phone !== 'me') {
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

      // Check if message is a rating (1-5) - only single digit 1, 2, 3, 4, or 5
      const messageBody = (messageData.body || '').trim();
      isRatingMessage = /^[1-5]$/.test(messageBody);

      // Check if chat has closed messages (chat was previously closed)
      const hasClosedMessages = await WhatsAppMessage.findOne({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { from_number: { [Op.in]: phoneVariants } },
                { to_number: { [Op.in]: phoneVariants } }
              ]
            },
            { chat_status: 'closed' },
            { instance: 'wa4' }
          ]
        },
        attributes: ['id'],
        limit: 1
      });

      // If message is rating (1-5) AND chat has closed messages, keep it closed
      if (isRatingMessage && hasClosedMessages) {
        chatStatus = 'closed';
        console.log('⭐ Rating message detected (1-5) for closed chat - keeping chat closed for phone:', phone);
      }

      // Check if any existing message for this phone has assigned_to (only for open chats)
      const existingAssignedMessage = await WhatsAppMessage.findOne({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { from_number: { [Op.in]: phoneVariants } },
                { to_number: { [Op.in]: phoneVariants } }
              ]
            },
            { chat_status: 'open' },
            { assigned_to: { [Op.ne]: null } }
          ]
        },
        attributes: ['assigned_to'],
        order: [['received_at', 'DESC']],
        limit: 1
      });

      if (existingAssignedMessage && existingAssignedMessage.assigned_to) {
        // assigned_to can be comma-separated (multiple agents)
        assignedTo = existingAssignedMessage.assigned_to;
        console.log('👤 Inheriting assigned_to from existing message:', assignedTo, 'for phone:', phone);
      }

      // Check if chat is pending - if latest message has is_pending = 1, inherit it
      const latestPendingMessage = await WhatsAppMessage.findOne({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { from_number: { [Op.in]: phoneVariants } },
                { to_number: { [Op.in]: phoneVariants } }
              ]
            },
            { chat_status: 'open' },
            { instance: 'wa4' }
          ]
        },
        order: [['received_at', 'DESC'], ['id', 'DESC']],
        attributes: ['is_pending'],
        limit: 1
      });

      if (latestPendingMessage && latestPendingMessage.is_pending === true) {
        isPending = true;
        //('⏸️ Inheriting is_pending = true from latest message for phone:', phone);
      }
    }

    // Extract rating value if it's a rating message
    let ratingValue = null;
    if (isRatingMessage) {
      ratingValue = parseInt((messageData.body || '').trim(), 10);
      console.log('⭐ Rating value extracted:', ratingValue, 'for phone:', phone);
    }

    // Prepare data for insert
    const fromNumber = messageData.from.replace('@c.us', '');
    const toNumber = messageData.to ? messageData.to.replace('@c.us', '') : null;
    const messageBody = messageData.body || null;
    const mediaData = messageData.media ? JSON.stringify(messageData.media) : null;
    const messageType = messageData.hasMedia ? 'image' : 'text';
    const direction = messageData.from === 'me' ? 'outgoing' : 'incoming';
    const timestamp = Math.floor(new Date(messageData.timestamp).getTime() / 1000);

    // Convert received_at to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
    let receivedAt = messageData.receivedAt || new Date().toISOString();
    // Convert ISO string to MySQL datetime format
    if (receivedAt.includes('T')) {
      const dateObj = new Date(receivedAt);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');
      receivedAt = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const agentId = messageData.agentId || null;
    const chatSessionId = messageData.chatSessionId || null;
    const isRead = messageData.from === 'me' ? 1 : 0;

    // Use raw SQL INSERT query (like phpMyAdmin) to ensure rating is inserted
    if (isRatingMessage && ratingValue) {
      // Insert with rating using raw SQL
      // Include createdAt and updatedAt (required by Sequelize timestamps)
      const insertSql = `
        INSERT INTO whatsapp_messages (
          message_id, from_number, to_number, body, rating, media_data,
          message_type, direction, timestamp, received_at, agent_id,
          chat_session_id, status, is_read, chat_status, is_pending, assigned_to, instance,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // Use receivedAt for createdAt and updatedAt (same timestamp)
      const insertValues = [
        messageData.id,
        fromNumber,
        toNumber,
        messageBody,
        ratingValue, // Rating value (1-5)
        mediaData,
        messageType,
        direction,
        timestamp,
        receivedAt,
        agentId,
        chatSessionId,
        'sent',
        isRead,
        chatStatus,
        isPending ? 1 : 0, // is_pending (1 if true, 0 if false)
        assignedTo,
        'wa4',
        receivedAt, // createdAt
        receivedAt  // updatedAt
      ];

      try {
        const [insertResult] = await db.query(insertSql, {
          replacements: insertValues
        });
        console.log('✅ Message with rating saved using raw SQL, ID:', insertResult.insertId || 'N/A', 'Rating:', ratingValue);
      } catch (sqlError) {
        console.error('❌ Error inserting with raw SQL, falling back to Sequelize:', sqlError);
        // Fallback to Sequelize if raw SQL fails
        const savedMessage = await WhatsAppMessage.create({
          message_id: messageData.id,
          from_number: fromNumber,
          to_number: toNumber,
          body: messageBody,
          rating: ratingValue,
          media_data: messageData.media || null,
          message_type: messageType,
          direction: direction,
          timestamp: timestamp,
          received_at: receivedAt,
          agent_id: agentId,
          chat_session_id: chatSessionId,
          status: 'sent',
          is_read: messageData.from === 'me' ? true : false,
          chat_status: chatStatus,
          is_pending: isPending,
          assigned_to: assignedTo,
          instance: 'wa4'
        });
        //('✅ Message saved using Sequelize fallback, ID:', savedMessage.id, 'Rating:', ratingValue);
      }
    } else {
      // Normal insert without rating using Sequelize
      const savedMessage = await WhatsAppMessage.create({
        message_id: messageData.id,
        from_number: fromNumber,
        to_number: toNumber,
        body: messageBody,
        rating: null, // No rating
        media_data: messageData.media || null,
        message_type: messageType,
        direction: direction,
        timestamp: timestamp,
        received_at: receivedAt,
        agent_id: agentId,
        chat_session_id: chatSessionId,
        status: 'sent',
        is_read: messageData.from === 'me' ? true : false,
        chat_status: chatStatus,
        is_pending: isPending,
        assigned_to: assignedTo,
        instance: 'wa4'
      });
      //('✅ Message saved to database with ID:', savedMessage.id, assignedTo ? `(assigned to ${assignedTo})` : '');
    }
  } catch (error) {
    console.error('❌ Error saving message to database:', error);
    console.error('❌ Message data:', messageData);
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
    //('💾 Calling saveMessageToDatabase...');
    await saveMessageToDatabase(data);

    //('📨 Pesan masuk dari:', message.from);
    //('📝 Isi pesan:', message.body);

    // Emit to socket clients FIRST for real-time display
    io.emit('message', data);

    // AI response disabled - manual replies only

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
      const toPhone = normalizedPhone.replace('@c.us', '');

      // Inherit assigned_to from existing open messages for this phone
      let assignedTo = null;
      const digitsOnly = (str) => (str || '').replace(/\D/g, '');
      const raw = digitsOnly(toPhone);
      const variants = new Set();
      if (raw) {
        variants.add(raw);
        if (raw.startsWith('62')) variants.add('0' + raw.slice(2));
        if (raw.startsWith('0')) variants.add('62' + raw.slice(1));
        if (!raw.startsWith('62')) variants.add('62' + raw);
      }

      const phoneVariants = Array.from(variants);

      // Check if any existing message for this phone has assigned_to
      const existingAssignedMessage = await WhatsAppMessage.findOne({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { from_number: { [Op.in]: phoneVariants } },
                { to_number: { [Op.in]: phoneVariants } }
              ]
            },
            { chat_status: 'open' },
            { assigned_to: { [Op.ne]: null } }
          ]
        },
        attributes: ['assigned_to'],
        order: [['received_at', 'DESC']],
        limit: 1
      });

      if (existingAssignedMessage && existingAssignedMessage.assigned_to) {
        assignedTo = existingAssignedMessage.assigned_to;
        console.log('👤 Inheriting assigned_to from existing message for media:', assignedTo, 'for phone:', toPhone);
      }

      await WhatsAppMessage.create({
        message_id: result.id._serialized,
        from_number: 'me',
        to_number: toPhone,
        body: `[MEDIA] ${media.filename}`,
        media_data: JSON.stringify(media),
        message_type: 'media',
        direction: 'outgoing',
        timestamp: Math.floor(Date.now() / 1000),
        received_at: new Date().toISOString(),
        agent_id: agentId || 'react-app',
        is_read: true, // Media messages are considered read
        chat_status: 'open', // New messages are open by default
        assigned_to: assignedTo, // Inherit assigned_to if chat is already assigned
        instance: 'wa4' // Set instance to wa4 for wa-socket-v4
      });
      console.log('💾 Media message saved to database', assignedTo ? `(assigned to ${assignedTo})` : '');
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
      console.log(`WhatsApp Socket Server v1 running on port ${port}`);

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

    // Simple query to get unread messages (only from open chats, wa4 instance)
    const unreadMessages = await WhatsAppMessage.findAll({
      where: {
        direction: 'incoming',
        is_read: false,
        chat_status: 'open', // Only count unread from open chats
        instance: 'wa4' // Only count unread messages from wa4 instance
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
// This endpoint is duplicated from wa4Router for direct access
app.get('/api/whatsapp/messages/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log('📥 Fetching messages from database (main router) for phone:', phone);

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

    // Get messages from database
    const phoneVariants = Array.from(variants);

    // Build query conditions
    const queryConditions = [
      // Incoming messages: from this phone to me
      {
        from_number: { [Op.in]: phoneVariants },
        direction: 'incoming'
      },
      // Outgoing messages: from me to this phone
      {
        from_number: 'me',
        to_number: { [Op.in]: phoneVariants },
        direction: 'outgoing'
      }
    ];

    const dbMessages = await WhatsAppMessage.findAll({
      where: {
        [Op.or]: queryConditions,
        chat_status: 'open' // Only show messages with open status
      },
      order: [
        ['received_at', 'ASC'],
        ['id', 'ASC'] // Use ID as tiebreaker for messages with same timestamp
      ]
    });

    console.log('📊 Found', dbMessages.length, 'messages in database for phone:', phone);

    // Transform database messages to format expected by frontend
    const transformedMessages = dbMessages.map((msg, index) => {
      const fromPhone = msg.from_number === 'me' ? 'me' :
        (msg.from_number ? `${msg.from_number}@c.us` : '');
      const toPhone = msg.to_number ? `${msg.to_number}@c.us` : '';

      // Use received_at only for sorting (most reliable)
      const receivedAtDate = msg.received_at ? new Date(msg.received_at) : new Date();
      const receivedAtMs = receivedAtDate.getTime();

      return {
        id: msg.message_id,
        from: fromPhone,
        to: toPhone,
        body: msg.body || '',
        timestamp: Math.floor(receivedAtMs / 1000), // Convert received_at to Unix timestamp in seconds
        hasMedia: msg.message_type === 'image' || msg.message_type === 'media' || !!msg.media_data,
        receivedAt: msg.received_at || new Date().toISOString(),
        type: msg.direction === 'outgoing' ? 'sent' : 'received',
        media: msg.media_data ? JSON.parse(msg.media_data) : null,
        agentId: msg.agent_id || null,
        is_pending: msg.is_pending || false, // Include is_pending from database
        _sortIndex: index // Additional sort index from database
      };
    });

    // Sort messages by received_at only (most reliable) to ensure chronological order
    // This prevents grouping by type - messages will appear in exact time order
    transformedMessages.sort((a, b) => {
      // Primary sort: received_at in milliseconds
      const timeA = new Date(a.receivedAt || 0).getTime();
      const timeB = new Date(b.receivedAt || 0).getTime();

      if (timeA !== timeB) {
        return timeA - timeB;
      }

      // If timestamps are equal, use sort index from database query
      if (a._sortIndex !== undefined && b._sortIndex !== undefined) {
        return a._sortIndex - b._sortIndex;
      }

      // Final fallback: use ID
      return (a.id || '').localeCompare(b.id || '');
    });

    // Debug: Log message order after sorting
    if (transformedMessages.length > 0) {
      console.log('📋 Messages order after sorting (main router):');
      transformedMessages.forEach((msg, idx) => {
        console.log(`  ${idx + 1}. ${msg.type} | receivedAt: ${msg.receivedAt} | timestamp: ${msg.timestamp} | body: ${msg.body?.substring(0, 30)}`);
      });
    }

    // Remove temporary sort index before sending
    transformedMessages.forEach(msg => delete msg._sortIndex);

    console.log('✅ Returning', transformedMessages.length, 'messages for phone:', phone);

    res.json({
      success: true,
      messages: transformedMessages,
      count: transformedMessages.length,
      phone: phone,
      source: 'database'
    });
  } catch (error) {
    console.error('❌ Error fetching messages from database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages from database',
      error: error.message
    });
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

// Get unread count for a specific phone number (wa4 instance)
wa4Router.get('/api/whatsapp/unread-count/:phone', async (req, res) => {
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
        instance: 'wa4', // Only count unread messages from wa4 instance
        is_read: false,
        chat_status: 'open' // Only count unread from open chats
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Get assigned status for a phone number
wa4Router.get('/api/whatsapp/assigned-status/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log('📋 Checking assigned status for phone:', phone);

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

// Duplicate endpoint for main router
app.get('/api/whatsapp/assigned-status/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log('📋 Checking assigned status for phone:', phone);

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
wa4Router.post('/api/whatsapp/assign-chat/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID is required'
      });
    }

    console.log('👤 Assigning chat to agent:', phone, '->', agentId);

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
        console.log('➕ Appending agent', agentId, 'to existing assigned agents:', existingMessage.assigned_to, '->', newAssignedTo);
      } else {
        // Agent already assigned, no change needed
        newAssignedTo = existingMessage.assigned_to;
        console.log('ℹ️ Agent', agentId, 'already in assigned list:', newAssignedTo);
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
          chat_status: 'open' // Only assign open chats
        }
      }
    );

    console.log('✅ Updated', affectedRows, 'messages assigned to agents', newAssignedTo, 'for phone:', phone);

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

// Duplicate endpoint for main router - supports multiple agents (comma-separated)
app.post('/api/whatsapp/assign-chat/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID is required'
      });
    }

    console.log('👤 Assigning chat to agent:', phone, '->', agentId);

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
        console.log('➕ Appending agent', agentId, 'to existing assigned agents:', existingMessage.assigned_to, '->', newAssignedTo);
      } else {
        // Agent already assigned, no change needed
        newAssignedTo = existingMessage.assigned_to;
        console.log('ℹ️ Agent', agentId, 'already in assigned list:', newAssignedTo);
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
          chat_status: 'open' // Only assign open chats
        }
      }
    );

    console.log('✅ Updated', affectedRows, 'messages assigned to agents', newAssignedTo, 'for phone:', phone);

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

// Mark messages as read for a specific phone number (wa4 instance)
wa4Router.post('/api/whatsapp/mark-read/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log('📖 Marking messages as read for phone (wa4):', phone);

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

    const fromNumberWhere = { [Op.in]: Array.from(variants) };

    // Find unread messages (only for wa4 instance)
    const unreadMessages = await WhatsAppMessage.findAll({
      where: {
        from_number: fromNumberWhere,
        direction: 'incoming',
        instance: 'wa4', // Only mark messages from wa4 instance
        [Op.or]: [
          { is_read: false },
          { is_read: 0 },
          { is_read: null }
        ]
      },
      attributes: ['id', 'from_number', 'direction', 'is_read'],
      raw: true
    });

    console.log('📖 Unread messages (wa4, before update):', unreadMessages.length);

    // Update by id
    const idsToUpdate = unreadMessages.map(m => m.id);
    let totalAffected = 0;
    if (idsToUpdate.length > 0) {
      const [affected] = await WhatsAppMessage.update(
        { is_read: true },
        {
          where: {
            id: { [Op.in]: idsToUpdate },
            instance: 'wa4' // Ensure only wa4 messages are updated
          }
        }
      );
      totalAffected = affected;
      console.log('📖 Rows affected (wa4, by id):', totalAffected);
    }

    // Fallback: update by condition if no rows affected
    if (totalAffected === 0) {
      const [affected] = await WhatsAppMessage.update(
        { is_read: true },
        {
          where: {
            from_number: fromNumberWhere,
            direction: 'incoming',
            instance: 'wa4', // Only update wa4 messages
            [Op.or]: [
              { is_read: false },
              { is_read: 0 },
              { is_read: null }
            ]
          }
        }
      );
      totalAffected = affected;
      console.log('📖 Rows affected (wa4, by condition):', totalAffected);
    }

    // Emit to all connected clients for real-time sync
    io.emit('messagesRead', {
      phone: phone,
      unreadCount: 0,
      instance: 'wa4'
    });

    res.json({
      success: true,
      message: 'Messages marked as read',
      rowsAffected: totalAffected,
      instance: 'wa4',
      normalizedFromNumbers: Array.from(variants)
    });
  } catch (error) {
    console.error('❌ Error marking messages as read (wa4):', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Update chat status to closed (for solve chat functionality)
wa4Router.post('/api/whatsapp/close-chat/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log('🔒 Closing chat for phone:', phone);

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

    // Update all messages for this phone to closed status and set is_pending = 0 (only for wa4 instance)
    const [affectedRows] = await WhatsAppMessage.update(
      { chat_status: 'closed', is_pending: false },
      {
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { from_number: { [Op.in]: phoneVariants } },
                { to_number: { [Op.in]: phoneVariants } }
              ]
            },
            { instance: 'wa4' } // Only update messages from wa4 instance
          ]
        }
      }
    );

    console.log('✅ Updated', affectedRows, 'messages to closed status for phone:', phone, '(wa4 instance)');

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

// Pending chat endpoint for wa4 instance
wa4Router.post('/api/whatsapp/pending-chat/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    //('⏸️ Pending chat for phone:', phone);

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

    // Update all messages for this phone to pending status (only for wa4 instance)
    // Set is_pending to true instead of changing chat_status
    const [affectedRows] = await WhatsAppMessage.update(
      { is_pending: true },
      {
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { from_number: { [Op.in]: phoneVariants } },
                { to_number: { [Op.in]: phoneVariants } }
              ]
            },
            { instance: 'wa4' } // Only update messages from wa4 instance
          ]
        }
      }
    );

    console.log('✅ Updated', affectedRows, 'messages to pending status for phone:', phone, '(wa4 instance)');

    res.json({
      success: true,
      message: 'Chat pending successfully',
      phone: phone,
      affectedRows: affectedRows
    });
  } catch (error) {
    console.error('❌ Error pending chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pending chat',
      error: error.message
    });
  }
});

// Get closed WhatsApp chats (for chat history)
wa4Router.get('/api/whatsapp/closed-chats', async (req, res) => {
  try {
    console.log('📥 Fetching closed WhatsApp chats from database');

    // Get phone numbers that have closed messages (for history view)
    // Include ALL phones with closed messages, even if they also have open messages
    // This ensures history shows all chats that were ever closed

    // Get phones with closed messages and their latest closed message (only for wa4 instance)
    const closedMessages = await WhatsAppMessage.findAll({
      where: {
        chat_status: 'closed',
        instance: 'wa4' // Only get closed chats from wa4 instance
      },
      attributes: [
        'from_number',
        'to_number',
        'instance',
        [Sequelize.fn('MAX', Sequelize.col('received_at')), 'last_message_time'],
        [Sequelize.fn('MAX', Sequelize.col('body')), 'last_message']
      ],
      group: ['from_number', 'to_number', 'instance'],
      raw: true
    });

    // Build set of phones from closed messages
    const phoneToLatestClosed = new Map();
    closedMessages.forEach(msg => {
      let phone = msg.from_number !== 'me' ? msg.from_number : msg.to_number;
      if (phone && (!phoneToLatestClosed.has(phone) ||
        new Date(msg.last_message_time) > new Date(phoneToLatestClosed.get(phone).lastMessageTime))) {
        phoneToLatestClosed.set(phone, {
          lastMessage: msg.last_message || 'No message',
          lastMessageTime: msg.last_message_time,
          instance: msg.instance || 'wa4' // Include instance from database
        });
      }
    });

    // Include ALL phones that have closed messages (for history view)
    const phonesArray = Array.from(phoneToLatestClosed.keys());
    const closedPhonesOnly = [];

    if (phonesArray.length > 0) {
      // Include ALL phones that have closed messages (don't filter out those with open messages)
      phoneToLatestClosed.forEach((data, phone) => {
        closedPhonesOnly.push({
          phone: phone,
          chat_id: `whatsapp-${phone}`,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime,
          status: 'closed',
          instance: data.instance || 'wa4', // Include instance from database
          hasOpenMessages: false // Will be set below if needed
        });
      });

      // Check which phones also have open messages (for reference only, still include them)
      const openFromNumbers = await WhatsAppMessage.findAll({
        where: {
          from_number: { [Op.in]: phonesArray },
          chat_status: 'open',
          instance: 'wa4' // Only check open messages from wa4 instance
        },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('from_number')), 'phone']],
        raw: true
      });

      const openToNumbers = await WhatsAppMessage.findAll({
        where: {
          to_number: { [Op.in]: phonesArray },
          chat_status: 'open',
          instance: 'wa4' // Only check open messages from wa4 instance
        },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('to_number')), 'phone']],
        raw: true
      });

      const phonesWithOpenSet = new Set();
      openFromNumbers.forEach(msg => {
        if (msg.phone && msg.phone !== 'me') phonesWithOpenSet.add(msg.phone);
      });
      openToNumbers.forEach(msg => {
        if (msg.phone) phonesWithOpenSet.add(msg.phone);
      });

      // Mark phones that also have open messages (but still include them in history)
      closedPhonesOnly.forEach(chat => {
        if (phonesWithOpenSet.has(chat.phone)) {
          chat.hasOpenMessages = true;
        }
      });
    }

    // Sort by last message time (newest first)
    closedPhonesOnly.sort((a, b) => {
      const timeA = new Date(a.lastMessageTime || 0).getTime();
      const timeB = new Date(b.lastMessageTime || 0).getTime();
      return timeB - timeA;
    });

    console.log('✅ Returning', closedPhonesOnly.length, 'closed WhatsApp chats (all phones with closed messages, including those that also have open messages)');

    res.json({
      success: true,
      chats: closedPhonesOnly,
      count: closedPhonesOnly.length
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

// Get chats list from database (aggregated from whatsapp_messages)
wa4Router.get('/api/whatsapp/chats', async (req, res) => {
  try {
    console.log('📥 Fetching WhatsApp chats list from database (wa4)');

    // Get all open messages from database
    const openMessages = await WhatsAppMessage.findAll({
      where: {
        chat_status: 'open',
        instance: 'wa4'
      },
      order: [['received_at', 'DESC']],
      raw: true
    });

    // Group messages by phone number
    const phoneToChat = new Map();

    openMessages.forEach(msg => {
      let phone = msg.from_number !== 'me' ? msg.from_number : msg.to_number;
      if (!phone) return;

      if (!phoneToChat.has(phone)) {
        // Initialize chat entry
        phoneToChat.set(phone, {
          phone: phone,
          lastMessage: msg.body || 'No message',
          lastMessageTime: msg.received_at,
          unreadCount: 0,
          instance: 'wa4',
          isAssigned: false,
          assignedTo: null
        });
      } else {
        const chat = phoneToChat.get(phone);
        // Update with latest message if this one is newer
        if (new Date(msg.received_at) > new Date(chat.lastMessageTime)) {
          chat.lastMessage = msg.body || 'No message';
          chat.lastMessageTime = msg.received_at;
        }
      }

      // Count unread messages
      if (msg.direction === 'incoming' && !msg.is_read) {
        const chat = phoneToChat.get(phone);
        chat.unreadCount = (chat.unreadCount || 0) + 1;
      }
    });

    // Handle media files - update lastMessage with descriptive text
    openMessages.forEach(msg => {
      let phone = msg.from_number !== 'me' ? msg.from_number : msg.to_number;
      if (!phone) return;

      const chat = phoneToChat.get(phone);
      if (chat && msg.received_at === chat.lastMessageTime && msg.media_data) {
        try {
          const mediaData = typeof msg.media_data === 'string' ? JSON.parse(msg.media_data) : msg.media_data;
          const mimeType = mediaData.mimetype || mediaData.mimeType || '';
          const fileName = mediaData.filename || mediaData.fileName || '';

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
        } catch (parseError) {
          console.warn('Error parsing media_data for phone', phone, ':', parseError);
          // If parsing fails, keep the original lastMessage
        }
      }
    });

    // Check assigned status for each chat (from whatsapp_messages table)
    const phonesArray = Array.from(phoneToChat.keys());
    if (phonesArray.length > 0) {
      // Get assigned_to from the most recent message for each phone
      const assignedMessages = await WhatsAppMessage.findAll({
        where: {
          [Op.or]: [
            { from_number: { [Op.in]: phonesArray }, direction: 'incoming' },
            { to_number: { [Op.in]: phonesArray }, from_number: 'me', direction: 'outgoing' }
          ],
          chat_status: 'open',
          instance: 'wa4',
          assigned_to: { [Op.ne]: null }
        },
        attributes: ['from_number', 'to_number', 'assigned_to', 'received_at'],
        order: [['received_at', 'DESC']],
        raw: true
      });

      // Group by phone and get the most recent assigned_to
      const phoneToAssigned = new Map();
      assignedMessages.forEach(msg => {
        let phone = msg.from_number !== 'me' ? msg.from_number : msg.to_number;
        if (!phone || phoneToAssigned.has(phone)) return; // Already have a more recent one

        if (msg.assigned_to) {
          phoneToAssigned.set(phone, msg.assigned_to);
        }
      });

      // Update chats with assigned status
      phoneToAssigned.forEach((assignedTo, phone) => {
        const chat = phoneToChat.get(phone);
        if (chat) {
          chat.isAssigned = true;
          chat.assignedTo = assignedTo;
        }
      });
    }

    // Convert to array and sort by last message time
    const chats = Array.from(phoneToChat.values()).sort((a, b) => {
      const timeA = new Date(a.lastMessageTime || 0).getTime();
      const timeB = new Date(b.lastMessageTime || 0).getTime();
      return timeB - timeA; // Most recent first
    });

    console.log(`📊 Found ${chats.length} chats in database (wa4)`);

    return res.json({
      success: true,
      chats: chats,
      count: chats.length,
      instance: 'wa4'
    });
  } catch (error) {
    console.error('❌ Error fetching chats from database (wa4):', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
});

// Duplicate endpoint for main router
app.get('/api/whatsapp/closed-chats', async (req, res) => {
  try {
    console.log('📥 Fetching closed WhatsApp chats from database');

    // Get phone numbers that have ONLY closed messages (no open messages)
    // Use SQL subquery to find phones that have closed messages but no open messages

    // Get phones with closed messages and their latest closed message (only for wa4 instance)
    const closedMessages = await WhatsAppMessage.findAll({
      where: {
        chat_status: 'closed',
        instance: 'wa4' // Only get closed chats from wa4 instance
      },
      attributes: [
        'from_number',
        'to_number',
        'instance',
        [Sequelize.fn('MAX', Sequelize.col('received_at')), 'last_message_time'],
        [Sequelize.fn('MAX', Sequelize.col('body')), 'last_message']
      ],
      group: ['from_number', 'to_number', 'instance'],
      raw: true
    });

    // Build set of phones from closed messages
    const phoneToLatestClosed = new Map();
    closedMessages.forEach(msg => {
      let phone = msg.from_number !== 'me' ? msg.from_number : msg.to_number;
      if (phone && (!phoneToLatestClosed.has(phone) ||
        new Date(msg.last_message_time) > new Date(phoneToLatestClosed.get(phone).lastMessageTime))) {
        phoneToLatestClosed.set(phone, {
          lastMessage: msg.last_message || 'No message',
          lastMessageTime: msg.last_message_time,
          instance: msg.instance || 'wa4' // Include instance from database
        });
      }
    });

    // Check which phones have NO open messages (using bulk query for efficiency)
    const phonesArray = Array.from(phoneToLatestClosed.keys());
    const closedPhonesOnly = [];

    if (phonesArray.length > 0) {
      // Find phones that have open messages (check both from_number and to_number, only for wa4 instance)
      const openFromNumbers = await WhatsAppMessage.findAll({
        where: {
          from_number: { [Op.in]: phonesArray },
          chat_status: 'open',
          instance: 'wa4' // Only check open messages from wa4 instance
        },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('from_number')), 'phone']],
        raw: true
      });

      const openToNumbers = await WhatsAppMessage.findAll({
        where: {
          to_number: { [Op.in]: phonesArray },
          chat_status: 'open',
          instance: 'wa4' // Only check open messages from wa4 instance
        },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('to_number')), 'phone']],
        raw: true
      });

      const phonesWithOpenSet = new Set();
      openFromNumbers.forEach(msg => {
        if (msg.phone && msg.phone !== 'me') phonesWithOpenSet.add(msg.phone);
      });
      openToNumbers.forEach(msg => {
        if (msg.phone) phonesWithOpenSet.add(msg.phone);
      });

      // Only include phones that don't have open messages
      phoneToLatestClosed.forEach((data, phone) => {
        if (!phonesWithOpenSet.has(phone)) {
          closedPhonesOnly.push({
            phone: phone,
            chat_id: `whatsapp-${phone}`,
            lastMessage: data.lastMessage,
            lastMessageTime: data.lastMessageTime,
            status: 'closed',
            instance: data.instance || 'wa4' // Include instance from database
          });
        }
      });
    }

    // Sort by last message time (newest first)
    closedPhonesOnly.sort((a, b) => {
      const timeA = new Date(a.lastMessageTime || 0).getTime();
      const timeB = new Date(b.lastMessageTime || 0).getTime();
      return timeB - timeA;
    });

    console.log('✅ Returning', closedPhonesOnly.length, 'closed WhatsApp chats (phones with only closed messages)');

    res.json({
      success: true,
      chats: closedPhonesOnly,
      count: closedPhonesOnly.length
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

// Duplicate endpoint for main router
app.post('/api/whatsapp/close-chat/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log('🔒 Closing chat for phone:', phone);

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

    // Update all messages for this phone to closed status and set is_pending = 0 (only for wa4 instance)
    const [affectedRows] = await WhatsAppMessage.update(
      { chat_status: 'closed', is_pending: false },
      {
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { from_number: { [Op.in]: phoneVariants } },
                { to_number: { [Op.in]: phoneVariants } }
              ]
            },
            { instance: 'wa4' } // Only update messages from wa4 instance
          ]
        }
      }
    );

    console.log('✅ Updated', affectedRows, 'messages to closed status for phone:', phone, '(wa4 instance)');

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

// Pending chat endpoint for all instances (dynamic instance from request)
app.post('/api/whatsapp/pending-chat/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    // Get instance from query parameter or default to wa4
    const instance = req.query.instance || req.headers['x-instance'] || 'wa4';
    //('⏸️ Pending chat for phone:', phone, 'instance:', instance);

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

    // Update all messages for this phone to pending status for the specified instance
    // Set is_pending to true instead of changing chat_status
    const [affectedRows] = await WhatsAppMessage.update(
      { is_pending: true },
      {
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { from_number: { [Op.in]: phoneVariants } },
                { to_number: { [Op.in]: phoneVariants } }
              ]
            },
            { instance: instance } // Update messages from the specified instance
          ]
        }
      }
    );

    console.log('✅ Updated', affectedRows, 'messages to pending status for phone:', phone, 'instance:', instance);

    res.json({
      success: true,
      message: 'Chat pending successfully',
      phone: phone,
      instance: instance,
      affectedRows: affectedRows
    });
  } catch (error) {
    console.error('❌ Error pending chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pending chat',
      error: error.message
    });
  }
});

// Endpoint to get agent name by ID from database
wa4Router.get('/api/whatsapp/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!agentId || isNaN(agentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }

    // Query directly from agent table using SQL
    const [results] = await db.query(
      'SELECT id, name, email FROM agent WHERE id = ? LIMIT 1',
      {
        replacements: [parseInt(agentId)]
      }
    );

    if (results && results.length > 0) {
      const agent = results[0];
      const agentName = agent.name || agent.email || null;

      if (agentName) {
        return res.json({
          success: true,
          agentId: agentId,
          agentName: agentName,
          agentData: {
            id: agent.id,
            name: agent.name,
            email: agent.email
          }
        });
      }
    }

    // Agent not found
    res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  } catch (error) {
    console.error(`❌ Error fetching agent ${req.params.agentId} from database:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent data',
      error: error.message
    });
  }
});

// Same endpoint for main app router
app.get('/api/whatsapp/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!agentId || isNaN(agentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }

    // Query directly from agent table using SQL
    const [results] = await db.query(
      'SELECT id, name, email FROM agent WHERE id = ? LIMIT 1',
      {
        replacements: [parseInt(agentId)]
      }
    );

    if (results && results.length > 0) {
      const agent = results[0];
      const agentName = agent.name || agent.email || null;

      if (agentName) {
        return res.json({
          success: true,
          agentId: agentId,
          agentName: agentName,
          agentData: {
            id: agent.id,
            name: agent.name,
            email: agent.email
          }
        });
      }
    }

    // Agent not found
    res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  } catch (error) {
    console.error(`❌ Error fetching agent ${req.params.agentId} from database:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent data',
      error: error.message
    });
  }
});

startServer();

module.exports = { client, io };
