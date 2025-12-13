/**
 * Temporal Activities
 *
 * Activities are the building blocks of workflows. They contain the
 * actual business logic that can fail, retry, and be traced.
 *
 * These activities use the TeamOrchestrator for AI-powered generation.
 */
import { GeneratedFile, MissionConfig } from '../types.js';
export interface GenerateInput {
    missionId: string;
    prompt: string;
    projectName: string;
    config?: MissionConfig;
}
export interface GenerateResult {
    success: boolean;
    files: GeneratedFile[];
    qaScore: number;
    duration: number;
    error?: string;
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
 * Generate application using TeamOrchestrator
 */
export declare function generateApplication(input: GenerateInput): Promise<GenerateResult>;
/**
 * Review generated code
 */
export declare function reviewCode(input: ReviewInput): Promise<ReviewResult>;
/**
 * Run tests on generated code (placeholder)
 */
export declare function runTests(input: TestInput): Promise<TestResult>;
/**
 * Install dependencies in sandbox (placeholder)
 */
export declare function installDependencies(sandboxId: string, packageJson: string): Promise<void>;
/**
 * Start preview server (placeholder)
 */
export declare function startPreview(sandboxId: string, port: number): Promise<string>;
export { generateUiPreview } from './ui-preview.js';
export type { UIPreviewInput, UIPreviewResult } from './ui-preview.js';
export { verifyVisuals } from './visual-qa.js';
export type { VisualQAInput, VisualQAResult } from './visual-qa.js';
export { simulateUser } from './user-simulation.js';
export type { UserSimulationInput, UserSimulationResult } from './user-simulation.js';
export { attemptRepair } from './repair.js';
export type { RepairInput, RepairResult } from './repair.js';
export { performSecurityAudit } from './security-audit.js';
export type { SecurityAuditInput, SecurityAuditResult } from './security-audit.js';
export { harvestKnowledge } from './knowledge-harvest.js';
export type { KnowledgeHarvestInput, KnowledgeHarvestResult } from './knowledge-harvest.js';
//# sourceMappingURL=index.d.ts.map