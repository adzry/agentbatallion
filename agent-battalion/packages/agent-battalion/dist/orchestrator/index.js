"use strict";
/**
 * Orchestrator
 *
 * High-level API for the Agent Battalion system.
 * Provides a simple interface for generating applications.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
exports.createOrchestrator = createOrchestrator;
exports.quickGenerate = quickGenerate;
const uuid_1 = require("uuid");
const analyzer_agent_js_1 = require("../langgraph/agents/analyzer-agent.js");
const planner_agent_js_1 = require("../langgraph/agents/planner-agent.js");
const coordinator_agent_js_1 = require("../langgraph/agents/coordinator-agent.js");
/**
 * Main Orchestrator class
 */
class Orchestrator {
    useTemporalWorkflows;
    constructor(options = {}) {
        this.useTemporalWorkflows = options.useTemporalWorkflows || false;
    }
    /**
     * Generate an application from a prompt
     */
    async generate(prompt, options = {}) {
        const missionId = (0, uuid_1.v4)();
        const startTime = Date.now();
        const { onProgress } = options;
        try {
            // Create config from options
            const config = {
                framework: options.framework || 'nextjs',
                styling: options.styling || 'tailwind',
                typescript: options.typescript !== false,
                testing: options.testing || false,
                features: options.features || [],
            };
            const projectName = options.projectName || this.extractProjectName(prompt);
            // Phase 1: Analyze
            onProgress?.({ phase: 'analyzing', message: 'Analyzing requirements...', progress: 10 });
            const analysis = await (0, analyzer_agent_js_1.runAnalyzerAgent)(prompt, config);
            // Phase 2: Plan
            onProgress?.({ phase: 'planning', message: 'Planning architecture...', progress: 30 });
            const plan = await (0, planner_agent_js_1.runPlannerAgent)(analysis, config);
            // Phase 3: Generate
            onProgress?.({ phase: 'generating', message: 'Generating code...', progress: 50 });
            const files = await (0, coordinator_agent_js_1.runCoordinatorAgent)(plan, projectName);
            // Complete
            onProgress?.({ phase: 'complete', message: 'Generation complete!', progress: 100 });
            return {
                missionId,
                success: true,
                files,
                duration: Date.now() - startTime,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            onProgress?.({ phase: 'error', message: errorMessage, progress: 0 });
            return {
                missionId,
                success: false,
                files: [],
                error: errorMessage,
                duration: Date.now() - startTime,
            };
        }
    }
    /**
     * Generate using Temporal workflows (for production use)
     */
    async generateWithWorkflow(prompt, options = {}) {
        // This would start a Temporal workflow and return the workflow ID
        // For now, just throw an error indicating this requires Temporal
        throw new Error('Temporal workflows not configured. Use generate() instead.');
    }
    /**
     * Extract a project name from the prompt
     */
    extractProjectName(prompt) {
        const patterns = [
            /(?:build|create|make|generate)\s+(?:a|an|the)?\s*(.+?)\s*(?:app|application|website|site)/i,
            /(.+?)\s*(?:app|application|website|site)/i,
        ];
        for (const pattern of patterns) {
            const match = prompt.match(pattern);
            if (match && match[1]) {
                return match[1]
                    .trim()
                    .split(' ')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(' ');
            }
        }
        return 'My App';
    }
}
exports.Orchestrator = Orchestrator;
/**
 * Create a new orchestrator instance
 */
function createOrchestrator(options) {
    return new Orchestrator(options);
}
/**
 * Quick generate function for simple use cases
 */
async function quickGenerate(prompt, options) {
    const orchestrator = new Orchestrator();
    return orchestrator.generate(prompt, options);
}
//# sourceMappingURL=index.js.map