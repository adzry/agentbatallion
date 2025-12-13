/**
 * Hybrid Mission Workflow
 * 
 * Orchestrates the app generation process using Temporal workflows.
 * Uses the TeamOrchestrator for intelligent multi-agent collaboration.
 */

import {
  proxyActivities,
  defineQuery,
  defineSignal,
  setHandler,
} from '@temporalio/workflow';
import type { MissionInput, MissionResult, WorkflowProgress, GeneratedFile } from '../types.js';

// Activity proxies
const { generateApplication, reviewCode, runTests } =
  proxyActivities<typeof import('../activities/index.js')>({
    startToCloseTimeout: '10 minutes',
    retry: {
      maximumAttempts: 3,
    },
  });

// Query definitions
export const getProgress = defineQuery<WorkflowProgress>('getProgress');

// Signal definitions
export const cancelGeneration = defineSignal('cancelGeneration');
export const updateRequirements = defineSignal<[string]>('updateRequirements');

/**
 * Main mission workflow
 */
export async function hybridMissionWorkflow(input: MissionInput): Promise<MissionResult> {
  const startTime = Date.now();
  let cancelled = false;
  let currentProgress: WorkflowProgress = {
    missionId: input.missionId,
    phase: 'initializing',
    step: 'Starting mission',
    progress: 0,
    message: 'Initializing Agent Battalion...',
    timestamp: new Date(),
  };
  let files: GeneratedFile[] = [];

  // Set up query handler
  setHandler(getProgress, () => currentProgress);

  // Set up signal handlers
  setHandler(cancelGeneration, () => {
    cancelled = true;
  });

  setHandler(updateRequirements, (newPrompt: string) => {
    input.prompt = newPrompt;
  });

  const updateProgress = (
    phase: string,
    step: string,
    progress: number,
    message: string
  ) => {
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

    // Phase 1: Generate Application using TeamOrchestrator
    updateProgress('generating', 'code', 20, 'Generating application with AI agents...');
    
    const result = await generateApplication({
      missionId: input.missionId,
      prompt: input.prompt,
      projectName: input.projectName,
      config: input.config,
    });

    if (!result.success) {
      throw new Error(result.error || 'Generation failed');
    }

    files = result.files;
    updateProgress('generating', 'code', 60, `Generated ${files.length} files`);

    if (cancelled) {
      return {
        missionId: input.missionId,
        status: 'cancelled',
        files,
        duration: Date.now() - startTime,
      };
    }

    // Phase 2: Additional Code Review
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

    // Phase 3: Run Tests (if enabled)
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
  } catch (error) {
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
