/**
 * Generation Workflow - Temporal Workflow Definition
 *
 * Orchestrates the full app generation process with:
 * - Durable execution
 * - Automatic retries
 * - Human feedback integration
 * - Checkpointing
 */
import type { ProjectFile } from '../../agents/types.js';
export interface GenerationWorkflowInput {
    projectId: string;
    userRequest: string;
    config?: {
        useRealAI?: boolean;
        requireApproval?: boolean;
        maxIterations?: number;
    };
}
export interface GenerationWorkflowOutput {
    projectId: string;
    success: boolean;
    files: ProjectFile[];
    stats: {
        totalFiles: number;
        totalLines: number;
        duration: number;
        iterations: number;
    };
    errors?: string[];
}
export declare const feedbackSignal: any;
export declare const cancelSignal: any;
/**
 * Main Generation Workflow
 */
export declare function generationWorkflow(input: GenerationWorkflowInput): Promise<GenerationWorkflowOutput>;
//# sourceMappingURL=generation-workflow.d.ts.map