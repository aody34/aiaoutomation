import { TokenData, TrendingTopic, ProjectIdea, MarketSnapshot } from '../types';
import { getTrendingTokens, getVolumeSpikes, getNewPairs } from '../services/dexscreener';
import { getTrendingTopics, getViralMemes, getTrendingHashtags } from '../services/twitter';
import { getAIAgentTrends, getAutomationTrends } from '../services/axiom';

// Name components for generating unique project names
const NAME_PREFIXES = [
    'Moon', 'Degen', 'Based', 'Sigma', 'Giga', 'Ultra', 'Turbo', 'Hyper',
    'Alpha', 'Omega', 'Meta', 'Quantum', 'Neural', 'Cyber', 'Atomic',
];

const NAME_SUFFIXES = [
    'AI', 'Bot', 'Agent', 'Inu', 'Cat', 'Pepe', 'Wojak', 'Chad',
    'Coin', 'Token', 'Protocol', 'DAO', 'Labs', 'Network', 'Finance',
];

const MEME_THEMES = [
    'dog', 'cat', 'frog', 'ai', 'robot', 'space', 'moon', 'chad',
    'wojak', 'npc', 'gigabrain', 'degen', 'ape', 'diamond', 'rocket',
];

/**
 * Main trend analyzer - combines all data sources
 */
export async function analyzeMarket(): Promise<MarketSnapshot> {
    console.log('📊 Analyzing market data...');

    const [trendingTokens, hotTopics, aiTrends, memes] = await Promise.all([
        getTrendingTokens(),
        getTrendingTopics(),
        getAIAgentTrends(),
        getViralMemes(),
    ]);

    return {
        timestamp: new Date(),
        trendingTokens,
        hotTopics,
        aiAgentTrends: aiTrends,
        viralMemes: memes,
    };
}

/**
 * Generate project ideas from market data
 */
export async function generateIdeas(
    snapshot: MarketSnapshot,
    minIdeas: number = 5
): Promise<ProjectIdea[]> {
    console.log('💡 Generating project ideas...');

    const ideas: ProjectIdea[] = [];
    let ideaId = 1;

    // 1. Ideas from trending tokens
    const volumeLeaders = snapshot.trendingTokens
        .filter((t) => t.volume24h > 50000)
        .sort((a, b) => b.priceChange24h - a.priceChange24h)
        .slice(0, 3);

    for (const token of volumeLeaders) {
        ideas.push(createIdeaFromToken(token, ideaId++));
    }

    // 2. Ideas from Twitter trends
    const bullishTopics = snapshot.hotTopics
        .filter((t) => t.sentiment === 'bullish')
        .slice(0, 2);

    for (const topic of bullishTopics) {
        ideas.push(createIdeaFromTrend(topic, ideaId++));
    }

    // 3. Ideas from AI agent trends
    for (const trend of snapshot.aiAgentTrends.slice(0, 2)) {
        ideas.push(createIdeaFromAITrend(trend, ideaId++));
    }

    // 4. Ideas from viral memes
    for (const meme of snapshot.viralMemes.slice(0, 2)) {
        ideas.push(createIdeaFromMeme(meme, ideaId++));
    }

    // 5. Generate original ideas based on combined analysis
    while (ideas.length < minIdeas) {
        ideas.push(generateOriginalIdea(snapshot, ideaId++));
    }

    // Score and sort ideas
    const scoredIdeas = ideas.map((idea) => ({
        ...idea,
        score: calculateOpportunityScore(idea, snapshot),
    }));

    return scoredIdeas
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.max(minIdeas, 7));
}

/**
 * Create idea from a trending token
 */
function createIdeaFromToken(token: TokenData, id: number): ProjectIdea {
    const theme = detectTheme(token.name, token.symbol);
    const ticker = generateTicker(theme);

    return {
        id,
        name: `${capitalizeFirst(theme)} ${getRandomSuffix()}`,
        ticker,
        narrative: `Riding the momentum of ${token.symbol} (${token.priceChange24h > 0 ? '+' : ''}${token.priceChange24h.toFixed(1)}% in 24h). Similar narrative tokens often follow leaders.`,
        concept: `A memecoin that captures the same energy as ${token.symbol} but with a fresh twist. Simple, viral, community-driven.`,
        whyNow: `${token.symbol} is pumping with $${formatNumber(token.volume24h)} volume. The narrative is hot - similar tokens historically follow within 24-48h.`,
        tokenUtility: 'Meme / Community signal',
        launchSimplicity: 'Easy',
        twitterHook: `"${token.symbol} was just the beginning. $${ticker} is next. Don't fade this."`,
        score: 0,
        sources: ['Dexscreener', token.url],
    };
}

/**
 * Create idea from a Twitter trend
 */
function createIdeaFromTrend(topic: TrendingTopic, id: number): ProjectIdea {
    const ticker = generateTicker(topic.keyword);

    return {
        id,
        name: `${capitalizeFirst(topic.keyword.split(' ')[0])} Coin`,
        ticker,
        narrative: `"${topic.keyword}" is trending on CT with ${topic.mentions}+ mentions. Early mover advantage for tokenizing this narrative.`,
        concept: `A memecoin that embodies the "${topic.keyword}" movement. Community-owned, meme-first, culture-driven.`,
        whyNow: `Twitter is buzzing about this topic. First token to capture attention wins. The window is 24-72h.`,
        tokenUtility: topic.relatedTokens?.length
            ? `Meme / Pairs with ${topic.relatedTokens[0]}`
            : 'Meme / Signal',
        launchSimplicity: 'Easy',
        twitterHook: `"Everyone's talking about ${topic.keyword}. Now there's a coin for it. $${ticker}"`,
        score: 0,
        sources: ['Twitter/X', `Topic: ${topic.keyword}`],
    };
}

/**
 * Create idea from AI agent trend
 */
function createIdeaFromAITrend(trend: string, id: number): ProjectIdea {
    const words = trend.split(' ');
    const ticker = `${words[0]?.substring(0, 2).toUpperCase() || 'AI'}${words[1]?.substring(0, 2).toUpperCase() || 'X'}`;

    return {
        id,
        name: `${capitalizeFirst(words[0])} Agent`,
        ticker,
        narrative: `AI agents are the #1 narrative. "${trend}" is the specific angle gaining attention.`,
        concept: `An AI agent token that represents the "${trend}" use case. Simple memecoin layer on top of AI hype.`,
        whyNow: `AI agent market is exploding. Projects like AI16Z and Virtuals are pumping. This specific narrative is underexplored.`,
        tokenUtility: 'Agent usage / DAO governance',
        launchSimplicity: 'Medium',
        twitterHook: `"AI agents are taking over crypto. $${ticker} is betting on ${trend}. Are you in?"`,
        score: 0,
        sources: ['Axiom/AI', trend],
    };
}

/**
 * Create idea from viral meme
 */
function createIdeaFromMeme(meme: string, id: number): ProjectIdea {
    const cleanMeme = meme.substring(0, 50);
    const ticker = generateTickerFromMeme(cleanMeme);

    return {
        id,
        name: ticker,
        ticker,
        narrative: `Viral meme detected: "${cleanMeme}..." - These cultural moments often birth 10-100x tokens.`,
        concept: `Tokenize the meme. Simple as that. Community will do the rest.`,
        whyNow: `This specific meme is going viral RIGHT NOW. First tokenizer wins the narrative.`,
        tokenUtility: 'Meme / Cultural artifact',
        launchSimplicity: 'Easy',
        twitterHook: `"${cleanMeme.substring(0, 30)}..." Now it's a coin. $${ticker}`,
        score: 0,
        sources: ['Twitter/X Viral', 'Meme'],
    };
}

/**
 * Generate an original idea from combined analysis
 */
function generateOriginalIdea(snapshot: MarketSnapshot, id: number): ProjectIdea {
    const themes = MEME_THEMES;
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
    const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];

    const name = `${prefix} ${capitalizeFirst(theme)}`;
    const ticker = `${prefix.substring(0, 2)}${theme.substring(0, 2)}`.toUpperCase();

    const trendingSymbols = snapshot.trendingTokens
        .slice(0, 3)
        .map((t) => t.symbol)
        .join(', ');

    return {
        id,
        name,
        ticker,
        narrative: `Original concept combining current themes: ${theme} + AI/meme crossover. Market is hot for ${trendingSymbols}.`,
        concept: `A ${theme}-themed memecoin with ${prefix.toLowerCase()} energy. Simple, viral, community-first.`,
        whyNow: `Market sentiment is bullish. ${snapshot.trendingTokens.length}+ tokens trending. Room for new narratives.`,
        tokenUtility: 'Meme / Community',
        launchSimplicity: 'Easy',
        twitterHook: `"Introducing $${ticker}. The ${theme} meta just got ${prefix.toLowerCase()}."`,
        score: 0,
        sources: ['AI Analysis', 'Market Synthesis'],
    };
}

/**
 * Calculate opportunity score (1-10)
 */
function calculateOpportunityScore(
    idea: ProjectIdea,
    snapshot: MarketSnapshot
): number {
    let score = 5; // Base score

    // Boost for trending source
    if (idea.sources.includes('Dexscreener')) score += 1;
    if (idea.sources.includes('Twitter/X')) score += 1;
    if (idea.sources.includes('Axiom/AI')) score += 1.5;

    // Boost for easy launch
    if (idea.launchSimplicity === 'Easy') score += 1;

    // Boost for AI narrative (hot right now)
    if (idea.narrative.toLowerCase().includes('ai')) score += 1;

    // Boost for bullish market
    const bullishTopics = snapshot.hotTopics.filter(
        (t) => t.sentiment === 'bullish'
    ).length;
    if (bullishTopics > 2) score += 0.5;

    // Cap at 10
    return Math.min(10, Math.round(score * 10) / 10);
}

// Helper functions
function detectTheme(name: string, symbol: string): string {
    const combined = `${name} ${symbol}`.toLowerCase();
    for (const theme of MEME_THEMES) {
        if (combined.includes(theme)) return theme;
    }
    return symbol.toLowerCase().substring(0, 4) || 'meme';
}

function generateTicker(source: string): string {
    const clean = source.replace(/[^a-zA-Z]/g, '').toUpperCase();
    return clean.substring(0, 5) || 'MEME';
}

function generateTickerFromMeme(meme: string): string {
    const words = meme.split(' ').filter((w) => w.length > 2);
    if (words.length >= 2) {
        return `${words[0].substring(0, 2)}${words[1].substring(0, 2)}`.toUpperCase();
    }
    return words[0]?.substring(0, 4).toUpperCase() || 'MEME';
}

function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getRandomSuffix(): string {
    return NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
}

function formatNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toFixed(0);
}
