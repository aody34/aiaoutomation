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

// ===============================
// NEW TYPES FOR ARCHITECTURE V2
// ===============================

/**
 * Unified raw trend data from all providers
 */
export interface RawTrendData {
    source: 'dexscreener' | 'twitter' | 'axiom';
    timestamp: Date;
    tokens: TokenMetrics[];
    narratives: NarrativeSignal[];
    rawEngagement: EngagementData;
}

/**
 * Token metrics for scoring
 */
export interface TokenMetrics {
    symbol: string;
    name: string;
    chain: string;
    volumeChange1h: number;  // % change in 1 hour
    volume24h: number;
    liquidity: number;
    marketCap: number;
    priceChange24h: number;
    pairAddress: string;
    url: string;
}

/**
 * Narrative signal from social/news
 */
export interface NarrativeSignal {
    keyword: string;
    frequency: number;
    source: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Engagement data from social sources
 */
export interface EngagementData {
    totalMentions: number;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    topTickers: string[];
    tweetSamples: string[];
}

/**
 * Scored project with weighted algorithm
 */
export interface ScoredProject {
    ticker: string;
    score: number;           // 0-100 final weighted score
    volumeGrowthScore: number;
    narrativeVelocityScore: number;
    liquidityHealthScore: number;
}

/**
 * Full Build Specification for a project
 */
export interface BuildSpecification {
    projectName: string;
    ticker: string;
    score: number;
    concept: string;
    whyNow: string;

    techStack: {
        frontend: string;
        blockchain: string;
        backend: string;
        database: string;
        wallet: string;
        dataFetching?: string;
        realtime?: string;
    };

    coreFeatures: string[];

    databaseSchema: Record<string, string>;

    smartContractRequirements: string[];

    roadmap: string[];

    // Enhanced fields (10-year experience level)
    analysisLogic?: {
        smartMoneyFilters?: string[];
        signalGeneration?: string;
    };

    performanceSpecs?: {
        caching?: string;
        realtime?: string;
        rateLimit?: string;
    };

    marketingHook?: string;
}

