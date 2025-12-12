/**
 * Temporal Activities
 *
 * Activities are the building blocks of workflows. They contain the
 * actual business logic that can fail, retry, and be traced.
 */
import { AnalysisResult, PlanResult, GeneratedFile, MissionConfig } from '../types.js';
export interface AnalyzeInput {
    missionId: string;
    prompt: string;
    config?: MissionConfig;
}
export interface PlanInput {
    missionId: string;
    analysis: AnalysisResult;
    config?: MissionConfig;
}
export interface GenerateInput {
    missionId: string;
    plan: PlanResult;
    projectName: string;
}
export interface ReviewInput {
    missionId: string;
    files: GeneratedFile[];
}
export interface ReviewResult {
    passed: boolean;
    issues: string[];
    fixes?: string[];
    fixedFiles?: GeneratedFile[];
}
export interface TestInput {
    missionId: string;
    files: GeneratedFile[];
}
export interface TestResult {
    passed: boolean;
    tests: number;
    failures: number;
    coverage?: number;
}
/**
 * Analyze requirements using the Analyzer Agent
 */
export declare function analyzeRequirements(input: AnalyzeInput): Promise<AnalysisResult>;
/**
 * Plan architecture using the Planner Agent
 */
export declare function planArchitecture(input: PlanInput): Promise<PlanResult>;
/**
 * Generate code using the Coordinator Agent
 */
export declare function generateCode(input: GenerateInput): Promise<GeneratedFile[]>;
/**
 * Review generated code
 */
export declare function reviewCode(input: ReviewInput): Promise<ReviewResult>;
/**
 * Run tests on generated code
 */
export declare function runTests(input: TestInput): Promise<TestResult>;
/**
 * Install dependencies in sandbox
 */
export declare function installDependencies(sandboxId: string, packageJson: string): Promise<void>;
/**
 * Start preview server
 */
export declare function startPreview(sandboxId: string, port: number): Promise<string>;
//# sourceMappingURL=index.d.ts.map