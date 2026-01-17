/**
 * Rate Limiter - Token Bucket Algorithm
 * Prevents API rate limit violations
 */
export class RateLimiter {
    private tokens: number;
    private lastRefill: number;
    private readonly maxTokens: number;
    private readonly refillRate: number; // tokens per ms

    constructor(requestsPerMinute: number) {
        this.maxTokens = requestsPerMinute;
        this.tokens = requestsPerMinute;
        this.refillRate = requestsPerMinute / 60000; // per millisecond
        this.lastRefill = Date.now();
    }

    /**
     * Acquire a token, waiting if necessary
     */
    async acquire(): Promise<void> {
        this.refill();

        if (this.tokens >= 1) {
            this.tokens -= 1;
            return;
        }

        // Calculate wait time for next token
        const waitTime = Math.ceil((1 - this.tokens) / this.refillRate);
        console.log(`⏳ Rate limited, waiting ${waitTime}ms...`);
        await this.sleep(waitTime);
        this.refill();
        this.tokens -= 1;
    }

    /**
     * Refill tokens based on elapsed time
     */
    private refill(): void {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const newTokens = elapsed * this.refillRate;
        this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
        this.lastRefill = now;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Reset the rate limiter
     */
    reset(): void {
        this.tokens = this.maxTokens;
        this.lastRefill = Date.now();
    }
}
