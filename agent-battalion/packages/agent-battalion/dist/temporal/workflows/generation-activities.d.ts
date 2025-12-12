/**
 * Generation Activities - Temporal Activity Definitions
 *
 * These activities are executed by the Temporal worker and can be
 * retried, timed out, and monitored independently.
 */
import type { ProjectFile, Requirement, ArchitectureSpec, DesignSystem, ProjectContext, DataModel } from '../../agents/types.js';
/**
 * Analyze requirements from user request
 */
export declare function analyzeRequirements(projectId: string, userRequest: string): Promise<{
    requirements: Requirement[];
    context: ProjectContext;
}>;
/**
 * Design system architecture
 */
export declare function designArchitecture(projectId: string, requirements: Requirement[], context: ProjectContext): Promise<{
    architecture: ArchitectureSpec;
    fileStructure: string[];
}>;
/**
 * Create design system
 */
export declare function createDesignSystem(projectId: string, requirements: Requirement[], context: ProjectContext): Promise<{
    designSystem: DesignSystem;
    files: ProjectFile[];
}>;
/**
 * Generate frontend code
 */
export declare function generateFrontend(projectId: string, architecture: ArchitectureSpec, designSystem: DesignSystem): Promise<ProjectFile[]>;
/**
 * Generate backend code
 */
export declare function generateBackend(projectId: string, requirements: Requirement[], dataModels: DataModel[], architecture: ArchitectureSpec): Promise<{
    schema: string;
    apiRoutes: ProjectFile[];
    middleware: ProjectFile[];
    utils: ProjectFile[];
}>;
/**
 * Review code quality
 */
export declare function reviewCode(projectId: string, files: ProjectFile[], requirements: Requirement[]): Promise<{
    score: number;
    issues: Array<{
        severity: string;
        message: string;
        file: string;
    }>;
    suggestions: string[];
}>;
/**
 * Audit security
 */
export declare function auditSecurity(projectId: string, files: ProjectFile[]): Promise<{
    score: number;
    grade: string;
    issues: Array<{
        severity: string;
        title: string;
        description: string;
    }>;
}>;
/**
 * Request human feedback
 */
export declare function requestFeedback(projectId: string, request: {
    type: string;
    title: string;
    content: string;
    agentId: string;
}): Promise<void>;
/**
 * Deploy to sandbox
 */
export declare function deployToSandbox(projectId: string, files: ProjectFile[]): Promise<{
    success: boolean;
    url?: string;
    logs: string[];
}>;
/**
 * Store project files
 */
export declare function storeFiles(projectId: string, files: ProjectFile[]): Promise<void>;
/**
 * Send notification
 */
export declare function sendNotification(projectId: string, type: string, message: string): Promise<void>;
//# sourceMappingURL=generation-activities.d.ts.map