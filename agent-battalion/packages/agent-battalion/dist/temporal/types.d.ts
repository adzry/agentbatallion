/**
 * Temporal Workflow Types
 *
 * Shared types for Temporal workflows and activities
 */
export interface MissionInput {
    missionId: string;
    prompt: string;
    projectName: string;
    userId?: string;
    config?: MissionConfig;
}
export interface MissionConfig {
    framework: 'nextjs' | 'react' | 'vue' | 'svelte';
    styling: 'tailwind' | 'css-modules' | 'styled-components';
    typescript: boolean;
    testing: boolean;
    features: string[];
}
export interface MissionResult {
    missionId: string;
    status: 'completed' | 'failed' | 'cancelled';
    files: GeneratedFile[];
    previewUrl?: string;
    downloadUrl?: string;
    duration: number;
    error?: string;
}
export interface GeneratedFile {
    path: string;
    content: string;
    type: 'source' | 'config' | 'asset' | 'doc';
}
export interface AgentTask {
    taskId: string;
    agentType: 'analyzer' | 'planner' | 'coder' | 'reviewer' | 'tester';
    input: Record<string, any>;
    dependencies?: string[];
}
export interface AgentResult {
    taskId: string;
    agentType: string;
    success: boolean;
    output: Record<string, any>;
    duration: number;
    error?: string;
}
export interface AnalysisResult {
    requirements: string[];
    components: ComponentSpec[];
    dataModels: DataModel[];
    routes: RouteSpec[];
    features: FeatureSpec[];
}
export interface ComponentSpec {
    name: string;
    type: 'page' | 'layout' | 'component' | 'hook';
    description: string;
    props?: PropSpec[];
    dependencies?: string[];
}
export interface PropSpec {
    name: string;
    type: string;
    required: boolean;
    description?: string;
}
export interface DataModel {
    name: string;
    fields: FieldSpec[];
    relations?: RelationSpec[];
}
export interface FieldSpec {
    name: string;
    type: string;
    required: boolean;
    unique?: boolean;
    default?: any;
}
export interface RelationSpec {
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    target: string;
    field: string;
}
export interface RouteSpec {
    path: string;
    component: string;
    layout?: string;
    middleware?: string[];
}
export interface FeatureSpec {
    name: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    components: string[];
}
export interface PlanResult {
    phases: BuildPhase[];
    estimatedDuration: number;
    dependencies: DependencyGraph;
}
export interface BuildPhase {
    id: string;
    name: string;
    tasks: BuildTask[];
    parallel: boolean;
}
export interface BuildTask {
    id: string;
    type: 'create-file' | 'modify-file' | 'install-dep' | 'run-command';
    description: string;
    target?: string;
    content?: string;
    dependencies?: string[];
}
export interface DependencyGraph {
    nodes: string[];
    edges: Array<[string, string]>;
}
export interface WorkflowProgress {
    missionId: string;
    phase: string;
    step: string;
    progress: number;
    message: string;
    timestamp: Date;
}
//# sourceMappingURL=types.d.ts.map