# User Profile

-   [Show Profile](#show-profile)
-   [Edit Profile](#edit-profile)
-   [Change Password](#change-password)

---

<a name="show-profile"></a>

## Show Profile

Menampilkan profil agent (current user) yang sedang login.
<br><br>

#### Resources:

```php
# URL
/profile

# routes/web.php
/profile

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\app\live-chat\profile\profile.css
- public\assets\css\custom.css

# Views
- resources\views\live-chat\profile\profile.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\profile\profile.js

/** API */
# routes/api.php
- [GET] api/profile/show

# Class
- app\Http\Controllers\API\AgentProfileController
- app\Services\AgentService
- app\Models\Agent
```

---

<a name="edit-profile"></a>

## Edit Profile

Update informasi profil agent yang sedang login (current user).
<br><br>

#### Resources:

```php
# URL
/profile/update

# routes/web.php
/profile/update

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\profile\profile-update.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\profile\update-profile.js

/** API */
# routes/api.php
- [POST] /api/profile/update

# Class
- app\Http\Controllers\API\AgentProfileController
- app\Services\AgentService
- app\Models\Agent
```

---

<a name="change-password"></a>

## Change Password

Mengubah kata sandi agent yang sedang login (current user).
<br><br>

#### Resources:

```php
# URL
/profile/change-password

# routes/web.php
/profile/change-password

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\profile\change-password.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\profile\change-password.js

/** API */
# routes/api.php
- [PUT] /api/profile/change-password

# Class
- app\Http\Controllers\API\AgentProfileController
- app\Services\AgentService
- app\Models\Agent
```
