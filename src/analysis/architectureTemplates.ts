/**
 * Architecture Templates for Crypto AI Bot
 * Contains ASCII diagrams, tech stacks, and templates per category
 */

// ASCII Architecture Diagrams for Telegram (monospace-friendly)
export const ARCHITECTURE_DIAGRAMS = {
    aiAgent: `
┌─────────────────────────────────┐
│     FRONTEND (Next.js 14)       │
│  Dashboard • Alerts • Settings  │
└───────────────┬─────────────────┘
                │ REST/tRPC
┌───────────────▼─────────────────┐
│    BACKEND (Node.js/Supabase)   │
│  Alert Engine • User Management │
└───────────────┬─────────────────┘
                │ Webhooks
┌───────────────▼─────────────────┐
│   BLOCKCHAIN (Helius/Alchemy)   │
│  TX Parsing • Wallet Tracking   │
└───────────────┬─────────────────┘
                │ Inference
┌───────────────▼─────────────────┐
│       AI LAYER (OpenAI)         │
│  Signal Classification • Score  │
└─────────────────────────────────┘`,

    defi: `
┌─────────────────────────────────┐
│     FRONTEND (Next.js 14)       │
│   Swap UI • Pools • Analytics   │
└───────────────┬─────────────────┘
                │ REST API
┌───────────────▼─────────────────┐
│    BACKEND (Edge Functions)     │
│  Price Feeds • Quote Engine     │
└───────────────┬─────────────────┘
                │ RPC Calls
┌───────────────▼─────────────────┐
│   SMART CONTRACTS (On-Chain)    │
│  Pools • Vaults • Token Logic   │
└───────────────┬─────────────────┘
                │ Price Oracle
┌───────────────▼─────────────────┐
│      ORACLES (Pyth/Chainlink)   │
│   Real-time Price Feeds         │
└─────────────────────────────────┘`,

    gaming: `
┌─────────────────────────────────┐
│     FRONTEND (Next.js 14)       │
│   Game UI • Inventory • Shop    │
└───────────────┬─────────────────┘
                │ WebSocket
┌───────────────▼─────────────────┐
│    GAME SERVER (Node.js)        │
│  Match Logic • Leaderboards     │
└───────────────┬─────────────────┘
                │ NFT Minting
┌───────────────▼─────────────────┐
│   BLOCKCHAIN (Metaplex/ERC721)  │
│  NFT Assets • Token Rewards     │
└───────────────┬─────────────────┘
                │ Rendering
┌───────────────▼─────────────────┐
│    GAME ENGINE (Phaser/Unity)   │
│   Graphics • Physics • Audio    │
└─────────────────────────────────┘`,

    privacy: `
┌─────────────────────────────────┐
│   FRONTEND (Next.js + Tor)      │
│  Private UI • No Tracking       │
└───────────────┬─────────────────┘
                │ E2E Encrypted
┌───────────────▼─────────────────┐
│   MINIMAL BACKEND (Serverless)  │
│  Zero Logs • No KYC Required    │
└───────────────┬─────────────────┘
                │ ZK Proofs
┌───────────────▼─────────────────┐
│   PRIVACY LAYER (ZK/libsodium)  │
│  Stealth Addresses • Mixers     │
└───────────────┬─────────────────┘
                │ Anonymous TX
┌───────────────▼─────────────────┐
│      BLOCKCHAIN (Private)       │
│  Ring Signatures • Shielded     │
└─────────────────────────────────┘`,

    realProject: `
┌─────────────────────────────────┐
│     FRONTEND (Next.js 14)       │
│  Dashboard • Search • Export    │
└───────────────┬─────────────────┘
                │ REST API
┌───────────────▼─────────────────┐
│    BACKEND (Supabase/tRPC)      │
│  Business Logic • Caching       │
└───────────────┬─────────────────┘
                │ Data APIs
┌───────────────▼─────────────────┐
│   DATA LAYER (APIs/Indexers)    │
│  DexScreener • Helius • APIs    │
└───────────────┬─────────────────┘
                │ Analytics
┌───────────────▼─────────────────┐
│      DATABASE (PostgreSQL)      │
│   User Data • Analytics • Logs  │
└─────────────────────────────────┘`,

    launchpad: `
┌─────────────────────────────────┐
│     FRONTEND (Next.js 14)       │
│  Launch UI • Tiers • Dashboard  │
└───────────────┬─────────────────┘
                │ REST/tRPC
┌───────────────▼─────────────────┐
│    BACKEND (Supabase + Queue)   │
│  KYC • Whitelist • Allocation   │
└───────────────┬─────────────────┘
                │ Contract Calls
┌───────────────▼─────────────────┐
│   SMART CONTRACTS (On-Chain)    │
│  Sale Contract • Vesting • Lock │
└───────────────┬─────────────────┘
                │ Token Deploy
┌───────────────▼─────────────────┐
│    TOKEN FACTORY (Metaplex)     │
│  SPL Token • Metadata • Mint    │
└─────────────────────────────────┘`,
};

// Tech Stack Templates per Category
export const TECH_STACKS = {
    aiAgent: {
        frontend: 'Next.js 14, TypeScript, TailwindCSS, shadcn/ui',
        backend: 'Next.js API Routes, Supabase Edge Functions',
        blockchain: 'Helius SDK, @solana/web3.js (Solana) or Alchemy (EVM)',
        ai: 'OpenAI GPT-4 / Claude API for signal classification',
        database: 'Supabase PostgreSQL with Row Level Security',
        realtime: 'Helius Webhooks, WebSocket subscriptions',
        wallet: '@solana/wallet-adapter-react or wagmi (EVM)',
    },
    defi: {
        frontend: 'Next.js 14, TypeScript, TailwindCSS, Recharts',
        backend: 'Supabase Edge Functions, tRPC',
        blockchain: 'Anchor (Solana) or Hardhat (EVM)',
        smartContracts: 'Rust/Anchor (Solana) or Solidity (EVM)',
        database: 'Supabase PostgreSQL (analytics only)',
        priceFeeds: 'Pyth Network (Solana) or Chainlink (EVM)',
        dex: 'Jupiter SDK (Solana) or 0x Protocol (EVM)',
    },
    gaming: {
        frontend: 'Next.js 14, TypeScript, TailwindCSS',
        gameEngine: 'Phaser.js (2D) or Three.js/Unity WebGL (3D)',
        backend: 'Node.js with Socket.io for multiplayer',
        blockchain: 'Metaplex (NFTs), SPL Token (rewards)',
        database: 'Supabase PostgreSQL + Redis (leaderboards)',
        assets: 'IPFS/Arweave for NFT metadata storage',
        wallet: '@solana/wallet-adapter-react',
    },
    privacy: {
        frontend: 'Next.js 14 (static export), Tor-friendly',
        backend: 'Minimal serverless, zero-log architecture',
        encryption: 'libsodium, TweetNaCl for E2E encryption',
        zkProofs: 'snarkjs, circom for zero-knowledge proofs',
        blockchain: 'Stealth addresses, ring signatures',
        storage: 'Local storage only, IPFS for decentralized',
        wallet: 'Burner wallet generation, stealth addresses',
    },
    realProject: {
        frontend: 'Next.js 14, TypeScript, TailwindCSS, shadcn/ui',
        backend: 'Supabase, tRPC, Redis for caching',
        dataApis: 'DexScreener, Helius, Birdeye, CoinGecko',
        database: 'Supabase PostgreSQL with RLS',
        analytics: 'Vercel Analytics, PostHog',
        export: 'Papa Parse (CSV), jsPDF (PDF export)',
        wallet: 'Optional wallet connection for personalization',
    },
    launchpad: {
        frontend: 'Next.js 14, TypeScript, TailwindCSS, shadcn/ui',
        backend: 'Supabase, Bull Queue for allocations',
        blockchain: 'Anchor (Solana) or Hardhat (EVM)',
        smartContracts: 'Token sale, vesting, liquidity lock contracts',
        database: 'Supabase PostgreSQL (whitelist, KYC status)',
        tokenFactory: 'Metaplex Token Metadata (Solana) or OpenZeppelin (EVM)',
        wallet: '@solana/wallet-adapter-react + tier verification',
    },
};

// Security Considerations per Category
export const SECURITY_TIPS = {
    aiAgent: [
        'Never store user private keys - use wallet adapters',
        'Implement rate limiting on all API endpoints',
        'Use RLS (Row Level Security) in Supabase',
        'Validate all webhook payloads from Helius',
        'Sanitize user inputs before AI processing',
    ],
    defi: [
        'Get professional smart contract audit before mainnet',
        'Implement slippage protection (max 5%)',
        'Use multisig for admin functions',
        'Add emergency pause functionality',
        'Never handle user funds in backend - on-chain only',
        'Start with testnet/devnet deployment',
    ],
    gaming: [
        'Validate game results on-chain to prevent cheating',
        'Use commit-reveal for randomness',
        'Rate limit NFT minting to prevent spam',
        'Store NFT metadata on IPFS/Arweave (immutable)',
        'Implement anti-bot measures for fair play',
    ],
    privacy: [
        'All encryption happens client-side only',
        'Zero server-side logging policy',
        'Open source all code for transparency',
        'Regular security audits by third parties',
        'Support Tor/VPN connections',
        'No KYC - no personal data collection',
    ],
    realProject: [
        'Implement proper authentication (Supabase Auth)',
        'Use RLS for data isolation between users',
        'Rate limit external API calls',
        'Cache API responses to reduce costs',
        'Validate and sanitize all user inputs',
    ],
    launchpad: [
        'Smart contract audit is MANDATORY',
        'Use timelocks for contract upgrades',
        'Implement anti-snipe mechanisms',
        'Lock liquidity automatically post-sale',
        'Multisig for fund management',
        'KYC provider integration (optional but recommended)',
    ],
};

// Future Improvements / Roadmap Templates
export const FUTURE_IMPROVEMENTS = {
    aiAgent: [
        'V2: Add copy-trading to mirror whale trades automatically',
        'V3: Mobile app with push notifications',
        'V4: Multi-chain support (Solana + ETH + Base)',
        'V5: AI learns from user feedback to improve signals',
    ],
    defi: [
        'V2: Add yield farming / auto-compound vaults',
        'V3: Cross-chain bridging and swaps',
        'V4: Governance token and DAO voting',
        'V5: Insurance fund for impermanent loss protection',
    ],
    gaming: [
        'V2: Tournament mode with prize pools',
        'V3: NFT marketplace for player-to-player trading',
        'V4: Mobile app version',
        'V5: Metaverse integration (virtual land)',
    ],
    privacy: [
        'V2: Mobile wallet with biometric unlock',
        'V3: Decentralized mixing pools',
        'V4: Cross-chain private transfers',
        'V5: ZK-SNARK integration for faster proofs',
    ],
    realProject: [
        'V2: AI-powered insights and recommendations',
        'V3: API access for developers',
        'V4: White-label solution for enterprises',
        'V5: Mobile app with offline support',
    ],
    launchpad: [
        'V2: NFT launches in addition to tokens',
        'V3: Secondary market for allocations',
        'V4: Cross-chain launches (Solana + EVM)',
        'V5: DAO governance for project selection',
    ],
};

// Simple Explanation Templates (Beginner-friendly)
export const SIMPLE_EXPLANATIONS = {
    aiAgent: (name: string, focus: string) =>
        `Think of ${name} like a smart assistant that watches the blockchain 24/7 for you. ` +
        `When something interesting happens (like a whale buying tokens), it instantly tells you. ` +
        `You set the rules, the AI does the watching. No more missing opportunities while you sleep!`,

    defi: (name: string, focus: string) =>
        `${name} is like a smart bank, but without the bank. ` +
        `It lets you ${focus.toLowerCase()} directly on the blockchain. ` +
        `No middlemen, no paperwork - just connect your wallet and go. ` +
        `Everything runs on smart contracts that anyone can verify.`,

    gaming: (name: string, focus: string) =>
        `${name} is a game where you actually OWN your items as NFTs. ` +
        `Think of it like Fortnite skins, but you can sell them for real money anytime. ` +
        `Play the game, earn tokens, trade with other players - it's gaming meets investing.`,

    privacy: (name: string, focus: string) =>
        `${name} keeps your crypto activity private. ` +
        `Normally, anyone can see your wallet on the blockchain. ` +
        `This tool uses special cryptography to hide your transactions, ` +
        `like sending a letter in an envelope instead of a postcard.`,

    realProject: (name: string, focus: string) =>
        `${name} solves a real problem that crypto users face every day. ` +
        `Instead of switching between 10 different tools, you get one dashboard that does it all. ` +
        `It saves you time and helps you make better decisions with real data.`,

    launchpad: (name: string, focus: string) =>
        `${name} is where new crypto projects launch their tokens. ` +
        `Think of it like Kickstarter, but for crypto. ` +
        `Early supporters get tokens at a discount, and the platform ensures a fair launch ` +
        `with vesting schedules so no one can dump immediately.`,
};

// Project Type Templates per Category
export const PROJECT_TYPES = {
    aiAgent: [
        { name: 'Sniper Bot', focus: 'Launch sniping and early token buys' },
        { name: 'Wallet Tracker', focus: 'Smart money and whale tracking' },
        { name: 'Copy Trading Bot', focus: 'Automated trade copying' },
        { name: 'Alpha Scanner', focus: 'Signal aggregation from multiple sources' },
        { name: 'Whale Alert Bot', focus: 'Large transaction monitoring' },
        { name: 'Rug Detector', focus: 'Smart contract safety analysis' },
    ],
    defi: [
        { name: 'DEX Aggregator', focus: 'Find best swap rates across DEXs' },
        { name: 'Yield Optimizer', focus: 'Auto-compound yields on farms' },
        { name: 'Lending Protocol', focus: 'Borrow and lend crypto' },
        { name: 'Staking Platform', focus: 'Stake tokens for rewards' },
        { name: 'Perpetual DEX', focus: 'Leveraged trading on-chain' },
        { name: 'Liquidity Locker', focus: 'Lock LP tokens for trust' },
    ],
    gaming: [
        { name: 'Play-to-Earn Game', focus: 'Earn crypto by playing' },
        { name: 'NFT Battle Arena', focus: 'PvP battles with NFT assets' },
        { name: 'Crypto Casino', focus: 'Provably fair gambling' },
        { name: 'Racing Game', focus: 'NFT cars and crypto prizes' },
        { name: 'Card Trading Game', focus: 'Collectible NFT cards' },
        { name: 'Prediction Market', focus: 'Bet on real-world outcomes' },
    ],
    privacy: [
        { name: 'Mixer Protocol', focus: 'Private token transfers' },
        { name: 'Private Wallet', focus: 'Anonymous wallet management' },
        { name: 'Stealth Payments', focus: 'One-time stealth addresses' },
        { name: 'ZK Proof Tool', focus: 'Prove ownership without revealing' },
        { name: 'Encrypted Messaging', focus: 'Secure crypto chat' },
        { name: 'Burner Wallet', focus: 'Disposable wallets for privacy' },
    ],
    realProject: [
        { name: 'Portfolio Tracker', focus: 'Multi-wallet portfolio management' },
        { name: 'Tax Calculator', focus: 'Crypto tax reporting' },
        { name: 'Contract Auditor', focus: 'Token safety scanner' },
        { name: 'PnL Dashboard', focus: 'Profit and loss tracking' },
        { name: 'Holder Analyzer', focus: 'Token holder distribution' },
        { name: 'Influencer Tracker', focus: 'Track influencer calls' },
    ],
    launchpad: [
        { name: 'Fair Launch Platform', focus: 'No VC, community-first launches' },
        { name: 'IDO Launchpad', focus: 'Initial DEX offerings' },
        { name: 'NFT Launchpad', focus: 'NFT collection launches' },
        { name: 'Token Factory', focus: 'Create tokens without code' },
        { name: 'Presale Platform', focus: 'Tiered presale with vesting' },
        { name: 'Airdrop Platform', focus: 'Token distribution tool' },
    ],
};

export type CategoryType = 'aiAgent' | 'defi' | 'gaming' | 'privacy' | 'realProject' | 'launchpad';

/**
 * Get all templates for a specific category
 */
export function getCategoryTemplates(category: CategoryType) {
    return {
        diagram: ARCHITECTURE_DIAGRAMS[category],
        techStack: TECH_STACKS[category],
        security: SECURITY_TIPS[category],
        future: FUTURE_IMPROVEMENTS[category],
        projectTypes: PROJECT_TYPES[category],
        getSimpleExplanation: SIMPLE_EXPLANATIONS[category],
    };
}
