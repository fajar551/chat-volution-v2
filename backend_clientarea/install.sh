#!/bin/bash

echo "Installing Backend Client Area dependencies..."
npm install

echo "Creating .env file from example..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "Please edit .env file with your database configuration"
fi

echo "Building application..."
npm run build

echo "Setup complete!"
echo "To start the application:"
echo "  Development: npm run start:dev"
echo "  Production: npm run start:prod"
echo "  PM2: pm2 start ecosystem.config.js"

