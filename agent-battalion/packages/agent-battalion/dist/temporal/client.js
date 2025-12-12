"use strict";
/**
 * Temporal Client
 *
 * Manages connection to Temporal server and workflow execution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTemporalClient = initTemporalClient;
exports.getTemporalClient = getTemporalClient;
exports.startMission = startMission;
exports.getMissionResult = getMissionResult;
exports.getMissionProgress = getMissionProgress;
exports.cancelMission = cancelMission;
exports.signalMission = signalMission;
exports.listRunningMissions = listRunningMissions;
exports.closeTemporalClient = closeTemporalClient;
const client_1 = require("@temporalio/client");
let client = null;
/**
 * Initialize Temporal client connection
 */
async function initTemporalClient() {
    if (client)
        return client;
    const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
    const connection = await client_1.Connection.connect({
        address,
    });
    client = new client_1.Client({
        connection,
        namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    });
    console.log(`Connected to Temporal at ${address}`);
    return client;
}
/**
 * Get the Temporal client instance
 */
function getTemporalClient() {
    if (!client) {
        throw new Error('Temporal client not initialized. Call initTemporalClient() first.');
    }
    return client;
}
/**
 * Start a new mission workflow
 */
async function startMission(input) {
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
async function getMissionResult(workflowId) {
    const client = getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);
    return await handle.result();
}
/**
 * Query mission progress
 */
async function getMissionProgress(workflowId) {
    const client = getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);
    return await handle.query('getProgress');
}
/**
 * Cancel a running mission
 */
async function cancelMission(workflowId) {
    const client = getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);
    await handle.cancel();
    console.log(`Cancelled mission workflow: ${workflowId}`);
}
/**
 * Signal a mission workflow
 */
async function signalMission(workflowId, signalName, args) {
    const client = getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);
    await handle.signal(signalName, ...args);
}
/**
 * List running missions
 */
async function listRunningMissions() {
    const client = getTemporalClient();
    const workflows = client.workflow.list({
        query: "ExecutionStatus = 'Running'",
    });
    const ids = [];
    for await (const workflow of workflows) {
        ids.push(workflow.workflowId);
    }
    return ids;
}
/**
 * Close the Temporal connection
 */
async function closeTemporalClient() {
    if (client) {
        await client.connection.close();
        client = null;
        console.log('Temporal client closed');
    }
}
//# sourceMappingURL=client.js.map