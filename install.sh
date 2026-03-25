#!/bin/bash

# AUTOWHATS ONE-CLICK INSTALLER
# Supported OS: Ubuntu 20.04 / 22.04
# Website: https://autowhats.com

set -e

# --- 0. LOGGING ---
LOG_FILE="/var/log/autowhats-install.log"
exec > >(tee -i "$LOG_FILE")
exec 2>&1

# --- 1. PRE-CHECKS & DEPS ---
echo "🚀 Starting AutoWhats Installation..."
echo "📝 Logs are being saved to $LOG_FILE"

if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)" 
   exit 1
fi

apt-get update
apt-get install -y curl git unzip gnupg64 build-essential ufw

# --- FIREWALL ---
echo "🟢 Configuring Firewall..."
ufw allow 3000/tcp || true
ufw allow 3001/tcp || true
ufw allow 22/tcp || true
# ufw --force enable # We don't force enable to avoid locking user out if they have custom setup, but we open ports.


# --- 2. INSTALL NODE.JS 20 ---
echo "🟢 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# --- 3. INSTALL POSTGRESQL & REDIS ---
echo "🟢 Installing PostgreSQL & Redis..."
apt-get install -y postgresql postgresql-contrib redis-server

systemctl enable postgresql
systemctl start postgresql
systemctl enable redis-server
systemctl start redis-server

# --- 4. CLONE REPOSITORY ---
echo "🟢 Cloning AutoWhats Repository..."
mkdir -p /var/www
cd /var/www
if [ -d "autowhats" ]; then
    echo "⚠️  Existing installation found at /var/www/autowhats. Backing up..."
    mv autowhats "autowhats_backup_$(date +%s)"
fi
git clone https://github.com/moroccanstore/autowats.git autowhats
cd autowhats

# --- 5. INSTALL & BUILD ---
echo "🟢 Installing Dependencies (this may take a few minutes)..."
npm install --quiet

echo "🟢 Building Application..."
npm run build

# --- 6. SETUP ENVIRONMENT ---
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ .env initialized from example."
fi

# --- 7. STARTING APPLICATION ---
# We use PM2 if available, otherwise suggest it
if ! command -v pm2 &> /dev/null; then
    echo "🟢 Installing PM2 (Process Manager)..."
    npm install -g pm2
fi

# Determine the start command - we assume turbo build structure
echo "🟢 Starting Services via PM2..."
cd /var/www/autowhats
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    echo "⚠️  ecosystem.config.js not found, starting manually..."
    pm2 start "npm run start:prod" -w api --name "autowhats-api"
    pm2 start "npm run start" -w web --name "autowhats-web"
fi

echo "🟢 Enabling Startup Persistence..."
pm2 save
pm2 startup | tail -n 1 | bash # Automatically run the suggested startup command

# --- 8. FINALIZE ---
IP=$(curl -s ifconfig.me || curl -s icanhazip.com)
echo "--------------------------------------------------"
echo "🚀 AutoWhats installed successfully!"
echo "--------------------------------------------------"
echo "👉 Open: http://$IP:3000/install"
echo "📝 Logs: /var/log/autowhats-install.log"
echo "--------------------------------------------------"
echo "Next Steps:"
echo "1. Configure your database in the web interface."
echo "2. Enter your License Key to activate the system."
echo "3. After setup, the installer will automatically lock."
echo "--------------------------------------------------"

