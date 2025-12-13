/**
 * Hybrid Mission Workflow
 *
 * Orchestrates the app generation process using Temporal workflows.
 * Uses the TeamOrchestrator for intelligent multi-agent collaboration.
 */
import type { MissionInput, MissionResult, WorkflowProgress } from '../types.js';
export declare const getProgress: import("@temporalio/workflow").QueryDefinition<WorkflowProgress, [], string>;
export declare const cancelGeneration: import("@temporalio/workflow").SignalDefinition<[], "cancelGeneration">;
export declare const updateRequirements: import("@temporalio/workflow").SignalDefinition<[string], string>;
/**
 * Main mission workflow
 */
export declare function hybridMissionWorkflow(input: MissionInput): Promise<MissionResult>;
//# sourceMappingURL=hybrid-mission.workflow.d.ts.map