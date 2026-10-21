# Farminix Production Deployment Guide for KVM2 Server

This guide provides complete instructions for deploying Farminix (Frontend + Backend + PostgreSQL SQL Database) onto your dedicated **KVM2 Linux Server** (Ubuntu 22.04 / 24.04 LTS or Debian 12).

---

## 🏗️ Architecture Overview on KVM2

```
Internet (Port 80/443)
       │
       ▼
   [ Nginx ]  ── (SSL Termination & Compression)
       │
       ▼ (Port 5000)
┌────────────────────────────────────────────────────────┐
│ Farminix Full-Stack Express Server                     │
│  ├── Serves SPA Frontend (dist/index.html & assets)   │
│  ├── Site Config & Admin CMS API (/api/site-config)    │
│  ├── Customer Orders & Stock API (/api/site-config/...)│
│  ├── Enquiries & Support API (/api/site-config/queries)│
│  ├── Razorpay Payments API (/api/payment/...)          │
│  └── User Authentication & Profile API (/api/auth)     │
└────────────────────────────────────────────────────────┘
       │
       ▼ (Port 5432)
┌────────────────────────────────────────────────────────┐
│ PostgreSQL Relational Database (farminix_db)           │
│  ├── site_config          ├── orders                   │
│  ├── products             ├── order_items              │
│  ├── categories           ├── customer_enquiries       │
│  ├── users                ├── coupons                  │
│  └── user_addresses       └── admin_sessions           │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Option 1: Docker Compose (Recommended)

Docker Compose sets up PostgreSQL with automated database schema migration, container healthchecks, and the Node.js application in **one command**.

### 1. Connect to your KVM2 Server
```bash
ssh root@your_server_ip
```

### 2. Install Docker & Docker Compose
```bash
sudo apt update && sudo apt install -y curl git ufw
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo apt install -y docker-compose-plugin
```

### 3. Clone Repository & Setup Environment
```bash
git clone https://github.com/2300040331/farminix-new.git /var/www/farminix
cd /var/www/farminix

# Create .env file for production
cp server/.env.example server/.env
nano server/.env
```

### 4. Launch Services
```bash
docker compose up -d --build
```

### 5. Verify Running Containers
```bash
docker compose ps
docker compose logs -f app
```
You should see:
```
🌾 Farminix Full-Stack Server Active
🚀 Port: http://0.0.0.0:5000
🗄️ Database: PostgreSQL (Connected)
```

---

## 🛠️ Deployment Option 2: Native Ubuntu / PM2 (Without Docker)

### 1. Install Node.js 22 & PostgreSQL 16
```bash
# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib git

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

### 2. Setup PostgreSQL User & Database
```bash
sudo -u postgres psql
```
Inside the PostgreSQL prompt (`postgres=#`):
```sql
CREATE DATABASE farminix_db;
CREATE USER farminix_user WITH ENCRYPTED PASSWORD 'your_strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE farminix_db TO farminix_user;
ALTER DATABASE farminix_db OWNER TO farminix_user;
\q
```

Grant schema privileges (PostgreSQL 15+):
```bash
sudo -u postgres psql -d farminix_db -c "GRANT ALL ON SCHEMA public TO farminix_user;"
```

### 3. Initialize SQL Tables
Import the production schema directly:
```bash
cd /var/www/farminix
sudo -u postgres psql -d farminix_db -f server/schema.sql
```

### 4. Install Dependencies & Build
```bash
cd /var/www/farminix

# Build Frontend
npm install
npm run build

# Build Backend
cd server
npm install
npm run build
```

### 5. Configure `.env`
Create `/var/www/farminix/server/.env`:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://farminix_user:your_strong_password_here@localhost:5432/farminix_db
ADMIN_PASSWORD=YourAdminPasswordHere2026!
ADMIN_SESSION_SECRET=a_very_long_random_salt_string_at_least_32_chars
JWT_SECRET=a_random_jwt_secret_key_at_least_32_chars
REFRESH_SECRET=a_random_refresh_secret_at_least_32_chars
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 6. Start with PM2
```bash
cd /var/www/farminix
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## 🔒 Setup Nginx & Free SSL (Let's Encrypt)

### 1. Install Nginx and Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Configure Nginx Virtual Host
Copy the provided `nginx.conf`:
```bash
sudo cp /var/www/farminix/nginx.conf /etc/nginx/sites-available/farminix
sudo ln -s /etc/nginx/sites-available/farminix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

### 3. Obtain SSL Certificate with Certbot
```bash
sudo certbot --nginx -d farminix.in -d www.farminix.in
sudo systemctl reload nginx
```

### 4. Enable Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## ✅ CRUD Operations Verification Checklist

After deployment on your KVM2 server, test each of the following endpoints:

| Feature | How to Test | Expected Response |
|---|---|---|
| **Health Check** | `curl https://farminix.in/api/health` | `{"status":"ok","database":"PostgreSQL (Connected)"}` |
| **Catalog Load** | Load `https://farminix.in` in browser | Products and categories load directly from SQL |
| **Admin Login** | Open `https://farminix.in/admin` and sign in | Sets HttpOnly cookie, unlocks Admin Dashboard |
| **Admin Save Changes**| Edit prices or banners, click "Save Changes" | Publishes and updates SQL `site_config` & `products` |
| **Online Orders** | Add to cart, place COD or Razorpay order | Atomically decrements stock in SQL, stores order |
| **Enquiries** | Submit query on "Any Queries?" page | Records in SQL `customer_enquiries`, visible in admin |
