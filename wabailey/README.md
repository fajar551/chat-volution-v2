# Wabailey - WhatsApp Socket Server dengan Baileys

Server WhatsApp menggunakan Baileys library, kompatibel dengan semua routes dari wa-socket-v1.

## Instalasi

### 1. Install Dependencies

```bash
cd chatvolutionV2/wabailey
npm install
```

### 2. Setup Environment Variables

Buat file `.env` di folder `wabailey` dengan konfigurasi berikut:

```env
# Server Configuration
PORT=4003
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DIALECT=mysql

# WhatsApp Auto-Connect (optional)
AUTOCONNECT_WA=0
# Set ke 1 untuk auto-connect saat server start
# Set ke 0 untuk manual connect via /wa1/init endpoint
```

### 3. Pastikan Database Sudah Disediakan

Pastikan database MySQL/PostgreSQL sudah dibuat dan tabel-tabel berikut sudah ada:

- `whatsapp_messages`
- `api_keys`
- `chat_channel_accounts`

## Menjalankan dengan PM2

### Install PM2 (jika belum terinstall)

```bash
npm install -g pm2
```

### Menjalankan dengan PM2

Ada beberapa cara untuk menjalankan dengan PM2:

#### Cara 1: Menggunakan script npm

```bash
cd chatvolutionV2/wabailey
npm run pm2
```

#### Cara 2: Langsung dengan PM2

```bash
cd chatvolutionV2/wabailey
pm2 start app.js --name wabailey
```

#### Cara 3: Dengan konfigurasi lengkap

```bash
cd chatvolutionV2/wabailey
pm2 start app.js --name wabailey --instances 1 --exec-mode fork
```

### PM2 Commands yang Berguna

```bash
# Lihat status semua proses
pm2 list

# Lihat logs real-time
pm2 logs wabailey

# Lihat logs terakhir (100 baris)
pm2 logs wabailey --lines 100

# Restart aplikasi
pm2 restart wabailey

# Stop aplikasi
pm2 stop wabailey

# Delete aplikasi dari PM2
pm2 delete wabailey

# Monitor aplikasi (CPU, Memory)
pm2 monit

# Save PM2 process list (untuk auto-start setelah reboot)
pm2 save

# Setup PM2 untuk auto-start setelah reboot
pm2 startup
```

### Konfigurasi PM2 Ecosystem (Opsional)

Buat file `ecosystem.config.js` untuk konfigurasi yang lebih lengkap:

```javascript
module.exports = {
  apps: [
    {
      name: "wabailey",
      script: "./app.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 4003,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
```

Kemudian jalankan dengan:

```bash
pm2 start ecosystem.config.js
```

## Menjalankan Tanpa PM2 (Development)

### Development Mode (dengan nodemon)

```bash
npm run dev
```

### Production Mode (tanpa PM2)

```bash
npm start
```

## Endpoints

Semua endpoints sama dengan wa-socket-v1:

- `GET /wa1/` - Home
- `GET /wa1/status` - Status koneksi WhatsApp
- `POST /wa1/send` - Kirim pesan
- `GET /wa1/init` - Initialize/Connect WhatsApp
- `GET /wa1/logout` - Logout WhatsApp
- `GET /wa1/scan` - Halaman scan QR code
- `GET /wa1/messages` - Daftar semua pesan
- `GET /wa1/messages/:phone` - Pesan berdasarkan nomor telepon
- `GET /wa1/api/whatsapp/messages/:phone` - Pesan dari database
- `GET /wa1/api/api-keys` - Daftar API keys
- `POST /wa1/api/api-keys` - Tambah/Update API key

## Troubleshooting

### Error: Module not found

```bash
# Pastikan semua dependencies terinstall
npm install
```

### Error: Database connection failed

- Pastikan database sudah running
- Cek konfigurasi di file `.env`
- Pastikan user database memiliki akses

### Error: Port already in use

- Cek apakah port 4003 sudah digunakan aplikasi lain
- Ubah PORT di file `.env` jika perlu

### QR Code tidak muncul

- Akses `/wa1/scan` di browser
- Atau cek logs dengan `pm2 logs wabailey`
- Pastikan folder `auth_info_baileys` tidak corrupted (hapus jika perlu)

### PM2 tidak menyimpan proses setelah reboot

```bash
pm2 save
pm2 startup
# Ikuti instruksi yang muncul
```

## Catatan Penting

1. **Port**: Default port adalah 4003 (sama dengan wa1)
2. **Auth Folder**: Session WhatsApp disimpan di folder `auth_info_baileys`
3. **Media Files**: Media disimpan di folder `public/whatsapp-chat/`
4. **Database**: Pastikan database sudah disinkronkan dengan models

## Support

Untuk masalah atau pertanyaan, silakan hubungi tim development.
