import { TokenData } from '../types';
import { getTrendingTokens, getVolumeSpikes } from '../services/dexscreener';
import { getRealProblems, RealProblem } from '../services/problemAnalyzer';
import { getAIAgentTrends } from '../services/axiom';

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

const AI_AGENT_TYPES = [
    { name: 'Sniper Bot', category: 'Trading', focus: 'Launch sniping' },
    { name: 'Wallet Tracker', category: 'Analytics', focus: 'Smart money tracking' },
    { name: 'Copy Trading Bot', category: 'Trading', focus: 'Trade copying' },
    { name: 'Alpha Scanner', category: 'Discovery', focus: 'Signal aggregation' },
    { name: 'Whale Alert Bot', category: 'Analytics', focus: 'Large tx monitoring' },
    { name: 'Rug Detector', category: 'Security', focus: 'Contract analysis' },
    { name: 'Auto TP/SL Bot', category: 'Trading', focus: 'Profit automation' },
    { name: 'Social Scanner', category: 'Discovery', focus: 'Sentiment tracking' },
    { name: 'Order Flow Analyzer', category: 'Analytics', focus: 'DEX flow analysis' },
    { name: 'Launch Monitor', category: 'Discovery', focus: 'New pairs detection' },
];

const REAL_PROJECT_SOLUTIONS: Record<string, string[]> = {
    security: ['Contract Auditor', 'Approval Manager', 'Deployer Checker'],
    trading: ['Gas Optimizer', 'MEV Shield', 'Trade Journal'],
    portfolio: ['Multi-Wallet Tracker', 'Tax Calculator', 'PnL Dashboard'],
    discovery: ['Influencer Tracker', 'Alpha Aggregator', 'Gem Finder'],
    analytics: ['Holder Analyzer', 'Volume Scanner', 'On-Chain Dashboard'],
    defi: ['IL Calculator', 'Yield Tracker', 'LP Manager'],
    community: ['Airdrop Tracker', 'Holder Verifier', 'Rewards Platform'],
    onboarding: ['Crypto Academy', 'Paper Trading', 'Wallet Guide'],
};

export async function generateAIAgentIdeas(minIdeas: number = 10): Promise<AIAgentIdea[]> {
    console.log('🚀 Generating 5 AI Agent + 5 Real Project ideas...');

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

    // Generate 5 AI Agent Ideas
    console.log('\n📊 Generating AI Agent ideas...');
    for (let i = 0; i < 5; i++) {
        const agentType = shuffledAgentTypes[i];
        const token = shuffledTokens[i] || { symbol: 'SOL', chain: 'solana', priceChange24h: 10, volume24h: 500000 };
        ideas.push(generateAIAgentIdea(i + 1, agentType, token, shuffledTokens, seed + i));
    }

    // Generate 5 Real Project Ideas
    console.log('💬 Generating Real Project ideas...');
    for (let i = 0; i < 5; i++) {
        const problem = shuffledProblems[i];
        const token = shuffledTokens[(i + 5) % shuffledTokens.length] || { symbol: 'SOL', chain: 'solana', priceChange24h: 5, volume24h: 100000 };
        ideas.push(generateRealProjectIdea(i + 6, problem, token, seed + i + 5));
    }

    return ideas.map(idea => ({ ...idea, score: calculateScore(idea) })).sort((a, b) => b.score - a.score);
}

function generateAIAgentIdea(
    id: number,
    agentType: { name: string; category: string; focus: string },
    token: TokenData,
    allTokens: TokenData[],
    seed: number
): AIAgentIdea {
    const chain = token.chain || 'solana';
    const symbol = token.symbol || 'TOKEN';
    const prefixes = ['Smart', 'Alpha', 'Degen', 'Turbo', 'Pro', 'Ultra', 'Rapid', 'Auto'];
    const name = `${prefixes[seed % prefixes.length]}${agentType.name.replace(/\s+/g, '')}`;

    const features = [
        `Real-time ${chain} blockchain monitoring`,
        `AI-powered ${agentType.focus.toLowerCase()}`,
        'Instant Telegram/Discord alerts',
        'One-click wallet connection',
        'Beautiful dark mode dashboard',
        'Performance analytics',
        'Custom alert settings',
    ];

    const techStack = ['Next.js 14', 'TypeScript', 'TailwindCSS', 'Supabase', chain === 'solana' ? 'Helius' : 'Alchemy', 'OpenAI'];

    const buildPrompt = `Build a production-ready ${agentType.name} platform for ${chain.toUpperCase()} traders.

PROJECT: ${name}
TYPE: AI Trading Agent
CHAIN: ${chain.toUpperCase()}

PROBLEM:
Traders need automated ${agentType.focus.toLowerCase()} but manual execution is too slow. Trending tokens like $${symbol} move fast.

SOLUTION:
An AI-powered ${agentType.name.toLowerCase()} that monitors the blockchain in real-time and executes faster than humans.

TECH STACK:
- Frontend: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- Backend: Next.js API Routes, Supabase
- Blockchain: ${chain === 'solana' ? 'Helius RPC, @solana/web3.js' : 'Alchemy, Ethers.js'}
- AI: OpenAI API
- Alerts: Telegram Bot API

CORE FEATURES:
1. ${agentType.focus} with AI analysis
2. Real-time blockchain monitoring via webhooks
3. Automated execution with safety checks
4. Telegram alerts with trade details
5. Dashboard with performance metrics
6. Wallet connection (Phantom/MetaMask)
7. User settings and preferences

DATABASE (Supabase):
- users: id, wallet_address, telegram_chat_id, settings, created_at
- agent_configs: id, user_id, name, config, is_active, created_at
- transactions: id, user_id, token_address, action, amount, tx_hash, created_at
- alerts: id, user_id, type, message, created_at

PAGES TO BUILD:
1. Landing page - Hero, features, CTA
2. Dashboard - Agent controls, stats, recent activity
3. Settings - Notifications, risk parameters
4. History - Past transactions, PnL

API ROUTES:
- POST /api/analyze - Analyze token safety
- POST /api/execute - Execute trade
- POST /api/webhook - Handle blockchain events
- GET /api/stats - User statistics

DESIGN:
- Dark theme: #09090b background, #18181b cards
- Primary: #6366f1 (indigo)
- Success: #22c55e, Error: #ef4444
- Font: Inter, smooth animations

Build a complete, deployable application. Start with the landing page, then dashboard, then core agent logic.`;

    return {
        id, name, category: agentType.category, projectType: agentType.name,
        ideaType: 'AI Agent',
        problem: `Traders need automated ${agentType.focus.toLowerCase()} but manual execution is too slow`,
        problemSource: `Trending: $${symbol} (${(token.priceChange24h || 0) > 0 ? '+' : ''}${(token.priceChange24h || 0).toFixed(0)}%)`,
        solution: `AI-powered ${agentType.name.toLowerCase()} with real-time monitoring`,
        targetUser: `${chain} memecoin traders`,
        features, techStack, buildPrompt, score: 0,
        trendingContext: `Based on $${symbol} trending`,
    };
}

function generateRealProjectIdea(
    id: number,
    problem: RealProblem,
    token: TokenData,
    seed: number
): AIAgentIdea {
    const chain = token.chain || 'solana';
    const category = problem.category;
    const projectOptions = REAL_PROJECT_SOLUTIONS[category] || REAL_PROJECT_SOLUTIONS.trading;
    const projectType = projectOptions[seed % projectOptions.length];

    const prefixes = ['Pro', 'Smart', 'Chain', 'Crypto', 'Block', 'Ultra', 'True', 'Real'];
    const name = `${prefixes[seed % prefixes.length]}${projectType.replace(/\s+/g, '')}`;

    const features = [
        `${chain} blockchain integration`,
        'Beautiful dark mode UI',
        'Mobile responsive design',
        'User authentication via wallet',
        'Real-time data updates',
        'Export functionality',
        'Custom alerts',
    ];

    const techStack = ['Next.js 14', 'TypeScript', 'TailwindCSS', 'Supabase', 'DexScreener API', chain === 'solana' ? 'Helius' : 'Alchemy'];

    const buildPrompt = `Build a production-ready ${projectType} platform for crypto users.

PROJECT: ${name}
TYPE: ${projectType}
CHAIN: ${chain.toUpperCase()}

PROBLEM (from ${problem.source}):
"${problem.problem}"
Frequency: ${problem.frequency} | Sentiment: ${problem.sentiment}

SOLUTION:
A ${projectType.toLowerCase()} that solves this exact problem with a beautiful, user-friendly interface.

TECH STACK:
- Frontend: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- Backend: Next.js API Routes, Supabase
- Data: DexScreener API, ${chain === 'solana' ? 'Helius' : 'Alchemy'}
- Auth: Wallet connection

CORE FEATURES:
1. Solve the core problem: ${problem.problem.slice(0, 50)}...
2. Real-time data from blockchain
3. Clean dashboard with key metrics
4. Search and filter functionality
5. Export data to CSV
6. Telegram notifications
7. User preferences

DATABASE (Supabase):
- users: id, wallet_address, email, settings, created_at
- tracked_items: id, user_id, type, address, name, metadata, created_at
- analyses: id, item_id, score, result, created_at
- activity: id, user_id, action, details, created_at

PAGES TO BUILD:
1. Landing page - Explain the problem, show solution, CTA
2. Dashboard - Main functionality, data display
3. Settings - Preferences, notifications
4. History - Past analyses, activity log

API ROUTES:
- POST /api/analyze - Analyze item
- POST /api/track - Add tracked item
- GET /api/data - Fetch user data
- DELETE /api/track/[id] - Remove item

DESIGN:
- Dark theme: #09090b background, #18181b cards
- Primary: #6366f1 (indigo)
- Success: #22c55e, Warning: #eab308, Error: #ef4444
- Font: Inter, glass effect cards, smooth animations

Build a complete, deployable application. Focus on solving the real problem users have.`;

    return {
        id, name, category: capitalizeFirst(category), projectType,
        ideaType: 'Real Project',
        problem: problem.problem,
        problemSource: `From ${problem.source} (${problem.frequency} frequency)`,
        solution: `A ${projectType.toLowerCase()} that solves this problem`,
        targetUser: getTargetUser(category),
        features, techStack, buildPrompt, score: 0,
        trendingContext: 'Solving real community problem',
    };
}

function getTargetUser(category: string): string {
    const targets: Record<string, string> = {
        security: 'Traders protecting from scams',
        trading: 'Active crypto traders',
        portfolio: 'Multi-wallet investors',
        discovery: 'Alpha seekers',
        analytics: 'Data-driven traders',
        defi: 'DeFi users',
        community: 'Token creators',
        onboarding: 'Crypto beginners',
    };
    return targets[category] || 'Crypto traders';
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
