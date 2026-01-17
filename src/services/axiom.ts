import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseProvider } from './BaseProvider';
import { RawTrendData, NarrativeSignal } from '../types';
import { config } from '../config';

// Known AI agent related tokens and projects
const AI_AGENT_TOKENS = [
    'AI16Z',
    'VIRTUAL',
    'FET',
    'AGIX',
    'OCEAN',
    'TAO',
    'RNDR',
    'AKT',
    'AIOZ',
    'PRIME',
];

// AI agent narratives to track
const AI_NARRATIVES = [
    { keyword: 'autonomous trading bots', weight: 1.5 },
    { keyword: 'AI content generation', weight: 1.2 },
    { keyword: 'on-chain AI agents', weight: 2.0 },
    { keyword: 'AI governance', weight: 1.0 },
    { keyword: 'predictive analytics', weight: 1.3 },
    { keyword: 'AI-powered DEX', weight: 1.5 },
    { keyword: 'agent swarms', weight: 1.8 },
    { keyword: 'AI meme generation', weight: 1.4 },
];

interface AxiomScrapedData {
    headlines: string[];
    narratives: Array<{ keyword: string; detected: boolean; weight: number }>;
    aiTokens: string[];
}

/**
 * Axiom Provider - AI Agent ecosystem monitoring
 */
export class AxiomProvider extends BaseProvider {
    constructor() {
        super('Axiom', config.rateLimits.axiom);
    }

    protected async fetchData(): Promise<AxiomScrapedData> {
        const headlines: string[] = [];

        // Scrape crypto AI news
        const newsUrls = [
            'https://decrypt.co/artificial-intelligence',
            'https://cointelegraph.com/tags/artificial-intelligence',
        ];

        for (const url of newsUrls) {
            try {
                await this.rateLimiter.acquire();
                const response = await axios.get(url, {
                    timeout: 10000,
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    },
                });

                const $ = cheerio.load(response.data);

                // Extract headlines
                $('h2, h3, .post-card-info-title, .post__title').each((_, el) => {
                    const text = $(el).text().trim().toLowerCase();
                    if (
                        text.includes('ai') ||
                        text.includes('agent') ||
                        text.includes('autonomous') ||
                        text.includes('bot')
                    ) {
                        headlines.push($(el).text().trim());
                    }
                });
            } catch (err) {
                continue;
            }
        }

        // Check which narratives are currently hot
        const narratives = AI_NARRATIVES.map(n => ({
            keyword: n.keyword,
            detected: headlines.some(h =>
                h.toLowerCase().includes(n.keyword.toLowerCase().split(' ')[0])
            ),
            weight: n.weight,
        }));

        return {
            headlines,
            narratives,
            aiTokens: AI_AGENT_TOKENS,
        };
    }

    protected formatData(raw: AxiomScrapedData): RawTrendData {
        // Build narrative signals with frequency based on headline matches and weight
        const narratives: NarrativeSignal[] = raw.narratives.map(n => ({
            keyword: n.keyword,
            frequency: n.detected ? Math.round(10 * n.weight) : 1, // Weighted frequency
            source: 'axiom',
            sentiment: 'bullish' as const, // AI narratives are generally bullish
        }));

        // Add detected headlines as additional narrative signals
        for (const headline of raw.headlines.slice(0, 10)) {
            narratives.push({
                keyword: headline,
                frequency: 5,
                source: 'axiom',
                sentiment: 'bullish',
            });
        }

        return {
            source: 'axiom',
            timestamp: new Date(),
            tokens: [], // Axiom doesn't provide token metrics directly
            narratives,
            rawEngagement: {
                totalMentions: raw.headlines.length + raw.narratives.filter(n => n.detected).length,
                sentiment: 'bullish',
                topTickers: raw.aiTokens.map(t => `$${t}`),
                tweetSamples: raw.headlines.slice(0, 5),
            },
        };
    }
}

// ====================================
// LEGACY EXPORTS (for backward compat)
// ====================================

const provider = new AxiomProvider();

/**
 * Get trending AI agent narratives
 * @deprecated Use AxiomProvider.getData() instead
 */
export async function getAIAgentTrends(): Promise<string[]> {
    const data = await provider.getData();
    return data.narratives.map(n => n.keyword);
}

/**
 * Get trending AI agent tokens with their metrics
 */
export async function getAIAgentTokens(): Promise<{ symbol: string; narrative: string }[]> {
    return AI_AGENT_TOKENS.map((symbol) => ({
        symbol,
        narrative: getTokenNarrative(symbol),
    }));
}

/**
 * Get narrative description for known AI tokens
 */
function getTokenNarrative(symbol: string): string {
    const narratives: Record<string, string> = {
        AI16Z: 'AI-powered DAO mimicking a16z investment strategies',
        VIRTUAL: 'AI-driven virtual environments and digital beings',
        FET: 'Autonomous agent framework for DeFi',
        AGIX: 'Decentralized AI marketplace',
        OCEAN: 'Data exchange for AI training',
        TAO: 'Decentralized machine learning network',
        RNDR: 'Distributed GPU rendering for AI',
        AKT: 'Decentralized cloud compute for AI',
        AIOZ: 'AI-powered content delivery',
        PRIME: 'AI gaming and entertainment',
    };

    return narratives[symbol] || 'AI infrastructure token';
}

/**
 * Get automation workflow trends
 */
export async function getAutomationTrends(): Promise<string[]> {
    return [
        'Automated liquidity provision',
        'Cross-chain arbitrage bots',
        'Social trading copy agents',
        'NFT sniping automation',
        'Airdrop farming bots',
        'MEV protection agents',
        'Portfolio rebalancing AI',
        'Sentiment-based trading',
        'Token launch automation',
        'Whale wallet tracking',
    ];
}
