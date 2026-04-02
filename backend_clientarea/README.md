# Backend Client Area - NestJS

Backend API untuk Client Area Chat dengan Agent menggunakan NestJS.

## Fitur

- ✅ RESTful API untuk manajemen pesan chat
- ✅ Tampilan HTML untuk balas chat dari agent
- ✅ Integrasi dengan database MySQL (tabel `backend_messages`)
- ✅ Support untuk berbagai tipe pesan (text, image, video, audio, document)
- ✅ Manajemen status chat (open/closed)
- ✅ Assignment chat ke agent
- ✅ Mark as read/unread
- ✅ Chat history dan filtering

## Teknologi

- **NestJS** - Framework Node.js
- **TypeORM** - ORM untuk database
- **MySQL** - Database
- **Handlebars** - Template engine untuk HTML views
- **PM2** - Process manager

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
```

Edit file `.env` dengan konfigurasi database Anda:
```
PORT=4001
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=chatvolution
APP_URL=https://cvbev2.genio.id
```

3. Build aplikasi:
```bash
npm run build
```

4. Jalankan aplikasi:
```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## PM2 Setup

1. Install PM2 (jika belum):
```bash
npm install -g pm2
```

2. Start aplikasi dengan PM2:
```bash
pm2 start ecosystem.config.js
```

3. Save PM2 configuration:
```bash
pm2 save
pm2 startup
```

4. Monitor aplikasi:
```bash
pm2 status
pm2 logs backend-clientarea
```

5. Restart aplikasi:
```bash
pm2 restart backend-clientarea
```

## API Endpoints

### Authentication

- `POST /login` - Login endpoint (kompatibel dengan backend_v2)
  - Request body: `{ email, password, agent_id, token, ... }`
  - Response: `{ success: true, message: '...', data: true, code: 200 }`

### Messages

- `GET /api/messages` - Get semua pesan (dengan query parameters)
- `GET /api/messages/:id` - Get pesan by ID
- `POST /api/messages` - Create pesan baru
- `PATCH /api/messages/:id` - Update pesan
- `DELETE /api/messages/:id` - Delete pesan

### Chat History

- `GET /api/messages/chat-history?from_number=xxx&to_number=xxx` - Get chat history

### Send Message

- `POST /api/messages/send?from_number=xxx` - Kirim pesan baru

### Chat Management

- `GET /api/messages/unread-count?from_number=xxx&agent_id=xxx` - Get jumlah unread messages
- `PATCH /api/messages/chat-status/:fromNumber` - Update status chat (open/closed)
- `POST /api/messages/mark-read` - Mark messages as read
- `POST /api/messages/assign-chat` - Assign chat ke agent

### HTML Views

- `GET /chat/reply?from_number=xxx&chat_session_id=xxx` - Halaman balas chat
- `POST /chat/reply?from_number=xxx` - Kirim balasan dari halaman HTML

### Client Area API (api-socket/chats)

- `POST /api-socket/chats/new` - Create new chat
- `POST /api-socket/chats/:chatId/send` - Send message in chat
- `POST /api-socket/chats/:chatId/end` - End chat
- `GET /api-socket/chats/:chatId/status` - Get chat status
- `GET /api-socket/chats/:chatId/messages` - Get messages in chat

## Query Parameters

### GET /api/messages

- `from_number` - Filter by nomor pengirim
- `to_number` - Filter by nomor penerima
- `chat_session_id` - Filter by session ID
- `chat_status` - Filter by status (open/closed)
- `assigned_to` - Filter by agent ID
- `limit` - Limit hasil (default: 100)
- `offset` - Offset untuk pagination (default: 0)

## Struktur Database

Tabel `backend_messages` dengan kolom:
- `id` (Primary Key, Auto Increment)
- `message_id` (Index, Unique)
- `from_number` (Index)
- `to_number`
- `body` (Text)
- `rating` (1-5)
- `is_read` (Boolean)
- `chat_status` (enum: open/closed)
- `is_pending` (Boolean)
- `assigned_to` (Agent ID)
- `media_data` (JSON)
- `message_type` (enum: text/image/video/audio/document)
- `direction` (enum: incoming/outgoing)
- `timestamp` (BigInt, Index)
- `received_at` (DateTime)
- `agent_id` (Agent yang mengirim)
- `name` (Nama pengirim)
- `chat_session_id` (Session identifier)
- `status` (enum: sent/delivered/read/failed)
- `instance` (Index, default: wa1)
- `perusahaan` (Nama perusahaan)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## URL Backend

Backend akan berjalan di: **https://cvbev2.genio.id/**

Pastikan reverse proxy (nginx/apache) sudah dikonfigurasi untuk mengarahkan ke port 4001.

## Development

```bash
# Watch mode
npm run start:dev

# Debug mode
npm run start:debug

# Production build
npm run build
npm run start:prod
```

## License

Private - ChatVolution

