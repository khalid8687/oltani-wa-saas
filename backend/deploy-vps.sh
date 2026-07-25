#!/bin/bash

# OLTANI Baileys WhatsApp Engine - Ubuntu VPS Deployment Script
echo "🚀 Starting OLTANI Backend Deployment on Ubuntu VPS..."

# 1. Update system & install Node.js 20 LTS
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential git

# 2. Install PM2 process manager
sudo npm install -g pm2

# 3. Create app directory
mkdir -p /var/www/oltani-backend
cd /var/www/oltani-backend

# 4. Copy backend files & install dependencies
npm install --production

# 5. Start app with PM2
pm2 stop oltani-backend || true
pm2 start src/server.js --name "oltani-backend"
pm2 save
pm2 startup

echo "✅ OLTANI Backend is live and running under PM2 on port 5000!"
