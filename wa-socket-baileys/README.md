# wa-socket-baileys

WhatsApp Socket Server using **Baileys** library - Modern, stable WhatsApp multi-device integration.

## Why Baileys?

- ✅ **No Puppeteer/Chromium** - Lightweight and faster
- ✅ **Works with latest WhatsApp** - Not affected by WhatsApp Web breaking changes
- ✅ **Better performance** - Lower memory usage
- ✅ **Active maintenance** - Regular updates

## Features

- 📱 Multi-device WhatsApp integration (Baileys)
- 📨 Send/receive text messages
- 🖼️ Send/receive media (images, videos, documents)
- 🤖 **AI Auto-Reply** using OpenAI Assistant API (via native fetch)
- 💾 Database storage (MySQL/PostgreSQL)
- 🔌 Socket.IO real-time events
- 🔐 Session persistence
- 📊 Message history API
- 🧵 Thread management per phone number
- 🚫 Deduplication for AI responses

## AI Integration

- ✅ OpenAI API key fetched from **database** (not .env)
- ✅ Uses **native fetch API** (no `openai` npm package)
- ✅ Thread persistence per phone number
- ✅ Automatic AI replies for incoming messages
- ✅ Assistant ID configurable via env variable
- ✅ Smart deduplication to prevent duplicate replies

## Installation

```bash
cd /home/chatvolutionmy/chatvolutionV2/wa-socket-baileys

# Install dependencies
npm install

# Configure .env file with your database credentials
nano .env

# Start with PM2
pm2 start app.js --name wa-socket-baileys
pm2 logs wa-socket-baileys
```

## Configuration

Edit `.env`:
```env
PORT=4004
AUTOCONNECT_WA=1

DB_HOST=localhost
DB_NAME=your_database
DB_USERNAME=your_user
DB_PASSWORD=your_password
```

## API Endpoints

### Connection

- `GET /` - Service info
- `GET /status` - Connection status
- `GET /qr` - Get QR code for scanning
- `POST /init` - Initialize connection manually

### Messaging

- `POST /send` - Send text message
  ```json
  {
    "phone": "6281234567890",
    "message": "Hello from Baileys!"
  }
  ```

- `POST /send-media` - Send media
  ```json
  {
    "phone": "6281234567890",
    "mediaUrl": "https://example.com/image.jpg",
    "caption": "Check this out!",
    "mediaType": "image"
  }
  ```

- `GET /messages` - Get message history
  ```
  ?phone=6281234567890&limit=50&offset=0
  ```

### Management

- `POST /logout` - Logout and clear session

## Socket.IO Events

### Server → Client

- `qr` - QR code for scanning
- `status` - Connection status updates
- `message` - Incoming messages
- `authenticated` - Successful authentication

## Testing

### 1. Start Server
```bash
pm2 start app.js --name wa-socket-baileys
pm2 logs wa-socket-baileys
```

### 2. Get QR Code
```bash
curl http://localhost:4004/qr
```

Or visit scan.html in browser.

### 3. Send Test Message
```bash
curl -X POST http://localhost:4004/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"6281234567890","message":"Test from Baileys!"}'
```

## Migration from whatsapp-web.js

Key differences:

| Feature | whatsapp-web.js | Baileys |
|---------|----------------|---------|
| Browser | Puppeteer (Chromium) | None |
| Memory | High (~200MB) | Low (~50MB) |
| Fresh QR | ❌ Broken | ✅ Works |
| API | Client-based | Socket-based |
| Session | `.wwebjs_auth` | `auth_info_baileys` |

## Troubleshooting

**QR not showing:** Check logs with `pm2 logs wa-socket-baileys`

**Connection fails:** Clear session: `rm -rf auth_info_baileys` then restart

**Database errors:** Verify database credentials in `.env`

## Advantages over whatsapp-web.js

1. ✅ **Not affected by WhatsApp Web updates** (no Puppeteer dependency)
2. ✅ **Lower resource usage** (no Chromium process)
3. ✅ **Faster initialization** (direct WebSocket connection)
4. ✅ **Better error recovery** (built-in reconnection)
5. ✅ **Fresh QR scans work reliably**

## License

MIT
