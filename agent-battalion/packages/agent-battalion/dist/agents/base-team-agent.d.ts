/**
 * Base Team Agent - MGX-style Agent Foundation
 *
 * Provides the foundation for all specialized team agents with
 * communication, memory, tool capabilities, and LLM integration.
 */
import { EventEmitter } from 'events';
import { AgentProfile, AgentState, AgentTask, AgentHandoff, Artifact, ActionType, TeamEvent, ProjectContext, HandoffContext } from './types.js';
import { MemoryManager } from '../memory/memory-manager.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { MessageBus } from '../communication/message-bus.js';
import { LLMService } from '../llm/llm-service.js';
import { VectorMemory } from '../memory/vector-memory.js';
export declare abstract class BaseTeamAgent extends EventEmitter {
    protected profile: AgentProfile;
    protected state: AgentState;
    protected memory: MemoryManager;
    protected tools: ToolRegistry;
    protected messageBus: MessageBus;
    protected projectContext: ProjectContext | null;
    protected llm: LLMService;
    protected useRealAI: boolean;
    protected globalKnowledge: VectorMemory;
    constructor(profile: AgentProfile, memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus);
    /**
     * Query global knowledge base for learned patterns (Phase 6: Overmind)
     */
    protected queryCollectiveWisdom(problem: string): Promise<string[]>;
    /**
     * Enhance prompt with collective wisdom (Phase 6: Overmind)
     */
    protected enhancePromptWithWisdom(basePrompt: string, context?: string): Promise<string>;
    /**
     * Prompt the LLM with a system message and user message
     * Returns parsed JSON if possible, otherwise raw text
     */
    protected promptLLM<T = string>(userMessage: string, options?: {
        expectJson?: boolean;
        maxRetries?: number;
    }): Promise<T>;
    /**
     * Check if real AI is enabled
     */
    protected isRealAIEnabled(): boolean;
    getProfile(): AgentProfile;
    getState(): AgentState;
    setProjectContext(context: ProjectContext): void;
    protected handleMessage(message: any): Promise<void>;
    protected handleTask(task: AgentTask): Promise<void>;
    protected handleHandoff(handoff: AgentHandoff): Promise<void>;
    protected handleFeedback(feedback: any): Promise<void>;
    protected abstract executeTask(task: AgentTask): Promise<any>;
    protected think(thought: string): void;
    protected act(type: ActionType, description: string, executor: () => Promise<any>): Promise<any>;
    protected createArtifact(type: Artifact['type'], name: string, content: string, path?: string, metadata?: Record<string, unknown>): Artifact;
    protected handoff(toAgentId: string, task: AgentTask, context: HandoffContext): Promise<void>;
    protected requestReview(reviewerAgentId: string, artifacts: Artifact[]): Promise<void>;
    protected updateStatus(status: AgentState['status']): void;
    protected updateProgress(progress: number): void;
    protected emitEvent(type: TeamEvent['type'], data: Record<string, unknown>): void;
    protected useTool<T>(toolName: string, input: Record<string, unknown>): Promise<T>;
    protected getContext(query: string): Promise<any[]>;
    reset(): void;
}
//# sourceMappingURL=base-team-agent.d.ts.map