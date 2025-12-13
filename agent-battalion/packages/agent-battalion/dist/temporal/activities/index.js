/**
 * Temporal Activities
 *
 * Activities are the building blocks of workflows. They contain the
 * actual business logic that can fail, retry, and be traced.
 *
 * These activities use the TeamOrchestrator for AI-powered generation.
 */
import { createTeamOrchestrator } from '../../agents/team-orchestrator.js';
/**
 * Generate application using TeamOrchestrator
 */
export async function generateApplication(input) {
    console.log(`[Activity] Generating application for mission: ${input.missionId}`);
    try {
        const orchestrator = createTeamOrchestrator({
            projectName: input.projectName,
        });
        const result = await orchestrator.run(input.prompt);
        return {
            success: result.success,
            files: result.files.map(f => ({
                path: f.path,
                content: f.content,
                type: f.type,
            })),
            qaScore: result.qaReport?.score || 0,
            duration: result.duration,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Generation failed:', message);
        return {
            success: false,
            files: [],
            qaScore: 0,
            duration: 0,
            error: message,
        };
    }
}
/**
 * Review generated code
 */
export async function reviewCode(input) {
    console.log(`[Activity] Reviewing code for mission: ${input.missionId}`);
    const issues = [];
    for (const file of input.files) {
        // Check for empty files
        if (!file.content || file.content.trim().length === 0) {
            issues.push(`Empty file: ${file.path}`);
        }
        // Check for common issues in TypeScript/JavaScript files
        if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
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
 * Run tests on generated code (placeholder)
 */
export async function runTests(input) {
    console.log(`[Activity] Running tests for mission: ${input.missionId}`);
    // Mock test results - in production, this would run actual tests
    return {
        passed: true,
        tests: 0,
        failures: 0,
        coverage: undefined,
    };
}
/**
 * Install dependencies in sandbox (placeholder)
 */
export async function installDependencies(sandboxId, packageJson) {
    console.log(`[Activity] Installing dependencies in sandbox: ${sandboxId}`);
    // Implementation would use E2B sandbox
}
/**
 * Start preview server (placeholder)
 */
export async function startPreview(sandboxId, port) {
    console.log(`[Activity] Starting preview server in sandbox: ${sandboxId}`);
    // Implementation would use E2B sandbox
    return `https://${sandboxId}.sandbox.e2b.dev:${port}`;
}
//# sourceMappingURL=index.js.map