/**
 * Generation Workflow - Temporal Workflow Definition
 *
 * Orchestrates the full app generation process with:
 * - Durable execution
 * - Automatic retries
 * - Human feedback integration
 * - Checkpointing
 */
import { proxyActivities, sleep, defineSignal, setHandler, condition } from '@temporalio/workflow';
// Proxy activities with retry configuration
const acts = proxyActivities({
    startToCloseTimeout: '5 minutes',
    retry: {
        maximumAttempts: 3,
        initialInterval: '1s',
        backoffCoefficient: 2,
    },
});
// Signals
export const feedbackSignal = defineSignal('feedback');
export const cancelSignal = defineSignal('cancel');
/**
 * Main Generation Workflow
 */
export async function generationWorkflow(input) {
    const startTime = Date.now();
    const maxIterations = input.config?.maxIterations || 3;
    let files = [];
    let iteration = 0;
    let cancelled = false;
    let awaitingFeedback = false;
    let feedbackResponse = null;
    // Set up signal handlers
    setHandler(feedbackSignal, (response) => {
        feedbackResponse = response;
        awaitingFeedback = false;
    });
    setHandler(cancelSignal, () => {
        cancelled = true;
    });
    try {
        // Phase 1: Requirements Analysis
        const requirementsResult = await acts.analyzeRequirements(input.projectId, input.userRequest);
        if (cancelled)
            throw new Error('Workflow cancelled');
        // Optional: Request approval for requirements
        if (input.config?.requireApproval) {
            awaitingFeedback = true;
            await acts.requestFeedback(input.projectId, {
                type: 'approval',
                title: 'Requirements Review',
                content: JSON.stringify(requirementsResult.requirements, null, 2),
                agentId: 'product-manager',
            });
            // Wait for feedback signal
            await condition(() => !awaitingFeedback || cancelled, '10m');
            const response = feedbackResponse;
            if (response?.approved === false) {
                throw new Error('Requirements rejected by user');
            }
        }
        // Phase 2: Architecture Design
        const archResult = await acts.designArchitecture(input.projectId, requirementsResult.requirements, requirementsResult.context);
        if (cancelled)
            throw new Error('Workflow cancelled');
        // Phase 3: Design System
        const designResult = await acts.createDesignSystem(input.projectId, requirementsResult.requirements, requirementsResult.context);
        files.push(...designResult.files);
        if (cancelled)
            throw new Error('Workflow cancelled');
        // Phase 4: Code Generation Loop
        do {
            iteration++;
            // Generate frontend code
            const frontendFiles = await acts.generateFrontend(input.projectId, archResult.architecture, designResult.designSystem);
            // Merge files (replace existing)
            for (const file of frontendFiles) {
                const existingIndex = files.findIndex(f => f.path === file.path);
                if (existingIndex >= 0) {
                    files[existingIndex] = file;
                }
                else {
                    files.push(file);
                }
            }
            if (cancelled)
                throw new Error('Workflow cancelled');
            // Phase 5: QA Review
            const qaReport = await acts.reviewCode(input.projectId, files, requirementsResult.requirements);
            // Check if quality is acceptable
            if (qaReport.score >= 85 || iteration >= maxIterations) {
                break;
            }
            // Brief pause between iterations
            await sleep('1s');
        } while (iteration < maxIterations);
        // Final phase
        const duration = Date.now() - startTime;
        const totalLines = files.reduce((sum, f) => sum + f.content.split('\n').length, 0);
        return {
            projectId: input.projectId,
            success: true,
            files,
            stats: {
                totalFiles: files.length,
                totalLines,
                duration,
                iterations: iteration,
            },
        };
    }
    catch (error) {
        return {
            projectId: input.projectId,
            success: false,
            files,
            stats: {
                totalFiles: files.length,
                totalLines: files.reduce((sum, f) => sum + f.content.split('\n').length, 0),
                duration: Date.now() - startTime,
                iterations: iteration,
            },
            errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
    }
}
//# sourceMappingURL=generation-workflow.js.map