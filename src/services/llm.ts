import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { BuildSpecification } from '../types';
import { ANALYST_SYSTEM_PROMPT, buildUserPrompt } from '../analysis/llmPrompt';

/**
 * Gemini LLM Service for generating Build Specifications
 */
export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: string;

    constructor() {
        if (!config.gemini.apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        this.model = config.gemini.model;
    }

    /**
     * Generate Build Specifications from market data
     */
    async generateBuildSpecs(marketData: {
        tokens: Array<{ symbol: string; volume24h: number; volumeChange1h: number; liquidity: number; marketCap: number }>;
        narratives: Array<{ keyword: string; frequency: number; sentiment: string }>;
        trendingTickers: string[];
        smartMoneySignals?: Array<{ wallet: string; action: string; token: string; amount: number }>;
    }): Promise<BuildSpecification[]> {
        console.log('🤖 Calling Gemini API for Build Specifications...');

        try {
            const model = this.genAI.getGenerativeModel({ model: this.model });

            // Build the prompts
            const userPrompt = buildUserPrompt(marketData);

            // Generate content with system instruction
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                systemInstruction: ANALYST_SYSTEM_PROMPT,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                    responseMimeType: 'application/json',
                },
            });

            const response = result.response;
            const text = response.text();

            console.log('✅ Gemini response received');

            // Parse JSON response
            const parsed = this.parseResponse(text);
            return parsed;

        } catch (error) {
            console.error('❌ Gemini API error:', error);
            throw error;
        }
    }

    /**
     * Parse Gemini response into BuildSpecification array
     */
    private parseResponse(text: string): BuildSpecification[] {
        try {
            // Try to extract JSON from the response
            let jsonStr = text;

            // Handle markdown code blocks
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                jsonStr = jsonMatch[1];
            }

            const parsed = JSON.parse(jsonStr);

            // Handle different response formats
            if (parsed.projects && Array.isArray(parsed.projects)) {
                return parsed.projects.map(this.normalizeBuildSpec);
            } else if (Array.isArray(parsed)) {
                return parsed.map(this.normalizeBuildSpec);
            }

            console.warn('⚠️ Unexpected response format, returning empty array');
            return [];

        } catch (error) {
            console.error('❌ Failed to parse Gemini response:', error);
            console.log('Raw response:', text.substring(0, 500));
            return [];
        }
    }

    /**
     * Normalize a project object to BuildSpecification format
     */
    private normalizeBuildSpec(project: any): BuildSpecification {
        return {
            projectName: project.projectName || project.name || 'Unknown Project',
            ticker: project.ticker || '$UNKNOWN',
            score: project.score || 0,
            concept: project.concept || '',
            whyNow: project.whyNow || '',
            techStack: project.techStack || {
                frontend: 'Next.js 14+',
                blockchain: 'Solana',
                backend: 'Node.js',
                database: 'Supabase',
                wallet: '@solana/wallet-adapter-react',
            },
            coreFeatures: project.coreFeatures || [],
            databaseSchema: project.databaseSchema || {},
            smartContractRequirements: project.smartContractRequirements || [],
            roadmap: project.roadmap || [],
            // New fields from enhanced prompt
            analysisLogic: project.analysisLogic,
            performanceSpecs: project.performanceSpecs,
            marketingHook: project.marketingHook || '',
        };
    }
}

// Singleton instance
let geminiService: GeminiService | null = null;

/**
 * Get or create Gemini service instance
 */
export function getGeminiService(): GeminiService {
    if (!geminiService) {
        geminiService = new GeminiService();
    }
    return geminiService;
}

/**
 * Generate Build Specifications (convenience function)
 */
export async function generateBuildSpecsWithLLM(marketData: {
    tokens: Array<{ symbol: string; volume24h: number; volumeChange1h: number; liquidity: number; marketCap: number }>;
    narratives: Array<{ keyword: string; frequency: number; sentiment: string }>;
    trendingTickers: string[];
    smartMoneySignals?: Array<{ wallet: string; action: string; token: string; amount: number }>;
}): Promise<BuildSpecification[]> {
    const service = getGeminiService();
    return service.generateBuildSpecs(marketData);
}
