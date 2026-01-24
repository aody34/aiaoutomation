import { TokenData } from '../types';
import { getTrendingTokens, getVolumeSpikes } from '../services/dexscreener';
import { getRealProblems, RealProblem } from '../services/problemAnalyzer';
import { getAIAgentTrends } from '../services/axiom';
import {
    CategoryType,
    getCategoryTemplates,
    ARCHITECTURE_DIAGRAMS,
    TECH_STACKS,
    SECURITY_TIPS,
    FUTURE_IMPROVEMENTS,
    SIMPLE_EXPLANATIONS,
    PROJECT_TYPES,
} from './architectureTemplates';

/**
 * Enhanced AI Agent Idea with 7-Section Format
 * Senior Architect + Junior Developer Mentor style
 */
export interface AIAgentIdea {
    id: number;
    name: string;
    category: string;
    projectType: string;
    ideaType: 'AI Agent' | 'DeFi' | 'Gaming' | 'Privacy' | 'Real Project' | 'Launchpad';

    // Section 1: What Problem It Solves
    problem: string;
    problemSource: string;

    // Section 2: How It Works (Simple Explanation)
    simpleExplanation: string;

    // Section 3: Full System Architecture
    systemArchitecture: {
        diagram: string;
        layers: {
            frontend: string;
            backend: string;
            blockchain: string;
            additional: string;
        };
    };

    // Section 4: Step-by-Step Build Plan
    stepByStepPlan: string[];

    // Section 5: Tech Stack
    techStack: {
        frontend: string;
        backend: string;
        blockchain: string;
        database: string;
        additional: string;
    };

    // Section 6: Security Considerations
    securityConsiderations: string[];

    // Section 7: Future Improvements
    futureImprovements: string[];

    // Legacy fields for compatibility
    solution: string;
    targetUser: string;
    features: string[];
    buildPrompt: string;
    score: number;
    trendingContext: string;
}

// Category mapping for idea types
const IDEA_TYPE_MAP: Record<CategoryType, AIAgentIdea['ideaType']> = {
    aiAgent: 'AI Agent',
    defi: 'DeFi',
    gaming: 'Gaming',
    privacy: 'Privacy',
    realProject: 'Real Project',
    launchpad: 'Launchpad',
};

const CATEGORY_DISPLAY_NAMES: Record<CategoryType, string> = {
    aiAgent: 'AI Agent',
    defi: 'DeFi',
    gaming: 'Gaming',
    privacy: 'Privacy',
    realProject: 'Real Project',
    launchpad: 'Launchpad',
};

/**
 * Generate 6 AI Agent Ideas (1 per category)
 * Categories: AI Agent, DeFi, Gaming, Privacy, Real Project, Launchpad
 */
export async function generateAIAgentIdeas(minIdeas: number = 6): Promise<AIAgentIdea[]> {
    console.log('🚀 Generating 6 ideas: 1 AI Agent + 1 DeFi + 1 Gaming + 1 Privacy + 1 Real Project + 1 Launchpad...');

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

    const ideas: AIAgentIdea[] = [];
    let idCounter = 1;

    // Define categories to generate (1 each)
    const categories: CategoryType[] = ['aiAgent', 'defi', 'gaming', 'privacy', 'realProject', 'launchpad'];

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const token = shuffledTokens[i] || { symbol: 'SOL', chain: 'solana', priceChange24h: 10, volume24h: 500000 };
        const problem = shuffledProblems[i % shuffledProblems.length];

        console.log(`  📦 Generating ${CATEGORY_DISPLAY_NAMES[category]} idea...`);

        const idea = generateEnhancedIdea(idCounter++, category, token, problem, seed + i);
        ideas.push(idea);
    }

    return ideas.map(idea => ({ ...idea, score: calculateScore(idea) })).sort((a, b) => b.score - a.score);
}

/**
 * Generate an enhanced idea with 7-section format
 */
function generateEnhancedIdea(
    id: number,
    category: CategoryType,
    token: TokenData,
    problem: RealProblem,
    seed: number
): AIAgentIdea {
    const templates = getCategoryTemplates(category);
    const projectTypes = templates.projectTypes;
    const selectedType = projectTypes[seed % projectTypes.length];

    const chain = token.chain || 'solana';
    const symbol = token.symbol || 'TOKEN';

    // Generate unique name
    const prefixes: Record<CategoryType, string[]> = {
        aiAgent: ['Smart', 'Alpha', 'Degen', 'Turbo', 'Pro', 'Ultra'],
        defi: ['Yield', 'Swap', 'Liq', 'Stake', 'Degen', 'Ultra'],
        gaming: ['Meta', 'Crypto', 'Chain', 'Web3', 'Degen', 'Ultra'],
        privacy: ['Shadow', 'Ghost', 'Stealth', 'Anon', 'Private', 'Secret'],
        realProject: ['Pro', 'Smart', 'Chain', 'Crypto', 'Block', 'Ultra'],
        launchpad: ['Launch', 'Rocket', 'Moon', 'Orbit', 'Boost', 'Alpha'],
    };

    const prefix = prefixes[category][seed % prefixes[category].length];
    const name = `${prefix}${selectedType.name.replace(/\s+/g, '')}`;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    // Get templates for this category
    const techStack = templates.techStack;
    const securityTips = templates.security;
    const futureItems = templates.future;
    const diagram = templates.diagram;
    const simpleExplanation = templates.getSimpleExplanation(name, selectedType.focus);

    // Build the step-by-step plan
    const stepByStepPlan = generateStepByStepPlan(category, slug, chain);

    // Build comprehensive prompt
    const buildPrompt = generateBuildPrompt(
        name,
        category,
        selectedType,
        chain,
        symbol,
        techStack,
        stepByStepPlan,
        securityTips,
        futureItems,
        problem
    );

    return {
        id,
        name,
        category: CATEGORY_DISPLAY_NAMES[category],
        projectType: selectedType.name,
        ideaType: IDEA_TYPE_MAP[category],

        // Section 1: Problem
        problem: problem?.problem || `Users need ${selectedType.focus.toLowerCase()}`,
        problemSource: problem?.source ? `From ${problem.source}` : `${chain.toUpperCase()} traders`,

        // Section 2: Simple Explanation
        simpleExplanation,

        // Section 3: Architecture
        systemArchitecture: {
            diagram,
            layers: {
                frontend: (techStack as any).frontend || 'Next.js 14, TypeScript, TailwindCSS',
                backend: (techStack as any).backend || 'Supabase, tRPC',
                blockchain: (techStack as any).blockchain || chain === 'solana' ? 'Helius, @solana/web3.js' : 'Alchemy, Ethers.js',
                additional: (techStack as any).ai || (techStack as any).gameEngine || (techStack as any).encryption || '',
            },
        },

        // Section 4: Build Plan
        stepByStepPlan,

        // Section 5: Tech Stack
        techStack: {
            frontend: (techStack as any).frontend || 'Next.js 14, TailwindCSS, shadcn/ui',
            backend: (techStack as any).backend || 'Supabase Edge Functions',
            blockchain: (techStack as any).blockchain || (techStack as any).smartContracts || 'Helius SDK',
            database: (techStack as any).database || 'Supabase PostgreSQL',
            additional: (techStack as any).ai || (techStack as any).gameEngine || (techStack as any).dex || '',
        },

        // Section 6: Security
        securityConsiderations: securityTips,

        // Section 7: Future
        futureImprovements: futureItems,

        // Legacy fields
        solution: `${selectedType.name} - ${selectedType.focus}`,
        targetUser: `${chain.toUpperCase()} users`,
        features: [selectedType.focus, 'Real-time data', 'Dashboard', 'Alerts', 'Analytics'],
        buildPrompt,
        score: 0,
        trendingContext: `Based on $${symbol} trending on ${chain}`,
    };
}

/**
 * Generate step-by-step build plan
 */
function generateStepByStepPlan(category: CategoryType, slug: string, chain: string): string[] {
    const baseSteps = [
        `npx create-next-app@latest ${slug} --typescript --tailwind --app`,
        `cd ${slug} && npx shadcn-ui@latest init`,
        'Set up Supabase project at supabase.com (free tier)',
        'Create database tables with Row Level Security',
    ];

    const categorySteps: Record<CategoryType, string[]> = {
        aiAgent: [
            `npm install @supabase/supabase-js ${chain === 'solana' ? '@solana/web3.js helius-sdk' : 'ethers'} openai`,
            'Set up Helius webhooks for real-time blockchain events',
            'Build dashboard with wallet tracking UI',
            'Implement AI signal classification with OpenAI',
            'Add Telegram bot integration for alerts',
            'Test on devnet/testnet before mainnet',
            'Deploy to Vercel with environment variables',
        ],
        defi: [
            `npm install @supabase/supabase-js ${chain === 'solana' ? '@solana/web3.js @coral-xyz/anchor' : 'ethers hardhat'} recharts`,
            'Write smart contracts (Anchor/Solidity)',
            'Test contracts with unit tests locally',
            'Deploy contracts to devnet/testnet',
            'Build swap/pool UI with real-time prices',
            'Integrate with Jupiter/Uniswap for routing',
            'Get security audit before mainnet deploy',
            'Deploy frontend to Vercel',
        ],
        gaming: [
            `npm install @supabase/supabase-js ${chain === 'solana' ? '@solana/web3.js @metaplex-foundation/js' : 'ethers'} phaser socket.io-client`,
            'Build game mechanics with Phaser.js',
            'Create NFT collection with Metaplex/OpenSea',
            'Implement leaderboard with Redis/Supabase',
            'Add multiplayer with Socket.io',
            'Build in-game shop for NFT purchases',
            'Test gameplay flow end-to-end',
            'Deploy game to Vercel + contracts to mainnet',
        ],
        privacy: [
            `npm install @supabase/supabase-js ${chain === 'solana' ? '@solana/web3.js' : 'ethers'} libsodium-wrappers`,
            'Implement client-side encryption with libsodium',
            'Build stealth address generation',
            'Create zero-log backend architecture',
            'Add Tor-friendly static export',
            'Open source all code on GitHub',
            'Get security audit for cryptography',
            'Deploy to privacy-friendly host (IPFS optional)',
        ],
        realProject: [
            `npm install @supabase/supabase-js axios swr`,
            'Integrate DexScreener API for token data',
            'Add Helius/Alchemy for on-chain data',
            'Build dashboard with charts (Recharts)',
            'Implement search and filter functionality',
            'Add CSV/PDF export feature',
            'Set up email/Telegram notifications',
            'Deploy to Vercel with caching',
        ],
        launchpad: [
            `npm install @supabase/supabase-js ${chain === 'solana' ? '@solana/web3.js @coral-xyz/anchor @metaplex-foundation/js' : 'ethers hardhat'}`,
            'Write token sale smart contract with vesting',
            'Write liquidity lock contract',
            'Build tiered whitelist system in Supabase',
            'Create launch dashboard UI',
            'Implement allocation calculation logic',
            'Add KYC provider integration (optional)',
            'Get security audit (MANDATORY for funds)',
            'Deploy contracts and frontend to production',
        ],
    };

    return [...baseSteps, ...categorySteps[category]];
}

/**
 * Generate comprehensive build prompt
 */
function generateBuildPrompt(
    name: string,
    category: CategoryType,
    projectType: { name: string; focus: string },
    chain: string,
    symbol: string,
    techStack: any,
    steps: string[],
    security: string[],
    future: string[],
    problem: RealProblem | undefined
): string {
    const problemText = problem?.problem || `Users need ${projectType.focus.toLowerCase()} tools`;

    return `Build a production-ready ${projectType.name} for ${chain.toUpperCase()}.

═══════════════════════════════════════════════════════════════
PROJECT: ${name}
TYPE: ${CATEGORY_DISPLAY_NAMES[category]} / ${projectType.focus}
CHAIN: ${chain.toUpperCase()}
═══════════════════════════════════════════════════════════════

📌 PROBLEM TO SOLVE:
"${problemText}"

💡 SOLUTION:
A ${projectType.name.toLowerCase()} that ${projectType.focus.toLowerCase()}. Built with modern tech, production-ready from day one.

🛠️ TECH STACK:
• Frontend: ${techStack.frontend}
• Backend: ${techStack.backend}
• Blockchain: ${techStack.blockchain || techStack.smartContracts || 'Helius/Alchemy'}
• Database: ${techStack.database}
${techStack.ai ? `• AI: ${techStack.ai}` : ''}
${techStack.gameEngine ? `• Game Engine: ${techStack.gameEngine}` : ''}
${techStack.dex ? `• DEX: ${techStack.dex}` : ''}
${techStack.priceFeeds ? `• Price Feeds: ${techStack.priceFeeds}` : ''}

📚 STEP-BY-STEP BUILD PLAN:
${steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

🔒 SECURITY CONSIDERATIONS:
${security.map(tip => `• ${tip}`).join('\n')}

🚀 FUTURE ROADMAP:
${future.map(item => `• ${item}`).join('\n')}

═══════════════════════════════════════════════════════════════
IMPORTANT: Start with the landing page, then dashboard, then core logic.
Test on ${chain === 'solana' ? 'devnet' : 'testnet'} before going to mainnet.
Don't skip security - get an audit for any smart contracts handling funds.
═══════════════════════════════════════════════════════════════`;
}

/**
 * Calculate score for an idea
 */
function calculateScore(idea: AIAgentIdea): number {
    let score = 7;

    // Category bonuses
    const categoryBonus: Record<string, number> = {
        'AI Agent': 0.8,
        'DeFi': 0.7,
        'Launchpad': 0.6,
        'Gaming': 0.5,
        'Real Project': 0.4,
        'Privacy': 0.3,
    };

    score += categoryBonus[idea.ideaType] || 0;

    // Randomize slightly for variety
    score += Math.random() * 0.5;

    return Math.min(10, Math.round(score * 10) / 10);
}

/**
 * Shuffle array with seed for daily consistency
 */
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

/**
 * Hash string to number for seeding
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
}
