# Project Structure

- [Structure](#structure)
- [Backend](#backend-description)
- [Frontend](#frontend-description)

ChatVolution versi 2 terdiri dari beberapa repo, yaitu:
- <a href="http://gitserver2.qwords.net/gina/livechat">ChatVolution v1</a>
- <a href="http://gitserver2.qwords.net/aep/chatvolutionV2">Backend v2 (Node.js)</a>
- <a>Frontend Dashboard v2</a>
- <a>Frontend Client v2</a>

---

<a name="structure"></a>
## Structure

### Backend v2 (Node.js)

```
.
│
└── .wwebjs_auth                           #Automatically created by whatsapp package
└── client/
└── config/
└── controllers/
└── handler/
└── migrations/
└── models/
└── public/
│
└── resources/
│   │
│   └── origins.json                       #Whitelist website url, this file must be present, do not push to repo
│
└── routes/
└── services/
└── utils/
└── views/
│   │
│   │
```


---

<a name="backend-description"></a>
## Backend
Backend yang dibuat dengan menggunakan Node.js berfokus pada improvement proses chatting.
Direktori service terdapat pada `services/`.
Untuk response API dapat menggunakan function yang terdapat pada direktori `utils/response-handler.js`

---

<a name="frontend-description"></a>
## Frontend

