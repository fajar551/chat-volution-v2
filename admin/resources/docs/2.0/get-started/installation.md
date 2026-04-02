# Installation

- [Laravel App](#laravel-app)
- [Node.js App](#nodejs-app)
- [Redis](#redis)

Teknologi yang digunakan aplikasi ChatVolution yaitu PHP (Laravel) dan Node.js (Express)

---

<a name="laravel-app"></a>
## Laravel App

ChatVolution membagi development aplikasi menjadi 2 bagian, yaitu frontend dan backend. Keduanya didevelop menggunakan Laravel.

<a name="clone"></a>
### Clone Project
```bash
git clone http://gitserver2.qwords.net/gina/livechat
```

<a name="setup-env"></a>
### Setup `.env`
Set environtment dengan membuat file `.env`. File `.env` dapat dibuat dengan membuat duplikat dan rename file `.env.example`, lalu sesuaikan setting (contoh: kredensial database, email, firebase).

Tipe env:
    - local
    - development
    - production

> {warning} Table migration tidak lengkap, terdapat beberapa tabel yang tidak memiliki migration.

<a name="setup-storage"></a>
### Setup Storage Directory

```
.
│
└── app/
└── ...
└── routes/
│
└── storage/
│   │
│   └── app/
│        │
│        └── public/
│            │
│            └── assets/
│                │
│                └── images/
│                │   │
│                │   └── uploads/
│                │       │
│                │       └── gravatar/       #Directory to save generated gravatar
│                │
│                └── (other file category)
│                │
│                └── oauth-private.key
│                │
│                └── oauth-public.key
```

<a name="command"></a>
### Artisan Command
Jalankan command berikut untuk install package dan setup project
```bash
composer install
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan passport:install        #Generate oauth file pada direktori storage
```

Setelah berhasil, jalankan command berikut untuk run project.
```bash
php artisan serve
```

---

<a name="nodejs-app"></a>
## Node.js App

Fitur chatting pada aplikasi menggunakan socket untuk bekerja secara realtime. Socket tersebut didevelop menggunakan Express, Socket.io, dan Redis.

<a name="clone"></a>
### Clone Project
```bash
git clone http://103.28.12.31/aep/chatvolutionV2.git
```

<a name="setup-env"></a>
### Setup `.env`
Set environtment dengan membuat file `.env`. File `.env` dapat dibuat dengan membuat duplikat dan rename file `.env.example`.

Tipe env:
    - local
    - development
    - production


<a name="command"></a>
### Command
#### Prerequisite
Pastikan sebelumnya server telah install:
    - Node.js
    - Npm
    - Redis
    - PostgreSQL

Jalankan command berikut untuk install package dan setup project
```bash
npm install
npx sequelize-cli db:migrate
```
> {info} Disarankan untuk install package via cmd jika menggunakan OS Windows


Setelah berhasil, jalankan command berikut untuk run project.
```bash
npm start
```

---

<a name="redis"></a>
## Redis

Database sementara yang digunakan untuk chatting. Setelah chatting selesai, chat akan disimpan di database (PostgreSQL) dan dihapus dari Redis.
> {info} Silakan install WSL jika menggunakan OS Windows

<a name="basic-install"></a>
### Basic Installation
Step yang dipaparkan oleh <a href="https://redis.io/docs/getting-started/installation/install-redis-on-windows">Redis</a> yaitu:
```bash
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list

sudo apt-get update
sudo apt-get install redis
```

Selanjutnya cek apakah Redis telah berhasil terinstall
```bash
redis-server --version

# Start redis server
sudo service redis-server start

# Stop redis server
sudo service redis-server stop

redis-cli
127.0.0.1:6379> ping
PONG
```

<a name="install-rejson"></a>
### Install ReJSON Module
Untuk menyimpan data chatting di Redis, diperlukan ReJSON Module.

- Install Package
```bash
apt-get install build-essential
```

- Get The Module
```bash
git clone "https://github.com/RedisJSON/RedisJSON.git"
git checkout v1.0.3
cd rejson/
make (if not work, try this: cargo build)
cd src/
mkdir /etc/redis/modules/
mv rejson.so /etc/redis/modules/
```

- Load Module
Write this script in `/etc/redis/redis.conf`
```bash
nano /etc/redis/redis.conf
# Add this
loadmodule /etc/redis/modules/rejson.so
```

- Restart Redis Server
```bash
service redis-server restart
```

- Testing
```bash
redis-cli
JSON.SET myjson . '{"name": "developer"}'
```

Reference:
- Basic command https://redis.io/docs/stack/json/
- https://redis.io/docs/getting-started/installation/install-redis-on-windows/
- https://redis.io/docs/stack/json/#building-on-ubuntu-2004
