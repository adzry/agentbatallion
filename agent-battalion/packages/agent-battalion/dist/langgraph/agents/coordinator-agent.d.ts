/**
 * Coordinator Agent
 *
 * Orchestrates the code generation process, managing multiple coder agents
 * and ensuring files are generated in the correct order with proper
 * dependencies.
 */
import { BaseAgent } from '../base-agent.js';
import { PlanResult, GeneratedFile } from '../../temporal/types.js';
export declare class CoordinatorAgent extends BaseAgent {
    constructor();
    protected getSystemPrompt(): string;
    protected execute(input: Record<string, any>): Promise<GeneratedFile[]>;
    private executePhase;
    private executeTask;
    private generateFileContent;
    private getFileType;
    private generatePackageJson;
    private generateTsConfig;
    private generateNextConfig;
    private generateTailwindConfig;
    private generatePostCssConfig;
    private generateLayout;
    private generateGlobalsCss;
    private generateHomePage;
    private generatePage;
    private generateReadme;
    private generateComponent;
}
/**
 * Run the coordinator agent
 */
export declare function runCoordinatorAgent(plan: PlanResult, projectName: string): Promise<GeneratedFile[]>;
//# sourceMappingURL=coordinator-agent.d.ts.map