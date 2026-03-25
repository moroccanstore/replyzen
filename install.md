# 🛠️ Installation Guide — AutoWhats

Follow these steps to deploy AutoWhats on your production server.

## 1. Prerequisites
Ensure your server has the following installed:
- **Node.js 18+**
- **PostgreSQL Database**
- **Redis Server**
- **PM2** (Optional but highly recommended)

## 2. Prepare the Files
Upload the project ZIP or clone the repository to your `/var/www` or equivalent directory.

```bash
cd /path/to/autowhats
npm install
npm run build
```

## 3. Configure the Domain
Point your domain or subdomain (e.g., `app.yourdomain.com`) to your server's IP and set up a reverse proxy (Nginx recommended) to point to port **3000**.

## 4. Run the Installer Wizard
Open your browser and navigate to:
`http://app.yourdomain.com/install`

The installer will guide you through:
1. **System Check**: Verifying Node.js version and disk permissions.
2. **Database Setup**: Enter your PostgreSQL connection string.
3. **Redis Setup**: Enter your Redis host and port.
4. **Admin Creation**: Set up your primary administrator account.
5. **License Activation**: Enter your purchase code or license key to activate the system.

## 5. Deployment
Once the installer finishes, it will generate an `install.lock` file to prevent future access to the wizard.

Start the application using PM2:
```bash
pm2 start npm --name "autowhats-api" --cwd "apps/api" -- run start:prod
pm2 start npm --name "autowhats-web" --cwd "apps/web" -- run start
```

## 🧪 Testing with Demo Mode
Don't have a WhatsApp Business API yet? No problem! AutoWhats comes with a pre-configured **Demo Workspace**.
- Go to **Settings > Workspace**.
- Enable **Demo Mode**.
- You can now test AI replies and campaign broadcasts with simulated responses.

---
**Need help?** Contact [contact@daki.pro](mailto:contact@daki.pro)
