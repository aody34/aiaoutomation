// Type definitions for the automation system

export interface TokenData {
    name: string;
    symbol: string;
    chain: string;
    priceUsd: string;
    priceChange24h: number;
    volume24h: number;
    liquidity: number;
    pairAddress: string;
    url: string;
    fdv?: number;
    marketCap?: number;
    txns24h?: {
        buys: number;
        sells: number;
    };
}

export interface TrendingTopic {
    keyword: string;
    source: 'twitter' | 'dexscreener' | 'axiom' | 'news';
    mentions: number;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    relatedTokens?: string[];
}

export interface ProjectIdea {
    id: number;
    name: string;
    ticker: string;
    narrative: string;
    concept: string;
    whyNow: string;
    tokenUtility: string;
    launchSimplicity: 'Easy' | 'Medium' | 'Hard';
    twitterHook: string;
    score: number; // 1-10 opportunity score
    sources: string[];
}

export interface MarketSnapshot {
    timestamp: Date;
    trendingTokens: TokenData[];
    hotTopics: TrendingTopic[];
    aiAgentTrends: string[];
    viralMemes: string[];
}

export interface DailyReport {
    date: string;
    ideas: ProjectIdea[];
    marketSnapshot: MarketSnapshot;
    generatedAt: Date;
}
