import { RateLimiter } from '../utils/RateLimiter';
import { withRetry } from '../utils/RetryHandler';
import { RawTrendData } from '../types';
import { config } from '../config';

/**
 * Abstract Base Provider
 * All data source providers must extend this class
 */
export abstract class BaseProvider {
    protected name: string;
    protected rateLimiter: RateLimiter;

    constructor(name: string, requestsPerMinute: number) {
        this.name = name;
        this.rateLimiter = new RateLimiter(requestsPerMinute);
    }

    /**
     * Fetch raw data from the source - implemented by each provider
     */
    protected abstract fetchData(): Promise<unknown>;

    /**
     * Format raw data into unified RawTrendData format
     */
    protected abstract formatData(raw: unknown): RawTrendData;

    /**
     * Get data with rate limiting and retry logic
     */
    async getData(): Promise<RawTrendData> {
        console.log(`📡 [${this.name}] Fetching data...`);

        // Apply rate limiting
        await this.rateLimiter.acquire();

        // Execute with retry logic
        const raw = await withRetry(
            () => this.fetchData(),
            {
                maxRetries: config.retry?.maxRetries || 3,
                baseDelayMs: config.retry?.baseDelayMs || 1000,
                retryStatusCodes: config.retry?.retryStatusCodes || [429, 503],
            }
        );

        const formatted = this.formatData(raw);
        console.log(`✅ [${this.name}] Data fetched successfully`);

        return formatted;
    }

    /**
     * Get provider name
     */
    getName(): string {
        return this.name;
    }
}
