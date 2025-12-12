/**
 * LangGraph Agent Types
 *
 * Shared types for LangGraph agents
 */
import { BaseMessage } from '@langchain/core/messages';
export interface AgentState {
    messages: BaseMessage[];
    input: Record<string, any>;
    output: any;
    currentStep?: string;
    error?: string;
    metadata: AgentMetadata;
}
export interface AgentMetadata {
    startTime: Date;
    endTime?: Date;
    steps: number;
    tokens?: TokenUsage;
    model?: string;
}
export interface TokenUsage {
    prompt: number;
    completion: number;
    total: number;
}
export interface AgentConfig {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    verbose?: boolean;
}
export interface NodeResult {
    nextNode: string | null;
    state: Partial<AgentState>;
}
export interface EdgeCondition {
    (state: AgentState): string;
}
export interface RequirementAnalysis {
    functional: string[];
    nonFunctional: string[];
    constraints: string[];
}
export interface ComponentDesign {
    pages: PageSpec[];
    components: ComponentSpec[];
    hooks: HookSpec[];
    utils: UtilSpec[];
}
export interface PageSpec {
    name: string;
    route: string;
    layout?: string;
    components: string[];
    dataRequirements?: string[];
}
export interface ComponentSpec {
    name: string;
    type: 'client' | 'server';
    props: PropDefinition[];
    children?: boolean;
    description: string;
}
export interface PropDefinition {
    name: string;
    type: string;
    required: boolean;
    default?: any;
}
export interface HookSpec {
    name: string;
    purpose: string;
    dependencies: string[];
    returnType: string;
}
export interface UtilSpec {
    name: string;
    functions: FunctionSpec[];
}
export interface FunctionSpec {
    name: string;
    params: ParamSpec[];
    returnType: string;
    description: string;
}
export interface ParamSpec {
    name: string;
    type: string;
    optional?: boolean;
}
export interface ExecutionPlan {
    phases: Phase[];
    dependencies: DependencyMap;
    estimatedDuration: number;
}
export interface Phase {
    id: string;
    name: string;
    tasks: Task[];
    parallel: boolean;
    dependsOn?: string[];
}
export interface Task {
    id: string;
    type: TaskType;
    target: string;
    template?: string;
    variables?: Record<string, any>;
    dependsOn?: string[];
}
export type TaskType = 'create-file' | 'modify-file' | 'delete-file' | 'install-package' | 'run-command' | 'validate';
export interface DependencyMap {
    [taskId: string]: string[];
}
export interface GeneratedCode {
    files: GeneratedFile[];
    warnings: string[];
    suggestions: string[];
}
export interface GeneratedFile {
    path: string;
    content: string;
    type: FileType;
    language: string;
}
export type FileType = 'source' | 'config' | 'style' | 'test' | 'asset' | 'documentation';
export interface AgentMessage {
    from: string;
    to: string;
    type: MessageType;
    payload: any;
    timestamp: Date;
}
export type MessageType = 'request' | 'response' | 'error' | 'status' | 'handoff';
export interface AgentHandoff {
    fromAgent: string;
    toAgent: string;
    context: Record<string, any>;
    reason: string;
}
//# sourceMappingURL=types.d.ts.map