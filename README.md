# 🤖 Crypto AI Automation System

An automated system that monitors crypto trends from **Dexscreener**, **Twitter/X**, and **AI agent ecosystems**, then sends daily Telegram reports with 5+ project ideas.

## 🚀 Quick Start

### Step 1: Create Your Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow the prompts
3. Copy the **Bot Token** (looks like: `1234567890:ABCdefGHI...`)
4. **Important**: Start a conversation with your new bot (search for it and press "Start")

### Step 2: Get Your Chat ID

1. Open Telegram and search for **@userinfobot**
2. Send any message to it
3. Copy your **Chat ID** (a number like `123456789`)

### Step 3: Set Up Environment

```bash
# Navigate to project
cd c:\Users\apdyk\Desktop\AIAUTOMATION

# Copy environment template
copy .env.example .env

# Edit .env with your values:
# TELEGRAM_BOT_TOKEN=your_bot_token_here
# TELEGRAM_CHAT_ID=your_chat_id_here
```

### Step 4: Install & Run

```bash
# Install dependencies
npm install

# Test immediately (trigger one report)
npm run trigger

# OR start scheduled daily reports
npm run dev
```

## 📋 Configuration

Edit `.env` to customize:

```env
# Your Telegram Bot credentials
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpQRStuvWXYZ
TELEGRAM_CHAT_ID=123456789

# Schedule: When to send daily reports (cron format)
CRON_SCHEDULE=0 9 * * *   # 9:00 AM daily

# Timezone (optional)
TIMEZONE=Europe/Moscow
```

### Cron Examples

| Schedule | Meaning |
|----------|---------|
| `0 9 * * *` | 9:00 AM daily |
| `0 */6 * * *` | Every 6 hours |
| `0 9,21 * * *` | 9 AM and 9 PM |
| `0 0 * * *` | Midnight daily |

## 📦 Commands

| Command | Description |
|---------|-------------|
| `npm run trigger` | Send a report immediately |
| `npm run dev` | Start scheduled automation |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |

## 🔍 Data Sources

- **Dexscreener**: Trending tokens, new pairs, volume spikes
- **Twitter/X**: Viral tweets, trending hashtags, sentiment
- **Axiom/AI**: AI agent trends, automation narratives

## 📱 Sample Report

The bot will send you messages like this:

```
🚀 CRYPTO AI DAILY REPORT
📅 Sunday, December 29, 2024

━━━━━━━━━━━━━━━━━━━
📊 Today's Top 5 Ideas
━━━━━━━━━━━━━━━━━━━

🔹 IDEA #1: Giga Agent
💎 Ticker: $GIAG
🔥 Score: 8.5/10

📝 Narrative:
AI agents are the #1 narrative...

💡 Concept:
Simple memecoin that represents...

⏰ Why Now:
AI agent market is exploding...
```

## 🛠️ Troubleshooting

### "TELEGRAM_BOT_TOKEN is required"
Make sure you've created a `.env` file with your actual bot token.

### "Chat not found" error
1. Make sure you've started a conversation with your bot
2. Verify your TELEGRAM_CHAT_ID is correct

### No data from Twitter
Twitter/Nitter scraping may be rate-limited. The system will still work with Dexscreener and AI data.

## 📁 Project Structure

```
AIAUTOMATION/
├── src/
│   ├── config/          # Configuration
│   ├── services/        # Data source APIs
│   │   ├── dexscreener.ts
│   │   ├── twitter.ts
│   │   └── axiom.ts
│   ├── analysis/        # AI analysis engine
│   │   └── trendAnalyzer.ts
│   ├── notifications/   # Telegram delivery
│   │   └── telegram.ts
│   ├── types/           # TypeScript types
│   ├── scheduler.ts     # Cron scheduler
│   ├── index.ts         # Main entry
│   └── trigger.ts       # Manual trigger
├── .env                 # Your config (create this)
├── .env.example         # Template
├── package.json
└── README.md
```

## 🔐 Security Notes

- Never share your `.env` file
- Keep your bot token private
- The `.env` file is gitignored by default

---

Made for degen founders who want alpha delivered daily 🚀
