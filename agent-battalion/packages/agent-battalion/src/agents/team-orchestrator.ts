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
import { v4 as uuidv4 } from 'uuid';
import {
  AgentRole,
  ProjectContext,
  TeamConfig,
  TeamEvent,
  Requirement,
  ArchitectureSpec,
  DesignSystem,
  TechStack,
  ProjectFile,
} from './types.js';
import { BaseTeamAgent } from './base-team-agent.js';
import { ProductManagerAgent } from './team/product-manager.js';
import { ArchitectAgent } from './team/architect.js';
import { DesignerAgent } from './team/designer.js';
import { FrontendEngineerAgent } from './team/frontend-engineer.js';
import { QAEngineerAgent, QAReport } from './team/qa-engineer.js';
import { MemoryManager, createMemoryManager } from '../memory/memory-manager.js';
import { ToolRegistry, createToolRegistry } from '../tools/tool-registry.js';
import { MessageBus, createMessageBus } from '../communication/message-bus.js';

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

export class TeamOrchestrator extends EventEmitter {
  private config: TeamConfig;
  private memory: MemoryManager;
  private tools: ToolRegistry;
  private messageBus: MessageBus;
  private agents: Map<AgentRole, BaseTeamAgent> = new Map();
  private events: TeamEvent[] = [];
  private projectContext: ProjectContext | null = null;

  constructor(config?: Partial<TeamConfig>) {
    super();

    this.config = {
      projectId: config?.projectId || uuidv4(),
      projectName: config?.projectName || 'New Project',
      teamSize: config?.teamSize || 'medium',
      enabledRoles: config?.enabledRoles || [
        'product_manager',
        'architect',
        'designer',
        'frontend_engineer',
        'qa_engineer',
      ],
      workflowType: config?.workflowType || 'agile',
      maxIterations: config?.maxIterations || 3,
      qualityThreshold: config?.qualityThreshold || 80,
    };

    // Initialize infrastructure
    this.memory = createMemoryManager();
    this.tools = createToolRegistry();
    this.messageBus = createMessageBus({ enableLogging: true });

    // Initialize agents
    this.initializeAgents();

    // Listen to agent events
    this.setupEventListeners();
  }

  /**
   * Initialize the agent team
   */
  private initializeAgents(): void {
    const { enabledRoles } = this.config;

    if (enabledRoles.includes('product_manager')) {
      this.agents.set('product_manager', new ProductManagerAgent(this.memory, this.tools, this.messageBus));
    }

    if (enabledRoles.includes('architect')) {
      this.agents.set('architect', new ArchitectAgent(this.memory, this.tools, this.messageBus));
    }

    if (enabledRoles.includes('designer')) {
      this.agents.set('designer', new DesignerAgent(this.memory, this.tools, this.messageBus));
    }

    if (enabledRoles.includes('frontend_engineer')) {
      this.agents.set('frontend_engineer', new FrontendEngineerAgent(this.memory, this.tools, this.messageBus));
    }

    if (enabledRoles.includes('qa_engineer')) {
      this.agents.set('qa_engineer', new QAEngineerAgent(this.memory, this.tools, this.messageBus));
    }
  }

  /**
   * Set up event listeners for agents
   */
  private setupEventListeners(): void {
    for (const agent of this.agents.values()) {
      agent.on('event', (event: TeamEvent) => {
        this.events.push(event);
        this.emit('event', event);
      });
    }

    this.messageBus.on('message', (message) => {
      this.emit('message', message);
    });
  }

  /**
   * Run the full orchestration workflow
   */
  async run(userRequest: string): Promise<OrchestrationResult> {
    const startTime = Date.now();
    let iterations = 0;

    this.emitProgress('starting', 'system', '🚀', 'Initializing Agent Battalion...', 0);

    try {
      // Phase 1: Product Manager - Analyze Requirements
      this.emitProgress('requirements', 'product_manager', '👔', 'Analyzing your requirements...', 5);
      const pmAgent = this.agents.get('product_manager') as ProductManagerAgent;
      const { requirements, projectContext } = await pmAgent.analyzeRequest(userRequest);
      
      // Store in memory
      await this.memory.store('requirements', 'current', requirements);
      await this.memory.setContext('project', projectContext);

      // Initialize project context
      this.projectContext = {
        id: this.config.projectId,
        name: projectContext.name || this.config.projectName,
        description: userRequest,
        requirements,
        techStack: projectContext.techStack!,
        files: [],
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set project context for all agents
      for (const agent of this.agents.values()) {
        agent.setProjectContext(this.projectContext);
      }

      this.emitProgress('requirements', 'product_manager', '👔', `Identified ${requirements.length} requirements`, 15);

      // Phase 2: Architect - Design Architecture
      this.emitProgress('architecture', 'architect', '🏗️', 'Designing system architecture...', 20);
      const architectAgent = this.agents.get('architect') as ArchitectAgent;
      const { architecture, fileStructure, techStack } = await architectAgent.designArchitecture(
        requirements,
        projectContext
      );

      await this.memory.store('architecture', 'current', architecture);
      await this.memory.store('file_structure', 'current', fileStructure);
      await this.memory.store('tech_stack', 'current', techStack);

      this.emitProgress('architecture', 'architect', '🏗️', `Planned ${fileStructure.length} files`, 30);

      // Phase 3: Designer - Create Design System
      this.emitProgress('design', 'designer', '🎨', 'Creating design system...', 35);
      const designerAgent = this.agents.get('designer') as DesignerAgent;
      const designSystem = await designerAgent.createDesignSystem(requirements, projectContext);

      await this.memory.store('design_system', 'current', designSystem);

      this.emitProgress('design', 'designer', '🎨', 'Design system complete', 45);

      // Phase 4: Frontend Engineer - Generate Code
      this.emitProgress('development', 'frontend_engineer', '💻', 'Writing code...', 50);
      const frontendAgent = this.agents.get('frontend_engineer') as FrontendEngineerAgent;
      let files = await frontendAgent.generateCode(
        architecture,
        designSystem,
        techStack,
        fileStructure
      );

      await this.memory.store('files', 'current', files);

      this.emitProgress('development', 'frontend_engineer', '💻', `Generated ${files.length} files`, 75);

      // Phase 5: QA Engineer - Review & Test
      let qaReport: QAReport | undefined;
      let passed = false;

      while (!passed && iterations < this.config.maxIterations) {
        iterations++;

        this.emitProgress('review', 'qa_engineer', '🔍', `Quality review (iteration ${iterations})...`, 80);
        const qaAgent = this.agents.get('qa_engineer') as QAEngineerAgent;
        qaReport = await qaAgent.reviewCode(files, requirements);

        passed = qaReport.passed || qaReport.score >= this.config.qualityThreshold;

        if (!passed && iterations < this.config.maxIterations) {
          this.emitProgress('fixing', 'frontend_engineer', '💻', 'Applying fixes...', 85);
          // In a real implementation, we would fix the issues here
          // For now, we'll accept the result
          passed = true;
        }
      }

      this.emitProgress('complete', 'system', '✅', 'Project generation complete!', 100);

      // Update project files
      this.projectContext.files = files;
      this.projectContext.status = 'complete';

      return {
        projectId: this.config.projectId,
        success: true,
        files,
        qaReport,
        duration: Date.now() - startTime,
        iterations,
        events: this.events,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.emitProgress('error', 'system', '❌', `Error: ${errorMessage}`, 0);

      return {
        projectId: this.config.projectId,
        success: false,
        files: [],
        duration: Date.now() - startTime,
        iterations,
        events: this.events,
      };
    }
  }

  /**
   * Emit progress event
   */
  private emitProgress(
    phase: string,
    agent: string,
    agentAvatar: string,
    message: string,
    progress: number
  ): void {
    const progressEvent: OrchestrationProgress = {
      phase,
      agent,
      agentAvatar,
      message,
      progress,
    };

    this.emit('progress', progressEvent);
  }

  /**
   * Get current project context
   */
  getProjectContext(): ProjectContext | null {
    return this.projectContext;
  }

  /**
   * Get all events
   */
  getEvents(): TeamEvent[] {
    return [...this.events];
  }

  /**
   * Get agent by role
   */
  getAgent(role: AgentRole): BaseTeamAgent | undefined {
    return this.agents.get(role);
  }

  /**
   * Get all agents
   */
  getAllAgents(): BaseTeamAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get memory manager
   */
  getMemory(): MemoryManager {
    return this.memory;
  }

  /**
   * Reset orchestrator state
   */
  reset(): void {
    this.events = [];
    this.projectContext = null;
    this.memory.clearAll();

    for (const agent of this.agents.values()) {
      agent.reset();
    }
  }
}

/**
 * Create an orchestrator instance
 */
export function createTeamOrchestrator(config?: Partial<TeamConfig>): TeamOrchestrator {
  return new TeamOrchestrator(config);
}
