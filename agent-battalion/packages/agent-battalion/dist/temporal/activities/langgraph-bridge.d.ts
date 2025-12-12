/**
 * LangGraph Bridge
 *
 * Provides integration between Temporal activities and LangGraph agents.
 * This bridge allows Temporal workflows to invoke LangGraph agents while
 * maintaining proper error handling and observability.
 */
import { BaseAgent } from '../../langgraph/base-agent.js';
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
export declare class LangGraphBridge {
    private config;
    constructor(config?: BridgeConfig);
    /**
     * Run an agent and return results
     */
    runAgent<T>(agent: BaseAgent, input: Record<string, unknown>): Promise<BridgeResult<T>>;
}
/**
 * Create a bridge for the analyzer agent
 */
export declare function createAnalyzerBridge(config?: BridgeConfig): LangGraphBridge;
/**
 * Create a bridge for the planner agent
 */
export declare function createPlannerBridge(config?: BridgeConfig): LangGraphBridge;
/**
 * Create a bridge for the coordinator agent
 */
export declare function createCoordinatorBridge(config?: BridgeConfig): LangGraphBridge;
/**
 * Utility function to safely invoke any LangGraph agent from a Temporal activity
 */
export declare function invokeLangGraphAgent<T>(agentType: 'analyzer' | 'planner' | 'coordinator', input: Record<string, unknown>, config?: BridgeConfig): Promise<T>;
//# sourceMappingURL=langgraph-bridge.d.ts.map