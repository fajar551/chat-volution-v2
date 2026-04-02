# Middleware

- [Middleware](#middleware)

Middleware yang digunakan dalam proses development maupun deployment project.

---

<a name="middleware"></a>
## Backend Node.js

- `cors` middleware
<br>
Menggunakan dynamic url whitelist yang disimpan di dalam file `resources/origins.json`

```javascript
let corsOptions = {
    methods: ['GET', 'POST'],
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204

    origin: function(origin, callback) {
        if(whitelist.indexOf(origin) !== -1) {
            // console.log('cors allowed')
            callback(null, true)
        } else {
            // console.log('cors blocked')
            callback(new Error('Not allowed by CORS'))
        }
    }
};

let corsMiddleware = (origin, callback) => {
    callback('', corsOptions);
};

// Enable CORS
app.use(cors(corsMiddleware));
```

<br>
origins.json

```json
"https://client.chatvolution.my.id","http://client.chatvolution.my.id"
```


- `session` middleware

```javascript
// Session Middleware
const sessionMiddleware = session({
    store: new RedisStore({
        client: redisClient
    }),
    secret: 'secret key',
    saveUninitialized: true,
    resave: true,
});

app.use(sessionMiddleware);
```


- `auth` middleware

```javascript
 const auth = (req, res, next) => {
    if(!req.session.user) {
        return responseMessage(res, 403, 'User Session Required', false);
    }
    next();
};
```

Usage:
```javascript
// API - Logout
app.post('/logout', auth, async (req, res) => {
    // your code here
});
```
