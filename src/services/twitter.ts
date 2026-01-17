import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseProvider } from './BaseProvider';
import { RawTrendData, TrendingTopic, NarrativeSignal, EngagementData } from '../types';
import { config } from '../config';

// Multiple Nitter instances for redundancy
const NITTER_INSTANCES = [
    'https://nitter.net',
    'https://nitter.cz',
    'https://nitter.privacydev.net',
];

// Crypto-related search terms with focus on AI/Axiom narratives
const CRYPTO_KEYWORDS = [
    'AI agent',
    'AI agent crypto',
    'Axiom',
    'memecoin',
    'solana',
    '$SOL',
    'crypto',
    'degen',
    'pump',
    'trending crypto',
];

interface TwitterScrapedData {
    topics: Array<{
        keyword: string;
        mentions: number;
        sentiment: 'bullish' | 'bearish' | 'neutral';
        tweetTexts: string[];
        tickers: string[];
    }>;
}

/**
 * Twitter Provider - Scrapes trending crypto topics from Nitter
 */
export class TwitterProvider extends BaseProvider {
    constructor() {
        super('Twitter', config.rateLimits.twitter);
    }

    protected async fetchData(): Promise<TwitterScrapedData> {
        const topics: TwitterScrapedData['topics'] = [];

        for (const keyword of CRYPTO_KEYWORDS) {
            try {
                const result = await this.searchTwitter(keyword);
                if (result) {
                    topics.push(result);
                }
            } catch (error) {
                // Continue with next keyword
                continue;
            }
        }

        return { topics };
    }

    private async searchTwitter(query: string): Promise<TwitterScrapedData['topics'][0] | null> {
        for (const instance of NITTER_INSTANCES) {
            try {
                await this.rateLimiter.acquire();
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
                    const tweetTexts: string[] = [];
                    $('.tweet-content').each((_, el) => {
                        tweetTexts.push($(el).text());
                    });

                    const sentiment = this.analyzeSentiment(tweetTexts);
                    const tickers = this.extractTokenMentions(tweetTexts);

                    return {
                        keyword: query,
                        mentions: tweets,
                        sentiment,
                        tweetTexts: tweetTexts.slice(0, 10),
                        tickers,
                    };
                }
            } catch (error) {
                // Try next instance
                continue;
            }
        }

        return null;
    }

    private analyzeSentiment(texts: string[]): 'bullish' | 'bearish' | 'neutral' {
        const combined = texts.join(' ').toLowerCase();

        const bullishWords = [
            'moon', 'pump', 'bullish', 'gem', 'buy', 'long', 'ape',
            '🚀', '🔥', 'send it', 'wagmi', 'gm',
        ];
        const bearishWords = [
            'dump', 'bearish', 'sell', 'short', 'rug', 'scam',
            'crash', 'rekt', 'ngmi',
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

    private extractTokenMentions(texts: string[]): string[] {
        const combined = texts.join(' ');
        const tickerPattern = /\$[A-Z]{2,10}/g;
        const matches = combined.match(tickerPattern) || [];
        return [...new Set(matches)].slice(0, 10);
    }

    protected formatData(raw: TwitterScrapedData): RawTrendData {
        // Calculate narrative velocity for AI-related keywords
        const aiKeywords = ['AI agent', 'Axiom', 'AI'];
        let aiMentions = 0;

        const narratives: NarrativeSignal[] = raw.topics.map(topic => {
            // Track AI-related mentions for narrative velocity
            if (aiKeywords.some(k => topic.keyword.toLowerCase().includes(k.toLowerCase()))) {
                aiMentions += topic.mentions;
            }

            return {
                keyword: topic.keyword,
                frequency: topic.mentions,
                source: 'twitter',
                sentiment: topic.sentiment,
            };
        });

        // Aggregate engagement data
        const allTickers = raw.topics.flatMap(t => t.tickers);
        const uniqueTickers = [...new Set(allTickers)];
        const allTweets = raw.topics.flatMap(t => t.tweetTexts);
        const totalMentions = raw.topics.reduce((sum, t) => sum + t.mentions, 0);

        // Overall sentiment from all topics
        const bullishCount = raw.topics.filter(t => t.sentiment === 'bullish').length;
        const bearishCount = raw.topics.filter(t => t.sentiment === 'bearish').length;
        let overallSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
        if (bullishCount > bearishCount + 1) overallSentiment = 'bullish';
        if (bearishCount > bullishCount + 1) overallSentiment = 'bearish';

        const engagement: EngagementData = {
            totalMentions,
            sentiment: overallSentiment,
            topTickers: uniqueTickers.slice(0, 10),
            tweetSamples: allTweets.slice(0, 5),
        };

        return {
            source: 'twitter',
            timestamp: new Date(),
            tokens: [], // Twitter doesn't provide token metrics directly
            narratives,
            rawEngagement: engagement,
        };
    }
}

// ====================================
// LEGACY EXPORTS (for backward compat)
// ====================================

const provider = new TwitterProvider();

/**
 * Scrapes trending crypto topics from Nitter
 * @deprecated Use TwitterProvider.getData() instead
 */
export async function getTrendingTopics(): Promise<TrendingTopic[]> {
    const data = await provider.getData();
    return data.narratives.map(n => ({
        keyword: n.keyword,
        source: 'twitter' as const,
        mentions: n.frequency,
        sentiment: n.sentiment,
        relatedTokens: data.rawEngagement.topTickers,
    }));
}

/**
 * Get viral crypto memes
 * @deprecated Use TwitterProvider.getData() instead
 */
export async function getViralMemes(): Promise<string[]> {
    const data = await provider.getData();
    return data.rawEngagement.tweetSamples.filter(t => t.length > 20 && t.length < 280);
}

/**
 * Get trending hashtags
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
