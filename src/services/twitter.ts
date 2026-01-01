import axios from 'axios';
import * as cheerio from 'cheerio';
import { TrendingTopic } from '../types';

// Multiple Nitter instances for redundancy
const NITTER_INSTANCES = [
    'https://nitter.net',
    'https://nitter.cz',
    'https://nitter.privacydev.net',
];

// Crypto-related search terms
const CRYPTO_KEYWORDS = [
    'memecoin',
    'solana',
    '$SOL',
    'crypto',
    'degen',
    'airdrop',
    'pump',
    'gem',
    'AI agent',
    'trending crypto',
];

/**
 * Scrapes trending crypto topics from Nitter (Twitter alternative)
 */
export async function getTrendingTopics(): Promise<TrendingTopic[]> {
    const topics: TrendingTopic[] = [];

    for (const keyword of CRYPTO_KEYWORDS) {
        try {
            const result = await searchTwitter(keyword);
            if (result) {
                topics.push(result);
            }
        } catch (error) {
            // Continue with next keyword
            continue;
        }
    }

    return topics;
}

/**
 * Search Twitter via Nitter for a specific keyword
 */
async function searchTwitter(query: string): Promise<TrendingTopic | null> {
    for (const instance of NITTER_INSTANCES) {
        try {
            const url = `${instance}/search?f=tweets&q=${encodeURIComponent(query)}`;
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            const $ = cheerio.load(response.data);
            const tweets = $('.timeline-item').length;

            if (tweets > 0) {
                // Analyze sentiment from tweet content
                const tweetTexts: string[] = [];
                $('.tweet-content').each((_, el) => {
                    tweetTexts.push($(el).text());
                });

                const sentiment = analyzeSentiment(tweetTexts);

                return {
                    keyword: query,
                    source: 'twitter',
                    mentions: tweets,
                    sentiment,
                    relatedTokens: extractTokenMentions(tweetTexts),
                };
            }
        } catch (error) {
            // Try next instance
            continue;
        }
    }

    return null;
}

/**
 * Simple sentiment analysis based on keywords
 */
function analyzeSentiment(texts: string[]): 'bullish' | 'bearish' | 'neutral' {
    const combined = texts.join(' ').toLowerCase();

    const bullishWords = [
        'moon',
        'pump',
        'bullish',
        'gem',
        'buy',
        'long',
        'ape',
        '🚀',
        '🔥',
        'send it',
        'wagmi',
        'gm',
    ];
    const bearishWords = [
        'dump',
        'bearish',
        'sell',
        'short',
        'rug',
        'scam',
        'crash',
        'rekt',
        'ngmi',
    ];

    let bullishScore = 0;
    let bearishScore = 0;

    for (const word of bullishWords) {
        if (combined.includes(word)) bullishScore++;
    }
    for (const word of bearishWords) {
        if (combined.includes(word)) bearishScore++;
    }

    if (bullishScore > bearishScore + 2) return 'bullish';
    if (bearishScore > bullishScore + 2) return 'bearish';
    return 'neutral';
}

/**
 * Extract token ticker mentions from tweets
 */
function extractTokenMentions(texts: string[]): string[] {
    const combined = texts.join(' ');
    const tickerPattern = /\$[A-Z]{2,10}/g;
    const matches = combined.match(tickerPattern) || [];
    return [...new Set(matches)].slice(0, 10);
}

/**
 * Get viral crypto memes and cultural moments
 */
export async function getViralMemes(): Promise<string[]> {
    const memeKeywords = [
        'crypto meme',
        'memecoin viral',
        'degen twitter',
        'ct meme',
    ];

    const memes: string[] = [];

    for (const keyword of memeKeywords) {
        for (const instance of NITTER_INSTANCES) {
            try {
                const url = `${instance}/search?f=tweets&q=${encodeURIComponent(keyword)}`;
                const response = await axios.get(url, {
                    timeout: 10000,
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    },
                });

                const $ = cheerio.load(response.data);
                $('.tweet-content')
                    .slice(0, 5)
                    .each((_, el) => {
                        const text = $(el).text().trim();
                        if (text.length > 20 && text.length < 280) {
                            memes.push(text);
                        }
                    });

                break; // Success, move to next keyword
            } catch (error) {
                continue;
            }
        }
    }

    return [...new Set(memes)].slice(0, 10);
}

/**
 * Get trending hashtags related to crypto
 */
export async function getTrendingHashtags(): Promise<string[]> {
    const hashtags: string[] = [];

    for (const instance of NITTER_INSTANCES) {
        try {
            const response = await axios.get(`${instance}/search?f=tweets&q=crypto`, {
                timeout: 10000,
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            const $ = cheerio.load(response.data);
            const hashtagPattern = /#[A-Za-z0-9_]+/g;

            $('.tweet-content').each((_, el) => {
                const text = $(el).text();
                const matches = text.match(hashtagPattern) || [];
                hashtags.push(...matches);
            });

            break;
        } catch (error) {
            continue;
        }
    }

    // Count occurrences and return top hashtags
    const counts = hashtags.reduce(
        (acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([tag]) => tag);
}
