/**
 * Base Agent
 *
 * Abstract base class for all LangGraph agents in the Agent Battalion system.
 * Provides common functionality for state management and agent execution.
 */
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StructuredTool } from '@langchain/core/tools';
import { AgentState, AgentConfig } from './types.js';
export { AgentState };
/**
 * Abstract Base Agent class
 *
 * This is a simplified implementation that doesn't use StateGraph directly
 * to avoid version compatibility issues. Production implementations should
 * use the full LangGraph StateGraph when API is stable.
 */
export declare abstract class BaseAgent {
    protected name: string;
    protected description: string;
    protected llm: BaseChatModel | null;
    protected tools: StructuredTool[];
    protected config: AgentConfig;
    constructor(name: string, description: string, config?: AgentConfig);
    /**
     * Get the agent's name
     */
    getName(): string;
    /**
     * Get the agent's description
     */
    getDescription(): string;
    /**
     * Initialize the LLM (lazy initialization)
     */
    protected initLLM(): BaseChatModel;
    /**
     * Add a tool to the agent
     */
    addTool(tool: StructuredTool): void;
    /**
     * Get the system prompt for this agent
     */
    protected abstract getSystemPrompt(): string;
    /**
     * Execute the agent's main logic
     */
    protected abstract execute(input: Record<string, any>): Promise<any>;
    /**
     * Create initial state for the agent
     */
    protected createInitialState(input: Record<string, any>): AgentState;
    /**
     * Run the agent with the given input
     */
    run(input: Record<string, any>): Promise<any>;
    /**
     * Get a mock/placeholder graph for compatibility
     * In production, this would return a full LangGraph StateGraph
     */
    getGraph(): {
        invoke: (state: AgentState) => Promise<AgentState>;
    };
}
/**
 * Helper function to create a simple processing node
 */
export declare function createProcessingNode(name: string, processor: (state: AgentState) => Promise<Partial<AgentState>>): (state: AgentState) => Promise<AgentState>;
/**
 * Helper function to create a conditional edge
 */
export declare function createConditionalEdge(condition: (state: AgentState) => string): (state: AgentState) => string;
//# sourceMappingURL=base-agent.d.ts.map