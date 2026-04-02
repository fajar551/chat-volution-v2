require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');

// Express Setup
const app = express();
const server = createServer(app);
const port = process.env.PORT || 4005;
const WEB_SOCKET_CV = process.env.WEB_SOCKET_CV;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
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

// Initialize global messages array
global.incomingMessages = [];

client.on('message', async (message) => {
  try {
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

    // Simpan pesan ke global array
    global.incomingMessages.push(data);

    // Batasi jumlah pesan yang disimpan (max 1000)
    if (global.incomingMessages.length > 1000) {
      global.incomingMessages = global.incomingMessages.slice(-1000);
    }

    console.log('📨 Pesan masuk dari:', message.from);
    console.log('📝 Isi pesan:', message.body);

    // Send to external webhook
    if (WEB_SOCKET_CV) {
      try {
        await axios.post(`${WEB_SOCKET_CV}/whatsapp-irsfa`, data, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('✅ Message sent to webhook');
      } catch (error) {
        console.error('❌ Error sending to webhook:', error.message);
      }
    }

    // Emit to socket clients
    io.emit('message', data);
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

app.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    const state = await client.getState();
    if (state !== 'CONNECTED') {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp is not connected. Status: ' + state
      });
    }

    const chatId = `${phone}@c.us`;
    const result = await client.sendMessage(chatId, message);

    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: result.id._serialized
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message: ' + error.message
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
    res.json({ success: true, message: 'WhatsApp logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging out: ' + error.message });
  }
});

app.get('/scan', (req, res) => {
  res.sendFile(__dirname + '/scan.html');
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint untuk mendapatkan pesan masuk
app.get('/messages', (req, res) => {
  try {
    const messages = global.incomingMessages || [];
    res.json({
      success: true,
      messages: messages,
      count: messages.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting messages: ' + error.message
    });
  }
});

// Endpoint untuk mendapatkan pesan dari nomor tertentu
app.get('/messages/:phone', (req, res) => {
  try {
    const phone = req.params.phone;
    const messages = global.incomingMessages || [];
    const filteredMessages = messages.filter(msg => msg.from === phone);

    res.json({
      success: true,
      messages: filteredMessages,
      count: filteredMessages.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting messages: ' + error.message
    });
  }
});

// Endpoint untuk clear pesan
app.delete('/messages', (req, res) => {
  try {
    global.incomingMessages = [];
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

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
server.listen(port, () => {
  console.log(`WhatsApp Socket Server v2 running on port ${port}`);

  // Auto initialize if enabled
  if (process.env.AUTOCONNECT_WA === '1') {
    console.log('Auto-connecting WhatsApp...');
    client.initialize();
  }
});

module.exports = { client, io };
