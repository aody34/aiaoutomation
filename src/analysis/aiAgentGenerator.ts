import { TokenData } from '../types';
import { getTrendingTokens, getVolumeSpikes } from '../services/dexscreener';
import { getRealProblems, RealProblem } from '../services/problemAnalyzer';
import { getAIAgentTrends } from '../services/axiom';

/**
 * Project Idea with BUILD PROMPT
 */
export interface AIAgentIdea {
    id: number;
    name: string;
    category: string;
    projectType: string;
    ideaType: 'AI Agent' | 'Real Project';
    problem: string;
    problemSource: string;
    solution: string;
    targetUser: string;
    features: string[];
    techStack: string[];
    buildPrompt: string;
    score: number;
    trendingContext: string;
}

// AI Agent types based on trending tokens
const AI_AGENT_TYPES = [
    { name: 'Sniper Bot', category: 'Trading', focus: 'Launch sniping' },
    { name: 'Wallet Tracker', category: 'Analytics', focus: 'Smart money tracking' },
    { name: 'Copy Trading Agent', category: 'Trading', focus: 'Automated copying' },
    { name: 'Alpha Scanner', category: 'Discovery', focus: 'Signal aggregation' },
    { name: 'Whale Alert Agent', category: 'Analytics', focus: 'Large tx monitoring' },
    { name: 'Rug Detection Agent', category: 'Security', focus: 'Contract analysis' },
    { name: 'Auto TP/SL Agent', category: 'Trading', focus: 'Profit automation' },
    { name: 'Social Buzz Agent', category: 'Discovery', focus: 'Sentiment tracking' },
    { name: 'Order Flow Agent', category: 'Analytics', focus: 'DEX flow analysis' },
    { name: 'Launch Monitor Agent', category: 'Discovery', focus: 'New pairs detection' },
];

// Real project solutions for community problems
const REAL_PROJECT_SOLUTIONS: Record<string, string[]> = {
    security: ['Contract Auditor Platform', 'Wallet Approval Manager', 'Deployer History Checker'],
    trading: ['Gas Fee Optimizer', 'MEV Protection Tool', 'Trading Journal Platform'],
    portfolio: ['Multi-Wallet Tracker', 'Crypto Tax Calculator', 'Cross-Chain PnL Dashboard'],
    discovery: ['Influencer Performance Tracker', 'Alpha Source Aggregator', 'Launch Gem Finder'],
    analytics: ['Holder Concentration Analyzer', 'Volume Pattern Scanner', 'On-Chain Intelligence Dashboard'],
    defi: ['IL Calculator with Fees', 'Yield Reality Checker', 'LP Position Manager'],
    community: ['Airdrop Eligibility Tracker', 'Holder Verification System', 'Community Reward Platform'],
    onboarding: ['Crypto Learning Platform', 'Paper Trading Simulator', 'Beginner Wallet Guide'],
};

/**
 * Generate 5 AI Agent ideas + 5 Real Project ideas = 10 total
 */
export async function generateAIAgentIdeas(minIdeas: number = 10): Promise<AIAgentIdea[]> {
    console.log('🚀 Generating 5 AI Agent + 5 Real Project ideas...');

    // Fetch all data sources
    const [trendingTokens, volumeSpikes, realProblems, aiTrends] = await Promise.all([
        getTrendingTokens(),
        getVolumeSpikes(),
        getRealProblems(),
        getAIAgentTrends(),
    ]);

    console.log(`  ✓ Found ${trendingTokens.length} trending tokens`);
    console.log(`  ✓ Found ${realProblems.length} real community problems`);
    console.log(`  ✓ Found ${aiTrends.length} AI trends`);

    const allTokens = [...trendingTokens, ...volumeSpikes].filter(t => t.symbol && t.symbol !== 'N/A');
    const today = new Date().toDateString();
    const seed = hashString(today);

    const shuffledTokens = shuffleWithSeed(allTokens, seed);
    const shuffledProblems = shuffleWithSeed(realProblems, seed + 1);
    const shuffledAgentTypes = shuffleWithSeed([...AI_AGENT_TYPES], seed + 2);

    const ideas: AIAgentIdea[] = [];

    // Generate 5 AI Agent Ideas (from Dexscreener + Axiom trends)
    console.log('\n📊 Generating AI Agent ideas from Dexscreener/Axiom...');
    for (let i = 0; i < 5; i++) {
        const agentType = shuffledAgentTypes[i];
        const token = shuffledTokens[i] || { symbol: 'SOL', chain: 'solana', priceChange24h: 10, volume24h: 500000 };

        ideas.push(generateAIAgentIdea(i + 1, agentType, token, shuffledTokens, aiTrends, seed + i));
    }

    // Generate 5 Real Project Ideas (from community problems)
    console.log('💬 Generating Real Project ideas from community problems...');
    for (let i = 0; i < 5; i++) {
        const problem = shuffledProblems[i];
        const token = shuffledTokens[(i + 5) % shuffledTokens.length] || { symbol: 'SOL', chain: 'solana', priceChange24h: 5, volume24h: 100000 };

        ideas.push(generateRealProjectIdea(i + 6, problem, token, shuffledTokens, seed + i + 5));
    }

    // Sort by score and return
    return ideas
        .map(idea => ({ ...idea, score: calculateScore(idea) }))
        .sort((a, b) => b.score - a.score);
}

/**
 * Generate AI Agent idea from trending tokens
 */
function generateAIAgentIdea(
    id: number,
    agentType: { name: string; category: string; focus: string },
    token: TokenData,
    allTokens: TokenData[],
    aiTrends: string[],
    seed: number
): AIAgentIdea {
    const chain = token.chain || 'solana';
    const symbol = token.symbol || 'TRENDING';

    const prefixes = ['Smart', 'Alpha', 'Degen', 'Turbo', 'Pro', 'Ultra', 'Rapid', 'Auto'];
    const name = `${prefixes[seed % prefixes.length]}${agentType.name.replace(' ', '')}`;

    const problem = `Traders need automated ${agentType.focus.toLowerCase()} for tokens like $${symbol} but manual execution is too slow`;
    const solution = `An AI-powered ${agentType.name.toLowerCase()} that automates ${agentType.focus.toLowerCase()} with real-time blockchain data and instant execution`;

    const features = getAIAgentFeatures(agentType.name, chain);
    const techStack = getAIAgentTechStack(chain);

    const buildPrompt = generateAIAgentPrompt(name, agentType, chain, symbol, allTokens, aiTrends, features);

    return {
        id,
        name,
        category: agentType.category,
        projectType: agentType.name,
        ideaType: 'AI Agent',
        problem,
        problemSource: `From Dexscreener trending ($${symbol} ${token.priceChange24h > 0 ? '+' : ''}${(token.priceChange24h || 0).toFixed(0)}%)`,
        solution,
        targetUser: `Memecoin traders who need automated ${agentType.focus.toLowerCase()}`,
        features,
        techStack,
        buildPrompt,
        score: 0,
        trendingContext: `Based on $${symbol} trending on Dexscreener`,
    };
}

/**
 * Generate Real Project idea from community problem
 */
function generateRealProjectIdea(
    id: number,
    problem: RealProblem,
    token: TokenData,
    allTokens: TokenData[],
    seed: number
): AIAgentIdea {
    const chain = token.chain || 'solana';
    const category = problem.category;

    const projectOptions = REAL_PROJECT_SOLUTIONS[category] || REAL_PROJECT_SOLUTIONS.trading;
    const projectType = projectOptions[seed % projectOptions.length];

    const prefixes = ['Pro', 'Smart', 'Chain', 'Crypto', 'Block', 'Ultra', 'True', 'Real'];
    const suffix = projectType.split(' ').pop() || 'Tool';
    const name = `${prefixes[seed % prefixes.length]}${suffix}`;

    const solution = `A ${projectType.toLowerCase()} that solves this problem with a beautiful, user-friendly interface`;

    const features = getRealProjectFeatures(category, chain);
    const techStack = getRealProjectTechStack(category, chain);

    const buildPrompt = generateRealProjectPrompt(name, projectType, category, chain, problem, allTokens, features);

    return {
        id,
        name,
        category: capitalizeFirst(category),
        projectType,
        ideaType: 'Real Project',
        problem: problem.problem,
        problemSource: `Real problem from ${problem.source} (${problem.frequency} frequency)`,
        solution,
        targetUser: getTargetUser(category),
        features,
        techStack,
        buildPrompt,
        score: 0,
        trendingContext: `Solving real community problem`,
    };
}

function getAIAgentFeatures(agentType: string, chain: string): string[] {
    const base = [`Real-time ${chain} monitoring`, 'AI-powered decisions', 'Instant Telegram alerts', 'One-click execution', 'Dashboard analytics'];
    const specific: Record<string, string[]> = {
        'Sniper Bot': ['Auto-buy on launch', 'Contract safety check', 'MEV protection', 'Slippage control'],
        'Wallet Tracker': ['Top wallet discovery', 'PnL tracking', 'Copy signals', 'Activity feed'],
        'Copy Trading Agent': ['Auto-copy trades', 'Risk limits', 'Position sizing', 'Performance stats'],
        'Alpha Scanner': ['Multi-source aggregation', 'Noise filtering', 'Signal scoring', 'Alert customization'],
        'Whale Alert Agent': ['Large tx detection', 'Wallet labeling', 'Impact prediction', 'Movement history'],
        'Rug Detection Agent': ['Contract analysis', 'Deployer check', 'Liquidity verify', 'Risk score'],
        'Auto TP/SL Agent': ['Take-profit levels', 'Trailing stop', 'Position tracking', 'Auto-execute'],
        'Social Buzz Agent': ['Mention velocity', 'Sentiment analysis', 'Influencer tracking', 'Trend detection'],
        'Order Flow Agent': ['Buy/sell ratio', 'Volume analysis', 'Accumulation patterns', 'Flow alerts'],
        'Launch Monitor Agent': ['New pair detection', 'Creator analysis', 'Early signals', 'Gem scoring'],
    };
    return [...(specific[agentType] || specific['Alpha Scanner']).slice(0, 4), ...base.slice(0, 3)];
}

function getRealProjectFeatures(category: string, chain: string): string[] {
    const base = [`${chain} blockchain integration`, 'Beautiful dark UI', 'Mobile responsive', 'Export functionality', 'User accounts'];
    const specific: Record<string, string[]> = {
        security: ['Risk score 0-100', 'Deployer history', 'Contract analysis', 'Community reports'],
        trading: ['Transaction history', 'Gas estimation', 'Route optimization', 'Slippage settings'],
        portfolio: ['Multi-wallet sync', 'Cross-chain view', 'Tax reports', 'PnL charts'],
        discovery: ['Source credibility', 'Historical accuracy', 'Custom filters', 'Watchlists'],
        analytics: ['Interactive charts', 'Custom metrics', 'Alerts', 'Data export'],
        defi: ['Accurate calculations', 'Fee inclusion', 'Position tracking', 'APY comparison'],
        community: ['Bot detection', 'Verification badges', 'Activity tracking', 'Rewards'],
        onboarding: ['Interactive tutorials', 'Progress tracking', 'Quizzes', 'Achievements'],
    };
    return [...(specific[category] || specific.trading).slice(0, 4), ...base.slice(0, 3)];
}

function getAIAgentTechStack(chain: string): string[] {
    return ['Next.js 14', 'TypeScript', 'TailwindCSS', 'Supabase', chain === 'solana' ? 'Helius RPC' : 'Alchemy', chain === 'solana' ? '@solana/web3.js' : 'Ethers.js', 'OpenAI API'];
}

function getRealProjectTechStack(category: string, chain: string): string[] {
    const base = ['Next.js 14', 'TypeScript', 'TailwindCSS', 'Supabase', 'DexScreener API'];
    if (chain === 'solana') base.push('Helius RPC');
    else base.push('Alchemy');
    return base;
}

function getTargetUser(category: string): string {
    const targets: Record<string, string> = {
        security: 'Traders who want protection from scams',
        trading: 'Active traders who need better tools',
        portfolio: 'Investors tracking multiple wallets',
        discovery: 'Alpha seekers looking for quality signals',
        analytics: 'Data-driven traders',
        defi: 'DeFi users managing positions',
        community: 'Token creators and managers',
        onboarding: 'Crypto beginners',
    };
    return targets[category] || 'Crypto traders';
}

function generateAIAgentPrompt(
    name: string,
    agentType: { name: string; category: string; focus: string },
    chain: string,
    symbol: string,
    allTokens: TokenData[],
    aiTrends: string[],
    features: string[]
): string {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const trendingList = allTokens.slice(0, 5).map(t => `$${t.symbol}`).join(', ') || '$SOL, $BONK';

    return `
╔═══════════════════════════════════════════════════════════════════════════════════╗
║  🤖 AI AGENT BUILD PROMPT: ${name.padEnd(52)} ║
║  📅 ${today.padEnd(68)} ║
║  📊 Trending: ${trendingList.padEnd(58)} ║
╚═══════════════════════════════════════════════════════════════════════════════════╝

TYPE: AI Agent (Autonomous Trading Tool)
CATEGORY: ${agentType.category}
FOCUS: ${agentType.focus}
CHAIN: ${chain.toUpperCase()}

Build an AI-powered ${agentType.name.toLowerCase()} that helps memecoin traders with 
automated ${agentType.focus.toLowerCase()}. The agent should monitor ${chain} blockchain 
in real-time and make intelligent decisions faster than humans can.

TECH STACK:
- Next.js 14, TypeScript, TailwindCSS
- Supabase (database + auth)
- ${chain === 'solana' ? 'Helius RPC + @solana/web3.js' : 'Alchemy + Ethers.js'}
- OpenAI API for intelligent decision making
- Telegram Bot API for alerts

CORE FEATURES:
${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

PROJECT STRUCTURE:
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/page.tsx    # Agent dashboard
│   ├── api/                  # Backend routes
├── components/               # UI components
├── lib/
│   ├── agent.ts              # AI agent logic
│   ├── ${chain}.ts           # Blockchain integration
│   ├── ai.ts                 # OpenAI integration
└── hooks/                    # React hooks

DATABASE:
- users (wallet, settings)
- agent_config (parameters, targets)
- activity_log (actions, results)
- alerts (rules, triggers)

BUILD STEPS:
1. Create Next.js project with TypeScript + TailwindCSS
2. Set up Supabase database
3. Build landing page with agent value proposition
4. Create dashboard with agent controls
5. Implement AI agent logic with ${agentType.focus.toLowerCase()}
6. Add blockchain monitoring with webhooks
7. Build Telegram notification system
8. Deploy to Vercel

AI AGENT LOGIC:
The agent should:
- Monitor blockchain for relevant events
- Analyze opportunities using predefined rules + AI
- Execute actions when criteria are met
- Send alerts with results
- Learn from outcomes to improve

START: Create project, build landing page, then implement core agent logic.
`;
}

function generateRealProjectPrompt(
    name: string,
    projectType: string,
    category: string,
    chain: string,
    problem: RealProblem,
    allTokens: TokenData[],
    features: string[]
): string {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return `
╔═══════════════════════════════════════════════════════════════════════════════════╗
║  💡 REAL PROJECT BUILD PROMPT: ${name.padEnd(48)} ║
║  📅 ${today.padEnd(68)} ║
║  🔍 Source: ${problem.source.padEnd(61)} ║
╚═══════════════════════════════════════════════════════════════════════════════════╝

TYPE: Real Project (Community-Requested Tool)
CATEGORY: ${capitalizeFirst(category)}
PROJECT: ${projectType}
CHAIN: ${chain.toUpperCase()}

THE REAL PROBLEM (from ${problem.source}):
"${problem.problem}"

Frequency: ${problem.frequency} | Sentiment: ${problem.sentiment}

YOUR SOLUTION:
Build a ${projectType.toLowerCase()} that solves this exact problem with a 
beautiful, user-friendly interface that anyone can use.

TECH STACK:
- Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- Supabase (database + auth + realtime)
- ${chain === 'solana' ? 'Helius RPC' : 'Alchemy API'}
- DexScreener API for market data

CORE FEATURES:
${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

PROJECT STRUCTURE:
├── app/
│   ├── page.tsx              # Landing (explain the problem you solve)
│   ├── dashboard/page.tsx    # Main functionality
│   ├── settings/page.tsx     # User preferences
│   ├── api/                  # Backend
├── components/
│   ├── ui/                   # shadcn components
│   ├── dashboard/            # Feature components
├── lib/
│   ├── supabase.ts           # Database
│   ├── ${chain}.ts           # Blockchain
└── hooks/                    # React hooks

DATABASE SCHEMA:
- users (wallet_address, email, created_at)
- tracked_items (user_id, type, address, chain)
- settings (user_id, preferences)
- activity (user_id, action, timestamp)

DESIGN:
- Dark mode default (#09090b background)
- Primary: #6366f1 (indigo)
- Success: #22c55e, Error: #ef4444
- Font: Inter, Mono: JetBrains Mono
- Glass effect cards, smooth animations

BUILD STEPS:
1. Create Next.js project with TypeScript + TailwindCSS
2. Install shadcn/ui components
3. Set up Supabase and create tables
4. Build landing page explaining the problem
5. Create dashboard with core functionality
6. Implement ${category} logic
7. Add user authentication
8. Polish and deploy

START: Create project, focus on the landing page that clearly explains 
the problem and your solution. Make users feel understood.
`;
}

function calculateScore(idea: AIAgentIdea): number {
    let score = 7;
    if (['Trading', 'Security', 'Analytics', 'Discovery'].includes(idea.category)) score += 1;
    if (idea.ideaType === 'AI Agent') score += 0.3;
    if (idea.problemSource.includes('high')) score += 0.5;
    score += Math.random() * 0.5;
    return Math.min(10, Math.round(score * 10) / 10);
}

function shuffleWithSeed<T>(array: T[], seed: number): T[] {
    const result = [...array];
    let currentIndex = result.length;
    let randomValue = seed;
    while (currentIndex > 0) {
        randomValue = (randomValue * 1103515245 + 12345) & 0x7fffffff;
        const randomIndex = randomValue % currentIndex;
        currentIndex--;
        [result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]];
    }
    return result;
}

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
