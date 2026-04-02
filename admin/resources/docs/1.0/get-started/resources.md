# Resources

- [List of Resources](#list-of-resources)
    - [Staging Host (garuda6)](#staging)
    - [Live Host](#live)
    - [Database](#database)
    - [SMTP](#smtp)
    - [Captcha](#captcha)
    - [WHMCS](#whmcs)
    - [Activity Log](#activity-log)
    - [App URL](#app-url)
    - [Firebase](#firebase)
    - [API Rate Limit](#api-rate-limit)

Bagian ini berisi daftar sumber daya seperti key secret, akses akun, environment, dll yang digunakan pada project ChatVolution

---

<a name="list-of-resources"></a>
## List of Resources


<a name="staging"></a>
### Staging Host (garuda6)

```bash
GARUDA_HOST=103.28.12.57:2083 atau staging.chatvolution.my.id:2083
GARUDA_USERNAME=chatvolutionmy
GARUDA_PASSWORD="Y]dsFKxGh^yl"
```


<a name="live"></a>
### Live Host

```bash
LIVE_HOST=103.102.153.200:2083 atau chatvolution.my.id:2083
WHM=103.102.153.200:2087 atau chatvolution.my.id:2087
USERNAME_CPANEL=omgid
LIVE_HOST_USERNAME=chatvolutionmy
LIVE_HOST_PASSWORD="Y]dsFKxGh^yl"
```


<a name="database"></a>
### Database

Staging
```bash
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=chatvolutionmy_db_dev
DB_USERNAME=chatvolu_user
DB_PASSWORD=7!52jGvNlEVG
```

Live
```bash
DB_CONNECTION=mysql
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
```


<a name="smtp"></a>
### SMTP

```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=support@chatvolution.com
MAIL_FROM_NAME="${APP_NAME}"
```

<a name="captcha"></a>
### Captcha

```bash
CAPTCHA_SITE_KEY=6LeQHp8dAAAAAGfc0StW9QNi4a0Lt6GCH8Vv9GAY
CAPTCHA_SECRET_KEY=6LeQHp8dAAAAACsTMrWm_RrE2HKHWs3Hj-W4EH2C
```


<a name="whmcs"></a>
### WHMCS

```bash
WHMCS_URL="https://proto.qwords.com/includes/api.php"
```


<a name="activity-log"></a>
### Activity Log

```bash
ACTIVITY_LOG=enable
TELESCOPE_ENABLED=false
```


<a name="app-url"></a>
### App URL

```bash
BASE_URL="http://localhost:8000"
BASE_URL_LIVE="http://localhost:8000"
BASE_SOCKET="http://stest.chatvolution.my.id"
BASE_SOCKET="http://localhost:4000"
```


<a name="firebase"></a>
### Firebase

```bash
FIREBASE_SERVER_KEY="AAAAmeMfUpc:APA91bH4FdOXQBNlVIEqRN4dfB09h31kFnbfIjM1CsoPDzjR3DvzISueHKY47kEUiLrUMHlOHPazWAHABRdMq-tNtcL7aC1SwqmV7vM3OkVVc1UQUy0TI8Sp8GX7QknKxbL_tP5q_NXF"
FCM_API_KEY="AIzaSyCHkz2QMORYsL9U7jtRTo1rhdTemK_F0KU"
FCM_AUTH_DOMAIN="chatvolu-dev.firebaseapp.com"
FCM_PROJECT_ID="chatvolu-dev"
FCM_STORAGE_BUCKET="chatvolu-dev.appspot.com"
FCM_MESSAGING_SENDER_ID="660940477079"
FCM_APP_ID="1:660940477079:web:787a78711aabf115158fd2"
FCM_MEASURMENT_ID="G-X78WE8FLJ7"
```


<a name="api-rate-limit"></a>
### API Rate Limit

```bash
API_RATE_LIMIT_INTERNAL_CHAT_BY_IP=100
API_RATE_LIMIT_INTERNAL_CHAT_BY_USER=200
```
