/**
 * Temporal Worker
 * 
 * Runs workflows and activities for the Agent Battalion system
 */

import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities/index.js';
import path from 'path';
import 'dotenv/config';

// Get the directory of the current module
const workflowsPath = path.resolve(__dirname, './workflows/hybrid-mission.workflow.js');

async function run(): Promise<void> {
  const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'agent-battalion-queue';

  console.log(`Connecting to Temporal at ${address}...`);

  const connection = await NativeConnection.connect({
    address,
  });

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    taskQueue,
    workflowsPath,
    activities,
  });

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🤖 Agent Battalion Worker                               ║
  ║                                                           ║
  ║   Task Queue:  ${taskQueue.padEnd(36)}║
  ║   Temporal:    ${address.padEnd(36)}║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);

  await worker.run();
}

run().catch((err) => {
  console.error('Worker error:', err);
  process.exit(1);
});
