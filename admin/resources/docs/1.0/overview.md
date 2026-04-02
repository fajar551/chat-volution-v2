# Overview

-   [Welcome](#welcome)
-   [Terminology](#terminology)
-   [Features](#features)
-   [Development Stack](#development-stack)

ChatVolution merupakan platform chatting untuk memanajemen chat dengan client dari berbagai channel di dalam satu platform (all in one chatting platform). Dilengkapi dengan fitur internal chat yang dapat digunakan untuk berkomunikasi dengan rekan dalam company.

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

Wave has some bad-ass features that I think you'll really dig. Here is a list of those features as well as a quick link to each section.

### Main Features

-   Client Chat
    -   Livechat
    -   Integration with Whatsapp and Telegram
    -   Quick Reply
-   Internal Chat
    -   Private Chat
    -   Group Chat

### Agent Features

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
    -   Closing Message

---

<a name="development-stack"></a>

## 🧪Development Stack

-   <a href="https://laravel.com/docs/8.x">Laravel 8.x</a>
-   <a href="https://nodejs.org/en/download/">Node.js</a>
-   <a href="https://mariadb.org/download/?t=mariadb&p=mariadb&r=10.6.8&os=windows&cpu=x86_64&pkg=msi&m=nus">Maria DB 10.x</a>
-   <a href="https://jquery.com/download/">Jquery 3.6.x</a>
-   <a href="https://angularjs.org/">Angularjs 1.7.9</a>
-   <a href="https://getbootstrap.com/docs/4.0/getting-started/introduction/">Bootstrap 4.x</a>
-   <a href="https://socket.io/">Socket.io 3.1.x</a>
-   <a href="https://expressjs.com/en/starter/installing.html">Expressjs</a>
