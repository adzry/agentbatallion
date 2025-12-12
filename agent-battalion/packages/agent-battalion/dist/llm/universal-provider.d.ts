/**
 * Universal LLM Provider
 *
 * Provides a unified interface for multiple LLM providers:
 * - OpenAI (GPT-4, GPT-4 Turbo)
 * - Anthropic (Claude 3)
 * - Google (Gemini)
 * - Azure OpenAI
 * - Ollama (local models)
 */
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'ollama';
export interface LLMConfig {
    provider: LLMProvider;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
    baseUrl?: string;
}
export interface UniversalProviderConfig {
    default: LLMConfig;
    fallback?: LLMConfig;
}
/**
 * Creates an LLM instance based on the provided configuration
 */
export declare function createLLM(config: LLMConfig): BaseChatModel;
/**
 * Universal Provider class with fallback support
 */
export declare class UniversalProvider {
    private primaryLLM;
    private fallbackLLM?;
    constructor(config: UniversalProviderConfig);
    /**
     * Get the primary LLM instance
     */
    getLLM(): BaseChatModel;
    /**
     * Get the fallback LLM instance
     */
    getFallbackLLM(): BaseChatModel | undefined;
    /**
     * Invoke the LLM with automatic fallback
     */
    invoke(messages: any[], options?: any): Promise<any>;
}
/**
 * Create a default provider from environment variables
 */
export declare function createDefaultProvider(): UniversalProvider;
//# sourceMappingURL=universal-provider.d.ts.map