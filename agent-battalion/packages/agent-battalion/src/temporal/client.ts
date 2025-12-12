/**
 * Temporal Client
 * 
 * Manages connection to Temporal server and workflow execution
 */

import { Client, Connection } from '@temporalio/client';
import { MissionInput, MissionResult, WorkflowProgress } from './types.js';

let client: Client | null = null;

/**
 * Initialize Temporal client connection
 */
export async function initTemporalClient(): Promise<Client> {
  if (client) return client;

  const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  
  const connection = await Connection.connect({
    address,
  });

  client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  });

  console.log(`Connected to Temporal at ${address}`);
  return client;
}

/**
 * Get the Temporal client instance
 */
export function getTemporalClient(): Client {
  if (!client) {
    throw new Error('Temporal client not initialized. Call initTemporalClient() first.');
  }
  return client;
}

/**
 * Start a new mission workflow
 */
export async function startMission(input: MissionInput): Promise<string> {
  const client = getTemporalClient();
  const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'agent-battalion-queue';

  const handle = await client.workflow.start('hybridMissionWorkflow', {
    taskQueue,
    workflowId: input.missionId,
    args: [input],
  });

  console.log(`Started mission workflow: ${handle.workflowId}`);
  return handle.workflowId;
}

/**
 * Get mission result
 */
export async function getMissionResult(workflowId: string): Promise<MissionResult> {
  const client = getTemporalClient();
  const handle = client.workflow.getHandle(workflowId);
  return await handle.result();
}

/**
 * Query mission progress
 */
export async function getMissionProgress(workflowId: string): Promise<WorkflowProgress> {
  const client = getTemporalClient();
  const handle = client.workflow.getHandle(workflowId);
  return await handle.query('getProgress');
}

/**
 * Cancel a running mission
 */
export async function cancelMission(workflowId: string): Promise<void> {
  const client = getTemporalClient();
  const handle = client.workflow.getHandle(workflowId);
  await handle.cancel();
  console.log(`Cancelled mission workflow: ${workflowId}`);
}

/**
 * Signal a mission workflow
 */
export async function signalMission(
  workflowId: string,
  signalName: string,
  args: any[]
): Promise<void> {
  const client = getTemporalClient();
  const handle = client.workflow.getHandle(workflowId);
  await handle.signal(signalName, ...args);
}

/**
 * List running missions
 */
export async function listRunningMissions(): Promise<string[]> {
  const client = getTemporalClient();
  const workflows = client.workflow.list({
    query: "ExecutionStatus = 'Running'",
  });

  const ids: string[] = [];
  for await (const workflow of workflows) {
    ids.push(workflow.workflowId);
  }
  return ids;
}

/**
 * Close the Temporal connection
 */
export async function closeTemporalClient(): Promise<void> {
  if (client) {
    await client.connection.close();
    client = null;
    console.log('Temporal client closed');
  }
}
