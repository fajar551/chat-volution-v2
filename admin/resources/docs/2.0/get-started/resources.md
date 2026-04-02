# (WIP) Resources

- [List of Resources Backend Node.js](#list-of-resources-nodejs)
    - [Staging Host](#staging)
    - [Live Host](#live)
    - [Database](#database)
    - [Redis](#redis)
    - [App URL](#app-url)

Bagian ini berisi daftar sumber daya seperti key secret, akses akun, environment, dll yang digunakan pada project ChatVolution.

---

<a name="list-of-resources-nodejs"></a>
## List of Resources Backend Node.js


<a name="staging"></a>
### Staging Host
```bash
NODE_ENV=local
#current socket port
PORT=10001

SERVER_HOST=103.163.184.5:7800/22041205
SERVER_USERNAME=wgp31xac
SERVER_PASSWORD=""
```
Referensi: http://apps.chatvolution.id/?search=Server+Staging+Semua&own=

> {info} Change NODE_ENV to "production" when migrating database


<a name="live"></a>
### Live Host

```bash
```


<a name="database"></a>
### Database

Staging
```bash
DB_USERNAME=chatvol
DB_PASSWORD=5bS4ZGH8BfRS
DB_NAME=chatvolutionV2
DB_HOST=localhost
DB_DIALECT=postgres
```

Live
```bash
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_HOST=
DB_DIALECT=
```


<a name="redis"></a>
### Redis

Staging
```bash
REDIS_PORT=6379
REDIS_HOST="127.0.0.1"
#needs Redis >= 6
REDIS_USERNAME="default"
#REDIS_PASSWORD=""
REDIS_DB=0
```

Live
```bash
REDIS_PORT=6379
REDIS_HOST=
#needs Redis >= 6
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_DB=0
```


<a name="app-url"></a>
### App URL

```bash
#v1 url
CHATVOLUTION_V1_URL="http://staging.chatvolution.com"
FILE_STORAGE_URL="http://staging.chatvolution.com"

#current socket url
SOCMED_FILE_STORAGE_URL="http://localhost:10001"
```
