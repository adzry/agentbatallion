/**
 * Base Team Agent - MGX-style Agent Foundation
 * 
 * Provides the foundation for all specialized team agents with
 * communication, memory, tool capabilities, and LLM integration.
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import {
  AgentProfile,
  AgentState,
  AgentAction,
  AgentTask,
  AgentHandoff,
  Artifact,
  ActionType,
  TeamEvent,
  ProjectContext,
  HandoffContext,
} from './types.js';
import { MemoryManager } from '../memory/memory-manager.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { MessageBus } from '../communication/message-bus.js';
import { LLMService, createLLMService, Message as LLMMessage } from '../llm/llm-service.js';
import { VectorMemory } from '../memory/vector-memory.js';

export abstract class BaseTeamAgent extends EventEmitter {
  protected profile: AgentProfile;
  protected state: AgentState;
  protected memory: MemoryManager;
  protected tools: ToolRegistry;
  protected messageBus: MessageBus;
  protected projectContext: ProjectContext | null = null;
  protected llm: LLMService;
  protected useRealAI: boolean;
  protected globalKnowledge: VectorMemory; // Phase 6: Overmind

  constructor(
    profile: AgentProfile,
    memory: MemoryManager,
    tools: ToolRegistry,
    messageBus: MessageBus
  ) {
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
  protected async queryCollectiveWisdom(problem: string): Promise<string[]> {
    try {
      const solutions = await this.globalKnowledge.findSimilarSolutions(problem);
      if (solutions.length > 0) {
        this.think(`Found ${solutions.length} similar solutions in collective wisdom`);
      }
      return solutions;
    } catch (error) {
      this.think(`Could not query collective wisdom: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Enhance prompt with collective wisdom (Phase 6: Overmind)
   */
  protected async enhancePromptWithWisdom(
    basePrompt: string,
    context: string = ''
  ): Promise<string> {
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
  protected async promptLLM<T = string>(
    userMessage: string,
    options?: {
      expectJson?: boolean;
      maxRetries?: number;
    }
  ): Promise<T> {
    const messages: LLMMessage[] = [
      { role: 'system', content: this.profile.systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const maxRetries = options?.maxRetries ?? 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.llm.complete(messages);
        
        if (options?.expectJson) {
          // Extract JSON from the response (handles markdown code blocks)
          const jsonMatch = response.content.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                          response.content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
          
          if (jsonMatch) {
            return JSON.parse(jsonMatch[1].trim()) as T;
          }
          
          // Try parsing the whole response as JSON
          return JSON.parse(response.content) as T;
        }
        
        return response.content as T;
      } catch (error) {
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
  protected isRealAIEnabled(): boolean {
    return this.useRealAI && this.llm.isRealLLM();
  }

  // Get agent profile
  getProfile(): AgentProfile {
    return this.profile;
  }

  // Get current state
  getState(): AgentState {
    return { ...this.state };
  }

  // Set project context
  setProjectContext(context: ProjectContext): void {
    this.projectContext = context;
    this.memory.setContext('project', context);
  }

  // Handle incoming message
  protected async handleMessage(message: any): Promise<void> {
    if (message.type === 'handoff') {
      await this.handleHandoff(message.data as AgentHandoff);
    } else if (message.type === 'task') {
      await this.handleTask(message.data as AgentTask);
    } else if (message.type === 'feedback') {
      await this.handleFeedback(message.data);
    }
  }

  // Handle task assignment
  protected async handleTask(task: AgentTask): Promise<void> {
    this.updateStatus('working');
    this.state.currentTask = task.title;
    
    this.emitEvent('task_started', { task });
    
    try {
      const result = await this.executeTask(task);
      this.emitEvent('task_complete', { task, result });
    } catch (error) {
      this.updateStatus('error');
      this.emitEvent('agent_error', { task, error });
    }
  }

  // Handle handoff from another agent
  protected async handleHandoff(handoff: AgentHandoff): Promise<void> {
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
  protected async handleFeedback(feedback: any): Promise<void> {
    this.think(`Received feedback: ${feedback.message}`);
    await this.memory.store('feedback', feedback.id, feedback);
  }

  // Execute a task (to be implemented by specific agents)
  protected abstract executeTask(task: AgentTask): Promise<any>;

  // Record a thought
  protected think(thought: string): void {
    this.state.thoughts.push(thought);
    this.emitEvent('agent_thinking', { thought });
  }

  // Create an action
  protected async act(
    type: ActionType,
    description: string,
    executor: () => Promise<any>
  ): Promise<any> {
    const action: AgentAction = {
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
    } catch (error) {
      action.status = 'failed';
      action.error = error instanceof Error ? error.message : 'Unknown error';
      action.endTime = new Date();
      throw error;
    }
  }

  // Create an artifact
  protected createArtifact(
    type: Artifact['type'],
    name: string,
    content: string,
    path?: string,
    metadata?: Record<string, unknown>
  ): Artifact {
    const artifact: Artifact = {
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
  protected async handoff(
    toAgentId: string,
    task: AgentTask,
    context: HandoffContext
  ): Promise<void> {
    const handoff: AgentHandoff = {
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
  protected async requestReview(
    reviewerAgentId: string,
    artifacts: Artifact[]
  ): Promise<void> {
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
  protected updateStatus(status: AgentState['status']): void {
    this.state.status = status;
    
    if (status === 'working') {
      this.state.startTime = new Date();
    } else if (status === 'complete' || status === 'error') {
      this.state.endTime = new Date();
    }

    this.emitEvent(`agent_${status === 'working' ? 'started' : status}`, {
      status,
    });
  }

  // Update progress
  protected updateProgress(progress: number): void {
    this.state.progress = Math.min(100, Math.max(0, progress));
  }

  // Emit team event
  protected emitEvent(type: TeamEvent['type'], data: Record<string, unknown>): void {
    const event: TeamEvent = {
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
  protected async useTool<T>(toolName: string, input: Record<string, unknown>): Promise<T> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    return await this.act('file_operation', `Using tool: ${toolName}`, async () => {
      return await tool.execute(input);
    });
  }

  // Get relevant context from memory
  protected async getContext(query: string): Promise<any[]> {
    return await this.memory.recall(query, 5);
  }

  // Reset agent state
  reset(): void {
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
