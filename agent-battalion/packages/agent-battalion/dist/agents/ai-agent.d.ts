/**
 * AI Agent - Real LLM-Powered Agent Base
 *
 * Extends BaseTeamAgent with actual AI capabilities using LLM service
 */
import { BaseTeamAgent } from './base-team-agent.js';
import { AgentProfile } from './types.js';
import { MemoryManager } from '../memory/memory-manager.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { MessageBus } from '../communication/message-bus.js';
import { LLMService, Message } from '../llm/llm-service.js';
export interface AIAgentConfig {
    useRealAI?: boolean;
    llmConfig?: {
        provider?: 'openai' | 'anthropic' | 'google' | 'ollama' | 'mock';
        model?: string;
        temperature?: number;
    };
}
export declare abstract class AIAgent extends BaseTeamAgent {
    protected llm: LLMService;
    protected useRealAI: boolean;
    protected conversationHistory: Message[];
    constructor(profile: AgentProfile, memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus, config?: AIAgentConfig);
    /**
     * Send a prompt to the LLM and get a response
     */
    protected prompt(userMessage: string): Promise<string>;
    /**
     * Stream a response from the LLM
     */
    protected promptStream(userMessage: string): AsyncGenerator<string>;
    /**
     * Ask LLM for structured JSON response
     */
    protected promptJSON<T>(userMessage: string, schema?: string): Promise<T>;
    /**
     * Ask LLM for code generation
     */
    protected promptCode(description: string, language?: string, context?: string): Promise<string>;
    /**
     * Clear conversation history (keep system prompt)
     */
    protected clearHistory(): void;
    /**
     * Add context to the conversation
     */
    protected addContext(context: string): void;
    /**
     * Check if using real AI
     */
    isUsingRealAI(): boolean;
}
//# sourceMappingURL=ai-agent.d.ts.map