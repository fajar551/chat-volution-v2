# Middleware

- [Middleware](#middleware)

Middleware yang digunakan dalam proses development maupun deployment project.

---

<a name="middleware"></a>
## List Middleware

|   Middleware      |   Deskripsi   |
|       :-          |       :-      |
|   auth            |   Middleware default dari Laravel yang digunakan untuk mengidentifikasi user.   |
|   auth:api        |   Middleware default dari Laravel yang digunakan pada routes API.   |
|   role:root       |   Didapatkan dari package Spatie. Routes di bawah middleware ini hanya dapat diakses oleh user yang memiliki role root.   |
|   withClientKey   |   Untuk memvalidasi `secret key` yang dibawa oleh client.   |
|   api_time        |   Berfungsi untuk menambahkan info response time pada API response header. Info disimpan di dalam variable `X-Elapsed-Time` dengan satuan miliseconds.   |
|   throttle:api-internal-chat  |   Digunakan untuk memberikan rate limit pada API. Rate limit dihitung berdasarkan jumlah request per IP dalam 1 menit (per user jika user telah login), limit dapat diatur melalui `.env` pada variable `API_RATE_LIMIT_INTERNAL_CHAT_BY_IP` dan `API_RATE_LIMIT_INTERNAL_CHAT_BY_USER`   |
