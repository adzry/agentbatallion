/**
 * Team Orchestrator
 *
 * MGX-style orchestration of the agent team:
 * - Coordinates agent collaboration
 * - Manages workflow execution
 * - Handles handoffs between agents
 * - Provides real-time progress updates
 */
import { EventEmitter } from 'events';
import { AgentRole, ProjectContext, TeamConfig, TeamEvent, ProjectFile } from './types.js';
import { BaseTeamAgent } from './base-team-agent.js';
import { QAReport } from './team/qa-engineer.js';
import { MemoryManager } from '../memory/memory-manager.js';
export interface OrchestrationResult {
    projectId: string;
    success: boolean;
    files: ProjectFile[];
    qaReport?: QAReport;
    duration: number;
    iterations: number;
    events: TeamEvent[];
}
export interface OrchestrationProgress {
    phase: string;
    agent: string;
    agentAvatar: string;
    message: string;
    progress: number;
    thought?: string;
}
export declare class TeamOrchestrator extends EventEmitter {
    private config;
    private memory;
    private tools;
    private messageBus;
    private agents;
    private events;
    private projectContext;
    constructor(config?: Partial<TeamConfig>);
    /**
     * Initialize the agent team
     */
    private initializeAgents;
    /**
     * Set up event listeners for agents
     */
    private setupEventListeners;
    /**
     * Run the full orchestration workflow
     */
    run(userRequest: string): Promise<OrchestrationResult>;
    /**
     * Emit progress event
     */
    private emitProgress;
    /**
     * Get current project context
     */
    getProjectContext(): ProjectContext | null;
    /**
     * Get all events
     */
    getEvents(): TeamEvent[];
    /**
     * Get agent by role
     */
    getAgent(role: AgentRole): BaseTeamAgent | undefined;
    /**
     * Get all agents
     */
    getAllAgents(): BaseTeamAgent[];
    /**
     * Get memory manager
     */
    getMemory(): MemoryManager;
    /**
     * Reset orchestrator state
     */
    reset(): void;
}
/**
 * Create an orchestrator instance
 */
export declare function createTeamOrchestrator(config?: Partial<TeamConfig>): TeamOrchestrator;
//# sourceMappingURL=team-orchestrator.d.ts.map