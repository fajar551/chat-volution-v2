# Client Chat

-   [Integration](#integration)
-   [Quick Reply](#quick-reply)

---

Client dapat terhubung dengan agent dengan berbagai channel yang disediakan:
- <a href="#livechat">Livechat</a>
- <a href="#whatsapp">WhatsApp</a>
- <a href="#telegram">Telegram</a>

<a name="integration"></a>
## Integration
Integrasi dilakukan untuk menghubungkan website atau akun media sosial milik perusahaan agar dapat digunakan sebagai penerima chat. Integrasi hanya dapat dilakukan oleh agent dengan role "company".


<a name="livechat"></a>
### Livechat

#### Flow chart
![image](http://localhost:8000/assets/images/documentation/v2.0/flow-integrate-livechat.jpg)

#### Keterangan:
Menyimpan/menghapus domain digunakan untuk menyimpan url lengkap dari domain tersebut di `resources/origins.json`. Hal ini dilakukan agar domain tersebut dapat mengakses socket.
> {warning} Jika website tidak dapat mengakses socket setelah `origins.json` bertambah, maka restart server Node.js

1. [Sistem FE] emit ke 'manage.domain'

- Menyimpan data. Data yang dikirimkan adalah:
```json
{
      "domain": "spotify.com",
      "action": "save"
}
```

- Menghapus data. Data yang dikirimkan adalah:
```json
{
      "domain": "spotify.com",
      "action": "remove"
}
```

<a name="whatsapp"></a>
### WhatsApp

#### Flow chart
![image](http://localhost:8000/assets/images/documentation/v2.0/flow-integrate-whatsapp.jpg)

#### Keterangan:
1. [Sistem FE] emit ke 'integrate.whatsapp'
Data yang dikirimkan adalah:
```json
{
	"inputPhone": "+62878xxxxyyyy"
}
```


<a name="telegram"></a>
### Telegram

#### Flow chart
![image](http://localhost:8000/assets/images/documentation/v2.0/flow-integrate-telegram.jpg)

#### Keterangan:
1. [Sistem FE] emit ke 'integrate.telegram'
Data yang dikirimkan adalah:
```json
{
    "inputPhone":  "+62878xxxxyyyy",
    "inputApiId": 1234567,
    "inputApiHash": "ai54923799db86524cf9e350f142c00f",
    "token": "Bearer token"
}
```
2. [Sistem FE] emit ke 'integrate.telegram.submitcode'
Data yang dikirimkan adalah:
```json
{
	"inputCode": 40850
}
```

---

<a name="quick-reply"></a>
## (Soon) Quick Reply

---
