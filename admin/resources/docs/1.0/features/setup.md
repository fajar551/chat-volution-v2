# Manages

-   [Welcome Message](#welcome-message)
-   [Closing Message](#closing-message)

---

<a name="welcome-message"></a>

## Welcome Message

Sebuah feature untuk mengatur message yang akan dikirim saat pertama kali agent/staff mengambil chat dari client di live chat:

### Resources:

```php
# URL
/welcome-message

# routes/web.php
/welcome-message

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\settings\setting-messages.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\setting\setting-messages.js

/* Routes API */
- [GET] /api/chat/agent/messages/default?meta=${meta}
- [POST] /api/setting

/*
    Note:
    1. api GET digunakan untuk mengambil data detail dari settings message
    2. meta digunakan untuk membedakan menu setting apa yang di request,
       value: away_message|welcome_message|closing_message
    3. api post digunakan untuk mengesave data yang dirubah dari menu setting message
*/

# Class
- app\Http\Controllers\API\SettingController
- app\Models\Setting
- App\Services\AgentOauthClientService;
- App\Services\ChatService;
```

---

<a name="closing-message"></a>

## Closing Message

Sebuah feature untuk mengatur message yang akan dikirim saat chat di solve oleh agent:

### Resources:

```php
# URL
/closing-message

# routes/web.php
/closing-message

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\settings\setting-messages.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\setting\setting-messages.js

/* Routes API */
- [GET] /api/chat/agent/messages/default?meta=${meta}
- [POST] /api/setting

/*
    Note:
    1. api GET digunakan untuk mengambil data detail dari settings message
    2. meta digunakan untuk membedakan menu setting apa yang di request,
       value: away_message|welcome_message|closing_message
    3. api post digunakan untuk mengesave data yang dirubah dari menu setting message
*/

# Class
- app\Http\Controllers\API\SettingController
- app\Models\Setting
- App\Services\AgentOauthClientService;
- App\Services\ChatService;
```
