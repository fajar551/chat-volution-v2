# Overview 2.0

-   [Welcome](#welcome)
-   [Terminology](#terminology)
-   [Features](#features)
-   [Development Stack](#development-stack)

ChatVolution merupakan platform chatting untuk memanajemen chat dengan client dari berbagai channel di dalam satu platform (all in one chatting platform). Fokus pada ChatVolution v2 ada pada fitur Client Chat, selain itu terdapat peningkatan dari segi tampilan maupun performance. <a href="/{{route}}/{{version}}/get-started/project-structure">Struktur project</a> yang digunakan pun telah diperbarui.

---

<a name="welcome"></a>

## 👋 Welcome

Selamat datang di dokumentasi ChatVolution. Dokumen ini diperuntukkan bagi developer yang berkontribusi pada project ChatVolution.

---

<a name="terminology"></a>

## 📙 Terminology

Di bawah ini merupakan glosarium yang penting dipahami oleh pembaca, atau yang umum digunakan di dalam dokumentasi ataupun aplikasi.

<table>
    <thead>
        <tr>
            <th width="20%">Istilah</th>
            <th>Deskripsi</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Company</td>
            <td>
                Perusahaan/agent dengan role company.
            </td>
        </tr>
        <tr>
            <td>Agent</td>
            <td>
                User/pengguna yang terdaftar di dalam company. Agent dapat login ke aplikasi ChatVolution. Contoh: karyawan, staff.
            </td>
        </tr>
        <tr>
            <td>User</td>
            <td>
                Dapat disebut dengan client. User adalah pengguna di luar company dan tidak dapat login di aplikasi ChatVolution. Contoh: user yang mengirimkan chat melalui WhatsApp.
            </td>
        </tr>
        <tr>
            <td>Client Area</td>
            <td>
                Halaman (page) di mana Livechat dipasang.
            </td>
        </tr>
        <tr>
            <td>Agent Area</td>
            <td>
                Halaman yang dapat diakses ketika agent berhasil login. Biasanya merujuk ke halaman di mana agent membalas chat dari client.
            </td>
        </tr>
        <tr>
            <td>Chat/Conversation</td>
            <td>
                Keseluruhan 1 baris chat pada list chat. Contoh: chat antara agent A dan Agent B, chat group A.
            </td>
        </tr>
        <tr>
            <td>Bubble Chat/Message</td>
            <td>
                Balasan pesan yang dikirim oleh agent dalam suatu chat.
            </td>
        </tr>
    </tbody>
</table>

---

<a name="features"></a>

## ⚒️ Features

Fitur-fitur yang tersedia di Chatvolution yaitu:

### Main Features

-   Client Chat
    -   Livechat
    -   Integration with Whatsapp and Telegram
    -   Send chat history to email
    -   (Soon) Quick Reply
-   (Soon) Internal Chat
    -   Private Chat
    -   Group Chat

<!-- ### Agent Features

-   <a href="/{{route}}/{{version}}/features/auth">Authentication</a>
-   User Profile
-   Manages
    -   Departments
    -   Staff
    -   Agents
    -   Topics
    -   Chat Labels
-   Setup
    -   Welcome Message
    -   Closing Message -->

---

<a name="development-stack"></a>

## 🧪Development Stack

-   <a href="https://laravel.com/docs/8.x">Laravel 8.x</a>
-   <a href="https://nodejs.org/en/download/">Node.js v16.13.1</a>
-   <a href="">PostgreSQL v14.4</a>
-   <a href="">Redis v7.0.2</a>
-   <a href="https://socket.io/">Socket.io v4.1.1</a>
-   <a href="https://expressjs.com/en/starter/installing.html">Expressjs v4.18.1</a>
