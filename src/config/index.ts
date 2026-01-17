import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.TELEGRAM_CHAT_ID || '',
    },
    schedule: {
        cron: process.env.CRON_SCHEDULE || '0 9 * * *', // Default: 9 AM daily
        timezone: process.env.TIMEZONE || 'UTC',
    },
    api: {
        dexscreener: 'https://api.dexscreener.com',
        nitter: 'https://nitter.net', // Twitter alternative
    },
    analysis: {
        minIdeas: 10, // Minimum ideas to generate
        maxIdeas: 12, // Maximum ideas per report
    },
    // Rate limiting configuration (requests per minute)
    rateLimits: {
        dexscreener: 30,
        twitter: 10,      // Nitter is more sensitive
        axiom: 20,
    },
    // Retry configuration for failed requests
    retry: {
        maxRetries: 3,
        baseDelayMs: 1000,
        retryStatusCodes: [429, 503, 502, 504],
    },
};

export function validateConfig(): boolean {
    const errors: string[] = [];

    if (!config.telegram.botToken) {
        errors.push('TELEGRAM_BOT_TOKEN is required');
    }
    if (!config.telegram.chatId) {
        errors.push('TELEGRAM_CHAT_ID is required');
    }

    if (errors.length > 0) {
        console.error('Configuration errors:');
        errors.forEach((err) => console.error(`  - ${err}`));
        return false;
    }

    return true;
}
