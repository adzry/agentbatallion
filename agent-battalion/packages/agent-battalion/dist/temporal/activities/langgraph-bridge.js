"use strict";
/**
 * LangGraph Bridge
 *
 * Provides integration between Temporal activities and LangGraph agents.
 * This bridge allows Temporal workflows to invoke LangGraph agents while
 * maintaining proper error handling and observability.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangGraphBridge = void 0;
exports.createAnalyzerBridge = createAnalyzerBridge;
exports.createPlannerBridge = createPlannerBridge;
exports.createCoordinatorBridge = createCoordinatorBridge;
exports.invokeLangGraphAgent = invokeLangGraphAgent;
const analyzer_agent_js_1 = require("../../langgraph/agents/analyzer-agent.js");
const planner_agent_js_1 = require("../../langgraph/agents/planner-agent.js");
const coordinator_agent_js_1 = require("../../langgraph/agents/coordinator-agent.js");
/**
 * LangGraph Agent Bridge
 *
 * Wraps LangGraph agent execution with Temporal-friendly error handling
 */
class LangGraphBridge {
    config;
    constructor(config = {}) {
        this.config = {
            timeout: config.timeout || 60000,
            maxRetries: config.maxRetries || 3,
            enableTracing: config.enableTracing || false,
        };
    }
    /**
     * Run an agent and return results
     */
    async runAgent(agent, input) {
        const startTime = Date.now();
        let steps = 0;
        try {
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
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
                data: result,
                duration: Date.now() - startTime,
                steps,
            };
        }
        catch (error) {
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
exports.LangGraphBridge = LangGraphBridge;
/**
 * Create a bridge for the analyzer agent
 */
function createAnalyzerBridge(config) {
    return new LangGraphBridge(config);
}
/**
 * Create a bridge for the planner agent
 */
function createPlannerBridge(config) {
    return new LangGraphBridge(config);
}
/**
 * Create a bridge for the coordinator agent
 */
function createCoordinatorBridge(config) {
    return new LangGraphBridge(config);
}
/**
 * Utility function to safely invoke any LangGraph agent from a Temporal activity
 */
async function invokeLangGraphAgent(agentType, input, config) {
    const bridge = new LangGraphBridge(config);
    let agent;
    switch (agentType) {
        case 'analyzer':
            agent = new analyzer_agent_js_1.AnalyzerAgent();
            break;
        case 'planner':
            agent = new planner_agent_js_1.PlannerAgent();
            break;
        case 'coordinator':
            agent = new coordinator_agent_js_1.CoordinatorAgent();
            break;
        default:
            throw new Error(`Unknown agent type: ${agentType}`);
    }
    const result = await bridge.runAgent(agent, input);
    if (!result.success) {
        throw new Error(result.error);
    }
    return result.data;
}
//# sourceMappingURL=langgraph-bridge.js.map