/**
 * Security Agent
 *
 * Responsible for:
 * - Security vulnerability scanning
 * - Authentication review
 * - Input validation checks
 * - Dependency auditing
 * - Security best practices enforcement
 */
import { BaseTeamAgent } from '../base-team-agent.js';
import { AgentTask, ProjectFile } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
export interface SecurityIssue {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    category: SecurityCategory;
    title: string;
    description: string;
    file?: string;
    line?: number;
    recommendation: string;
    cwe?: string;
}
export type SecurityCategory = 'injection' | 'authentication' | 'authorization' | 'xss' | 'csrf' | 'sensitive_data' | 'misconfiguration' | 'dependency' | 'cryptography' | 'logging';
export interface SecurityReport {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    issues: SecurityIssue[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
    };
    recommendations: string[];
    passedChecks: string[];
}
export declare class SecurityAgent extends BaseTeamAgent {
    constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus);
    /**
     * Perform security audit on project files
     */
    auditSecurity(files: ProjectFile[]): Promise<SecurityReport>;
    protected executeTask(task: AgentTask): Promise<any>;
    private scanFile;
    private checkMissingSecurityMeasures;
    private auditDependencies;
    private generateReport;
    private formatReportMarkdown;
}
//# sourceMappingURL=security-agent.d.ts.map