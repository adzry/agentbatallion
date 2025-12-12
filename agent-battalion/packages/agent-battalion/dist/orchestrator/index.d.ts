/**
 * Orchestrator
 *
 * High-level API for the Agent Battalion system.
 * Provides a simple interface for generating applications.
 */
import { MissionInput, MissionResult, MissionConfig, GeneratedFile } from '../temporal/types.js';
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
export declare class Orchestrator {
    private useTemporalWorkflows;
    constructor(options?: {
        useTemporalWorkflows?: boolean;
    });
    /**
     * Generate an application from a prompt
     */
    generate(prompt: string, options?: GenerationOptions): Promise<GenerationResult>;
    /**
     * Generate using Temporal workflows (for production use)
     */
    generateWithWorkflow(prompt: string, options?: GenerationOptions): Promise<string>;
    /**
     * Extract a project name from the prompt
     */
    private extractProjectName;
}
/**
 * Create a new orchestrator instance
 */
export declare function createOrchestrator(options?: {
    useTemporalWorkflows?: boolean;
}): Orchestrator;
/**
 * Quick generate function for simple use cases
 */
export declare function quickGenerate(prompt: string, options?: GenerationOptions): Promise<GenerationResult>;
export { MissionInput, MissionResult, MissionConfig, GeneratedFile };
//# sourceMappingURL=index.d.ts.map