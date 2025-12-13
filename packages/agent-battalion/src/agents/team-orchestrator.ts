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
import { BackendEngineerAgent, BackendOutput } from './team/backend-engineer.js';
import { QAEngineerAgent, QAReport } from './team/qa-engineer.js';
import { SecurityAgent, SecurityReport } from './team/security-agent.js';
import { MemoryManager, createMemoryManager } from '../memory/memory-manager.js';
import { ToolRegistry, createToolRegistry } from '../tools/tool-registry.js';
import { MessageBus, createMessageBus } from '../communication/message-bus.js';
import { cleanupCode } from '../utils/code-cleanup.js';

export interface OrchestrationResult {
  projectId: string;
  success: boolean;
  files: ProjectFile[];
  qaReport?: QAReport;
  securityReport?: SecurityReport;
  backend?: {
    schema?: string;
    apiRoutes?: ProjectFile[];
    middleware?: ProjectFile[];
    utils?: ProjectFile[];
  };
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
        'backend_engineer',
        'qa_engineer',
        'security_agent',
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

    if (enabledRoles.includes('backend_engineer')) {
      this.agents.set('backend_engineer', new BackendEngineerAgent(this.memory, this.tools, this.messageBus));
    }

    if (enabledRoles.includes('qa_engineer')) {
      this.agents.set('qa_engineer', new QAEngineerAgent(this.memory, this.tools, this.messageBus));
    }

    if (enabledRoles.includes('security_agent')) {
      this.agents.set('security_agent', new SecurityAgent(this.memory, this.tools, this.messageBus));
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

      this.emitProgress('design', 'designer', '🎨', 'Design system complete', 40);

      // Phase 3.5: Backend Engineer - Generate Backend Code
      let backendOutput;
      if (this.agents.has('backend_engineer')) {
        this.emitProgress('backend', 'backend_engineer', '🗄️', 'Generating backend code...', 42);
        const backendAgent = this.agents.get('backend_engineer') as BackendEngineerAgent;
        
        // Extract data models from requirements or use empty array
        const dataModels = requirements
          .filter((req: any) => req.dataModel)
          .map((req: any) => req.dataModel);
        
        backendOutput = await backendAgent.generateBackend(
          requirements,
          dataModels,
          architecture
        );

        await this.memory.store('backend', 'current', backendOutput);

        // Store backend output in project context
        if (this.projectContext) {
          this.projectContext.backend = backendOutput;
        }

        this.emitProgress('backend', 'backend_engineer', '🗄️', 'Backend generation complete', 45);
      }

      // Phase 4: Frontend Engineer - Generate Code
      this.emitProgress('development', 'frontend_engineer', '💻', 'Writing code...', 50);
      const frontendAgent = this.agents.get('frontend_engineer') as FrontendEngineerAgent;
      let files = await frontendAgent.generateCode(
        architecture,
        designSystem,
        techStack,
        fileStructure
      );

      // Merge backend files if available
      if (backendOutput) {
        // Add Prisma schema as a ProjectFile
        const schemaFile: ProjectFile = {
          path: 'prisma/schema.prisma',
          content: backendOutput.schema,
          type: 'prisma',
          createdBy: 'backend-engineer-agent',
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        };
        
        files = [
          ...files,
          schemaFile,
          ...backendOutput.apiRoutes,
          ...backendOutput.middleware,
          ...backendOutput.utils,
        ];
      }

      await this.memory.store('files', 'current', files);

      this.emitProgress('development', 'frontend_engineer', '💻', `Generated ${files.length} files`, 65);

      // Phase 4.5: Post-process and cleanup generated code
      this.emitProgress('cleanup', 'frontend_engineer', '🧹', 'Cleaning up generated code...', 68);
      files = this.cleanupGeneratedFiles(files);
      await this.memory.store('files', 'current', files);

      this.emitProgress('development', 'frontend_engineer', '💻', `Code cleanup complete`, 70);

      // Phase 4.7: Security Agent - Security Review (REAL GATE)
      let securityReport;
      if (this.agents.has('security_agent')) {
        this.emitProgress('security', 'security_agent', '🔐', 'Running security review...', 72);
        const securityAgent = this.agents.get('security_agent') as SecurityAgent;
        securityReport = await securityAgent.auditSecurity(files);

        await this.memory.store('security_report', 'current', securityReport);

        // Store security report in project context
        if (this.projectContext) {
          this.projectContext.securityReport = securityReport;
        }

        // REAL SECURITY GATE: Fail on critical or high severity issues
        const criticalIssues = securityReport.issues.filter(
          (issue: any) => issue.severity === 'critical' || issue.severity === 'high'
        );

        if (criticalIssues.length > 0) {
          const errorMsg = `Security gate failed: ${criticalIssues.length} critical/high severity issue(s) found`;
          this.emitProgress('error', 'security_agent', '🔐', errorMsg, 0);
          
          throw new Error(
            `${errorMsg}\n` +
            criticalIssues.map((issue: any) => `  - ${issue.title}: ${issue.description}`).join('\n')
          );
        }

        this.emitProgress('security', 'security_agent', '🔐', `Security review passed (${securityReport.score}/100)`, 75);
      }

      // Phase 5: QA Engineer - Review & Test (REAL GATE)
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
          // For now, we continue to next iteration
        }
      }

      // REAL QA GATE: Fail if quality threshold not met after max iterations
      if (!passed) {
        const errorMsg = `QA gate failed: Quality threshold (${this.config.qualityThreshold}) not met after ${this.config.maxIterations} iteration(s). Score: ${qaReport?.score || 0}`;
        this.emitProgress('error', 'qa_engineer', '🔍', errorMsg, 0);
        
        throw new Error(errorMsg);
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
        securityReport,
        backend: backendOutput,
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

  /**
   * Cleanup and post-process generated files
   */
  private cleanupGeneratedFiles(files: ProjectFile[]): ProjectFile[] {
    return files.map(file => {
      // Only cleanup code files
      if (!file.path.match(/\.(tsx?|jsx?|css|json)$/)) {
        return file;
      }

      const result = cleanupCode(file.content, file.path);
      
      // Log fixes for debugging
      if (result.fixes.length > 0) {
        this.events.push({
          id: uuidv4(),
          type: 'agent_thinking',
          agentId: 'system',
          timestamp: new Date(),
          data: {
            message: `Cleaned ${file.path}: ${result.fixes.join(', ')}`,
          },
        });
      }

      return {
        ...file,
        content: result.code,
      };
    });
  }
}

/**
 * Create an orchestrator instance
 */
export function createTeamOrchestrator(config?: Partial<TeamConfig>): TeamOrchestrator {
  return new TeamOrchestrator(config);
}
