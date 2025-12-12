/**
 * Orchestrator
 * 
 * High-level API for the Agent Battalion system.
 * Provides a simple interface for generating applications.
 */

import { v4 as uuidv4 } from 'uuid';
import { MissionInput, MissionResult, MissionConfig, GeneratedFile } from '../temporal/types.js';
import { runAnalyzerAgent } from '../langgraph/agents/analyzer-agent.js';
import { runPlannerAgent } from '../langgraph/agents/planner-agent.js';
import { runCoordinatorAgent } from '../langgraph/agents/coordinator-agent.js';

export interface GenerationOptions {
  projectName?: string;
  framework?: 'nextjs' | 'react' | 'vue' | 'svelte';
  styling?: 'tailwind' | 'css-modules' | 'styled-components';
  typescript?: boolean;
  testing?: boolean;
  features?: string[];
  onProgress?: (progress: GenerationProgress) => void;
}

export interface GenerationProgress {
  phase: string;
  message: string;
  progress: number;
}

export interface GenerationResult {
  missionId: string;
  success: boolean;
  files: GeneratedFile[];
  error?: string;
  duration: number;
}

/**
 * Main Orchestrator class
 */
export class Orchestrator {
  private useTemporalWorkflows: boolean;

  constructor(options: { useTemporalWorkflows?: boolean } = {}) {
    this.useTemporalWorkflows = options.useTemporalWorkflows || false;
  }

  /**
   * Generate an application from a prompt
   */
  async generate(prompt: string, options: GenerationOptions = {}): Promise<GenerationResult> {
    const missionId = uuidv4();
    const startTime = Date.now();
    const { onProgress } = options;

    try {
      // Create config from options
      const config: MissionConfig = {
        framework: options.framework || 'nextjs',
        styling: options.styling || 'tailwind',
        typescript: options.typescript !== false,
        testing: options.testing || false,
        features: options.features || [],
      };

      const projectName = options.projectName || this.extractProjectName(prompt);

      // Phase 1: Analyze
      onProgress?.({ phase: 'analyzing', message: 'Analyzing requirements...', progress: 10 });
      const analysis = await runAnalyzerAgent(prompt, config);

      // Phase 2: Plan
      onProgress?.({ phase: 'planning', message: 'Planning architecture...', progress: 30 });
      const plan = await runPlannerAgent(analysis, config);

      // Phase 3: Generate
      onProgress?.({ phase: 'generating', message: 'Generating code...', progress: 50 });
      const files = await runCoordinatorAgent(plan, projectName);

      // Complete
      onProgress?.({ phase: 'complete', message: 'Generation complete!', progress: 100 });

      return {
        missionId,
        success: true,
        files,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      onProgress?.({ phase: 'error', message: errorMessage, progress: 0 });

      return {
        missionId,
        success: false,
        files: [],
        error: errorMessage,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Generate using Temporal workflows (for production use)
   */
  async generateWithWorkflow(prompt: string, options: GenerationOptions = {}): Promise<string> {
    // This would start a Temporal workflow and return the workflow ID
    // For now, just throw an error indicating this requires Temporal
    throw new Error('Temporal workflows not configured. Use generate() instead.');
  }

  /**
   * Extract a project name from the prompt
   */
  private extractProjectName(prompt: string): string {
    const patterns = [
      /(?:build|create|make|generate)\s+(?:a|an|the)?\s*(.+?)\s*(?:app|application|website|site)/i,
      /(.+?)\s*(?:app|application|website|site)/i,
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        return match[1]
          .trim()
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
    }

    return 'My App';
  }
}

/**
 * Create a new orchestrator instance
 */
export function createOrchestrator(options?: { useTemporalWorkflows?: boolean }): Orchestrator {
  return new Orchestrator(options);
}

/**
 * Quick generate function for simple use cases
 */
export async function quickGenerate(
  prompt: string,
  options?: GenerationOptions
): Promise<GenerationResult> {
  const orchestrator = new Orchestrator();
  return orchestrator.generate(prompt, options);
}

// Re-export types
export { MissionInput, MissionResult, MissionConfig, GeneratedFile };
