# 🛠️ Installation Guide — AutoWhats

Follow these steps to deploy AutoWhats on your production server.

## 1. Prerequisites
Ensure your server has the following installed:
- **Node.js 18+**
- **PostgreSQL Database**
- **Redis Server**
- **PM2** (Optional but highly recommended)

## 🚀 Option A: One-Click Ubuntu Installer (Recommended)

For the easiest experience on a fresh Ubuntu VPS, run:

```bash
curl -sSL https://raw.githubusercontent.com/moroccanstore/autowats/main/install.sh | bash
```

**What it does:**
- Installs Node.js 20, PostgreSQL, and Redis.
- Configures Firewalls (`ufw`) for ports 3000/3001.
- Clones and builds the repo.
- Sets up PM2 for auto-restart on reboot.

---

## 🛠️ Option B: Manual Installation

### 1. Prerequisites
... [Existing steps] ...

---

## 4. Run the Installer Wizard
Open your browser and navigate to:
`http://app.yourdomain.com/install`

The installer now features **Resumable Setup**:
1. **License Verification**: (Now with 5s timeout & grace mode)
2. **Database/Redis Setup**
3. **Admin Creation**
4. **License Activation**
5. **Lock & Complete**

*Note: If setup is interrupted, just refresh the page; the system will resume from the last successful step.*

## 5. Deployment
Start the application using PM2 (already handled if using Option A):
```bash
pm2 start ecosystem.config.js
```


## 🧪 Testing with Demo Mode
Don't have a WhatsApp Business API yet? No problem! AutoWhats comes with a pre-configured **Demo Workspace**.
- Go to **Settings > Workspace**.
- Enable **Demo Mode**.
- You can now test AI replies and campaign broadcasts with simulated responses.

---
**Need help?** Contact [contact@daki.pro](mailto:contact@daki.pro)
