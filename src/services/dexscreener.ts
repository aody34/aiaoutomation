import axios from 'axios';
import { BaseProvider } from './BaseProvider';
import { RawTrendData, TokenMetrics, TokenData } from '../types';
import { config } from '../config';

const API_BASE = config.api.dexscreener;

interface DexscreenerPair {
    pairAddress: string;
    baseToken: { name: string; symbol: string };
    chainId: string;
    priceUsd: string;
    priceChange?: { h24?: number; h1?: number };
    volume?: { h24?: number; h1?: number };
    liquidity?: { usd?: number };
    fdv?: number;
    marketCap?: number;
    txns?: { h24?: { buys: number; sells: number } };
    url?: string;
}

interface DexscreenerApiResponse {
    pairs: DexscreenerPair[];
    boostedTokens: Array<{ tokenAddress: string }>;
}

/**
 * Dexscreener Provider - Fetches trending tokens and volume data
 */
export class DexscreenerProvider extends BaseProvider {
    constructor() {
        super('Dexscreener', config.rateLimits.dexscreener);
    }

    protected async fetchData(): Promise<DexscreenerApiResponse> {
        // Get boosted tokens (trending/promoted)
        const boostResponse = await axios.get(`${API_BASE}/token-boosts/top/v1`);
        const boostedTokens = boostResponse.data || [];

        const pairs: DexscreenerPair[] = [];

        // Get detailed info for top 20 boosted tokens
        for (const token of boostedTokens.slice(0, 20)) {
            try {
                await this.rateLimiter.acquire();
                const pairResponse = await axios.get(
                    `${API_BASE}/latest/dex/tokens/${token.tokenAddress}`
                );
                const tokenPairs = pairResponse.data?.pairs || [];
                if (tokenPairs.length > 0) {
                    pairs.push(tokenPairs[0]);
                }
            } catch (err) {
                // Skip failed tokens
                continue;
            }
        }

        // Also get new pairs from major chains
        const [solana, ethereum, base] = await Promise.all([
            this.fetchNewPairs('solana'),
            this.fetchNewPairs('ethereum'),
            this.fetchNewPairs('base'),
        ]);

        pairs.push(...solana, ...ethereum, ...base);

        return { pairs, boostedTokens };
    }

    private async fetchNewPairs(chain: string): Promise<DexscreenerPair[]> {
        try {
            await this.rateLimiter.acquire();
            const response = await axios.get(`${API_BASE}/latest/dex/pairs/${chain}`);
            const pairs = response.data?.pairs || [];

            // Filter for pairs created in last 72 hours with decent volume
            return pairs
                .filter((pair: DexscreenerPair & { pairCreatedAt?: number }) => {
                    const createdAt = pair.pairCreatedAt;
                    const hoursSinceCreation = createdAt
                        ? (Date.now() - createdAt) / (1000 * 60 * 60)
                        : Infinity;
                    return hoursSinceCreation <= 72;
                })
                .slice(0, 15);
        } catch {
            return [];
        }
    }

    protected formatData(raw: DexscreenerApiResponse): RawTrendData {
        const tokens: TokenMetrics[] = raw.pairs.map(pair => ({
            symbol: pair.baseToken?.symbol || 'N/A',
            name: pair.baseToken?.name || 'Unknown',
            chain: pair.chainId || 'unknown',
            volumeChange1h: pair.volume?.h1 || 0,
            volume24h: pair.volume?.h24 || 0,
            liquidity: pair.liquidity?.usd || 0,
            marketCap: pair.marketCap || pair.fdv || 0,
            priceChange24h: pair.priceChange?.h24 || 0,
            pairAddress: pair.pairAddress || '',
            url: pair.url || `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`,
        }));

        // Remove duplicates by symbol
        const uniqueTokens = tokens.reduce((acc, token) => {
            if (!acc.find(t => t.symbol === token.symbol)) {
                acc.push(token);
            }
            return acc;
        }, [] as TokenMetrics[]);

        return {
            source: 'dexscreener',
            timestamp: new Date(),
            tokens: uniqueTokens,
            narratives: [], // Dexscreener doesn't provide narrative data
            rawEngagement: {
                totalMentions: 0,
                sentiment: 'neutral',
                topTickers: uniqueTokens.slice(0, 10).map(t => `$${t.symbol}`),
                tweetSamples: [],
            },
        };
    }
}

// ====================================
// LEGACY EXPORTS (for backward compat)
// ====================================

const provider = new DexscreenerProvider();

/**
 * Fetches trending tokens from Dexscreener
 * @deprecated Use DexscreenerProvider.getData() instead
 */
export async function getTrendingTokens(): Promise<TokenData[]> {
    const data = await provider.getData();
    return data.tokens.map(t => ({
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
    }));
}

/**
 * Fetches new token pairs
 * @deprecated Use DexscreenerProvider.getData() instead
 */
export async function getNewPairs(chain: string = 'solana'): Promise<TokenData[]> {
    return getTrendingTokens();
}

/**
 * Get tokens with highest volume spikes
 * @deprecated Use DexscreenerProvider.getData() instead
 */
export async function getVolumeSpikes(): Promise<TokenData[]> {
    const data = await provider.getData();
    return data.tokens
        .filter(t => t.volume24h > 10000)
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 20)
        .map(t => ({
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
        }));
}

/**
 * Search for tokens by keyword
 */
export async function searchTokens(query: string): Promise<TokenData[]> {
    try {
        await provider['rateLimiter'].acquire();
        const response = await axios.get(
            `${API_BASE}/latest/dex/search?q=${encodeURIComponent(query)}`
        );

        const pairs = response.data?.pairs || [];
        return pairs.slice(0, 10).map((pair: DexscreenerPair) => ({
            name: pair.baseToken?.name || 'Unknown',
            symbol: pair.baseToken?.symbol || 'N/A',
            chain: pair.chainId || 'unknown',
            priceUsd: pair.priceUsd || '0',
            priceChange24h: pair.priceChange?.h24 || 0,
            volume24h: pair.volume?.h24 || 0,
            liquidity: pair.liquidity?.usd || 0,
            pairAddress: pair.pairAddress || '',
            url: pair.url || '',
            fdv: pair.fdv,
            marketCap: pair.marketCap,
        }));
    } catch (error) {
        console.error('Error searching tokens:', error);
        return [];
    }
}
