import axios from 'axios';
import { TokenData } from '../types';
import { config } from '../config';

const API_BASE = config.api.dexscreener;

/**
 * Fetches trending tokens from Dexscreener
 */
export async function getTrendingTokens(): Promise<TokenData[]> {
    try {
        // Get boosted tokens (trending/promoted)
        const response = await axios.get(`${API_BASE}/token-boosts/top/v1`);
        const boostedTokens = response.data || [];

        const tokens: TokenData[] = [];

        for (const token of boostedTokens.slice(0, 20)) {
            try {
                // Get detailed pair info
                const pairResponse = await axios.get(
                    `${API_BASE}/latest/dex/tokens/${token.tokenAddress}`
                );
                const pairs = pairResponse.data?.pairs || [];

                if (pairs.length > 0) {
                    const pair = pairs[0];
                    tokens.push({
                        name: pair.baseToken?.name || 'Unknown',
                        symbol: pair.baseToken?.symbol || 'N/A',
                        chain: pair.chainId || 'unknown',
                        priceUsd: pair.priceUsd || '0',
                        priceChange24h: pair.priceChange?.h24 || 0,
                        volume24h: pair.volume?.h24 || 0,
                        liquidity: pair.liquidity?.usd || 0,
                        pairAddress: pair.pairAddress || '',
                        url: pair.url || `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`,
                        fdv: pair.fdv,
                        marketCap: pair.marketCap,
                        txns24h: pair.txns?.h24,
                    });
                }
            } catch (err) {
                // Skip failed tokens
                continue;
            }
        }

        return tokens;
    } catch (error) {
        console.error('Error fetching trending tokens:', error);
        return [];
    }
}

/**
 * Fetches new token pairs from the last 24 hours
 */
export async function getNewPairs(chain: string = 'solana'): Promise<TokenData[]> {
    try {
        const response = await axios.get(
            `${API_BASE}/latest/dex/pairs/${chain}`
        );

        const pairs = response.data?.pairs || [];
        const tokens: TokenData[] = pairs
            .filter((pair: any) => {
                const createdAt = pair.pairCreatedAt;
                const hoursSinceCreation = createdAt
                    ? (Date.now() - createdAt) / (1000 * 60 * 60)
                    : Infinity;
                return hoursSinceCreation <= 72; // Last 72 hours
            })
            .slice(0, 30)
            .map((pair: any) => ({
                name: pair.baseToken?.name || 'Unknown',
                symbol: pair.baseToken?.symbol || 'N/A',
                chain: pair.chainId || chain,
                priceUsd: pair.priceUsd || '0',
                priceChange24h: pair.priceChange?.h24 || 0,
                volume24h: pair.volume?.h24 || 0,
                liquidity: pair.liquidity?.usd || 0,
                pairAddress: pair.pairAddress || '',
                url: pair.url || '',
                fdv: pair.fdv,
                marketCap: pair.marketCap,
                txns24h: pair.txns?.h24,
            }));

        return tokens;
    } catch (error) {
        console.error('Error fetching new pairs:', error);
        return [];
    }
}

/**
 * Search for tokens by keyword
 */
export async function searchTokens(query: string): Promise<TokenData[]> {
    try {
        const response = await axios.get(
            `${API_BASE}/latest/dex/search?q=${encodeURIComponent(query)}`
        );

        const pairs = response.data?.pairs || [];
        return pairs.slice(0, 10).map((pair: any) => ({
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

/**
 * Get tokens with highest volume spikes
 */
export async function getVolumeSpikes(): Promise<TokenData[]> {
    const [solana, ethereum, base] = await Promise.all([
        getNewPairs('solana'),
        getNewPairs('ethereum'),
        getNewPairs('base'),
    ]);

    const allTokens = [...solana, ...ethereum, ...base];

    // Sort by volume and filter for significant volume
    return allTokens
        .filter((t) => t.volume24h > 10000) // Min $10k volume
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 20);
}
