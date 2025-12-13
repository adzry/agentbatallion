/**
 * Hybrid Mission Workflow
 *
 * Orchestrates the app generation process using Temporal workflows.
 * Uses the TeamOrchestrator for intelligent multi-agent collaboration.
 */
import type { MissionInput, MissionResult } from '../types.js';
export declare const getProgress: any;
export declare const cancelGeneration: any;
export declare const updateRequirements: any;
/**
 * Main mission workflow
 */
export declare function hybridMissionWorkflow(input: MissionInput): Promise<MissionResult>;
//# sourceMappingURL=hybrid-mission.workflow.d.ts.map