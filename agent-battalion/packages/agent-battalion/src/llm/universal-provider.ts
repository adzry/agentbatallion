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
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

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

// Default models for each provider
const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4-turbo-preview',
  anthropic: 'claude-3-sonnet-20240229',
  google: 'gemini-pro',
  azure: 'gpt-4',
  ollama: 'llama2',
};

/**
 * Creates an LLM instance based on the provided configuration
 */
export function createLLM(config: LLMConfig): BaseChatModel {
  const { provider, model, temperature = 0.7, maxTokens = 4096 } = config;
  const selectedModel = model || DEFAULT_MODELS[provider];

  switch (provider) {
    case 'openai':
      return new ChatOpenAI({
        modelName: selectedModel,
        temperature,
        maxTokens,
        openAIApiKey: config.apiKey || process.env.OPENAI_API_KEY,
      });

    case 'anthropic':
      return new ChatAnthropic({
        modelName: selectedModel,
        temperature,
        maxTokens,
        anthropicApiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      });

    case 'google':
      return new ChatGoogleGenerativeAI({
        modelName: selectedModel,
        temperature,
        maxOutputTokens: maxTokens,
        apiKey: config.apiKey || process.env.GOOGLE_AI_API_KEY,
      });

    case 'azure':
      return new ChatOpenAI({
        modelName: selectedModel,
        temperature,
        maxTokens,
        azureOpenAIApiKey: config.apiKey || process.env.AZURE_OPENAI_API_KEY,
        azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT,
        azureOpenAIBasePath: process.env.AZURE_OPENAI_ENDPOINT,
      });

    case 'ollama':
      return new ChatOpenAI({
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
export class UniversalProvider {
  private primaryLLM: BaseChatModel;
  private fallbackLLM?: BaseChatModel;

  constructor(config: UniversalProviderConfig) {
    this.primaryLLM = createLLM(config.default);
    if (config.fallback) {
      this.fallbackLLM = createLLM(config.fallback);
    }
  }

  /**
   * Get the primary LLM instance
   */
  getLLM(): BaseChatModel {
    return this.primaryLLM;
  }

  /**
   * Get the fallback LLM instance
   */
  getFallbackLLM(): BaseChatModel | undefined {
    return this.fallbackLLM;
  }

  /**
   * Invoke the LLM with automatic fallback
   */
  async invoke(messages: any[], options?: any): Promise<any> {
    try {
      return await this.primaryLLM.invoke(messages, options);
    } catch (error) {
      if (this.fallbackLLM) {
        console.warn('Primary LLM failed, using fallback:', error);
        return await this.fallbackLLM.invoke(messages, options);
      }
      throw error;
    }
  }
}

/**
 * Create a default provider from environment variables
 */
export function createDefaultProvider(): UniversalProvider {
  const provider = (process.env.LLM_PROVIDER as LLMProvider) || 'openai';
  const model = process.env.LLM_MODEL;

  return new UniversalProvider({
    default: {
      provider,
      model,
      temperature: 0.7,
    },
  });
}
