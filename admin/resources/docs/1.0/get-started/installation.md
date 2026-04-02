# Installation

- [Laravel App](#laravel-app)
- [Node.js App](#nodejs-app)

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

Fitur chatting pada aplikasi menggunakan socket untuk bekerja secara realtime. Socket tersebut didevelop menggunakan Express dan Socket.io.

<a name="clone"></a>
### Clone Project
```bash
git clone http://103.28.12.31/aep/socket-qchat.git
```

<a name="setup-env"></a>
### Setup `.env`
Set environtment dengan membuat file `.env`. File `.env` dapat dibuat dengan membuat duplikat dan rename file `.env_example`.

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

Jalankan command berikut untuk install package dan setup project
```bash
npm install
```
> {info} Disarankan untuk install package via cmd jika menggunakan OS Windows


Setelah berhasil, jalankan command berikut untuk run project.
```bash
npm start
```
