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
    const projectSlug = name.toLowerCase().replace(/\s+/g, '-');

    return `
╔═══════════════════════════════════════════════════════════════════════════════════╗
║  🤖 COMPLETE BUILD PROMPT: ${name.padEnd(52)} ║
║  📅 ${today.padEnd(68)} ║
║  📊 Trending: ${trendingList.padEnd(58)} ║
╚═══════════════════════════════════════════════════════════════════════════════════╝

You are an expert full-stack developer. Build a complete, production-ready 
${agentType.name} platform for ${chain.toUpperCase()} memecoin traders.

═══════════════════════════════════════════════════════════════════════════════════
                              PROJECT SETUP
═══════════════════════════════════════════════════════════════════════════════════

# Create the project
npx create-next-app@latest ${projectSlug} --typescript --tailwind --app --src-dir
cd ${projectSlug}

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install ${chain === 'solana' ? '@solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-wallets' : 'ethers wagmi viem'}
npm install axios node-telegram-bot-api openai
npm install framer-motion lucide-react recharts
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input dialog dropdown-menu toast

═══════════════════════════════════════════════════════════════════════════════════
                              ENVIRONMENT VARIABLES
═══════════════════════════════════════════════════════════════════════════════════

Create .env.local:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_key
${chain === 'solana' ? 'HELIUS_API_KEY=your_helius_key' : 'ALCHEMY_API_KEY=your_alchemy_key'}
OPENAI_API_KEY=your_openai_key
TELEGRAM_BOT_TOKEN=your_telegram_token

═══════════════════════════════════════════════════════════════════════════════════
                              DATABASE SCHEMA (Supabase)
═══════════════════════════════════════════════════════════════════════════════════

-- Run in Supabase SQL Editor:

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    telegram_chat_id TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT '${agentType.name}',
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agent_configs(id),
    token_address TEXT NOT NULL,
    action TEXT NOT NULL,
    amount NUMERIC,
    price NUMERIC,
    tx_hash TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

═══════════════════════════════════════════════════════════════════════════════════
                              CORE FILES TO CREATE
═══════════════════════════════════════════════════════════════════════════════════

📁 src/lib/supabase.ts
---
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
---

📁 src/lib/${chain}.ts
---
${chain === 'solana' ? `
import { Connection, PublicKey } from '@solana/web3.js';

const HELIUS_URL = \`https://mainnet.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}\`;
export const connection = new Connection(HELIUS_URL);

export async function getTokenInfo(address: string) {
    const response = await fetch(\`https://api.helius.xyz/v0/token-metadata?api-key=\${process.env.HELIUS_API_KEY}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mintAccounts: [address] })
    });
    return response.json();
}

export async function subscribeToTransactions(addresses: string[], callback: (tx: any) => void) {
    // Set up Helius webhooks for real-time monitoring
    const ws = new WebSocket(\`wss://atlas-mainnet.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}\`);
    ws.onmessage = (event) => callback(JSON.parse(event.data));
    return ws;
}
` : `
import { ethers } from 'ethers';

const ALCHEMY_URL = \`https://eth-mainnet.g.alchemy.com/v2/\${process.env.ALCHEMY_API_KEY}\`;
export const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);

export async function getTokenInfo(address: string) {
    const contract = new ethers.Contract(address, ['function name() view returns (string)', 'function symbol() view returns (string)'], provider);
    return { name: await contract.name(), symbol: await contract.symbol() };
}
`}
---

📁 src/lib/agent.ts
---
import { supabase } from './supabase';
${chain === 'solana' ? "import { connection, getTokenInfo } from './solana';" : "import { provider, getTokenInfo } from './ethereum';"}

interface AgentConfig {
    minLiquidity: number;
    maxSlippage: number;
    takeProfit: number[];
    stopLoss: number;
    autoExecute: boolean;
}

export class TradingAgent {
    private config: AgentConfig;
    private userId: string;

    constructor(config: AgentConfig, userId: string) {
        this.config = config;
        this.userId = userId;
    }

    async analyze(tokenAddress: string): Promise<{ score: number; signals: string[] }> {
        const signals: string[] = [];
        let score = 50;

        // Check token info
        const tokenInfo = await getTokenInfo(tokenAddress);
        
        // Add your ${agentType.focus.toLowerCase()} logic here:
        // - Check liquidity
        // - Analyze holders
        // - Check deployer history
        // - Monitor social signals
        
        return { score, signals };
    }

    async execute(action: 'buy' | 'sell', tokenAddress: string, amount: number) {
        // Implement swap logic using Jupiter (Solana) or 0x (ETH)
        const tx = { /* transaction details */ };
        
        await supabase.from('transactions').insert({
            user_id: this.userId,
            token_address: tokenAddress,
            action,
            amount,
            status: 'completed'
        });
        
        return tx;
    }

    async sendAlert(message: string, telegramChatId?: string) {
        await supabase.from('alerts').insert({
            user_id: this.userId,
            type: '${agentType.name}',
            message
        });
        
        if (telegramChatId) {
            await fetch(\`https://api.telegram.org/bot\${process.env.TELEGRAM_BOT_TOKEN}/sendMessage\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: telegramChatId, text: message, parse_mode: 'Markdown' })
            });
        }
    }
}
---

📁 src/app/api/agent/route.ts
---
import { NextRequest, NextResponse } from 'next/server';
import { TradingAgent } from '@/lib/agent';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    const { action, tokenAddress, userId, config } = await req.json();
    
    const agent = new TradingAgent(config, userId);
    
    if (action === 'analyze') {
        const result = await agent.analyze(tokenAddress);
        return NextResponse.json(result);
    }
    
    if (action === 'execute') {
        const result = await agent.execute('buy', tokenAddress, config.amount);
        return NextResponse.json(result);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
---

📁 src/app/dashboard/page.tsx
---
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Dashboard() {
    const [tokenAddress, setTokenAddress] = useState('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const analyzeToken = async () => {
        setLoading(true);
        const res = await fetch('/api/agent', {
            method: 'POST',
            body: JSON.stringify({ action: 'analyze', tokenAddress })
        });
        setAnalysis(await res.json());
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-6">
            <h1 className="text-3xl font-bold mb-6">${name} Dashboard</h1>
            
            <Card className="bg-[#18181b] border-[#27272a]">
                <CardHeader>
                    <CardTitle>Analyze Token</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Token address..."
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                        className="bg-[#27272a] border-[#3f3f46]"
                    />
                    <Button onClick={analyzeToken} disabled={loading}>
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </Button>
                    
                    {analysis && (
                        <div className="mt-4 p-4 bg-[#27272a] rounded-lg">
                            <div className="text-2xl font-bold text-green-500">
                                Score: {analysis.score}/100
                            </div>
                            <ul className="mt-2 space-y-1">
                                {analysis.signals.map((s: string, i: number) => (
                                    <li key={i}>• {s}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
---

═══════════════════════════════════════════════════════════════════════════════════
                              DEPLOYMENT
═══════════════════════════════════════════════════════════════════════════════════

1. Push to GitHub: git init && git add . && git commit -m "Initial" && git push
2. Deploy to Vercel: vercel --prod
3. Add environment variables in Vercel dashboard
4. Set up Supabase database with the SQL above
5. Configure Helius/Alchemy webhooks for real-time monitoring

═══════════════════════════════════════════════════════════════════════════════════

🎯 This is a COMPLETE, BUILDABLE prompt. Copy it into Cursor/Claude and start building!

═══════════════════════════════════════════════════════════════════════════════════
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
    const projectSlug = name.toLowerCase().replace(/\s+/g, '-');

    return `
╔═══════════════════════════════════════════════════════════════════════════════════╗
║  💡 COMPLETE BUILD PROMPT: ${name.padEnd(52)} ║
║  📅 ${today.padEnd(68)} ║
║  🔍 Solving: ${category.toUpperCase()} problem                                    ║
╚═══════════════════════════════════════════════════════════════════════════════════╝

You are an expert full-stack developer. Build a complete, production-ready 
${projectType} platform that solves this REAL problem from the crypto community:

THE PROBLEM (from ${problem.source} - ${problem.frequency} frequency):
"${problem.problem}"

User sentiment: ${problem.sentiment}

═══════════════════════════════════════════════════════════════════════════════════
                              PROJECT SETUP
═══════════════════════════════════════════════════════════════════════════════════

# Create the project
npx create-next-app@latest ${projectSlug} --typescript --tailwind --app --src-dir
cd ${projectSlug}

# Install core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install ${chain === 'solana' ? '@solana/web3.js' : 'ethers'}
npm install axios react-query zustand
npm install framer-motion lucide-react recharts date-fns

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input dialog dropdown-menu toast tabs table badge skeleton

═══════════════════════════════════════════════════════════════════════════════════
                              ENVIRONMENT VARIABLES (.env.local)
═══════════════════════════════════════════════════════════════════════════════════

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
${chain === 'solana' ? 'HELIUS_API_KEY=your_helius_api_key' : 'ALCHEMY_API_KEY=your_alchemy_key'}
DEXSCREENER_API=https://api.dexscreener.com

═══════════════════════════════════════════════════════════════════════════════════
                              DATABASE SCHEMA (Supabase SQL Editor)
═══════════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    settings JSONB DEFAULT '{"theme": "dark", "notifications": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main data table (customize based on ${category})
CREATE TABLE public.tracked_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'token', 'wallet', 'contract', etc.
    address TEXT NOT NULL,
    chain TEXT DEFAULT '${chain}',
    name TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, type, address)
);

-- Analysis/Results table
CREATE TABLE public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES public.tracked_items(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    result JSONB NOT NULL,
    alerts TEXT[],
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- User activity log
CREATE TABLE public.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can view own items" ON public.tracked_items FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view own analyses" ON public.analyses FOR SELECT USING (
    item_id IN (SELECT id FROM public.tracked_items WHERE user_id = auth.uid())
);

═══════════════════════════════════════════════════════════════════════════════════
                              COMPLETE FILE STRUCTURE
═══════════════════════════════════════════════════════════════════════════════════

${projectSlug}/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   ├── (auth)/
│   │   │   └── login/page.tsx          # Login page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Dashboard layout
│   │   │   ├── dashboard/page.tsx      # Main dashboard
│   │   │   ├── settings/page.tsx       # User settings
│   │   │   └── history/page.tsx        # Activity history
│   │   └── api/
│   │       ├── analyze/route.ts        # Analysis endpoint
│   │       ├── track/route.ts          # Add tracked items
│   │       └── webhook/route.ts        # External webhooks
│   ├── components/
│   │   ├── ui/                         # shadcn components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── AnalysisCard.tsx
│   │   │   └── AddItemModal.tsx
│   │   └── landing/
│   │       ├── Hero.tsx
│   │       ├── Features.tsx
│   │       └── CTA.tsx
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client
│   │   ├── ${chain}.ts                 # Blockchain helpers
│   │   ├── dexscreener.ts              # DexScreener API
│   │   ├── analyzer.ts                 # Core analysis logic
│   │   └── utils.ts                    # Utility functions
│   ├── hooks/
│   │   ├── useUser.ts
│   │   ├── useItems.ts
│   │   └── useAnalysis.ts
│   └── types/
│       └── index.ts                    # TypeScript types
├── .env.local
├── tailwind.config.ts
└── package.json

═══════════════════════════════════════════════════════════════════════════════════
                              KEY FILES TO CREATE
═══════════════════════════════════════════════════════════════════════════════════

📁 src/lib/supabase.ts
---
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getUser(walletAddress: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
    return { data, error };
}

export async function createUser(walletAddress: string) {
    const { data, error } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress })
        .select()
        .single();
    return { data, error };
}
---

📁 src/lib/dexscreener.ts
---
import axios from 'axios';

const API_BASE = 'https://api.dexscreener.com/latest';

export interface TokenData {
    address: string;
    name: string;
    symbol: string;
    priceUsd: string;
    priceChange24h: number;
    volume24h: number;
    liquidity: number;
    fdv: number;
}

export async function getTokenInfo(address: string): Promise<TokenData | null> {
    try {
        const { data } = await axios.get(\`\${API_BASE}/dex/tokens/\${address}\`);
        if (data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0];
            return {
                address,
                name: pair.baseToken.name,
                symbol: pair.baseToken.symbol,
                priceUsd: pair.priceUsd,
                priceChange24h: pair.priceChange?.h24 || 0,
                volume24h: pair.volume?.h24 || 0,
                liquidity: pair.liquidity?.usd || 0,
                fdv: pair.fdv || 0,
            };
        }
        return null;
    } catch (error) {
        console.error('DexScreener API error:', error);
        return null;
    }
}

export async function getTrendingTokens(chain = '${chain}'): Promise<TokenData[]> {
    try {
        const { data } = await axios.get(\`\${API_BASE}/dex/tokens/trending\`);
        return data.tokens || [];
    } catch (error) {
        return [];
    }
}
---

📁 src/lib/analyzer.ts
---
import { getTokenInfo } from './dexscreener';
import { supabase } from './supabase';

export interface AnalysisResult {
    score: number;
    findings: string[];
    risks: string[];
    recommendation: 'safe' | 'caution' | 'danger';
}

export async function analyzeItem(address: string, type: string): Promise<AnalysisResult> {
    const findings: string[] = [];
    const risks: string[] = [];
    let score = 50;

    // Get token data from DexScreener
    const tokenData = await getTokenInfo(address);
    
    if (tokenData) {
        // Check liquidity
        if (tokenData.liquidity > 100000) {
            score += 15;
            findings.push('Good liquidity (>$100k)');
        } else if (tokenData.liquidity < 10000) {
            score -= 20;
            risks.push('Low liquidity (<$10k)');
        }

        // Check volume
        if (tokenData.volume24h > 50000) {
            score += 10;
            findings.push('Active trading volume');
        }

        // Check price trend
        if (tokenData.priceChange24h > 0) {
            findings.push(\`Price up \${tokenData.priceChange24h.toFixed(1)}% in 24h\`);
        } else if (tokenData.priceChange24h < -20) {
            score -= 10;
            risks.push('Significant price drop in 24h');
        }
    } else {
        score -= 30;
        risks.push('Token data not available');
    }

    // Add more ${category}-specific analysis here...

    return {
        score: Math.max(0, Math.min(100, score)),
        findings,
        risks,
        recommendation: score >= 70 ? 'safe' : score >= 40 ? 'caution' : 'danger',
    };
}
---

📁 src/app/api/analyze/route.ts
---
import { NextRequest, NextResponse } from 'next/server';
import { analyzeItem } from '@/lib/analyzer';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { address, type, itemId } = await req.json();

        if (!address) {
            return NextResponse.json({ error: 'Address required' }, { status: 400 });
        }

        const result = await analyzeItem(address, type || 'token');

        // Save analysis to database if itemId provided
        if (itemId) {
            await supabase.from('analyses').insert({
                item_id: itemId,
                score: result.score,
                result: result,
                alerts: result.risks,
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
---

📁 src/app/(dashboard)/dashboard/page.tsx
---
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!address) return;
        setLoading(true);
        
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, type: 'token' }),
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getRecommendationBadge = (rec: string) => {
        switch (rec) {
            case 'safe': return <Badge className="bg-green-500">✓ Safe</Badge>;
            case 'caution': return <Badge className="bg-yellow-500">⚠ Caution</Badge>;
            case 'danger': return <Badge className="bg-red-500">✕ Danger</Badge>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-2">${name}</h1>
                <p className="text-gray-400 mb-8">${projectType} - Solving: "${problem.problem.slice(0, 60)}..."</p>

                {/* Analysis Input */}
                <Card className="bg-[#18181b] border-[#27272a] mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Analyze
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Input
                                placeholder="Enter token/wallet/contract address..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="flex-1 bg-[#27272a] border-[#3f3f46]"
                            />
                            <Button onClick={handleAnalyze} disabled={loading}>
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Analyze'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                {loading && (
                    <Card className="bg-[#18181b] border-[#27272a]">
                        <CardContent className="p-6">
                            <Skeleton className="h-8 w-32 mb-4" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                    </Card>
                )}

                {result && !loading && (
                    <Card className="bg-[#18181b] border-[#27272a]">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Analysis Results</CardTitle>
                                {getRecommendationBadge(result.recommendation)}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold mb-4" style={{
                                color: result.score >= 70 ? '#22c55e' : result.score >= 40 ? '#eab308' : '#ef4444'
                            }}>
                                Score: {result.score}/100
                            </div>

                            {result.findings?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Positive Findings
                                    </h3>
                                    <ul className="space-y-1">
                                        {result.findings.map((f: string, i: number) => (
                                            <li key={i} className="text-gray-300">• {f}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {result.risks?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Risks
                                    </h3>
                                    <ul className="space-y-1">
                                        {result.risks.map((r: string, i: number) => (
                                            <li key={i} className="text-gray-300">• {r}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
---

═══════════════════════════════════════════════════════════════════════════════════
                              DESIGN SYSTEM
═══════════════════════════════════════════════════════════════════════════════════

Add to tailwind.config.ts:

theme: {
    extend: {
        colors: {
            background: '#09090b',
            surface: '#18181b',
            border: '#27272a',
            primary: '#6366f1',
            success: '#22c55e',
            warning: '#eab308',
            danger: '#ef4444',
        },
    },
}

═══════════════════════════════════════════════════════════════════════════════════
                              DEPLOYMENT TO VERCEL
═══════════════════════════════════════════════════════════════════════════════════

1. Push to GitHub:
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/${projectSlug}.git
   git push -u origin main

2. Deploy:
   - Go to vercel.com
   - Import from GitHub
   - Add environment variables
   - Deploy!

═══════════════════════════════════════════════════════════════════════════════════

🎯 This is a COMPLETE, BUILDABLE prompt. Copy it into Cursor/Claude and start building!
   Every file is ready to create. Every command is ready to run.

═══════════════════════════════════════════════════════════════════════════════════
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
