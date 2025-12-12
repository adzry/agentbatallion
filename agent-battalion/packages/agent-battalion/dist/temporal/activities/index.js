/**
 * Temporal Activities
 *
 * Activities are the building blocks of workflows. They contain the
 * actual business logic that can fail, retry, and be traced.
 */
import { runAnalyzerAgent } from '../../langgraph/agents/analyzer-agent.js';
import { runPlannerAgent } from '../../langgraph/agents/planner-agent.js';
import { runCoordinatorAgent } from '../../langgraph/agents/coordinator-agent.js';
/**
 * Analyze requirements using the Analyzer Agent
 */
export async function analyzeRequirements(input) {
    console.log(`[Activity] Analyzing requirements for mission: ${input.missionId}`);
    try {
        const result = await runAnalyzerAgent(input.prompt, input.config);
        return result;
    }
    catch (error) {
        console.error('Analysis failed:', error);
        throw error;
    }
}
/**
 * Plan architecture using the Planner Agent
 */
export async function planArchitecture(input) {
    console.log(`[Activity] Planning architecture for mission: ${input.missionId}`);
    try {
        const result = await runPlannerAgent(input.analysis, input.config);
        return result;
    }
    catch (error) {
        console.error('Planning failed:', error);
        throw error;
    }
}
/**
 * Generate code using the Coordinator Agent
 */
export async function generateCode(input) {
    console.log(`[Activity] Generating code for mission: ${input.missionId}`);
    try {
        const result = await runCoordinatorAgent(input.plan, input.projectName);
        return result;
    }
    catch (error) {
        console.error('Code generation failed:', error);
        throw error;
    }
}
/**
 * Review generated code
 */
export async function reviewCode(input) {
    console.log(`[Activity] Reviewing code for mission: ${input.missionId}`);
    // Simple validation for now
    const issues = [];
    for (const file of input.files) {
        // Check for empty files
        if (!file.content || file.content.trim().length === 0) {
            issues.push(`Empty file: ${file.path}`);
        }
        // Check for common issues in TypeScript/JavaScript files
        if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
            if (file.content.includes('any[]') || file.content.includes(': any')) {
                // This is acceptable for generated code
            }
            // Check for console.log statements
            if (file.content.includes('console.log')) {
                issues.push(`Console.log found in: ${file.path}`);
            }
        }
    }
    return {
        passed: issues.length === 0,
        issues,
    };
}
/**
 * Run tests on generated code
 */
export async function runTests(input) {
    console.log(`[Activity] Running tests for mission: ${input.missionId}`);
    // Mock test results for now
    return {
        passed: true,
        tests: 0,
        failures: 0,
        coverage: undefined,
    };
}
/**
 * Install dependencies in sandbox
 */
export async function installDependencies(sandboxId, packageJson) {
    console.log(`[Activity] Installing dependencies in sandbox: ${sandboxId}`);
    // Implementation would use E2B sandbox
}
/**
 * Start preview server
 */
export async function startPreview(sandboxId, port) {
    console.log(`[Activity] Starting preview server in sandbox: ${sandboxId}`);
    // Implementation would use E2B sandbox
    return `https://${sandboxId}.sandbox.e2b.dev:${port}`;
}
//# sourceMappingURL=index.js.map