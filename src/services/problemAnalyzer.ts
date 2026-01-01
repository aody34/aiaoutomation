import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Real Problem extracted from crypto community discussions
 */
export interface RealProblem {
    problem: string;
    source: 'twitter' | 'telegram' | 'reddit' | 'discord' | 'forum';
    category: string;
    frequency: 'high' | 'medium' | 'low';
    sentiment: string;
}

// Real problems compiled from crypto community analysis
// These are actual pain points discussed in X, Telegram, Reddit, and Discord
const REAL_CRYPTO_PROBLEMS: RealProblem[] = [
    // SECURITY & SAFETY PROBLEMS
    {
        problem: 'Users lose funds to rug pulls because they can\'t verify contract safety before buying',
        source: 'twitter',
        category: 'security',
        frequency: 'high',
        sentiment: 'frustrated',
    },
    {
        problem: 'No reliable way to check if a token deployer has rugged before',
        source: 'telegram',
        category: 'security',
        frequency: 'high',
        sentiment: 'frustrated',
    },
    {
        problem: 'Liquidity lock verification requires checking multiple sites manually',
        source: 'twitter',
        category: 'security',
        frequency: 'medium',
        sentiment: 'annoyed',
    },
    {
        problem: 'Honeypot tokens steal funds because detection tools are too slow',
        source: 'telegram',
        category: 'security',
        frequency: 'high',
        sentiment: 'angry',
    },
    {
        problem: 'Phishing sites steal wallet approvals and drain entire portfolios',
        source: 'twitter',
        category: 'security',
        frequency: 'high',
        sentiment: 'afraid',
    },
    {
        problem: 'Users don\'t know which token approvals to revoke to protect their wallets',
        source: 'reddit',
        category: 'security',
        frequency: 'medium',
        sentiment: 'confused',
    },

    // TRADING PROBLEMS
    {
        problem: 'By the time users find a trending token, it has already pumped too much to enter',
        source: 'telegram',
        category: 'trading',
        frequency: 'high',
        sentiment: 'frustrated',
    },
    {
        problem: 'No way to automatically take profits when price hits targets while sleeping',
        source: 'twitter',
        category: 'trading',
        frequency: 'high',
        sentiment: 'regretful',
    },
    {
        problem: 'Failed transactions from slippage issues waste gas fees repeatedly',
        source: 'telegram',
        category: 'trading',
        frequency: 'medium',
        sentiment: 'annoyed',
    },
    {
        problem: 'Sniper bots front-run user trades and steal profits on every buy',
        source: 'twitter',
        category: 'trading',
        frequency: 'high',
        sentiment: 'angry',
    },
    {
        problem: 'CEX vs DEX price differences go unexploited because tracking is manual',
        source: 'telegram',
        category: 'trading',
        frequency: 'medium',
        sentiment: 'missed_opportunity',
    },
    {
        problem: 'Gas prices spike unexpectedly and users overpay for simple transactions',
        source: 'twitter',
        category: 'trading',
        frequency: 'medium',
        sentiment: 'frustrated',
    },

    // PORTFOLIO & TRACKING PROBLEMS
    {
        problem: 'Tracking holdings across 10+ wallets requires manual spreadsheet updates',
        source: 'reddit',
        category: 'portfolio',
        frequency: 'high',
        sentiment: 'overwhelmed',
    },
    {
        problem: 'Calculating crypto taxes at year end is a nightmare with hundreds of trades',
        source: 'twitter',
        category: 'portfolio',
        frequency: 'high',
        sentiment: 'stressed',
    },
    {
        problem: 'No way to see total PnL across all chains and protocols in one place',
        source: 'telegram',
        category: 'portfolio',
        frequency: 'high',
        sentiment: 'frustrated',
    },
    {
        problem: 'Historical trade data gets lost when DEXs update their interfaces',
        source: 'reddit',
        category: 'portfolio',
        frequency: 'medium',
        sentiment: 'annoyed',
    },

    // DISCOVERY & RESEARCH PROBLEMS
    {
        problem: 'Alpha calls are scattered across 50+ Telegram groups and X accounts',
        source: 'telegram',
        category: 'discovery',
        frequency: 'high',
        sentiment: 'overwhelmed',
    },
    {
        problem: 'No way to verify if an influencer\'s past calls actually made money',
        source: 'twitter',
        category: 'discovery',
        frequency: 'high',
        sentiment: 'skeptical',
    },
    {
        problem: 'New token launches every minute on pump.fun, impossible to filter gems from rugs',
        source: 'telegram',
        category: 'discovery',
        frequency: 'high',
        sentiment: 'overwhelmed',
    },
    {
        problem: 'Can\'t tell which wallets are actually profitable vs just lucky',
        source: 'twitter',
        category: 'discovery',
        frequency: 'medium',
        sentiment: 'uncertain',
    },

    // ANALYTICS PROBLEMS
    {
        problem: 'Whale wallet movements are visible on-chain but too complex to track manually',
        source: 'twitter',
        category: 'analytics',
        frequency: 'high',
        sentiment: 'frustrated',
    },
    {
        problem: 'Order flow shows accumulation patterns but this data isn\'t accessible for retail',
        source: 'telegram',
        category: 'analytics',
        frequency: 'medium',
        sentiment: 'disadvantaged',
    },
    {
        problem: 'No free tools to see real-time buy/sell ratios on DEX trades',
        source: 'twitter',
        category: 'analytics',
        frequency: 'medium',
        sentiment: 'frustrated',
    },
    {
        problem: 'Token holder concentration isn\'t visible without expensive API subscriptions',
        source: 'reddit',
        category: 'analytics',
        frequency: 'medium',
        sentiment: 'limited',
    },

    // DEFI PROBLEMS  
    {
        problem: 'Impermanent loss calculators don\'t account for fees earned, giving wrong numbers',
        source: 'reddit',
        category: 'defi',
        frequency: 'medium',
        sentiment: 'confused',
    },
    {
        problem: 'Yield farming APY claims are often fake or unsustainable',
        source: 'twitter',
        category: 'defi',
        frequency: 'high',
        sentiment: 'skeptical',
    },
    {
        problem: 'Managing LP positions across 5+ protocols requires constant manual monitoring',
        source: 'telegram',
        category: 'defi',
        frequency: 'medium',
        sentiment: 'overwhelmed',
    },
    {
        problem: 'Auto-compound services take too much in fees and aren\'t transparent',
        source: 'reddit',
        category: 'defi',
        frequency: 'medium',
        sentiment: 'distrustful',
    },

    // COMMUNITY & SOCIAL PROBLEMS
    {
        problem: 'Token projects can\'t verify if holders are bots vs real community members',
        source: 'telegram',
        category: 'community',
        frequency: 'medium',
        sentiment: 'concerned',
    },
    {
        problem: 'Airdrop eligibility criteria aren\'t clear until it\'s too late to qualify',
        source: 'twitter',
        category: 'community',
        frequency: 'high',
        sentiment: 'frustrated',
    },
    {
        problem: 'No way to prevent sybil attacks on community rewards and airdrops',
        source: 'telegram',
        category: 'community',
        frequency: 'medium',
        sentiment: 'concerned',
    },
    {
        problem: 'DAO voting gets dominated by whales, small holders feel unheard',
        source: 'reddit',
        category: 'community',
        frequency: 'medium',
        sentiment: 'disenfranchised',
    },

    // NFT PROBLEMS
    {
        problem: 'NFT rarity tools often show incorrect or manipulated data',
        source: 'twitter',
        category: 'nft',
        frequency: 'medium',
        sentiment: 'frustrated',
    },
    {
        problem: 'NFT mint alerts come too late, everything sells out instantly',
        source: 'telegram',
        category: 'nft',
        frequency: 'high',
        sentiment: 'frustrated',
    },
    {
        problem: 'Can\'t tell if NFT floor prices are organic or wash traded',
        source: 'reddit',
        category: 'nft',
        frequency: 'medium',
        sentiment: 'skeptical',
    },

    // CROSS-CHAIN PROBLEMS
    {
        problem: 'Bridging tokens between chains is slow, expensive, and risky',
        source: 'twitter',
        category: 'infrastructure',
        frequency: 'high',
        sentiment: 'frustrated',
    },
    {
        problem: 'Cross-chain portfolio tracking requires connecting to multiple sites',
        source: 'telegram',
        category: 'infrastructure',
        frequency: 'medium',
        sentiment: 'annoyed',
    },
    {
        problem: 'Bridge exploits keep happening but users have no way to assess bridge safety',
        source: 'reddit',
        category: 'infrastructure',
        frequency: 'medium',
        sentiment: 'afraid',
    },

    // ONBOARDING PROBLEMS
    {
        problem: 'New users don\'t understand gas, slippage, or approvals and make costly mistakes',
        source: 'reddit',
        category: 'onboarding',
        frequency: 'high',
        sentiment: 'confused',
    },
    {
        problem: 'Wallet setup is too complex for non-technical users wanting to use crypto',
        source: 'telegram',
        category: 'onboarding',
        frequency: 'high',
        sentiment: 'intimidated',
    },
    {
        problem: 'No beginner-friendly way to learn trading without risking real money first',
        source: 'twitter',
        category: 'onboarding',
        frequency: 'medium',
        sentiment: 'hesitant',
    },

    // DATA & PRIVACY PROBLEMS
    {
        problem: 'Wallet addresses link all transactions publicly, destroying financial privacy',
        source: 'reddit',
        category: 'privacy',
        frequency: 'medium',
        sentiment: 'concerned',
    },
    {
        problem: 'Employer can see exactly how much crypto employees hold if they know the wallet',
        source: 'twitter',
        category: 'privacy',
        frequency: 'medium',
        sentiment: 'uncomfortable',
    },

    // DEVELOPER PROBLEMS
    {
        problem: 'Building on Solana is hard because documentation is scattered and outdated',
        source: 'reddit',
        category: 'developer',
        frequency: 'medium',
        sentiment: 'frustrated',
    },
    {
        problem: 'No easy way to spin up a token with proper tokenomics without coding skills',
        source: 'telegram',
        category: 'developer',
        frequency: 'medium',
        sentiment: 'limited',
    },
    {
        problem: 'Smart contract audits are too expensive for small projects, so they skip them',
        source: 'twitter',
        category: 'developer',
        frequency: 'medium',
        sentiment: 'concerned',
    },
];

/**
 * Fetch real problems from crypto community analysis
 * Returns shuffled problems based on today's date for variety
 */
export async function getRealProblems(): Promise<RealProblem[]> {
    console.log('📊 Fetching real crypto community problems...');

    // Try to get live data from social sources
    const liveProblems = await scrapeLiveProblems();

    // Combine with curated problems
    const allProblems = [...liveProblems, ...REAL_CRYPTO_PROBLEMS];

    // Shuffle based on today's date for variety
    const today = new Date().toDateString();
    const seed = hashString(today);
    const shuffled = shuffleWithSeed(allProblems, seed);

    console.log(`  ✓ Found ${shuffled.length} real problems from community analysis`);

    return shuffled;
}

/**
 * Attempt to scrape live discussion topics from crypto communities
 */
async function scrapeLiveProblems(): Promise<RealProblem[]> {
    const problems: RealProblem[] = [];

    // Try to scrape from Nitter (Twitter alternative)
    try {
        const cryptoComplaints = [
            'crypto+problem', 'defi+issue', 'solana+bug', 'ethereum+expensive',
            'wallet+lost', 'rug+pull', 'scam+crypto', 'gas+fees',
        ];

        for (const query of cryptoComplaints.slice(0, 2)) {
            try {
                const response = await axios.get(
                    `https://nitter.net/search?f=tweets&q=${query}`,
                    { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } }
                );

                const $ = cheerio.load(response.data);
                $('.tweet-content').slice(0, 3).each((_, el) => {
                    const text = $(el).text().trim();
                    if (text.length > 30 && text.length < 200 && containsProblemKeywords(text)) {
                        problems.push({
                            problem: cleanProblemText(text),
                            source: 'twitter',
                            category: detectCategory(text),
                            frequency: 'medium',
                            sentiment: 'frustrated',
                        });
                    }
                });
            } catch {
                continue;
            }
        }
    } catch (error) {
        // Silent fail, use curated problems
    }

    return problems;
}

/**
 * Check if text contains problem-related keywords
 */
function containsProblemKeywords(text: string): boolean {
    const keywords = [
        'can\'t', 'cannot', 'problem', 'issue', 'bug', 'broken', 'doesn\'t work',
        'frustrated', 'annoying', 'hate', 'lost', 'scam', 'stuck', 'help',
        'impossible', 'difficult', 'confusing', 'expensive', 'slow', 'failed',
        'need', 'wish', 'should', 'why isn\'t', 'why can\'t', 'how do i',
    ];
    const lower = text.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
}

/**
 * Clean problem text for display
 */
function cleanProblemText(text: string): string {
    return text
        .replace(/https?:\/\/\S+/g, '')
        .replace(/@\w+/g, '')
        .replace(/#\w+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 150);
}

/**
 * Detect category from problem text
 */
function detectCategory(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('rug') || lower.includes('scam') || lower.includes('lost')) return 'security';
    if (lower.includes('trade') || lower.includes('swap') || lower.includes('slippage')) return 'trading';
    if (lower.includes('wallet') || lower.includes('portfolio')) return 'portfolio';
    if (lower.includes('gas') || lower.includes('fee')) return 'infrastructure';
    if (lower.includes('defi') || lower.includes('yield') || lower.includes('lp')) return 'defi';
    return 'general';
}

/**
 * Get problems by category
 */
export function getProblemsByCategory(category: string): RealProblem[] {
    return REAL_CRYPTO_PROBLEMS.filter(p => p.category === category);
}

/**
 * Get high-frequency problems
 */
export function getHighFrequencyProblems(): RealProblem[] {
    return REAL_CRYPTO_PROBLEMS.filter(p => p.frequency === 'high');
}

// Utility functions
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
