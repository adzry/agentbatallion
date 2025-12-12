/**
 * Base Agent
 *
 * Abstract base class for all LangGraph agents in the Agent Battalion system.
 * Provides common functionality for state management and agent execution.
 */
import { SystemMessage } from '@langchain/core/messages';
import { createDefaultProvider } from '../llm/universal-provider.js';
/**
 * Abstract Base Agent class
 *
 * This is a simplified implementation that doesn't use StateGraph directly
 * to avoid version compatibility issues. Production implementations should
 * use the full LangGraph StateGraph when API is stable.
 */
export class BaseAgent {
    name;
    description;
    llm = null;
    tools;
    config;
    constructor(name, description, config = {}) {
        this.name = name;
        this.description = description;
        this.config = config;
        this.tools = [];
    }
    /**
     * Get the agent's name
     */
    getName() {
        return this.name;
    }
    /**
     * Get the agent's description
     */
    getDescription() {
        return this.description;
    }
    /**
     * Initialize the LLM (lazy initialization)
     */
    initLLM() {
        if (!this.llm) {
            try {
                const provider = createDefaultProvider();
                this.llm = provider.getLLM();
            }
            catch (error) {
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
    addTool(tool) {
        this.tools.push(tool);
    }
    /**
     * Create initial state for the agent
     */
    createInitialState(input) {
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
    async run(input) {
        const startTime = Date.now();
        try {
            const result = await this.execute(input);
            return result;
        }
        catch (error) {
            console.error(`Agent ${this.name} error:`, error);
            throw error;
        }
    }
    /**
     * Get a mock/placeholder graph for compatibility
     * In production, this would return a full LangGraph StateGraph
     */
    getGraph() {
        return {
            invoke: async (state) => {
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
export function createProcessingNode(name, processor) {
    return async (state) => {
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
export function createConditionalEdge(condition) {
    return condition;
}
//# sourceMappingURL=base-agent.js.map