/**
 * Base Team Agent - MGX-style Agent Foundation
 *
 * Provides the foundation for all specialized team agents with
 * communication, memory, tool capabilities, and LLM integration.
 */
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { createLLMService } from '../llm/llm-service.js';
import { VectorMemory } from '../memory/vector-memory.js';
export class BaseTeamAgent extends EventEmitter {
    profile;
    state;
    memory;
    tools;
    messageBus;
    projectContext = null;
    llm;
    useRealAI;
    globalKnowledge; // Phase 6: Overmind
    constructor(profile, memory, tools, messageBus) {
        super();
        this.profile = profile;
        this.memory = memory;
        this.tools = tools;
        this.messageBus = messageBus;
        // Initialize LLM service
        this.llm = createLLMService();
        this.useRealAI = process.env.USE_REAL_AI === 'true';
        // Initialize global knowledge (Phase 6: Overmind)
        this.globalKnowledge = new VectorMemory();
        this.globalKnowledge.initialize().catch(err => {
            console.warn('Global knowledge initialization failed:', err);
        });
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
    /**
     * Query global knowledge base for learned patterns (Phase 6: Overmind)
     */
    async queryCollectiveWisdom(problem) {
        try {
            const solutions = await this.globalKnowledge.findSimilarSolutions(problem);
            if (solutions.length > 0) {
                this.think(`Found ${solutions.length} similar solutions in collective wisdom`);
            }
            return solutions;
        }
        catch (error) {
            this.think(`Could not query collective wisdom: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return [];
        }
    }
    /**
     * Enhance prompt with collective wisdom (Phase 6: Overmind)
     */
    async enhancePromptWithWisdom(basePrompt, context = '') {
        const wisdom = await this.queryCollectiveWisdom(context || basePrompt);
        if (wisdom.length === 0) {
            return basePrompt;
        }
        const wisdomSection = `

COLLECTIVE WISDOM (learned from previous missions):
${wisdom.map((w, i) => `${i + 1}. ${w}`).join('\n')}

Apply these learnings to avoid common pitfalls.
`;
        return basePrompt + wisdomSection;
    }
    /**
     * Prompt the LLM with a system message and user message
     * Returns parsed JSON if possible, otherwise raw text
     */
    async promptLLM(userMessage, options) {
        const messages = [
            { role: 'system', content: this.profile.systemPrompt },
            { role: 'user', content: userMessage },
        ];
        const maxRetries = options?.maxRetries ?? 2;
        let lastError = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await this.llm.complete(messages);
                if (options?.expectJson) {
                    // Extract JSON from the response (handles markdown code blocks)
                    const jsonMatch = response.content.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                        response.content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[1].trim());
                    }
                    // Try parsing the whole response as JSON
                    return JSON.parse(response.content);
                }
                return response.content;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                this.think(`LLM attempt ${attempt + 1} failed: ${lastError.message}`);
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                }
            }
        }
        throw lastError || new Error('LLM prompt failed');
    }
    /**
     * Check if real AI is enabled
     */
    isRealAIEnabled() {
        return this.useRealAI && this.llm.isRealLLM();
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
            id: uuidv4(),
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
            id: uuidv4(),
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
            id: uuidv4(),
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
            id: uuidv4(),
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
//# sourceMappingURL=base-team-agent.js.map