import {
    TokenData,
    TrendingTopic,
    ProjectIdea,
    MarketSnapshot,
    RawTrendData,
    TokenMetrics,
    NarrativeSignal,
    BuildSpecification,
} from '../types';
import { DexscreenerProvider } from '../services/dexscreener';
import { TwitterProvider } from '../services/twitter';
import { AxiomProvider } from '../services/axiom';
import { getTrendingTokens, getVolumeSpikes } from '../services/dexscreener';
import { getTrendingTopics, getViralMemes, getTrendingHashtags } from '../services/twitter';
import { getAIAgentTrends, getAutomationTrends } from '../services/axiom';
import { ANALYST_SYSTEM_PROMPT, buildUserPrompt } from './llmPrompt';

// Scoring weights
const SCORING_WEIGHTS = {
    VOLUME_GROWTH: 0.25,      // 25% - Volume spike in 1h
    NARRATIVE_VELOCITY: 0.35,  // 35% - AI Agent/Axiom keyword frequency
    LIQUIDITY_HEALTH: 0.40,    // 40% - MC/Liquidity ratio
};

// AI-related keywords for narrative velocity
const AI_KEYWORDS = [
    'ai agent', 'axiom', 'autonomous', 'on-chain ai',
    'ai16z', 'virtual', 'ai bot', 'agent swarm',
];

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

// Initialize providers
const dexscreenerProvider = new DexscreenerProvider();
const twitterProvider = new TwitterProvider();
const axiomProvider = new AxiomProvider();

/**
 * Calculate Volume Growth Score (0-100)
 * +25% volume in 1h = 100 score
 */
function scoreVolumeGrowth(volumeChange1h: number): number {
    if (volumeChange1h <= 0) return 0;
    return Math.min(100, Math.round((volumeChange1h / 25) * 100));
}

/**
 * Calculate Narrative Velocity Score (0-100)
 * Based on AI/Axiom keyword frequency
 */
function scoreNarrativeVelocity(narratives: NarrativeSignal[]): number {
    let totalAIFrequency = 0;

    for (const narrative of narratives) {
        const isAIRelated = AI_KEYWORDS.some(k =>
            narrative.keyword.toLowerCase().includes(k)
        );
        if (isAIRelated) {
            totalAIFrequency += narrative.frequency;
        }
    }

    // 50 mentions = 100 score
    return Math.min(100, Math.round((totalAIFrequency / 50) * 100));
}

/**
 * Calculate Liquidity Health Score (0-100)
 * MC/Liquidity ratio of 2-10x = healthy
 */
function scoreLiquidityHealth(marketCap: number, liquidity: number): number {
    if (liquidity === 0) return 0;

    const ratio = marketCap / liquidity;

    if (ratio >= 2 && ratio <= 5) return 100;  // Optimal
    if (ratio > 5 && ratio <= 10) return 75;   // Good
    if (ratio > 10 && ratio <= 20) return 50;  // Acceptable
    return 25;  // Risky (too low or too high)
}

/**
 * Calculate combined weighted score
 */
function calculateWeightedScore(
    volumeChange1h: number,
    narratives: NarrativeSignal[],
    marketCap: number,
    liquidity: number
): { total: number; volumeScore: number; narrativeScore: number; liquidityScore: number } {
    const volumeScore = scoreVolumeGrowth(volumeChange1h);
    const narrativeScore = scoreNarrativeVelocity(narratives);
    const liquidityScore = scoreLiquidityHealth(marketCap, liquidity);

    const total = Math.round(
        volumeScore * SCORING_WEIGHTS.VOLUME_GROWTH +
        narrativeScore * SCORING_WEIGHTS.NARRATIVE_VELOCITY +
        liquidityScore * SCORING_WEIGHTS.LIQUIDITY_HEALTH
    );

    return { total, volumeScore, narrativeScore, liquidityScore };
}

/**
 * Main trend analyzer - combines all data sources using new providers
 */
export async function analyzeMarket(): Promise<MarketSnapshot> {
    console.log('📊 Analyzing market data with new providers...');

    // Fetch data from all providers in parallel
    const [dexData, twitterData, axiomData] = await Promise.all([
        dexscreenerProvider.getData().catch(err => {
            console.error('Dexscreener fetch failed:', err.message);
            return null;
        }),
        twitterProvider.getData().catch(err => {
            console.error('Twitter fetch failed:', err.message);
            return null;
        }),
        axiomProvider.getData().catch(err => {
            console.error('Axiom fetch failed:', err.message);
            return null;
        }),
    ]);

    // Combine into market snapshot (legacy format for backward compat)
    const trendingTokens: TokenData[] = dexData?.tokens.map(t => ({
        name: t.name,
        symbol: t.symbol,
        chain: t.chain,
        priceUsd: '0',
        priceChange24h: t.priceChange24h,
        volume24h: t.volume24h,
        liquidity: t.liquidity,
        pairAddress: t.pairAddress,
        url: t.url,
        marketCap: t.marketCap,
    })) || [];

    const hotTopics: TrendingTopic[] = twitterData?.narratives.map(n => ({
        keyword: n.keyword,
        source: 'twitter' as const,
        mentions: n.frequency,
        sentiment: n.sentiment,
        relatedTokens: twitterData.rawEngagement.topTickers,
    })) || [];

    const aiAgentTrends: string[] = axiomData?.narratives.map(n => n.keyword) || [];
    const viralMemes: string[] = twitterData?.rawEngagement.tweetSamples || [];

    return {
        timestamp: new Date(),
        trendingTokens,
        hotTopics,
        aiAgentTrends,
        viralMemes,
    };
}

/**
 * Analyze market with new providers and return raw data for LLM
 */
export async function analyzeMarketV2(): Promise<{
    tokens: TokenMetrics[];
    narratives: NarrativeSignal[];
    trendingTickers: string[];
    rawData: RawTrendData[];
}> {
    console.log('📊 Analyzing market data (V2)...');

    const [dexData, twitterData, axiomData] = await Promise.all([
        dexscreenerProvider.getData().catch(() => null),
        twitterProvider.getData().catch(() => null),
        axiomProvider.getData().catch(() => null),
    ]);

    const rawData: RawTrendData[] = [];
    if (dexData) rawData.push(dexData);
    if (twitterData) rawData.push(twitterData);
    if (axiomData) rawData.push(axiomData);

    // Combine tokens from all sources
    const tokens = dexData?.tokens || [];

    // Combine narratives from Twitter and Axiom
    const narratives = [
        ...(twitterData?.narratives || []),
        ...(axiomData?.narratives || []),
    ];

    // Combine trending tickers
    const trendingTickers = [
        ...(dexData?.rawEngagement.topTickers || []),
        ...(twitterData?.rawEngagement.topTickers || []),
    ];

    return {
        tokens,
        narratives,
        trendingTickers: [...new Set(trendingTickers)],
        rawData,
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

    // Score and sort ideas using new algorithm
    const scoredIdeas = ideas.map((idea) => ({
        ...idea,
        score: calculateOpportunityScore(idea, snapshot),
    }));

    return scoredIdeas
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.max(minIdeas, 7));
}

/**
 * Generate Build Specifications using the new analysis
 */
export async function generateBuildSpecifications(count: number = 5): Promise<BuildSpecification[]> {
    console.log('🔧 Generating Build Specifications...');

    const marketData = await analyzeMarketV2();

    // For now, generate mock build specs based on analyzed data
    // In production, this would call an LLM with the ANALYST_SYSTEM_PROMPT
    const buildSpecs: BuildSpecification[] = [];

    // Score and rank tokens
    const scoredTokens = marketData.tokens
        .map(token => ({
            token,
            scores: calculateWeightedScore(
                token.volumeChange1h,
                marketData.narratives,
                token.marketCap,
                token.liquidity
            ),
        }))
        .sort((a, b) => b.scores.total - a.scores.total)
        .slice(0, count);

    for (let i = 0; i < Math.min(count, scoredTokens.length); i++) {
        const { token, scores } = scoredTokens[i];
        const projectName = `${NAME_PREFIXES[i % NAME_PREFIXES.length]} ${token.symbol} ${NAME_SUFFIXES[i % NAME_SUFFIXES.length]}`;

        buildSpecs.push({
            projectName,
            ticker: `$${token.symbol}X`,
            score: scores.total,
            concept: `A ${token.symbol}-inspired project leveraging current AI agent momentum with ${scores.total}% opportunity score.`,
            whyNow: `${token.symbol} is trending with ${token.volume24h.toLocaleString()} 24h volume. AI narrative velocity: ${scores.narrativeScore}/100. Liquidity health: ${scores.liquidityScore}/100.`,
            techStack: {
                frontend: 'Next.js 14+, React 18, shadcn/ui, TailwindCSS',
                blockchain: token.chain === 'solana'
                    ? 'Solana (@solana/web3.js, @metaplex-foundation/js)'
                    : 'EVM (ethers v6, wagmi, viem)',
                backend: 'Node.js 20+, tRPC, WebSocket',
                database: 'Supabase (PostgreSQL) with Row Level Security',
                wallet: token.chain === 'solana'
                    ? '@solana/wallet-adapter-react'
                    : 'RainbowKit + wagmi',
            },
            coreFeatures: [
                'Real-time token price tracking',
                'Wallet connection and authentication',
                'Social sharing and community features',
            ],
            databaseSchema: {
                users: 'id (uuid), wallet_address (text unique), created_at (timestamptz)',
                transactions: 'id (uuid), user_id (fk), token_amount (decimal), tx_hash (text), status (enum)',
            },
            smartContractRequirements: [
                token.chain === 'solana'
                    ? 'SPL Token deployment via Metaplex'
                    : 'ERC-20 Token deployment',
                'Basic staking mechanism',
            ],
            roadmap: [
                'Step 1: npx create-next-app@latest my-project --typescript --tailwind --app',
                'Step 2: npx shadcn-ui@latest init',
                `Step 3: npm install ${token.chain === 'solana' ? '@solana/web3.js @solana/wallet-adapter-react' : 'wagmi viem @rainbow-me/rainbowkit'}`,
                'Step 4: Set up Supabase project and create tables',
                'Step 5: Implement wallet connection and basic UI',
                'Step 6: Deploy token contract on devnet/testnet',
                'Step 7: Test full flow',
                'Step 8: Deploy to Vercel + mainnet',
            ],
        });
    }

    // If not enough tokens, generate AI-focused specs
    while (buildSpecs.length < count) {
        const idx = buildSpecs.length;
        const aiNarrative = marketData.narratives[idx % marketData.narratives.length]?.keyword || 'AI Agent';
        const prefix = NAME_PREFIXES[idx % NAME_PREFIXES.length];

        buildSpecs.push({
            projectName: `${prefix} ${aiNarrative.split(' ')[0]} Agent`,
            ticker: `$${prefix.substring(0, 2)}${aiNarrative.substring(0, 2)}`.toUpperCase(),
            score: 70 - idx * 5,
            concept: `An autonomous ${aiNarrative} project for the Web3 ecosystem.`,
            whyNow: `"${aiNarrative}" is trending with high narrative velocity. AI agents are the #1 narrative.`,
            techStack: {
                frontend: 'Next.js 14+, React 18, shadcn/ui, TailwindCSS',
                blockchain: 'Solana (@solana/web3.js, @metaplex-foundation/js)',
                backend: 'Node.js 20+, Express, WebSocket',
                database: 'Supabase (PostgreSQL)',
                wallet: '@solana/wallet-adapter-react',
            },
            coreFeatures: [
                'AI agent interaction interface',
                'Token-gated access',
                'Community governance',
            ],
            databaseSchema: {
                users: 'id (uuid), wallet_address (text unique), created_at (timestamptz)',
                agents: 'id (uuid), name (text), config (jsonb), owner_id (fk)',
            },
            smartContractRequirements: [
                'SPL Token deployment',
                'Agent registry program',
            ],
            roadmap: [
                'Step 1: npx create-next-app@latest --typescript --tailwind --app',
                'Step 2: npx shadcn-ui@latest init',
                'Step 3: npm install @solana/web3.js @solana/wallet-adapter-react',
                'Step 4: Set up Supabase',
                'Step 5: Build MVP UI',
                'Step 6: Deploy to Vercel',
            ],
        });
    }

    return buildSpecs;
}

/**
 * Get the LLM prompt for external use
 */
export function getLLMPrompt(): { system: string; buildUserPrompt: typeof buildUserPrompt } {
    return {
        system: ANALYST_SYSTEM_PROMPT,
        buildUserPrompt,
    };
}

// ====================================
// LEGACY HELPER FUNCTIONS
// ====================================

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

function calculateOpportunityScore(idea: ProjectIdea, snapshot: MarketSnapshot): number {
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
