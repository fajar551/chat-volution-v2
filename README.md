# Pemetaan URL → folder proyek

Ringkasan singkat: halaman produksi mana yang dibuild dari folder monorepo mana.

## Admin panel

| URL | Folder |
|-----|--------|
| [admin-chat.genio.id/integrations/whatsapp-agent-1](https://admin-chat.genio.id/integrations/whatsapp-agent-1) | `admin` |

## Aplikasi chat (klien)

| URL | Folder |
|-----|--------|
| [v2chat.genio.id/chat-with-client](https://v2chat.genio.id/chat-with-client) | `chat_v2` |

## Backend & soket

| Peran | Lokasi | Catatan |
|--------|--------|---------|
| Backend **live chat** | `backend_clientarea` | API / gateway untuk fitur chat |
| Backend **WhatsApp** | `wa-socket-v1`, `wa-socket-v2`, … (folder `wa-socket*`) | Proses diatur lewat **PM2** di server |

## Live Chat (dari ikon / alur live chat), itu ada di folder:

- **Frontend:** `chat_v2`
- **Backend:** `backend_clientarea`

### PM2 untuk `backend_clientarea`

Jalankan dari dalam folder **`backend_clientarea`** agar NestJS menemukan file **`.env`**:

- npm run build
- pm2 restart backend-clientarea --update-env

**Atau jika tidak berubah-rubah ke kodingan yang terbaru, coba jalankan:**

```bash
cd backend_clientarea
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 restart backend-clientarea --update-env
```