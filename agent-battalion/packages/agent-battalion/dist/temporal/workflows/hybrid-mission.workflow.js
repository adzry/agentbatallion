"use strict";
/**
 * Hybrid Mission Workflow
 *
 * Orchestrates the app generation process using Temporal workflows
 * and LangGraph agents for intelligent decision-making.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRequirements = exports.cancelGeneration = exports.getProgress = void 0;
exports.hybridMissionWorkflow = hybridMissionWorkflow;
const workflow_1 = require("@temporalio/workflow");
// Activity proxies
const { analyzeRequirements, planArchitecture, generateCode, reviewCode, runTests } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '5 minutes',
    retry: {
        maximumAttempts: 3,
    },
});
// Query definitions
exports.getProgress = (0, workflow_1.defineQuery)('getProgress');
// Signal definitions
exports.cancelGeneration = (0, workflow_1.defineSignal)('cancelGeneration');
exports.updateRequirements = (0, workflow_1.defineSignal)('updateRequirements');
/**
 * Main mission workflow
 */
async function hybridMissionWorkflow(input) {
    const startTime = Date.now();
    let cancelled = false;
    let currentProgress = {
        missionId: input.missionId,
        phase: 'initializing',
        step: 'Starting mission',
        progress: 0,
        message: 'Initializing Agent Battalion...',
        timestamp: new Date(),
    };
    let files = [];
    // Set up query handler
    (0, workflow_1.setHandler)(exports.getProgress, () => currentProgress);
    // Set up signal handlers
    (0, workflow_1.setHandler)(exports.cancelGeneration, () => {
        cancelled = true;
    });
    (0, workflow_1.setHandler)(exports.updateRequirements, (newPrompt) => {
        input.prompt = newPrompt;
    });
    const updateProgress = (phase, step, progress, message) => {
        currentProgress = {
            missionId: input.missionId,
            phase,
            step,
            progress,
            message,
            timestamp: new Date(),
        };
    };
    try {
        // Check for cancellation
        if (cancelled) {
            return {
                missionId: input.missionId,
                status: 'cancelled',
                files: [],
                duration: Date.now() - startTime,
            };
        }
        // Phase 1: Analyze Requirements
        updateProgress('analyzing', 'requirements', 10, 'Analyzing requirements...');
        const analysis = await analyzeRequirements({
            missionId: input.missionId,
            prompt: input.prompt,
            config: input.config,
        });
        if (cancelled) {
            return {
                missionId: input.missionId,
                status: 'cancelled',
                files: [],
                duration: Date.now() - startTime,
            };
        }
        // Phase 2: Plan Architecture
        updateProgress('planning', 'architecture', 25, 'Planning architecture...');
        const plan = await planArchitecture({
            missionId: input.missionId,
            analysis,
            config: input.config,
        });
        if (cancelled) {
            return {
                missionId: input.missionId,
                status: 'cancelled',
                files: [],
                duration: Date.now() - startTime,
            };
        }
        // Phase 3: Generate Code
        updateProgress('generating', 'code', 50, 'Generating code...');
        files = await generateCode({
            missionId: input.missionId,
            plan,
            projectName: input.projectName,
        });
        if (cancelled) {
            return {
                missionId: input.missionId,
                status: 'cancelled',
                files,
                duration: Date.now() - startTime,
            };
        }
        // Phase 4: Code Review
        updateProgress('reviewing', 'code', 75, 'Reviewing generated code...');
        const reviewResult = await reviewCode({
            missionId: input.missionId,
            files,
        });
        // Apply review fixes if needed
        if (reviewResult.fixes && reviewResult.fixes.length > 0) {
            updateProgress('fixing', 'issues', 85, 'Applying fixes...');
            files = reviewResult.fixedFiles || files;
        }
        if (cancelled) {
            return {
                missionId: input.missionId,
                status: 'cancelled',
                files,
                duration: Date.now() - startTime,
            };
        }
        // Phase 5: Run Tests (if enabled)
        if (input.config?.testing) {
            updateProgress('testing', 'code', 90, 'Running tests...');
            await runTests({
                missionId: input.missionId,
                files,
            });
        }
        // Complete
        updateProgress('complete', 'done', 100, 'Mission complete!');
        return {
            missionId: input.missionId,
            status: 'completed',
            files,
            downloadUrl: `/api/download/${input.missionId}`,
            duration: Date.now() - startTime,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateProgress('error', 'failed', currentProgress.progress, errorMessage);
        return {
            missionId: input.missionId,
            status: 'failed',
            files,
            duration: Date.now() - startTime,
            error: errorMessage,
        };
    }
}
//# sourceMappingURL=hybrid-mission.workflow.js.map