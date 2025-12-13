/**
 * AI Agent - Real LLM-Powered Agent Base
 * 
 * Extends BaseTeamAgent with actual AI capabilities using LLM service
 */

import { BaseTeamAgent } from './base-team-agent.js';
import { AgentProfile, AgentTask, Artifact } from './types.js';
import { MemoryManager } from '../memory/memory-manager.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { MessageBus } from '../communication/message-bus.js';
import { LLMService, Message, createLLMService } from '../llm/llm-service.js';

export interface AIAgentConfig {
  useRealAI?: boolean;
  llmConfig?: {
    provider?: 'openai' | 'anthropic' | 'google' | 'ollama' | 'mock';
    model?: string;
    temperature?: number;
  };
}

export abstract class AIAgent extends BaseTeamAgent {
  protected llm: LLMService;
  protected useRealAI: boolean;
  protected conversationHistory: Message[] = [];

  constructor(
    profile: AgentProfile,
    memory: MemoryManager,
    tools: ToolRegistry,
    messageBus: MessageBus,
    config?: AIAgentConfig
  ) {
    super(profile, memory, tools, messageBus);
    
    this.useRealAI = config?.useRealAI ?? 
      (process.env.USE_REAL_AI === 'true');

    this.llm = createLLMService(config?.llmConfig);

    // Initialize conversation with system prompt
    this.conversationHistory = [{
      role: 'system',
      content: this.profile.systemPrompt,
    }];
  }

  /**
   * Send a prompt to the LLM and get a response
   */
  protected async prompt(userMessage: string): Promise<string> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    this.think(`Processing: ${userMessage.slice(0, 100)}...`);

    try {
      const response = await this.llm.complete(this.conversationHistory);

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.content,
      });

      return response.content;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.think(`LLM Error: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Stream a response from the LLM
   */
  protected async *promptStream(userMessage: string): AsyncGenerator<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    let fullResponse = '';

    for await (const chunk of this.llm.stream(this.conversationHistory)) {
      if (!chunk.done) {
        fullResponse += chunk.content;
        yield chunk.content;
      }
    }

    this.conversationHistory.push({
      role: 'assistant',
      content: fullResponse,
    });
  }

  /**
   * Ask LLM for structured JSON response
   */
  protected async promptJSON<T>(userMessage: string, schema?: string): Promise<T> {
    const prompt = schema 
      ? `${userMessage}\n\nRespond with valid JSON matching this schema:\n${schema}`
      : `${userMessage}\n\nRespond with valid JSON only, no markdown or explanation.`;

    const response = await this.prompt(prompt);

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response;
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      // Try to find JSON object in response
      const objectMatch = response.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]) as T;
      }
      throw new Error(`Failed to parse JSON response: ${response.slice(0, 200)}`);
    }
  }

  /**
   * Ask LLM for code generation
   */
  protected async promptCode(
    description: string,
    language: string = 'typescript',
    context?: string
  ): Promise<string> {
    const prompt = `Generate ${language} code for: ${description}
${context ? `\nContext:\n${context}` : ''}

Requirements:
- Write clean, production-ready code
- Include proper TypeScript types
- Follow best practices
- No explanations, just the code

Respond with only the code, no markdown code blocks.`;

    const response = await this.prompt(prompt);

    // Extract code from response (handle markdown code blocks)
    const codeMatch = response.match(/```(?:\w+)?\s*([\s\S]*?)```/);
    if (codeMatch) {
      return codeMatch[1].trim();
    }

    return response.trim();
  }

  /**
   * Clear conversation history (keep system prompt)
   */
  protected clearHistory(): void {
    this.conversationHistory = [{
      role: 'system',
      content: this.profile.systemPrompt,
    }];
  }

  /**
   * Add context to the conversation
   */
  protected addContext(context: string): void {
    this.conversationHistory.push({
      role: 'user',
      content: `Context information:\n${context}`,
    });
    this.conversationHistory.push({
      role: 'assistant',
      content: 'I understand the context. I will use this information for my tasks.',
    });
  }

  /**
   * Check if using real AI
   */
  isUsingRealAI(): boolean {
    return this.llm.isRealLLM();
  }
}
