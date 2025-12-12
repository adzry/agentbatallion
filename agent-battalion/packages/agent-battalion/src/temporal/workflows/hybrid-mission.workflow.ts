/**
 * Hybrid Mission Workflow
 * 
 * Orchestrates the app generation process using Temporal workflows
 * and LangGraph agents for intelligent decision-making.
 */

import {
  proxyActivities,
  defineQuery,
  defineSignal,
  setHandler,
  condition,
  sleep,
} from '@temporalio/workflow';
import type { MissionInput, MissionResult, WorkflowProgress, GeneratedFile } from '../types.js';

// Activity proxies
const { analyzeRequirements, planArchitecture, generateCode, reviewCode, runTests } =
  proxyActivities<typeof import('../activities/index.js')>({
    startToCloseTimeout: '5 minutes',
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
