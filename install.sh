#!/bin/bash

# AUTOWHATS ONE-CLICK INSTALLER
# Supported OS: Ubuntu 20.04 / 22.04 / 24.04

set -e

# --- 0. LOGGING ---
LOG_FILE="/var/log/autowhats-install.log"
exec > >(tee -i "$LOG_FILE")
exec 2>&1

echo "🚀 Starting AutoWhats Installation..."
echo "📝 Logs: $LOG_FILE"

# --- 1. PRE-CHECKS ---
if [[ $EUID -ne 0 ]]; then
   echo "❌ Please run as root (sudo)"
   exit 1
fi

OS_VERSION=$(lsb_release -rs)
if [[ "$OS_VERSION" != "20.04" && "$OS_VERSION" != "22.04" && "$OS_VERSION" != "24.04" ]]; then
  echo "❌ Unsupported Ubuntu version: $OS_VERSION"
  exit 1
fi

# --- 2. INSTALL DEPENDENCIES ---
echo "🟢 Installing system dependencies..."
apt-get update -y
apt-get install -y curl git unzip ca-certificates gnupg build-essential ufw

# --- FIREWALL ---
echo "🟢 Configuring firewall..."
ufw allow 22/tcp || true
ufw allow 3000/tcp || true
ufw allow 3001/tcp || true

# --- 3. INSTALL NODE.JS 20 ---
echo "🟢 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - || {
  echo "❌ Failed to setup Node.js repository"
  exit 1
}
apt-get install -y nodejs

node -v
npm -v

# --- 4. INSTALL POSTGRESQL & REDIS ---
echo "🟢 Installing PostgreSQL & Redis..."
apt-get install -y postgresql postgresql-contrib redis-server

systemctl enable postgresql
systemctl start postgresql

systemctl enable redis-server
systemctl restart redis-server

# --- 5. SETUP DATABASE ---
echo "🟢 Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE USER autowhats WITH PASSWORD 'autowhats';" || true
sudo -u postgres psql -c "CREATE DATABASE autowhats OWNER autowhats;" || true

# --- 6. CLONE PROJECT ---
echo "🟢 Cloning project..."
mkdir -p /var/www
cd /var/www

if [ -d "autowhats" ]; then
    echo "⚠️ Existing installation found, backing up..."
    mv autowhats "autowhats_backup_$(date +%s)"
fi

git clone https://github.com/moroccanstore/autowats.git autowhats
cd autowhats

# --- 7. DEPENDENCIES, PRISMA & BUILD ---
echo "🟢 Installing dependencies (this may take a few minutes)..."
cd /var/www/autowhats
npm install --quiet

# Export environment for Prisma (needed for migration)
export DATABASE_URL="postgresql://autowhats:autowhats@localhost:5432/autowhats?schema=public"

echo "🟢 Generating Prisma client..."
cd /var/www/autowhats/apps/api
npx prisma generate

echo "🟢 Running database migrations..."
npx prisma migrate deploy || true

echo "🟢 Building API..."
cd /var/www/autowhats/apps/api
npm run build

echo "🟢 Building Web application..."
cd /var/www/autowhats/apps/web
npm run build

# --- 8. ENV SETUP ---
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ .env created"
fi

# --- 9. INSTALL PM2 ---
if ! command -v pm2 &> /dev/null; then
    echo "🟢 Installing PM2..."
    npm install -g pm2
fi

# --- 10. START SERVICES ---
echo "🟢 Starting services with PM2..."
pm2 delete all || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | bash

# --- 11. FINAL OUTPUT ---
IP=$(curl -s ifconfig.me || curl -s icanhazip.com)

echo "--------------------------------------------------"
echo "🎉 AutoWhats Installed Successfully!"
echo "--------------------------------------------------"
echo "👉 Open: http://$IP:3000/install"
echo "--------------------------------------------------"
echo "Next Steps:"
echo "1. Open the link above"
echo "2. Configure database (auto-filled recommended)"
echo "3. Enter your License Key"
echo "4. Complete setup"
echo "--------------------------------------------------"
echo "Logs: $LOG_FILE"
echo "--------------------------------------------------"