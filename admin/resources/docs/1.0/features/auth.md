# Authentication

-   [Auth Terminology](#auth-terminology)
-   [Login](#login)
-   [Register](#register)
-   [Email Verification](#verification)
-   [Resend Verification Email](#resend-verification)
-   [Forgot Password](#forgot-password)

---

<a name="auth-terminology"></a>

## Auth Terminology

### Roles

Merupakan role dari pengguna di aplikasi ChatVolution.

-   Pengguna yang dapat mengakses keseluruhan aplikasi:
    -   Admin
-   Pengguna yang berada di dalam company:
    -   Company
        -   Staff
        -   Agent
-   Pengguna yang berada di luar company:
    -   User/Client

---

<a name="login"></a>

## Login

Fitur login hanya dapat digunakan oleh agent, company, staff dan admin.
<br><br>

#### Resources:

```php
# URL
/login

# routes/web.php
/login

# Class
- app\Http\Controllers\WEB\GuestController.php

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\auth\login.blade.php

#JS
- public\js\login.js
- public\js\app\app.js

/** API */
# routes/api.php
- [POST] api/login

# Class
- app\Http\Controllers\API\AuthController
```

---

<a name="register"></a>

## Register

Register merupakan fitur untuk mendaftarkan diri sebagai `company`. Setelah berhasil melakukan register, user perlu melakukan verifikasi email sebelum dapat login ke aplikasi.

> {info} Untuk register sebagai `staff` atau `agent` dapat dilakukan oleh `company` melalui menu Manages Staff/Manages Agent

#### Resources:

```php
# URL
/register

# routes/web.php
/register

# Class
- app\Http\Controllers\WEB\GuestController.php

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\auth\register.blade.php

#JS
- public\js\app\app.js
- public\js\register.js

#Eksternal Library
- https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit

/** API */
# routes/api.php
- [POST] api/register

# Class
- app\Http\Controllers\API\AuthController
```

---

<a name="verification"></a>

## Email Verification & Complete Profile

Setelah berhasil register, langkah selanjutnya adalah melakukan verifikasi email. Email akan dikirim ke alamat email yang diinputkan ketika melakukan registrasi.
<br><br>

#### Resources:

```php
# URL
account/verify/{token}

# routes/web.php
account/verify/{token}

# Class
- app\Http\Controllers\API\AuthController.php

#CSS
- public\assets\css\custom.css

# Views
- resources\views\layouts\app-verify\complete-profile.blade.php [View Complete Profile Register]
- resources\views\layouts\app-verify\redirect-login.blade.php [View Redirect To Dashboard]
- resources\views\layouts\app-verify\app-verify.blade.php [Parent-Structur]

#JS
- \js\complete-profile.js [Profile Complete]
- \js\verif-redirect-page.js [Redirect To Home/Dashboard]


/** API */
# routes/api.php
- [PUT] api/agent/verification

# Class
- app\Http\Controllers\API\AgentController

```

---

<a name="resend-verification"></a>

## Resend Verification Email

#### Resources:

```php
/** API */
# routes/api.php
- [POST] api/agent/verification/resend

# Class
- app\Http\Controllers\API\AuthController

```

---

<a name="forgot-password"></a>

## Forgot Password

Terdiri dari 2 bagian, yaitu:

-   (1) request reset password (atur ulang kata sandi) yang akan mengirimkan email untuk mengatur ulang password,
-   (2) reset password yang akan mengubah kata sandi lama menjadi kata sandi baru.
    <br><br>

### Forgot Password

#### Resources:

```php
# URL
/forgot-password

# routes/web.php
/forgot-password

# Class
- app\Http\Controllers\WEB\GuestController.php

# Views
- resources\views\live-chat\auth\forgot-password.blade.php [Content]
- resources\views\layouts\app-verify\app-verify.blade.php [Parent-Structur]


/** API */
# routes/api.php
- [POST] api/password/forgot-password

# Class
- app\Http\Controllers\API\ForgotPasswordController
```

### Reset Password

#### Resources:

```php
# URL
/reset-password

# routes/web.php
/reset-password

# Class
- app\Http\Controllers\WEB\GuestController.php

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\auth\reset-password.blade.php

#JS
- public\js\reset-password.js
- public\js\app\app.js

/** API */
# routes/api.php
- [POST] api/password/reset

# Class
- app\Http\Controllers\API\ResetPasswordController
```
