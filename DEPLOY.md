# 🚀 Deployment Guide - Run Your Bot 24/7

Your bot is ready to deploy! **Railway is the easiest option** (free tier available).

---

## Option 1: Railway (Easiest - Recommended)

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click **New Repository**
3. Name it: `crypto-ideas-bot`
4. Make it **Private**
5. Click **Create Repository**

### Step 2: Push Your Code to GitHub
Open terminal in your project folder and run:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/crypto-ideas-bot.git
git push -u origin main
```

### Step 3: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Click **Login with GitHub**
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your `crypto-ideas-bot` repository
5. Railway will auto-detect and start building

### Step 4: Add Environment Variables
1. In Railway, click on your project
2. Go to **Variables** tab
3. Add these variables:
   ```
   TELEGRAM_BOT_TOKEN = your_bot_token_here
   TELEGRAM_CHAT_ID = 1412950392
   CRON_SCHEDULE = 0 9 * * *
   TZ = Europe/Moscow
   ```
4. Click **Deploy**

### Step 5: Verify
- Check **Deployments** tab to see logs
- Send `hello` to your Telegram bot
- It should respond with ideas!

**Done!** Your bot runs 24/7 now.

---

## Option 2: Render

1. Go to [render.com](https://render.com)
2. Click **New** → **Background Worker**
3. Connect your GitHub repository
4. Set:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables (same as Railway)
6. Click **Create Background Worker**

---

## Option 3: VPS (Advanced)

If you have a VPS (DigitalOcean, Hetzner, etc):

```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Clone your repo
git clone https://github.com/YOUR_USERNAME/crypto-ideas-bot.git
cd crypto-ideas-bot

# Install dependencies
npm install
npm run build

# Create .env file
nano .env
# Add your environment variables

# Install PM2 to keep bot running
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name "crypto-bot"
pm2 save
pm2 startup
```

---

## Troubleshooting

### Bot not responding?
- Check that environment variables are set correctly
- Look at deployment logs for errors
- Make sure TELEGRAM_BOT_TOKEN is correct

### Ideas not generating?
- Check DexScreener API access in logs
- The bot still works with fallback data

### Need help?
- Railway Discord: discord.gg/railway
- Render Docs: render.com/docs

---

## Cost

| Platform | Free Tier | Paid |
|----------|-----------|------|
| Railway | $5 credit/month | $5/month |
| Render | 750 hours/month | $7/month |
| VPS | None | ~$5/month |

**Railway is recommended** - easiest setup and good free tier!
