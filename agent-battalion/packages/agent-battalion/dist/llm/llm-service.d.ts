/**
 * LLM Service - Real AI Integration
 *
 * Provides unified interface for multiple LLM providers:
 * - OpenAI (GPT-4, GPT-4 Turbo, GPT-3.5)
 * - Anthropic (Claude 3 Opus, Sonnet, Haiku)
 * - Google (Gemini Pro)
 * - Local (Ollama)
 */
import { EventEmitter } from 'events';
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'ollama' | 'mock';
export interface LLMConfig {
    provider: LLMProvider;
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
}
export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
    images?: string[];
}
export interface LLMRequest {
    messages: Message[];
    images?: string[];
}
export interface LLMResponse {
    content: string;
    model: string;
    provider: LLMProvider;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    finishReason?: string;
}
export interface StreamChunk {
    content: string;
    done: boolean;
}
/**
 * LLM Service Class
 */
export declare class LLMService extends EventEmitter {
    private config;
    private requestCount;
    constructor(config?: Partial<LLMConfig>);
    private getApiKey;
    /**
     * Generate a completion with automatic failover
     */
    complete(messages: Message[], enableFailover?: boolean): Promise<LLMResponse>;
    /**
     * Get ordered list of providers to try (primary first, then failovers)
     */
    private getProvidersWithFailover;
    /**
     * Stream a completion
     */
    stream(messages: Message[]): AsyncGenerator<StreamChunk>;
    /**
     * OpenAI Completion
     */
    private completeOpenAI;
    /**
     * OpenAI Streaming
     */
    private streamOpenAI;
    /**
     * Anthropic Completion
     */
    private completeAnthropic;
    /**
     * Anthropic Streaming
     */
    private streamAnthropic;
    /**
     * Google AI Completion
     */
    private completeGoogle;
    /**
     * Ollama Completion (Local)
     */
    private completeOllama;
    /**
     * Mock Completion (for testing)
     */
    private completeMock;
    /**
     * Mock Streaming
     */
    private streamMock;
    /**
     * Generate mock response based on context
     */
    private generateMockResponse;
    /**
     * Get current configuration
     */
    getConfig(): LLMConfig;
    /**
     * Get request count
     */
    getRequestCount(): number;
    /**
     * Check if real LLM is configured
     */
    isRealLLM(): boolean;
    /**
     * Get list of available (configured) providers
     */
    getAvailableProviders(): LLMProvider[];
    /**
     * Get primary provider
     */
    getPrimaryProvider(): LLMProvider;
}
/**
 * Create LLM service instance
 */
export declare function createLLMService(config?: Partial<LLMConfig>): LLMService;
export declare function getDefaultLLMService(): LLMService;
//# sourceMappingURL=llm-service.d.ts.map