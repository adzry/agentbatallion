"use strict";
/**
 * Base Team Agent - MGX-style Agent Foundation
 *
 * Provides the foundation for all specialized team agents with
 * communication, memory, and tool capabilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTeamAgent = void 0;
const uuid_1 = require("uuid");
const events_1 = require("events");
class BaseTeamAgent extends events_1.EventEmitter {
    profile;
    state;
    memory;
    tools;
    messageBus;
    projectContext = null;
    constructor(profile, memory, tools, messageBus) {
        super();
        this.profile = profile;
        this.memory = memory;
        this.tools = tools;
        this.messageBus = messageBus;
        this.state = {
            agentId: profile.id,
            status: 'idle',
            progress: 0,
            thoughts: [],
            actions: [],
            artifacts: [],
        };
        // Subscribe to messages directed to this agent
        this.messageBus.subscribe(this.profile.id, this.handleMessage.bind(this));
    }
    // Get agent profile
    getProfile() {
        return this.profile;
    }
    // Get current state
    getState() {
        return { ...this.state };
    }
    // Set project context
    setProjectContext(context) {
        this.projectContext = context;
        this.memory.setContext('project', context);
    }
    // Handle incoming message
    async handleMessage(message) {
        if (message.type === 'handoff') {
            await this.handleHandoff(message.data);
        }
        else if (message.type === 'task') {
            await this.handleTask(message.data);
        }
        else if (message.type === 'feedback') {
            await this.handleFeedback(message.data);
        }
    }
    // Handle task assignment
    async handleTask(task) {
        this.updateStatus('working');
        this.state.currentTask = task.title;
        this.emitEvent('task_started', { task });
        try {
            const result = await this.executeTask(task);
            this.emitEvent('task_complete', { task, result });
        }
        catch (error) {
            this.updateStatus('error');
            this.emitEvent('agent_error', { task, error });
        }
    }
    // Handle handoff from another agent
    async handleHandoff(handoff) {
        this.think(`Received handoff from ${handoff.fromAgent}: ${handoff.message}`);
        // Store handoff context in memory
        await this.memory.store('handoff', handoff.id, handoff);
        // Acknowledge handoff
        this.messageBus.send(handoff.fromAgent, {
            type: 'handoff_ack',
            data: { handoffId: handoff.id, acknowledged: true },
        });
        // Process the task
        await this.handleTask(handoff.task);
    }
    // Handle feedback
    async handleFeedback(feedback) {
        this.think(`Received feedback: ${feedback.message}`);
        await this.memory.store('feedback', feedback.id, feedback);
    }
    // Record a thought
    think(thought) {
        this.state.thoughts.push(thought);
        this.emitEvent('agent_thinking', { thought });
    }
    // Create an action
    async act(type, description, executor) {
        const action = {
            id: (0, uuid_1.v4)(),
            type,
            description,
            status: 'running',
            startTime: new Date(),
        };
        this.state.actions.push(action);
        this.emitEvent('agent_working', { action });
        try {
            const result = await executor();
            action.status = 'complete';
            action.output = result;
            action.endTime = new Date();
            return result;
        }
        catch (error) {
            action.status = 'failed';
            action.error = error instanceof Error ? error.message : 'Unknown error';
            action.endTime = new Date();
            throw error;
        }
    }
    // Create an artifact
    createArtifact(type, name, content, path, metadata) {
        const artifact = {
            id: (0, uuid_1.v4)(),
            type,
            name,
            path,
            content,
            createdBy: this.profile.id,
            createdAt: new Date(),
            version: 1,
            metadata,
        };
        this.state.artifacts.push(artifact);
        this.emitEvent('artifact_created', { artifact });
        // Store in memory
        this.memory.store('artifact', artifact.id, artifact);
        return artifact;
    }
    // Handoff to another agent
    async handoff(toAgentId, task, context) {
        const handoff = {
            id: (0, uuid_1.v4)(),
            fromAgent: this.profile.id,
            toAgent: toAgentId,
            task,
            context,
            message: `${this.profile.name} handing off "${task.title}" to next agent`,
            timestamp: new Date(),
            acknowledged: false,
        };
        this.think(`Handing off to ${toAgentId}: ${task.title}`);
        this.emitEvent('handoff', { handoff });
        this.messageBus.send(toAgentId, {
            type: 'handoff',
            data: handoff,
        });
    }
    // Request review from another agent
    async requestReview(reviewerAgentId, artifacts) {
        this.emitEvent('review_requested', {
            reviewer: reviewerAgentId,
            artifacts: artifacts.map(a => a.id),
        });
        this.messageBus.send(reviewerAgentId, {
            type: 'review_request',
            data: {
                requestedBy: this.profile.id,
                artifacts,
            },
        });
    }
    // Update agent status
    updateStatus(status) {
        this.state.status = status;
        if (status === 'working') {
            this.state.startTime = new Date();
        }
        else if (status === 'complete' || status === 'error') {
            this.state.endTime = new Date();
        }
        this.emitEvent(`agent_${status === 'working' ? 'started' : status}`, {
            status,
        });
    }
    // Update progress
    updateProgress(progress) {
        this.state.progress = Math.min(100, Math.max(0, progress));
    }
    // Emit team event
    emitEvent(type, data) {
        const event = {
            id: (0, uuid_1.v4)(),
            type,
            agentId: this.profile.id,
            data,
            timestamp: new Date(),
        };
        this.emit('event', event);
        this.messageBus.broadcast(event);
    }
    // Use a tool
    async useTool(toolName, input) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new Error(`Tool not found: ${toolName}`);
        }
        return await this.act('file_operation', `Using tool: ${toolName}`, async () => {
            return await tool.execute(input);
        });
    }
    // Get relevant context from memory
    async getContext(query) {
        return await this.memory.recall(query, 5);
    }
    // Reset agent state
    reset() {
        this.state = {
            agentId: this.profile.id,
            status: 'idle',
            progress: 0,
            thoughts: [],
            actions: [],
            artifacts: [],
        };
    }
}
exports.BaseTeamAgent = BaseTeamAgent;
//# sourceMappingURL=base-team-agent.js.map