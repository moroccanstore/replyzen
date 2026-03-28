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

# --- 6. CHECK FOR UPLOADED PROJECT FILES ---
echo "🟢 Checking for project files..."
mkdir -p /var/www
cd /var/www

if [ -d "autowhats" ]; then
    echo "⚠️ Existing installation found, backing up..."
    mv autowhats "autowhats_backup_$(date +%s)"
fi

# Create directory and wait for files
echo "📦 Creating project directory: /var/www/autowhats"
mkdir -p /var/www/autowhats

# Check if package.json exists (indicates files are present)
if [ ! -f "/var/www/autowhats/package.json" ]; then
    echo ""
    echo "⚠️  Project files not found!"
    echo ""
    echo "📥 Please upload your project files to /var/www/autowhats"
    echo ""
    echo "Options to upload:"
    echo "  1. Using SCP from your local machine:"
    echo "     scp -r /path/to/autowhats root@YOUR_SERVER_IP:/var/www/"
    echo ""
    echo "  2. Using SFTP (FileZilla, WinSCP, etc.):"
    echo "     Connect to: sftp://root@YOUR_SERVER_IP"
    echo "     Upload files to: /var/www/autowhats"
    echo ""
    echo "  3. Using ZIP upload:"
    echo "     Upload autowhats.zip to /var/www/ and run:"
    echo "     cd /var/www && unzip autowhats.zip && mv autowhats autowhats_temp && mv autowhats_temp/* autowhats/"
    echo ""
    echo "After uploading, run this script again:"
    echo "  curl -sSL https://raw.githubusercontent.com/moroccanstore/replyzen/main/install.sh | sudo bash"
    echo ""
    echo "📝 Installation paused. Upload files then re-run the installer."
    echo "--------------------------------------------------"
    exit 0
fi

cd /var/www/autowhats
echo "✅ Project files found!"

# --- 7. DEPENDENCIES, ENV & PRISMA ---
echo "🟢 Installing dependencies (this may take a few minutes)..."
npm install --quiet

echo "🟢 Creating environment file..."
cat > /var/www/autowhats/.env <<EOF
DATABASE_URL="postgresql://autowhats:autowhats@localhost:5432/autowhats"
JWT_SECRET="supersecretkey"
ENCRYPTION_KEY="32characterslongsecretkey123"
EOF

# Copy to API folder for Prisma/Build
cp /var/www/autowhats/.env /var/www/autowhats/apps/api/.env

echo "🟢 Generating Prisma client..."
cd /var/www/autowhats/apps/api
npx prisma generate

echo "🟢 Running migrations..."
npx prisma migrate deploy || true

echo "🟢 Building API..."
npm run build

echo "🟢 Building Web..."
cd ../web
npm run build

# --- 8. PM2 SETUP ---
cd /var/www/autowhats

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
