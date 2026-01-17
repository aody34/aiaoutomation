import axios, { AxiosError } from 'axios';

export interface RetryOptions {
    maxRetries: number;
    baseDelayMs: number;
    retryStatusCodes: number[];
}

const DEFAULT_OPTIONS: RetryOptions = {
    maxRetries: 3,
    baseDelayMs: 1000,
    retryStatusCodes: [429, 503, 502, 504],
};

/**
 * Execute a function with exponential backoff retry logic
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Check if we should retry
            if (attempt >= opts.maxRetries) {
                break;
            }

            const shouldRetry = isRetryableError(error, opts.retryStatusCodes);
            if (!shouldRetry) {
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s, 8s...
            const delay = opts.baseDelayMs * Math.pow(2, attempt);
            console.log(`🔄 Retry ${attempt + 1}/${opts.maxRetries} after ${delay}ms...`);
            await sleep(delay);
        }
    }

    throw lastError || new Error('Unknown error during retry');
}

/**
 * Check if an error is retryable based on status code
 */
function isRetryableError(error: unknown, retryStatusCodes: number[]): boolean {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;

        if (status && retryStatusCodes.includes(status)) {
            return true;
        }

        // Also retry on network errors
        if (axiosError.code === 'ECONNRESET' || axiosError.code === 'ETIMEDOUT') {
            return true;
        }
    }

    return false;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
