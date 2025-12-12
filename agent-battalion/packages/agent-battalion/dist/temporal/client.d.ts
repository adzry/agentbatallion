/**
 * Temporal Client
 *
 * Manages connection to Temporal server and workflow execution
 */
import { Client } from '@temporalio/client';
import { MissionInput, MissionResult, WorkflowProgress } from './types.js';
/**
 * Initialize Temporal client connection
 */
export declare function initTemporalClient(): Promise<Client>;
/**
 * Get the Temporal client instance
 */
export declare function getTemporalClient(): Client;
/**
 * Start a new mission workflow
 */
export declare function startMission(input: MissionInput): Promise<string>;
/**
 * Get mission result
 */
export declare function getMissionResult(workflowId: string): Promise<MissionResult>;
/**
 * Query mission progress
 */
export declare function getMissionProgress(workflowId: string): Promise<WorkflowProgress>;
/**
 * Cancel a running mission
 */
export declare function cancelMission(workflowId: string): Promise<void>;
/**
 * Signal a mission workflow
 */
export declare function signalMission(workflowId: string, signalName: string, args: any[]): Promise<void>;
/**
 * List running missions
 */
export declare function listRunningMissions(): Promise<string[]>;
/**
 * Close the Temporal connection
 */
export declare function closeTemporalClient(): Promise<void>;
//# sourceMappingURL=client.d.ts.map