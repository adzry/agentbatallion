/**
 * Base Agent
 * 
 * Abstract base class for all LangGraph agents in the Agent Battalion system.
 * Provides common functionality for state management and agent execution.
 */

import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StructuredTool } from '@langchain/core/tools';
import { AgentState, AgentConfig, AgentMetadata } from './types.js';
import { createDefaultProvider } from '../llm/universal-provider.js';

export { AgentState };

/**
 * Abstract Base Agent class
 * 
 * This is a simplified implementation that doesn't use StateGraph directly
 * to avoid version compatibility issues. Production implementations should
 * use the full LangGraph StateGraph when API is stable.
 */
export abstract class BaseAgent {
  protected name: string;
  protected description: string;
  protected llm: BaseChatModel | null = null;
  protected tools: StructuredTool[];
  protected config: AgentConfig;

  constructor(
    name: string,
    description: string,
    config: AgentConfig = {}
  ) {
    this.name = name;
    this.description = description;
    this.config = config;
    this.tools = [];
  }

  /**
   * Get the agent's name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get the agent's description
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Initialize the LLM (lazy initialization)
   */
  protected initLLM(): BaseChatModel {
    if (!this.llm) {
      try {
        const provider = createDefaultProvider();
        this.llm = provider.getLLM();
      } catch (error) {
        // If LLM initialization fails (no API keys), continue without it
        console.warn('LLM initialization failed, using mock mode');
        throw error;
      }
    }
    return this.llm;
  }

  /**
   * Add a tool to the agent
   */
  addTool(tool: StructuredTool): void {
    this.tools.push(tool);
  }

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
  protected createInitialState(input: Record<string, any>): AgentState {
    return {
      messages: [new SystemMessage(this.getSystemPrompt())],
      input,
      output: null,
      metadata: {
        startTime: new Date(),
        steps: 0,
      },
    };
  }

  /**
   * Run the agent with the given input
   */
  async run(input: Record<string, any>): Promise<any> {
    const startTime = Date.now();
    
    try {
      const result = await this.execute(input);
      return result;
    } catch (error) {
      console.error(`Agent ${this.name} error:`, error);
      throw error;
    }
  }

  /**
   * Get a mock/placeholder graph for compatibility
   * In production, this would return a full LangGraph StateGraph
   */
  getGraph(): { invoke: (state: AgentState) => Promise<AgentState> } {
    return {
      invoke: async (state: AgentState) => {
        const result = await this.execute(state.input);
        return {
          ...state,
          output: result,
          metadata: {
            ...state.metadata,
            endTime: new Date(),
          },
        };
      },
    };
  }
}

/**
 * Helper function to create a simple processing node
 */
export function createProcessingNode(
  name: string,
  processor: (state: AgentState) => Promise<Partial<AgentState>>
) {
  return async (state: AgentState): Promise<AgentState> => {
    const updates = await processor(state);
    return {
      ...state,
      ...updates,
      currentStep: name,
    };
  };
}

/**
 * Helper function to create a conditional edge
 */
export function createConditionalEdge(
  condition: (state: AgentState) => string
): (state: AgentState) => string {
  return condition;
}
