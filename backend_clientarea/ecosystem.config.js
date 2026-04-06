/**
 * PM2: jalankan dari folder backend_clientarea (Nest memuat .env lewat ConfigModule).
 *
 *   cd backend_clientarea
 *   npm run build
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *
 * Isi .env: LIVE_CHAT_ESCALATION_ADMIN_API_URL, LIVE_CHAT_ESCALATION_ADMIN_API_SECRET,
 * opsional LIVE_CHAT_ESCALATION_TO dan LIVE_CHAT_APP_BASE_URL.
 * Email eskalasi live chat tidak pakai nodemailer di Nest — hanya HTTP ke Laravel admin.
 */

module.exports = {
  apps: [
    {
      name: 'backend-clientarea',
      cwd: __dirname,
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
    },
  ],
};
