/**
 * Agent Types - MGX-style Multi-Agent System
 * 
 * Defines the core types for the agent team system inspired by MGX.dev
 */

// Agent Roles in the Team
export type AgentRole = 
  | 'product_manager'
  | 'architect'
  | 'frontend_engineer'
  | 'backend_engineer'
  | 'designer'
  | 'qa_engineer'
  | 'devops_engineer'
  | 'tech_lead';

// Agent Status
export type AgentStatus = 
  | 'idle'
  | 'thinking'
  | 'working'
  | 'waiting'
  | 'reviewing'
  | 'complete'
  | 'error';

// Agent capabilities
export interface AgentCapabilities {
  canWriteCode: boolean;
  canDesign: boolean;
  canTest: boolean;
  canDeploy: boolean;
  canResearch: boolean;
  canReview: boolean;
  languages?: string[];
  frameworks?: string[];
}

// Agent Profile
export interface AgentProfile {
  id: string;
  name: string;
  role: AgentRole;
  avatar: string;
  description: string;
  capabilities: AgentCapabilities;
  personality: string;
  systemPrompt: string;
}

// Agent State during execution
export interface AgentState {
  agentId: string;
  status: AgentStatus;
  currentTask?: string;
  progress: number;
  thoughts: string[];
  actions: AgentAction[];
  artifacts: Artifact[];
  startTime?: Date;
  endTime?: Date;
}

// Agent Action
export interface AgentAction {
  id: string;
  type: ActionType;
  description: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: 'pending' | 'running' | 'complete' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: string;
}

export type ActionType = 
  | 'think'
  | 'plan'
  | 'code'
  | 'design'
  | 'review'
  | 'test'
  | 'research'
  | 'communicate'
  | 'file_operation'
  | 'command';

// Artifact produced by agents
export interface Artifact {
  id: string;
  type: ArtifactType;
  name: string;
  path?: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  version: number;
  metadata?: Record<string, unknown>;
}

export type ArtifactType = 
  | 'requirement'
  | 'architecture'
  | 'design'
  | 'code'
  | 'test'
  | 'documentation'
  | 'config'
  | 'asset';

// Task assigned to an agent
export interface AgentTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'review' | 'complete' | 'blocked';
  dependencies?: string[];
  artifacts?: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Handoff between agents
export interface AgentHandoff {
  id: string;
  fromAgent: string;
  toAgent: string;
  task: AgentTask;
  context: HandoffContext;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface HandoffContext {
  summary: string;
  completedWork: string[];
  nextSteps: string[];
  artifacts: string[];
  concerns?: string[];
  suggestions?: string[];
}

// Team configuration
export interface TeamConfig {
  projectId: string;
  projectName: string;
  teamSize: 'small' | 'medium' | 'large';
  enabledRoles: AgentRole[];
  workflowType: 'waterfall' | 'agile' | 'parallel';
  maxIterations: number;
  qualityThreshold: number;
}

// Project context shared across team
export interface ProjectContext {
  id: string;
  name: string;
  description: string;
  requirements: Requirement[];
  architecture?: ArchitectureSpec;
  designSystem?: DesignSystem;
  techStack: TechStack;
  files: ProjectFile[];
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Requirement {
  id: string;
  type: 'functional' | 'non_functional' | 'constraint';
  priority: 'must' | 'should' | 'could' | 'wont';
  description: string;
  acceptanceCriteria?: string[];
  status: 'proposed' | 'approved' | 'implemented' | 'tested';
}

export interface ArchitectureSpec {
  type: 'monolith' | 'microservices' | 'serverless' | 'jamstack';
  components: ComponentSpec[];
  dataFlow: DataFlowSpec[];
  integrations: IntegrationSpec[];
  diagram?: string;
}

export interface ComponentSpec {
  name: string;
  type: string;
  description: string;
  dependencies: string[];
  apis?: ApiSpec[];
}

export interface ApiSpec {
  method: string;
  path: string;
  description: string;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
}

export interface DataFlowSpec {
  from: string;
  to: string;
  data: string;
  protocol?: string;
}

export interface IntegrationSpec {
  name: string;
  type: string;
  config?: Record<string, unknown>;
}

export interface DesignSystem {
  colors: Record<string, string>;
  typography: TypographySpec;
  spacing: Record<string, string>;
  components: UIComponentSpec[];
  theme: 'light' | 'dark' | 'system';
}

export interface TypographySpec {
  fontFamily: string;
  headings: Record<string, string>;
  body: string;
}

export interface UIComponentSpec {
  name: string;
  variants: string[];
  props: Record<string, string>;
}

export interface TechStack {
  frontend: {
    framework: string;
    language: string;
    styling: string;
    stateManagement?: string;
  };
  backend?: {
    framework: string;
    language: string;
    database?: string;
    orm?: string;
  };
  infrastructure?: {
    hosting: string;
    ci_cd?: string;
    monitoring?: string;
  };
}

export interface ProjectFile {
  path: string;
  content: string;
  type: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export type ProjectStatus = 
  | 'planning'
  | 'designing'
  | 'developing'
  | 'testing'
  | 'reviewing'
  | 'complete'
  | 'deployed';

// Data Model for database schema generation
export interface DataModel {
  name: string;
  fields: DataModelField[];
  relations?: DataModelRelation[];
}

export interface DataModelField {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  default?: unknown;
}

export interface DataModelRelation {
  field: string;
  target: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

// Team event for real-time updates
export interface TeamEvent {
  id: string;
  type: TeamEventType;
  agentId?: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export type TeamEventType =
  | 'agent_started'
  | 'agent_thinking'
  | 'agent_working'
  | 'agent_complete'
  | 'agent_error'
  | 'agent_idle'
  | 'agent_waiting'
  | 'agent_reviewing'
  | 'handoff'
  | 'artifact_created'
  | 'task_started'
  | 'task_complete'
  | 'review_requested'
  | 'feedback_received'
  | 'iteration_start'
  | 'iteration_complete'
  | 'project_complete';
