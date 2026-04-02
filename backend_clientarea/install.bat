@echo off
echo Installing Backend Client Area dependencies...
call npm install

echo Creating .env file from example...
if not exist .env (
    copy env.example .env
    echo Please edit .env file with your database configuration
)

echo Building application...
call npm run build

echo Setup complete!
echo To start the application:
echo   Development: npm run start:dev
echo   Production: npm run start:prod
echo   PM2: pm2 start ecosystem.config.js

pause

