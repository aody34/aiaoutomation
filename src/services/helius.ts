// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Helius } = require('helius-sdk');
import { BaseProvider } from './BaseProvider';
import { RawTrendData, NarrativeSignal, TokenMetrics } from '../types';
import { config } from '../config';
import { SMART_MONEY_CONFIG } from '../analysis/llmPrompt';

interface WalletAnalysis {
    address: string;
    winRate: number;
    avgHoldTime: number; // in hours
    totalTrades: number;
    profitableTrades: number;
    isSmartMoney: boolean;
}

interface SmartMoneySignal {
    wallet: string;
    action: 'buy' | 'sell' | 'accumulate';
    token: string;
    tokenSymbol: string;
    amount: number;
    timestamp: Date;
}

interface HeliusRawData {
    walletAnalyses: WalletAnalysis[];
    smartMoneySignals: SmartMoneySignal[];
    tokenHolders: Array<{ address: string; balance: number }>;
}

/**
 * Helius Provider - Smart Money detection and Solana wallet analysis
 */
export class HeliusProvider extends BaseProvider {
    private helius: any;

    constructor() {
        super('Helius', config.rateLimits?.helius || 50);

        if (!config.helius.apiKey) {
            throw new Error('HELIUS_API_KEY is not set');
        }

        this.helius = new Helius(config.helius.apiKey);
    }

    protected async fetchData(): Promise<HeliusRawData> {
        // For now, return mock data structure
        // In production, this would call Helius APIs
        return {
            walletAnalyses: [],
            smartMoneySignals: [],
            tokenHolders: [],
        };
    }

    protected formatData(raw: HeliusRawData): RawTrendData {
        const narratives: NarrativeSignal[] = [];

        // Convert smart money signals to narrative signals
        for (const signal of raw.smartMoneySignals) {
            narratives.push({
                keyword: `Smart Money ${signal.action}: ${signal.tokenSymbol}`,
                frequency: Math.round(signal.amount / 1000), // Weight by amount
                source: 'helius',
                sentiment: signal.action === 'buy' ? 'bullish' : signal.action === 'sell' ? 'bearish' : 'neutral',
            });
        }

        return {
            source: 'axiom', // Use axiom as the source type for compatibility
            timestamp: new Date(),
            tokens: [],
            narratives,
            rawEngagement: {
                totalMentions: raw.smartMoneySignals.length,
                sentiment: 'neutral',
                topTickers: raw.smartMoneySignals.map(s => `$${s.tokenSymbol}`),
                tweetSamples: [],
            },
        };
    }

    /**
     * Analyze a wallet's trading performance
     */
    async analyzeWallet(address: string): Promise<WalletAnalysis> {
        console.log(`📊 Analyzing wallet: ${address.substring(0, 8)}...`);

        try {
            await this.rateLimiter.acquire();

            // Get wallet transaction history
            const history = await this.helius.rpc.getSignaturesForAddress(address, {
                limit: 100,
            });

            // Analyze trades to calculate win rate
            let profitableTrades = 0;
            let totalTrades = 0;
            let totalHoldTime = 0;

            // This is a simplified analysis
            // In production, you'd track actual buy/sell pairs and P&L
            for (const tx of history) {
                totalTrades++;
                // Simplified: assume 60% win rate for demo
                if (Math.random() > 0.4) profitableTrades++;
                totalHoldTime += Math.random() * 48; // Random hold time up to 48h
            }

            const winRate = totalTrades > 0 ? profitableTrades / totalTrades : 0;
            const avgHoldTime = totalTrades > 0 ? totalHoldTime / totalTrades : 0;

            const isSmartMoney =
                winRate >= SMART_MONEY_CONFIG.minWinRate &&
                avgHoldTime * 60 * 60 * 1000 >= SMART_MONEY_CONFIG.minHoldTime;

            return {
                address,
                winRate,
                avgHoldTime,
                totalTrades,
                profitableTrades,
                isSmartMoney,
            };

        } catch (error) {
            console.error(`❌ Failed to analyze wallet ${address}:`, error);
            return {
                address,
                winRate: 0,
                avgHoldTime: 0,
                totalTrades: 0,
                profitableTrades: 0,
                isSmartMoney: false,
            };
        }
    }

    /**
     * Get top holders for a token and analyze for smart money
     */
    async analyzeTokenHolders(tokenAddress: string): Promise<{
        holders: WalletAnalysis[];
        smartMoneyCount: number;
        smartMoneyPercentage: number;
    }> {
        console.log(`🔍 Analyzing holders for token: ${tokenAddress.substring(0, 8)}...`);

        try {
            await this.rateLimiter.acquire();

            // Get token accounts (holders)
            // Note: In production you'd use getAssetsByGroup or similar
            const assets = await this.helius.rpc.getTokenAccounts({
                mint: tokenAddress,
                limit: 20,
            });

            const holders: WalletAnalysis[] = [];

            // Analyze top holders
            for (const asset of assets.token_accounts?.slice(0, 10) || []) {
                const analysis = await this.analyzeWallet(asset.owner);
                holders.push(analysis);
            }

            const smartMoneyCount = holders.filter(h => h.isSmartMoney).length;

            return {
                holders,
                smartMoneyCount,
                smartMoneyPercentage: holders.length > 0 ? (smartMoneyCount / holders.length) * 100 : 0,
            };

        } catch (error) {
            console.error('❌ Failed to analyze token holders:', error);
            return {
                holders: [],
                smartMoneyCount: 0,
                smartMoneyPercentage: 0,
            };
        }
    }

    /**
     * Detect smart money accumulation signals
     */
    async detectSmartMoneySignals(tokenAddresses: string[]): Promise<SmartMoneySignal[]> {
        console.log(`🎯 Detecting smart money signals for ${tokenAddresses.length} tokens...`);

        const signals: SmartMoneySignal[] = [];

        for (const token of tokenAddresses.slice(0, 5)) { // Limit to 5 to avoid rate limits
            try {
                const analysis = await this.analyzeTokenHolders(token);

                if (analysis.smartMoneyCount >= SMART_MONEY_CONFIG.alertThreshold) {
                    signals.push({
                        wallet: 'Multiple',
                        action: 'accumulate',
                        token,
                        tokenSymbol: token.substring(0, 6).toUpperCase(),
                        amount: analysis.smartMoneyCount * 10000, // Estimated
                        timestamp: new Date(),
                    });
                }
            } catch (error) {
                continue;
            }
        }

        return signals;
    }

    /**
     * Get enhanced transaction data for a token
     */
    async getEnhancedTransactions(tokenAddress: string, limit: number = 20): Promise<any[]> {
        try {
            await this.rateLimiter.acquire();

            // Use Helius enhanced transactions API
            const txs = await this.helius.rpc.getSignaturesForAddress(tokenAddress, { limit });

            // Get parsed transaction data
            const signatures = txs.map((tx: { signature: string }) => tx.signature);
            if (signatures.length === 0) return [];

            const parsed = await this.helius.rpc.getTransactions(signatures, {
                commitment: 'confirmed',
            });

            return parsed || [];

        } catch (error) {
            console.error('❌ Failed to get enhanced transactions:', error);
            return [];
        }
    }
}

// Singleton instance
let heliusProvider: HeliusProvider | null = null;

/**
 * Get or create Helius provider instance
 */
export function getHeliusProvider(): HeliusProvider {
    if (!heliusProvider) {
        heliusProvider = new HeliusProvider();
    }
    return heliusProvider;
}

/**
 * Detect smart money signals (convenience function)
 */
export async function detectSmartMoney(tokenAddresses: string[]): Promise<SmartMoneySignal[]> {
    const provider = getHeliusProvider();
    return provider.detectSmartMoneySignals(tokenAddresses);
}

/**
 * Analyze a wallet for smart money status
 */
export async function analyzeWalletForSmartMoney(address: string): Promise<WalletAnalysis> {
    const provider = getHeliusProvider();
    return provider.analyzeWallet(address);
}
