import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Meme Trends Service
 * Fetches trending memes from X/Twitter and TikTok for meme-making ideas
 */

export interface MemeTrend {
    name: string;
    platform: 'X' | 'TikTok' | 'Both';
    description: string;
    memeIdea: string;
    virality: 'Exploding' | 'Hot' | 'Rising';
}

/**
 * Get current viral meme trends
 */
export async function getMemeTrends(): Promise<MemeTrend[]> {
    const trends: MemeTrend[] = [];

    // Current hot memes based on real-time research
    const currentTrends: MemeTrend[] = [
        {
            name: '"Chill Guy" Dog',
            platform: 'Both',
            description: 'Smirking dog with hands in pockets - unbothered energy',
            memeIdea: 'Use for "me ignoring [problem]" or "staying calm when [chaos]" formats',
            virality: 'Exploding',
        },
        {
            name: 'Pepe the King Prawn',
            platform: 'Both',
            description: 'Muppet with stressed/high cortisol expression',
            memeIdea: 'Perfect for "TFW" (that feeling when) relatable stress moments',
            virality: 'Hot',
        },
        {
            name: '"100 Men vs Gorilla"',
            platform: 'X',
            description: 'Hypothetical battle debate that went viral',
            memeIdea: 'Create absurd "100 X vs 1 Y" comparisons for your niche',
            virality: 'Hot',
        },
        {
            name: 'New Year Burnout',
            platform: 'Both',
            description: '"Mentally logged out for the year" vibes',
            memeIdea: 'End-of-year exhaustion content - universally relatable',
            virality: 'Exploding',
        },
        {
            name: 'Coldplay Kiss Cam CEO',
            platform: 'X',
            description: 'CEO caught with HR exec on kiss cam at concert',
            memeIdea: 'Office drama/caught slipping format',
            virality: 'Hot',
        },
        {
            name: '"Pretty Little Baby" Sound',
            platform: 'TikTok',
            description: '1962 Connie Francis song trending for nostalgic videos',
            memeIdea: 'Pair with aesthetic/vintage content or ironic contrasts',
            virality: 'Rising',
        },
        {
            name: 'Zootopia 2 Couple Selfies',
            platform: 'TikTok',
            description: 'Couples recreating Nick & Judy selfie poses',
            memeIdea: 'Create unexpected character pairings doing the selfie',
            virality: 'Rising',
        },
        {
            name: '"Money in the Grave x Last Christmas"',
            platform: 'TikTok',
            description: 'Drake + Wham mashup for festive chaos',
            memeIdea: 'Holiday chaos content with edge',
            virality: 'Hot',
        },
    ];

    // Shuffle and return random selection to keep it fresh
    const shuffled = currentTrends.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
}

/**
 * Scrape real-time trending topics from Nitter
 */
export async function scrapeXTrends(): Promise<string[]> {
    const trends: string[] = [];
    const nitterInstances = [
        'https://nitter.net',
        'https://nitter.cz',
    ];

    for (const instance of nitterInstances) {
        try {
            const response = await axios.get(`${instance}/search?f=tweets&q=trending%20meme`, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            const $ = cheerio.load(response.data);
            $('.tweet-content').slice(0, 10).each((_, el) => {
                const text = $(el).text().trim();
                if (text.length > 10 && text.length < 200) {
                    trends.push(text);
                }
            });

            if (trends.length > 0) break;
        } catch (error) {
            continue;
        }
    }

    return trends;
}

/**
 * Generate meme ideas from crypto context
 */
export function generateCryptoMemeIdeas(): string[] {
    return [
        '🐕 "$CHILL" - Chill Guy unbothered by red candles',
        '🦐 "$PRAWN" - High cortisol degen trader vibes',
        '🦍 "$GORILLA" - 100 Rugs vs 1 Diamond Hand',
        '😮‍💨 "$BURNOUT" - End of year exhaustion token',
        '🎄 "$XMAS" - Holiday chaos memecoin',
        '🎬 "$ZOOTOPIA" - Unexpected pair energy',
    ];
}
