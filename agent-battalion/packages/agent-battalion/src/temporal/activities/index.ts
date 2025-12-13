/**
 * Temporal Activities
 * 
 * Activities are the building blocks of workflows. They contain the
 * actual business logic that can fail, retry, and be traced.
 * 
 * These activities use the TeamOrchestrator for AI-powered generation.
 */

import { GeneratedFile, MissionConfig } from '../types.js';
import { createTeamOrchestrator } from '../../agents/team-orchestrator.js';

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
export async function generateApplication(input: GenerateInput): Promise<GenerateResult> {
  console.log(`[Activity] Generating application for mission: ${input.missionId}`);
  
  try {
    const orchestrator = createTeamOrchestrator({
      projectName: input.projectName,
    });

    const result = await orchestrator.run(input.prompt);

    return {
      success: result.success,
      files: result.files.map(f => ({
        path: f.path,
        content: f.content,
        type: f.type as 'source' | 'config' | 'asset' | 'doc',
      })),
      qaScore: result.qaReport?.score || 0,
      duration: result.duration,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Generation failed:', message);
    
    return {
      success: false,
      files: [],
      qaScore: 0,
      duration: 0,
      error: message,
    };
  }
}

/**
 * Review generated code
 */
export async function reviewCode(input: ReviewInput): Promise<ReviewResult> {
  console.log(`[Activity] Reviewing code for mission: ${input.missionId}`);
  
  const issues: string[] = [];
  
  for (const file of input.files) {
    // Check for empty files
    if (!file.content || file.content.trim().length === 0) {
      issues.push(`Empty file: ${file.path}`);
    }
    
    // Check for common issues in TypeScript/JavaScript files
    if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
      // Check for console.log statements
      if (file.content.includes('console.log')) {
        issues.push(`Console.log found in: ${file.path}`);
      }
    }
  }
  
  return {
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Run tests on generated code (placeholder)
 */
export async function runTests(input: TestInput): Promise<TestResult> {
  console.log(`[Activity] Running tests for mission: ${input.missionId}`);
  
  // Mock test results - in production, this would run actual tests
  return {
    passed: true,
    tests: 0,
    failures: 0,
    coverage: undefined,
  };
}

/**
 * Install dependencies in sandbox (placeholder)
 */
export async function installDependencies(
  sandboxId: string,
  packageJson: string
): Promise<void> {
  console.log(`[Activity] Installing dependencies in sandbox: ${sandboxId}`);
  // Implementation would use E2B sandbox
}

/**
 * Start preview server (placeholder)
 */
export async function startPreview(
  sandboxId: string,
  port: number
): Promise<string> {
  console.log(`[Activity] Starting preview server in sandbox: ${sandboxId}`);
  // Implementation would use E2B sandbox
  return `https://${sandboxId}.sandbox.e2b.dev:${port}`;
}

// Export UI Preview activity (Phase 1: Nano Banana)
export { generateUiPreview } from './ui-preview.js';
export type { UIPreviewInput, UIPreviewResult } from './ui-preview.js';

// Export Visual QA activity (Phase 2: Eye of Sauron)
export { verifyVisuals } from './visual-qa.js';
export type { VisualQAInput, VisualQAResult } from './visual-qa.js';

// Export User Simulation activity (Phase 3: Dynamic Swarm)
export { simulateUser } from './user-simulation.js';
export type { UserSimulationInput, UserSimulationResult } from './user-simulation.js';

// Export Repair activity (Phase 4: Lazarus Protocol)
export { attemptRepair } from './repair.js';
export type { RepairInput, RepairResult } from './repair.js';

// Export Security Audit activity (Phase 5: Red Sparrow)
export { performSecurityAudit } from './security-audit.js';
export type { SecurityAuditInput, SecurityAuditResult } from './security-audit.js';

// Export Knowledge Harvest activity (Phase 6: Overmind)
export { harvestKnowledge } from './knowledge-harvest.js';
export type { KnowledgeHarvestInput, KnowledgeHarvestResult } from './knowledge-harvest.js';

// Export Voice activities (Phase 7: Project Siren)
export { generateAudioSummary, processVoiceCommand } from './daily-standup.js';
export type { StandupInput, StandupResult } from './daily-standup.js';

// Export Infrastructure activities (Phase 10: Project Titan)
export { generateInfrastructure, validateInfrastructureBudget } from './infrastructure.js';
export type { InfrastructureInput, InfrastructureResult } from './infrastructure.js';
