import { TokenData } from '../types';
import { getTrendingTokens, getVolumeSpikes } from '../services/dexscreener';
import { getRealProblems, RealProblem } from '../services/problemAnalyzer';
import { getAIAgentTrends } from '../services/axiom';

export interface AIAgentIdea {
    id: number;
    name: string;
    category: string;
    projectType: string;
    ideaType: 'AI Agent' | 'Real Project' | 'Gaming' | 'DeFi' | 'Privacy';
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

// AI Agent types
const AI_AGENT_TYPES = [
    { name: 'Sniper Bot', category: 'Trading', focus: 'Launch sniping' },
    { name: 'Wallet Tracker', category: 'Analytics', focus: 'Smart money tracking' },
    { name: 'Copy Trading Bot', category: 'Trading', focus: 'Trade copying' },
    { name: 'Alpha Scanner', category: 'Discovery', focus: 'Signal aggregation' },
    { name: 'Whale Alert Bot', category: 'Analytics', focus: 'Large tx monitoring' },
    { name: 'Rug Detector', category: 'Security', focus: 'Contract analysis' },
    { name: 'Auto TP/SL Bot', category: 'Trading', focus: 'Profit automation' },
    { name: 'Social Scanner', category: 'Discovery', focus: 'Sentiment tracking' },
];

// Gaming project types
const GAMING_PROJECTS = [
    { name: 'Play-to-Earn Game', focus: 'Earn crypto by playing' },
    { name: 'NFT Game Platform', focus: 'In-game NFT assets' },
    { name: 'Crypto Casino', focus: 'Provably fair gambling' },
    { name: 'Prediction Market', focus: 'Bet on outcomes' },
    { name: 'Battle Arena', focus: 'PvP with crypto stakes' },
    { name: 'Racing Game', focus: 'NFT cars, crypto prizes' },
    { name: 'Card Game', focus: 'NFT cards trading' },
    { name: 'Metaverse Land', focus: 'Virtual real estate' },
    { name: 'Lottery Platform', focus: 'Decentralized lottery' },
    { name: 'Sports Betting', focus: 'Crypto sports bets' },
];

// DeFi project types
const DEFI_PROJECTS = [
    { name: 'DEX Aggregator', focus: 'Best swap rates' },
    { name: 'Yield Optimizer', focus: 'Auto-compound yields' },
    { name: 'Lending Protocol', focus: 'Borrow and lend' },
    { name: 'Staking Platform', focus: 'Stake tokens for rewards' },
    { name: 'Liquidity Locker', focus: 'Lock LP tokens' },
    { name: 'Token Launchpad', focus: 'Fair token launches' },
    { name: 'DAO Treasury', focus: 'Community fund management' },
    { name: 'Bridge Protocol', focus: 'Cross-chain transfers' },
    { name: 'Perpetual DEX', focus: 'Leveraged trading' },
    { name: 'Insurance Protocol', focus: 'DeFi insurance' },
];

// Privacy project types
const PRIVACY_PROJECTS = [
    { name: 'Mixer Protocol', focus: 'Private transactions' },
    { name: 'Private Wallet', focus: 'Anonymous wallet' },
    { name: 'Encrypted Messaging', focus: 'Secure crypto chat' },
    { name: 'Privacy Analytics', focus: 'Track without exposing' },
    { name: 'Anonymous DEX', focus: 'Private swaps' },
    { name: 'Stealth Addresses', focus: 'One-time addresses' },
    { name: 'ZK Proof Tool', focus: 'Zero-knowledge proofs' },
    { name: 'Private NFT', focus: 'Anonymous NFT ownership' },
    { name: 'Encrypted Storage', focus: 'Private on-chain data' },
    { name: 'Burner Wallet', focus: 'Disposable wallets' },
];

// Real project solutions
const REAL_PROJECT_SOLUTIONS: Record<string, string[]> = {
    security: ['Contract Auditor', 'Approval Manager', 'Deployer Checker'],
    trading: ['Gas Optimizer', 'MEV Shield', 'Trade Journal'],
    portfolio: ['Multi-Wallet Tracker', 'Tax Calculator', 'PnL Dashboard'],
    discovery: ['Influencer Tracker', 'Alpha Aggregator', 'Gem Finder'],
    analytics: ['Holder Analyzer', 'Volume Scanner', 'On-Chain Dashboard'],
};

export async function generateAIAgentIdeas(minIdeas: number = 10): Promise<AIAgentIdea[]> {
    console.log('🚀 Generating 10 ideas: 2 AI + 2 Real + 2 Gaming + 2 DeFi + 2 Privacy...');

    const [trendingTokens, volumeSpikes, realProblems, aiTrends] = await Promise.all([
        getTrendingTokens(),
        getVolumeSpikes(),
        getRealProblems(),
        getAIAgentTrends(),
    ]);

    console.log(`  ✓ Found ${trendingTokens.length} trending tokens`);
    console.log(`  ✓ Found ${realProblems.length} real community problems`);

    const allTokens = [...trendingTokens, ...volumeSpikes].filter(t => t.symbol && t.symbol !== 'N/A');
    const today = new Date().toDateString();
    const seed = hashString(today);

    const shuffledTokens = shuffleWithSeed(allTokens, seed);
    const shuffledProblems = shuffleWithSeed(realProblems, seed + 1);
    const shuffledAgentTypes = shuffleWithSeed([...AI_AGENT_TYPES], seed + 2);
    const shuffledGaming = shuffleWithSeed([...GAMING_PROJECTS], seed + 3);
    const shuffledDeFi = shuffleWithSeed([...DEFI_PROJECTS], seed + 4);
    const shuffledPrivacy = shuffleWithSeed([...PRIVACY_PROJECTS], seed + 5);

    const ideas: AIAgentIdea[] = [];
    let idCounter = 1;

    // 2 AI Agent Ideas
    console.log('\n🤖 Generating AI Agent ideas...');
    for (let i = 0; i < 2; i++) {
        const agentType = shuffledAgentTypes[i];
        const token = shuffledTokens[i] || { symbol: 'SOL', chain: 'solana', priceChange24h: 10, volume24h: 500000 };
        ideas.push(generateAIAgentIdea(idCounter++, agentType, token, seed + i));
    }

    // 2 Real Project Ideas
    console.log('💡 Generating Real Project ideas...');
    for (let i = 0; i < 2; i++) {
        const problem = shuffledProblems[i];
        const token = shuffledTokens[i + 2] || { symbol: 'SOL', chain: 'solana', priceChange24h: 5, volume24h: 100000 };
        ideas.push(generateRealProjectIdea(idCounter++, problem, token, seed + i + 2));
    }

    // 2 Gaming Ideas
    console.log('🎮 Generating Gaming ideas...');
    for (let i = 0; i < 2; i++) {
        const gaming = shuffledGaming[i];
        const token = shuffledTokens[i + 4] || { symbol: 'SOL', chain: 'solana', priceChange24h: 5, volume24h: 100000 };
        ideas.push(generateGamingIdea(idCounter++, gaming, token, seed + i + 4));
    }

    // 2 DeFi Ideas
    console.log('💰 Generating DeFi ideas...');
    for (let i = 0; i < 2; i++) {
        const defi = shuffledDeFi[i];
        const token = shuffledTokens[i + 6] || { symbol: 'SOL', chain: 'solana', priceChange24h: 5, volume24h: 100000 };
        ideas.push(generateDeFiIdea(idCounter++, defi, token, seed + i + 6));
    }

    // 2 Privacy Ideas
    console.log('🔒 Generating Privacy ideas...');
    for (let i = 0; i < 2; i++) {
        const privacy = shuffledPrivacy[i];
        const token = shuffledTokens[i + 8] || { symbol: 'SOL', chain: 'solana', priceChange24h: 5, volume24h: 100000 };
        ideas.push(generatePrivacyIdea(idCounter++, privacy, token, seed + i + 8));
    }

    return ideas.map(idea => ({ ...idea, score: calculateScore(idea) })).sort((a, b) => b.score - a.score);
}

function generateAIAgentIdea(id: number, agentType: { name: string; category: string; focus: string }, token: TokenData, seed: number): AIAgentIdea {
    const chain = token.chain || 'solana';
    const symbol = token.symbol || 'TOKEN';
    const prefixes = ['Smart', 'Alpha', 'Degen', 'Turbo', 'Pro', 'Ultra'];
    const name = `${prefixes[seed % prefixes.length]}${agentType.name.replace(/\s+/g, '')}`;

    const buildPrompt = `Build a production-ready ${agentType.name} for ${chain.toUpperCase()} traders.

PROJECT: ${name}
TYPE: AI Trading Agent
CHAIN: ${chain.toUpperCase()}

PROBLEM:
Traders need automated ${agentType.focus.toLowerCase()} but manual execution is too slow. Tokens like $${symbol} move fast.

SOLUTION:
AI-powered ${agentType.name.toLowerCase()} that monitors blockchain in real-time and executes faster than humans.

TECH STACK:
- Frontend: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- Backend: Next.js API Routes, Supabase
- Blockchain: ${chain === 'solana' ? 'Helius RPC, @solana/web3.js' : 'Alchemy, Ethers.js'}
- AI: OpenAI API
- Alerts: Telegram Bot API

CORE FEATURES:
1. ${agentType.focus} with AI analysis
2. Real-time blockchain monitoring
3. Automated execution with safety checks
4. Telegram alerts with trade details
5. Dashboard with performance metrics
6. Wallet connection

DATABASE (Supabase):
- users: id, wallet_address, telegram_chat_id, settings
- agent_configs: id, user_id, config, is_active
- transactions: id, user_id, token_address, action, tx_hash
- alerts: id, user_id, type, message

PAGES: Landing, Dashboard, Settings, History

API ROUTES:
- POST /api/analyze - Analyze token
- POST /api/execute - Execute trade
- POST /api/webhook - Blockchain events

DESIGN: Dark theme #09090b, Primary #6366f1, smooth animations

Build complete, deployable app. Start with landing page, then dashboard, then agent logic.`;

    return {
        id, name, category: agentType.category, projectType: agentType.name,
        ideaType: 'AI Agent',
        problem: `Traders need automated ${agentType.focus.toLowerCase()}`,
        problemSource: `Trending: $${symbol}`,
        solution: `AI-powered ${agentType.name.toLowerCase()}`,
        targetUser: `${chain} traders`,
        features: ['Real-time monitoring', 'AI analysis', 'Auto-execution', 'Telegram alerts', 'Dashboard'],
        techStack: ['Next.js', 'TypeScript', 'Supabase', chain === 'solana' ? 'Helius' : 'Alchemy', 'OpenAI'],
        buildPrompt, score: 0, trendingContext: `Based on $${symbol} trending`,
    };
}

function generateRealProjectIdea(id: number, problem: RealProblem, token: TokenData, seed: number): AIAgentIdea {
    const chain = token.chain || 'solana';
    const category = problem.category;
    const projectOptions = REAL_PROJECT_SOLUTIONS[category] || REAL_PROJECT_SOLUTIONS.trading;
    const projectType = projectOptions[seed % projectOptions.length];
    const prefixes = ['Pro', 'Smart', 'Chain', 'Crypto', 'Block', 'Ultra'];
    const name = `${prefixes[seed % prefixes.length]}${projectType.replace(/\s+/g, '')}`;

    const buildPrompt = `Build a production-ready ${projectType} for crypto users.

PROJECT: ${name}
TYPE: ${projectType}
CHAIN: ${chain.toUpperCase()}

PROBLEM (from ${problem.source}):
"${problem.problem}"

SOLUTION:
A ${projectType.toLowerCase()} that solves this problem with beautiful UI.

TECH STACK:
- Frontend: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- Backend: Next.js API Routes, Supabase
- Data: DexScreener API, ${chain === 'solana' ? 'Helius' : 'Alchemy'}

CORE FEATURES:
1. Solve: ${problem.problem.slice(0, 40)}...
2. Real-time blockchain data
3. Clean dashboard with metrics
4. Search and filter
5. Export to CSV
6. Notifications

DATABASE (Supabase):
- users: id, wallet_address, settings
- tracked_items: id, user_id, address, metadata
- analyses: id, item_id, score, result

PAGES: Landing, Dashboard, Settings, History

API ROUTES:
- POST /api/analyze, GET /api/data, POST /api/track

DESIGN: Dark theme #09090b, Primary #6366f1

Build complete app focusing on solving the real problem.`;

    return {
        id, name, category: capitalizeFirst(category), projectType,
        ideaType: 'Real Project',
        problem: problem.problem,
        problemSource: `From ${problem.source}`,
        solution: `${projectType} solving this problem`,
        targetUser: 'Crypto users',
        features: ['Real-time data', 'Dashboard', 'Alerts', 'Export', 'Search'],
        techStack: ['Next.js', 'TypeScript', 'Supabase', 'DexScreener'],
        buildPrompt, score: 0, trendingContext: 'Solving community problem',
    };
}

function generateGamingIdea(id: number, gaming: { name: string; focus: string }, token: TokenData, seed: number): AIAgentIdea {
    const chain = token.chain || 'solana';
    const prefixes = ['Meta', 'Crypto', 'Chain', 'Web3', 'Degen', 'Ultra'];
    const name = `${prefixes[seed % prefixes.length]}${gaming.name.replace(/\s+/g, '')}`;

    const buildPrompt = `Build a production-ready ${gaming.name} on ${chain.toUpperCase()}.

PROJECT: ${name}
TYPE: Gaming / ${gaming.focus}
CHAIN: ${chain.toUpperCase()}

CONCEPT:
A blockchain-based ${gaming.name.toLowerCase()} where players can ${gaming.focus.toLowerCase()}.

TECH STACK:
- Frontend: Next.js 14, TypeScript, TailwindCSS
- Game Engine: Phaser.js or Three.js
- Backend: Next.js API Routes, Supabase
- Blockchain: ${chain === 'solana' ? '@solana/web3.js, Metaplex' : 'Ethers.js, OpenZeppelin'}
- Wallet: ${chain === 'solana' ? 'Phantom' : 'MetaMask'}

CORE FEATURES:
1. ${gaming.focus}
2. Wallet connection and authentication
3. NFT minting/trading for in-game assets
4. Leaderboard with rewards
5. Token rewards system
6. Multiplayer functionality
7. Beautiful game UI

DATABASE (Supabase):
- users: id, wallet_address, username, stats
- game_sessions: id, user_id, score, rewards
- nfts: id, owner_id, metadata, rarity
- transactions: id, user_id, type, amount

SMART CONTRACTS:
- Game token (SPL/ERC20)
- NFT collection for assets
- Reward distribution

PAGES: Home, Play, Inventory, Leaderboard, Marketplace

DESIGN: Vibrant gaming theme, animations, sound effects

Build complete gaming platform with crypto integration.`;

    return {
        id, name, category: 'Gaming', projectType: gaming.name,
        ideaType: 'Gaming',
        problem: `Gamers want to ${gaming.focus.toLowerCase()} in web3`,
        problemSource: 'Gaming trend',
        solution: `${gaming.name} with blockchain rewards`,
        targetUser: 'Web3 gamers',
        features: [gaming.focus, 'NFT assets', 'Token rewards', 'Leaderboard', 'Multiplayer'],
        techStack: ['Next.js', 'Phaser.js', 'Supabase', chain === 'solana' ? 'Metaplex' : 'OpenZeppelin'],
        buildPrompt, score: 0, trendingContext: 'Gaming + Crypto trend',
    };
}

function generateDeFiIdea(id: number, defi: { name: string; focus: string }, token: TokenData, seed: number): AIAgentIdea {
    const chain = token.chain || 'solana';
    const prefixes = ['Yield', 'Swap', 'Liq', 'Stake', 'Degen', 'Ultra'];
    const name = `${prefixes[seed % prefixes.length]}${defi.name.replace(/\s+/g, '')}`;

    const buildPrompt = `Build a production-ready ${defi.name} on ${chain.toUpperCase()}.

PROJECT: ${name}
TYPE: DeFi / ${defi.focus}
CHAIN: ${chain.toUpperCase()}

CONCEPT:
A decentralized ${defi.name.toLowerCase()} that enables users to ${defi.focus.toLowerCase()}.

TECH STACK:
- Frontend: Next.js 14, TypeScript, TailwindCSS
- Backend: Next.js API Routes, Supabase
- Blockchain: ${chain === 'solana' ? '@solana/web3.js, Anchor' : 'Ethers.js, Hardhat'}
- DEX: ${chain === 'solana' ? 'Jupiter, Raydium' : 'Uniswap, 0x'}

CORE FEATURES:
1. ${defi.focus}
2. Wallet connection
3. Real-time price feeds
4. Transaction history
5. APY/APR calculations
6. Gas optimization
7. Slippage protection

DATABASE (Supabase):
- users: id, wallet_address, total_volume
- positions: id, user_id, pool, amount, rewards
- transactions: id, user_id, type, token, amount, tx_hash
- analytics: id, pool_id, tvl, volume, apy

SMART CONTRACTS:
- Main protocol contract
- Token contract (if needed)
- Governance (optional)

PAGES: Home, Dashboard, Pools, Swap, Analytics

API ROUTES:
- GET /api/pools - List pools
- GET /api/prices - Token prices
- POST /api/quote - Swap quote
- GET /api/positions - User positions

DESIGN: Professional DeFi theme, charts, dark mode

Build complete DeFi protocol with beautiful UI.`;

    return {
        id, name, category: 'DeFi', projectType: defi.name,
        ideaType: 'DeFi',
        problem: `Users need ${defi.focus.toLowerCase()}`,
        problemSource: 'DeFi demand',
        solution: `${defi.name} protocol`,
        targetUser: 'DeFi users',
        features: [defi.focus, 'Real-time prices', 'Analytics', 'Gas optimization', 'Slippage protection'],
        techStack: ['Next.js', 'Supabase', chain === 'solana' ? 'Anchor' : 'Hardhat', chain === 'solana' ? 'Jupiter' : 'Uniswap'],
        buildPrompt, score: 0, trendingContext: 'DeFi trend',
    };
}

function generatePrivacyIdea(id: number, privacy: { name: string; focus: string }, token: TokenData, seed: number): AIAgentIdea {
    const chain = token.chain || 'solana';
    const prefixes = ['Shadow', 'Ghost', 'Stealth', 'Anon', 'Private', 'Secret'];
    const name = `${prefixes[seed % prefixes.length]}${privacy.name.replace(/\s+/g, '')}`;

    const buildPrompt = `Build a production-ready ${privacy.name} for ${chain.toUpperCase()}.

PROJECT: ${name}
TYPE: Privacy / ${privacy.focus}
CHAIN: ${chain.toUpperCase()}

CONCEPT:
A privacy-focused ${privacy.name.toLowerCase()} that enables ${privacy.focus.toLowerCase()}.

TECH STACK:
- Frontend: Next.js 14, TypeScript, TailwindCSS
- Backend: Next.js API Routes, encrypted storage
- Blockchain: ${chain === 'solana' ? '@solana/web3.js' : 'Ethers.js'}
- Privacy: Zero-knowledge proofs, encryption libraries
- Wallet: Non-custodial, encrypted keys

CORE FEATURES:
1. ${privacy.focus}
2. End-to-end encryption
3. No KYC required
4. Tor/VPN friendly
5. Zero logs policy
6. Decentralized architecture
7. Open source verification

PRIVACY MEASURES:
- All transactions encrypted
- No IP logging
- Stealth addresses
- Ring signatures (if applicable)
- Time-delayed transactions

DATABASE (encrypted):
- Minimal data storage
- User-controlled keys
- Encrypted metadata

PAGES: Home, Dashboard, Privacy Tools, Settings

SECURITY:
- Regular audits
- Bug bounty program
- Open source code

DESIGN: Dark, minimal, privacy-focused UI

Build privacy-first application with strong encryption.`;

    return {
        id, name, category: 'Privacy', projectType: privacy.name,
        ideaType: 'Privacy',
        problem: `Users need ${privacy.focus.toLowerCase()}`,
        problemSource: 'Privacy demand',
        solution: `${privacy.name} with encryption`,
        targetUser: 'Privacy-conscious users',
        features: [privacy.focus, 'E2E encryption', 'No KYC', 'Zero logs', 'Decentralized'],
        techStack: ['Next.js', 'ZK Proofs', 'Encryption', chain === 'solana' ? 'Solana' : 'Ethereum'],
        buildPrompt, score: 0, trendingContext: 'Privacy trend',
    };
}

function calculateScore(idea: AIAgentIdea): number {
    let score = 7;
    if (['Trading', 'Security', 'DeFi', 'Gaming'].includes(idea.category)) score += 1;
    if (idea.ideaType === 'AI Agent') score += 0.5;
    if (idea.ideaType === 'DeFi') score += 0.3;
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
