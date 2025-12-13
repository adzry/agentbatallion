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

// Types
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
  images?: string[]; // Base64 encoded images (Phase 2: Visual QA)
}

export interface LLMRequest {
  messages: Message[];
  images?: string[]; // Base64 encoded images for vision models
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

// Default models per provider
const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-sonnet-4-20250514',
  google: 'gemini-2.5-flash',
  ollama: 'llama2',
  mock: 'mock-model',
};

// Failover order for providers
const FAILOVER_ORDER: LLMProvider[] = ['anthropic', 'openai', 'google'];

/**
 * LLM Service Class
 */
export class LLMService extends EventEmitter {
  private config: LLMConfig;
  private requestCount: number = 0;

  constructor(config?: Partial<LLMConfig>) {
    super();
    
    // Determine provider from environment or config
    const provider = config?.provider || 
      (process.env.LLM_PROVIDER as LLMProvider) || 
      'mock';

    this.config = {
      provider,
      apiKey: config?.apiKey || this.getApiKey(provider),
      model: config?.model || process.env.LLM_MODEL || DEFAULT_MODELS[provider],
      baseUrl: config?.baseUrl,
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 4096,
    };
  }

  private getApiKey(provider: LLMProvider): string | undefined {
    switch (provider) {
      case 'openai':
        return process.env.OPENAI_API_KEY;
      case 'anthropic':
        return process.env.ANTHROPIC_API_KEY;
      case 'google':
        return process.env.GOOGLE_AI_API_KEY;
      default:
        return undefined;
    }
  }

  /**
   * Generate a completion with automatic failover
   */
  async complete(messages: Message[], enableFailover: boolean = true): Promise<LLMResponse> {
    this.requestCount++;
    this.emit('request', { messages, config: this.config });

    // Get providers to try (primary + failovers if enabled)
    const providersToTry = enableFailover 
      ? this.getProvidersWithFailover()
      : [this.config.provider];

    let lastError: Error | null = null;

    for (const provider of providersToTry) {
      try {
        let response: LLMResponse;

        switch (provider) {
          case 'openai':
            if (!this.getApiKey('openai')) continue;
            response = await this.completeOpenAI(messages);
            break;
          case 'anthropic':
            if (!this.getApiKey('anthropic')) continue;
            response = await this.completeAnthropic(messages);
            break;
          case 'google':
            if (!this.getApiKey('google')) continue;
            response = await this.completeGoogle(messages);
            break;
          case 'ollama':
            response = await this.completeOllama(messages);
            break;
          case 'mock':
          default:
            response = await this.completeMock(messages);
            break;
        }

        this.emit('response', response);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.emit('provider_failed', { provider, error: lastError.message });
        
        // If failover is enabled, continue to next provider
        if (enableFailover && providersToTry.indexOf(provider) < providersToTry.length - 1) {
          this.emit('failover', { from: provider, to: providersToTry[providersToTry.indexOf(provider) + 1] });
          continue;
        }
      }
    }

    this.emit('error', lastError);
    throw lastError || new Error('All providers failed');
  }

  /**
   * Get ordered list of providers to try (primary first, then failovers)
   */
  private getProvidersWithFailover(): LLMProvider[] {
    const primary = this.config.provider;
    
    // For mock provider, don't failover
    if (primary === 'mock' || primary === 'ollama') {
      return [primary];
    }

    // Start with primary, then add other configured providers
    const providers: LLMProvider[] = [primary];
    
    for (const provider of FAILOVER_ORDER) {
      if (provider !== primary && this.getApiKey(provider)) {
        providers.push(provider);
      }
    }

    return providers;
  }

  /**
   * Stream a completion
   */
  async *stream(messages: Message[]): AsyncGenerator<StreamChunk> {
    this.requestCount++;

    switch (this.config.provider) {
      case 'openai':
        yield* this.streamOpenAI(messages);
        break;
      case 'anthropic':
        yield* this.streamAnthropic(messages);
        break;
      case 'mock':
      default:
        yield* this.streamMock(messages);
        break;
    }
  }

  /**
   * OpenAI Completion
   */
  private async completeOpenAI(messages: Message[]): Promise<LLMResponse> {
    // Transform messages to support images (Phase 2: Visual QA)
    const transformedMessages = messages.map(msg => {
      if (msg.images && msg.images.length > 0) {
        // GPT-4 Vision format
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            ...msg.images.map(img => ({
              type: 'image_url',
              image_url: {
                url: img.startsWith('data:') ? img : `data:image/png;base64,${img}`,
              },
            })),
          ],
        };
      }
      return { role: msg.role, content: msg.content };
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: transformedMessages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string }; finish_reason: string }>;
      model: string;
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    return {
      content: data.choices[0].message.content,
      model: data.model,
      provider: 'openai',
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      finishReason: data.choices[0].finish_reason,
    };
  }

  /**
   * OpenAI Streaming
   */
  private async *streamOpenAI(messages: Message[]): AsyncGenerator<StreamChunk> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            if (content) {
              yield { content, done: false };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  /**
   * Anthropic Completion
   */
  private async completeAnthropic(messages: Message[]): Promise<LLMResponse> {
    // Extract system message
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        system: systemMessage?.content,
        messages: chatMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json() as {
      content: Array<{ text: string }>;
      model: string;
      usage: { input_tokens: number; output_tokens: number };
      stop_reason: string;
    };

    return {
      content: data.content[0].text,
      model: data.model,
      provider: 'anthropic',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
      finishReason: data.stop_reason,
    };
  }

  /**
   * Anthropic Streaming
   */
  private async *streamAnthropic(messages: Message[]): AsyncGenerator<StreamChunk> {
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        system: systemMessage?.content,
        messages: chatMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content_block_delta') {
              yield { content: data.delta.text, done: false };
            } else if (data.type === 'message_stop') {
              yield { content: '', done: true };
              return;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  /**
   * Google AI Completion
   */
  private async completeGoogle(messages: Message[]): Promise<LLMResponse> {
    // Transform messages to support images (Phase 2: Visual QA)
    const contents = messages.map(m => {
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
        { text: m.content }
      ];
      
      // Add images in Gemini format
      if (m.images && m.images.length > 0) {
        m.images.forEach(img => {
          // Remove data URL prefix if present
          const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
          parts.push({
            inlineData: {
              mimeType: 'image/png',
              data: base64Data,
            },
          });
        });
      }
      
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: this.config.maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(`Google AI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json() as {
      candidates: Array<{ content: { parts: Array<{ text: string }> }; finishReason: string }>;
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
    };

    return {
      content: data.candidates[0].content.parts[0].text,
      model: this.config.model!,
      provider: 'google',
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
      finishReason: data.candidates[0].finishReason,
    };
  }

  /**
   * Ollama Completion (Local)
   */
  private async completeOllama(messages: Message[]): Promise<LLMResponse> {
    const baseUrl = this.config.baseUrl || 'http://localhost:11434';

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json() as {
      message: { content: string };
      prompt_eval_count?: number;
      eval_count?: number;
    };

    return {
      content: data.message.content,
      model: this.config.model!,
      provider: 'ollama',
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    };
  }

  /**
   * Mock Completion (for testing)
   */
  private async completeMock(messages: Message[]): Promise<LLMResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const lastMessage = messages[messages.length - 1];
    const mockResponse = this.generateMockResponse(lastMessage.content);

    return {
      content: mockResponse,
      model: 'mock-model',
      provider: 'mock',
      usage: {
        promptTokens: lastMessage.content.length,
        completionTokens: mockResponse.length,
        totalTokens: lastMessage.content.length + mockResponse.length,
      },
    };
  }

  /**
   * Mock Streaming
   */
  private async *streamMock(messages: Message[]): AsyncGenerator<StreamChunk> {
    const lastMessage = messages[messages.length - 1];
    const mockResponse = this.generateMockResponse(lastMessage.content);
    const words = mockResponse.split(' ');

    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 50));
      yield { content: word + ' ', done: false };
    }

    yield { content: '', done: true };
  }

  /**
   * Generate mock response based on context
   */
  private generateMockResponse(input: string): string {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('requirement') || lowerInput.includes('analyze')) {
      return JSON.stringify({
        requirements: [
          'User authentication system',
          'Responsive dashboard',
          'Data visualization',
          'API integration',
        ],
        priority: 'high',
        complexity: 'medium',
      });
    }

    if (lowerInput.includes('architect') || lowerInput.includes('design')) {
      return JSON.stringify({
        architecture: 'JAMstack',
        components: ['Header', 'Footer', 'Dashboard', 'Sidebar'],
        techStack: {
          frontend: 'Next.js 15',
          styling: 'Tailwind CSS',
          database: 'PostgreSQL',
        },
      });
    }

    if (lowerInput.includes('code') || lowerInput.includes('implement')) {
      return `// Generated code component
export function Component() {
  return (
    <div className="p-4">
      <h1>Generated Component</h1>
    </div>
  );
}`;
    }

    return 'Mock response generated for: ' + input.slice(0, 50) + '...';
  }

  /**
   * Get current configuration
   */
  getConfig(): LLMConfig {
    return { ...this.config };
  }

  /**
   * Get request count
   */
  getRequestCount(): number {
    return this.requestCount;
  }

  /**
   * Check if real LLM is configured
   */
  isRealLLM(): boolean {
    return this.config.provider !== 'mock' && !!this.config.apiKey;
  }

  /**
   * Get list of available (configured) providers
   */
  getAvailableProviders(): LLMProvider[] {
    const available: LLMProvider[] = [];
    
    if (this.getApiKey('anthropic')) available.push('anthropic');
    if (this.getApiKey('openai')) available.push('openai');
    if (this.getApiKey('google')) available.push('google');
    
    // Ollama and mock are always available
    available.push('ollama', 'mock');
    
    return available;
  }

  /**
   * Get primary provider
   */
  getPrimaryProvider(): LLMProvider {
    return this.config.provider;
  }
}

/**
 * Create LLM service instance
 */
export function createLLMService(config?: Partial<LLMConfig>): LLMService {
  return new LLMService(config);
}

/**
 * Default singleton instance
 */
let defaultInstance: LLMService | null = null;

export function getDefaultLLMService(): LLMService {
  if (!defaultInstance) {
    defaultInstance = createLLMService();
  }
  return defaultInstance;
}
