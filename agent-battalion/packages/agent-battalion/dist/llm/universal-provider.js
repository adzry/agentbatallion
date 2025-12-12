"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalProvider = void 0;
exports.createLLM = createLLM;
exports.createDefaultProvider = createDefaultProvider;
const openai_1 = require("@langchain/openai");
const anthropic_1 = require("@langchain/anthropic");
const google_genai_1 = require("@langchain/google-genai");
// Default models for each provider
const DEFAULT_MODELS = {
    openai: 'gpt-4-turbo-preview',
    anthropic: 'claude-3-sonnet-20240229',
    google: 'gemini-pro',
    azure: 'gpt-4',
    ollama: 'llama2',
};
/**
 * Creates an LLM instance based on the provided configuration
 */
function createLLM(config) {
    const { provider, model, temperature = 0.7, maxTokens = 4096 } = config;
    const selectedModel = model || DEFAULT_MODELS[provider];
    switch (provider) {
        case 'openai':
            return new openai_1.ChatOpenAI({
                modelName: selectedModel,
                temperature,
                maxTokens,
                openAIApiKey: config.apiKey || process.env.OPENAI_API_KEY,
            });
        case 'anthropic':
            return new anthropic_1.ChatAnthropic({
                modelName: selectedModel,
                temperature,
                maxTokens,
                anthropicApiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
            });
        case 'google':
            return new google_genai_1.ChatGoogleGenerativeAI({
                modelName: selectedModel,
                temperature,
                maxOutputTokens: maxTokens,
                apiKey: config.apiKey || process.env.GOOGLE_AI_API_KEY,
            });
        case 'azure':
            return new openai_1.ChatOpenAI({
                modelName: selectedModel,
                temperature,
                maxTokens,
                azureOpenAIApiKey: config.apiKey || process.env.AZURE_OPENAI_API_KEY,
                azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT,
                azureOpenAIBasePath: process.env.AZURE_OPENAI_ENDPOINT,
            });
        case 'ollama':
            return new openai_1.ChatOpenAI({
                modelName: selectedModel,
                temperature,
                maxTokens,
                configuration: {
                    baseURL: config.baseUrl || 'http://localhost:11434/v1',
                },
            });
        default:
            throw new Error(`Unsupported LLM provider: ${provider}`);
    }
}
/**
 * Universal Provider class with fallback support
 */
class UniversalProvider {
    primaryLLM;
    fallbackLLM;
    constructor(config) {
        this.primaryLLM = createLLM(config.default);
        if (config.fallback) {
            this.fallbackLLM = createLLM(config.fallback);
        }
    }
    /**
     * Get the primary LLM instance
     */
    getLLM() {
        return this.primaryLLM;
    }
    /**
     * Get the fallback LLM instance
     */
    getFallbackLLM() {
        return this.fallbackLLM;
    }
    /**
     * Invoke the LLM with automatic fallback
     */
    async invoke(messages, options) {
        try {
            return await this.primaryLLM.invoke(messages, options);
        }
        catch (error) {
            if (this.fallbackLLM) {
                console.warn('Primary LLM failed, using fallback:', error);
                return await this.fallbackLLM.invoke(messages, options);
            }
            throw error;
        }
    }
}
exports.UniversalProvider = UniversalProvider;
/**
 * Create a default provider from environment variables
 */
function createDefaultProvider() {
    const provider = process.env.LLM_PROVIDER || 'openai';
    const model = process.env.LLM_MODEL;
    return new UniversalProvider({
        default: {
            provider,
            model,
            temperature: 0.7,
        },
    });
}
//# sourceMappingURL=universal-provider.js.map