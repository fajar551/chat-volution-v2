# Project Structure

- [Structure](#structure)
- [Backend](#backend-description)
- [Frontend](#frontend-description)

Pada project ChatVolution, structure project dijelaskan ke dalam 2 bagian, yaitu frontend dan backend.

---

<a name="structure"></a>
## Structure

### Laravel

```
.
│
└── app/
│   │
│   └── Helpers/                           #General helper
│   │
│   └── Http/
│   │   │
│   │   └── Controllers/
│   │   │   │
│   │   │   └── API/                       #API controller
│   │   │   │
│   │   │   └── WEB/                       #Web controller
│   │   │
│   │   └── Middleware/
│   │   │
│   │   └── Requests/                      #Validation rules stored here
│   └── Imports/
│   └── Mail/
│   └── Models/
│   └── Notifications/
│   └── Rules/                             #Custom validation rules
│   └── Services/
│   └── Traits/
│   └── User.php
│
└── config/                                #App configuration
│
└── database/                              #Migration file and seeders file
│   └── factories/
│   └── migrations/
│   │
│   └── seeders/                           #Seeder files must be stored here
│   │
│   └── seeds/                             #Old seeder file storage, the directory must be present
│
└── public/
│
└── resources/
└── routes/
└── storage/
│
└── test_client/                           #Client area of Livechat testing project
```

### Node.js


```
.
│
└── ...
│
└── resources/
│   │
│   └── origins.json                       #Whitelist website url, this file must be present, do not push to repo
│   │
│   │
```


---

<a name="backend-description"></a>
## Backend

Sebagian besar project menerapkan service pattern dalam proses development. Direktori servis terdapat pada `app/Services/`. Untuk response API dapat menggunakan traits general pattern yang terdapat pada direktori `app/Traits/`. Traits dapat digunakan pada controller maupun services.

---

<a name="frontend-description"></a>
## Frontend

Deskripsi source frontend?

- Structure FE?
- Socket?
