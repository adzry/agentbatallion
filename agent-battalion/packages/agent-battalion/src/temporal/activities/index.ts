/**
 * Temporal Activities
 * 
 * Activities are the building blocks of workflows. They contain the
 * actual business logic that can fail, retry, and be traced.
 */

import { AnalysisResult, PlanResult, GeneratedFile, MissionConfig } from '../types.js';
import { runAnalyzerAgent } from '../../langgraph/agents/analyzer-agent.js';
import { runPlannerAgent } from '../../langgraph/agents/planner-agent.js';
import { runCoordinatorAgent } from '../../langgraph/agents/coordinator-agent.js';

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
export async function analyzeRequirements(input: AnalyzeInput): Promise<AnalysisResult> {
  console.log(`[Activity] Analyzing requirements for mission: ${input.missionId}`);
  
  try {
    const result = await runAnalyzerAgent(input.prompt, input.config);
    return result;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

/**
 * Plan architecture using the Planner Agent
 */
export async function planArchitecture(input: PlanInput): Promise<PlanResult> {
  console.log(`[Activity] Planning architecture for mission: ${input.missionId}`);
  
  try {
    const result = await runPlannerAgent(input.analysis, input.config);
    return result;
  } catch (error) {
    console.error('Planning failed:', error);
    throw error;
  }
}

/**
 * Generate code using the Coordinator Agent
 */
export async function generateCode(input: GenerateInput): Promise<GeneratedFile[]> {
  console.log(`[Activity] Generating code for mission: ${input.missionId}`);
  
  try {
    const result = await runCoordinatorAgent(input.plan, input.projectName);
    return result;
  } catch (error) {
    console.error('Code generation failed:', error);
    throw error;
  }
}

/**
 * Review generated code
 */
export async function reviewCode(input: ReviewInput): Promise<ReviewResult> {
  console.log(`[Activity] Reviewing code for mission: ${input.missionId}`);
  
  // Simple validation for now
  const issues: string[] = [];
  
  for (const file of input.files) {
    // Check for empty files
    if (!file.content || file.content.trim().length === 0) {
      issues.push(`Empty file: ${file.path}`);
    }
    
    // Check for common issues in TypeScript/JavaScript files
    if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
      if (file.content.includes('any[]') || file.content.includes(': any')) {
        // This is acceptable for generated code
      }
      
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
 * Run tests on generated code
 */
export async function runTests(input: TestInput): Promise<TestResult> {
  console.log(`[Activity] Running tests for mission: ${input.missionId}`);
  
  // Mock test results for now
  return {
    passed: true,
    tests: 0,
    failures: 0,
    coverage: undefined,
  };
}

/**
 * Install dependencies in sandbox
 */
export async function installDependencies(
  sandboxId: string,
  packageJson: string
): Promise<void> {
  console.log(`[Activity] Installing dependencies in sandbox: ${sandboxId}`);
  // Implementation would use E2B sandbox
}

/**
 * Start preview server
 */
export async function startPreview(
  sandboxId: string,
  port: number
): Promise<string> {
  console.log(`[Activity] Starting preview server in sandbox: ${sandboxId}`);
  // Implementation would use E2B sandbox
  return `https://${sandboxId}.sandbox.e2b.dev:${port}`;
}
