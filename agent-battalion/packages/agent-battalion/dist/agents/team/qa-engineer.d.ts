/**
 * QA Engineer Agent
 *
 * Responsible for:
 * - Reviewing code quality
 * - Validating against requirements
 * - Checking for bugs and issues
 * - Ensuring accessibility
 * - Testing responsiveness
 */
import { BaseTeamAgent } from '../base-team-agent.js';
import { AgentTask, ProjectFile, Requirement } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
export interface QAReport {
    passed: boolean;
    score: number;
    issues: QAIssue[];
    suggestions: string[];
    coverage: {
        requirements: number;
        components: number;
        accessibility: number;
    };
}
export interface QAIssue {
    id: string;
    severity: 'critical' | 'major' | 'minor' | 'info';
    category: 'bug' | 'accessibility' | 'performance' | 'security' | 'style' | 'best-practice';
    file: string;
    line?: number;
    message: string;
    suggestion?: string;
}
export declare class QAEngineerAgent extends BaseTeamAgent {
    constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus);
    /**
     * Review all generated code
     */
    reviewCode(files: ProjectFile[], requirements: Requirement[]): Promise<QAReport>;
    /**
     * Use AI for comprehensive code review
     */
    private reviewWithAI;
    protected executeTask(task: AgentTask): Promise<any>;
    private reviewFile;
    private checkRequirementsCoverage;
    private checkAccessibility;
    private calculateComponentCoverage;
    private calculateA11yScore;
    private generateSuggestions;
    private generateReportMarkdown;
    private suggestFixes;
}
//# sourceMappingURL=qa-engineer.d.ts.map