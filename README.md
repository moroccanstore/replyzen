# 🚀 AutoWhats — The Ultimate AI-Powered WhatsApp CRM

AutoWhats is a professional, high-performance WhatsApp CRM and automation platform built for scale. Leverage AI to handle customer support, run massive broadcast campaigns, and automate your entire sales funnel.

## ⚡ Quick Start (5 Minutes)

1. **Upload**: Upload the project files to your server.
2. **Install**: Run `npm install && npm run build`.
3. **Wizard**: Open `http://your-domain.com/install` in your browser.
4. **Setup**: Follow the on-screen instructions to connect your Database, Redis, and activate your License Key.
5. **Done 🎉**: Your system is now active and ready for use.

## ✨ Core Features

- 🧠 **Elite AI Automation**: Connect OpenAI to handle customer queries with human-like precision.  
- 📣 **Smart Broadcasts**: Send 1,000s of messages without getting banned using randomized delays.  
- ⚡ **Keyword Rules**: Set up instant triggers for common questions (e.g., "price", "location").  
- 📥 **Real-time Inbox**: Centralized dashboard for all your team to manage conversations.  
- 🧪 **Demo Mode**: Test the entire system (AI replies, campaigns) instantly without needing a WhatsApp API token.  
- 🚀 **Plug-and-Play Installer**: Get up and running in under 5 minutes.

## 📦 What You Get

- Full AutoWhats SaaS source code  
- Plug-and-play installer  
- License system  
- Demo mode  
- Documentation  
- Free updates  

## 💡 Why AutoWhats?

Unlike typical scripts, AutoWhats includes:

- **Real AI automation**: Uses OpenAI to intelligently respond to customer inquiries.
- **Multi-tenant architecture**: Built for SaaS distribution from day one.
- **Remote control system**: Manage and update your instance configuration remotely.
- **Enterprise-grade stability**: High performance, optimized for large-scale operations.

## 📋 Server Requirements

- **Node.js**: v18 or higher (LTS recommended)
- **Database**: PostgreSQL (v14+)
- **Cache**: Redis (v7+)
- **Process Manager**: PM2

## 🚀 Pro Installation (Secure 1-Click)

Run this on a clean **Ubuntu 20.04/22.04/24.04** VPS:

```bash
curl -sSL https://raw.githubusercontent.com/moroccanstore/autowats/main/install.sh | sudo bash
```

### What happens?
1. **Bootstrap**: Installs Node.js 20, PostgreSQL, Redis, and PM2.
2. **Secure Launch**: Starts the Lite Installer on port 3000.
3. **Activation**: You enter your license key.
4. **Download**: The system securely fetches the production ZIP from private storage.
5. **Ready**: Your AI Sales Agent is live!
**: Automatically opens ports 3000/3001 via `ufw`.
- 🔄 **Stateful Setup**: The wizard is resumable; if you lose connection, just refresh and continue.
- 📝 **Centralized Logs**: Installation logs are saved to `/var/log/autowhats-install.log`.
- 🚀 **Auto-Persistence**: PM2 is pre-configured to keep the app running after server reboots.

Once the script completes:
1. Open your browser at `http://YOUR-SERVER-IP:3000/install`
2. Follow the 6-step setup wizard to configure your Database, Redis, and Admin account.
3. Enter your License Key to activate the system.

---

## 🛠️ Manual Installation

AutoWhats features an automated setup wizard. No coding or manual database configuration is required.

1. **Upload**: Upload the project files to your server.
2. **Install**: Run `npm install` and `npm run build`.
3. **Wizard**: Open `http://your-domain.com/install` in your browser.
4. **Setup**: Follow the on-screen instructions to connect your Database, Redis, and activate your License Key.

For detailed steps, see [install.md](./install.md).

## 🔀 Updates

Keeping your system up-to-date is simple:
1. `git pull`
2. `npm install`
3. `npm run build`
4. `pm2 restart all`

See [update.md](./update.md) for more details.

## 🛠️ Support Policy

We provide:
- **Bug Fixes**: Priority support for system errors.
- **Installation Help**: Assistance with your first server setup.
- **Technical Assistance**: Reach out to us at [contact@daki.pro](mailto:contact@daki.pro).
- **Documentation**: Extensive guides at [docs.daki.pro](https://docs.daki.pro).

---
*Built with passion by Daki.pro for elite entrepreneurs.*
