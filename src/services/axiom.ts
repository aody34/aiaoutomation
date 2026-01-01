import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Axiom / AI Agent ecosystem monitoring
 * Tracks trending AI agent use cases, automation workflows, and agent narratives
 */

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
    'autonomous trading bots',
    'AI content generation',
    'on-chain AI agents',
    'AI governance',
    'predictive analytics',
    'AI-powered DEX',
    'agent swarms',
    'AI meme generation',
];

/**
 * Get trending AI agent narratives
 */
export async function getAIAgentTrends(): Promise<string[]> {
    const trends: string[] = [];

    // Scrape crypto news for AI agent mentions
    try {
        const newsUrls = [
            'https://decrypt.co/artificial-intelligence',
            'https://cointelegraph.com/tags/artificial-intelligence',
        ];

        for (const url of newsUrls) {
            try {
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
                        trends.push($(el).text().trim());
                    }
                });
            } catch (err) {
                continue;
            }
        }
    } catch (error) {
        console.error('Error fetching AI agent trends:', error);
    }

    // Add known trending narratives
    const currentNarratives = await detectCurrentNarratives();
    trends.push(...currentNarratives);

    return [...new Set(trends)].slice(0, 15);
}

/**
 * Detect current hot narratives based on social signals
 */
async function detectCurrentNarratives(): Promise<string[]> {
    const narratives: string[] = [];

    // Check for specific trending topics
    const trendingTopics = [
        { keyword: 'AI agent crypto', narrative: 'Autonomous AI trading agents' },
        { keyword: 'Truth Terminal', narrative: 'AI chatbots influencing markets' },
        { keyword: 'ai16z crypto', narrative: 'AI-powered DAO and DeFi' },
        { keyword: 'Virtuals Protocol', narrative: 'AI virtual environments' },
        { keyword: 'DeSci AI', narrative: 'Decentralized Science + AI' },
        { keyword: 'agent swarm', narrative: 'Multi-agent coordination' },
    ];

    for (const topic of trendingTopics) {
        // Simple check - in production would verify with social data
        narratives.push(topic.narrative);
    }

    return narratives;
}

/**
 * Get trending AI agent tokens with their metrics
 */
export async function getAIAgentTokens(): Promise<
    { symbol: string; narrative: string }[]
> {
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
 * Get automation workflow trends (what agents are being built for)
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
