/**
 * LangGraph Bridge
 * 
 * Provides integration between Temporal activities and LangGraph agents.
 * This bridge allows Temporal workflows to invoke LangGraph agents while
 * maintaining proper error handling and observability.
 */

import { BaseAgent, AgentState } from '../../langgraph/base-agent.js';
import { AnalyzerAgent } from '../../langgraph/agents/analyzer-agent.js';
import { PlannerAgent } from '../../langgraph/agents/planner-agent.js';
import { CoordinatorAgent } from '../../langgraph/agents/coordinator-agent.js';

export interface BridgeConfig {
  timeout?: number;
  maxRetries?: number;
  enableTracing?: boolean;
}

export interface BridgeResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
  steps: number;
}

/**
 * LangGraph Agent Bridge
 * 
 * Wraps LangGraph agent execution with Temporal-friendly error handling
 */
export class LangGraphBridge {
  private config: BridgeConfig;

  constructor(config: BridgeConfig = {}) {
    this.config = {
      timeout: config.timeout || 60000,
      maxRetries: config.maxRetries || 3,
      enableTracing: config.enableTracing || false,
    };
  }

  /**
   * Run an agent and return results
   */
  async runAgent<T>(
    agent: BaseAgent,
    input: Record<string, unknown>
  ): Promise<BridgeResult<T>> {
    const startTime = Date.now();
    let steps = 0;

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Agent execution timed out after ${this.config.timeout}ms`));
        }, this.config.timeout);
      });

      // Run agent with timeout
      const result = await Promise.race([
        agent.run(input),
        timeoutPromise,
      ]);

      steps = 1; // Simplified step counting

      return {
        success: true,
        data: result as T,
        duration: Date.now() - startTime,
        steps,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        error: message,
        duration: Date.now() - startTime,
        steps,
      };
    }
  }
}

/**
 * Create a bridge for the analyzer agent
 */
export function createAnalyzerBridge(config?: BridgeConfig): LangGraphBridge {
  return new LangGraphBridge(config);
}

/**
 * Create a bridge for the planner agent
 */
export function createPlannerBridge(config?: BridgeConfig): LangGraphBridge {
  return new LangGraphBridge(config);
}

/**
 * Create a bridge for the coordinator agent
 */
export function createCoordinatorBridge(config?: BridgeConfig): LangGraphBridge {
  return new LangGraphBridge(config);
}

/**
 * Utility function to safely invoke any LangGraph agent from a Temporal activity
 */
export async function invokeLangGraphAgent<T>(
  agentType: 'analyzer' | 'planner' | 'coordinator',
  input: Record<string, unknown>,
  config?: BridgeConfig
): Promise<T> {
  const bridge = new LangGraphBridge(config);
  
  let agent: BaseAgent;
  
  switch (agentType) {
    case 'analyzer':
      agent = new AnalyzerAgent();
      break;
    case 'planner':
      agent = new PlannerAgent();
      break;
    case 'coordinator':
      agent = new CoordinatorAgent();
      break;
    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }

  const result = await bridge.runAgent<T>(agent, input);
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data!;
}
