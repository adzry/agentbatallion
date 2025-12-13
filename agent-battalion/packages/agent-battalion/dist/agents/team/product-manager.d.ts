/**
 * Product Manager Agent
 *
 * Responsible for:
 * - Understanding user requirements
 * - Creating product specifications
 * - Defining user stories and acceptance criteria
 * - Prioritizing features
 * - Coordinating with the team
 */
import { BaseTeamAgent } from '../base-team-agent.js';
import { AgentTask, Requirement, ProjectContext } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
export declare class ProductManagerAgent extends BaseTeamAgent {
    constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus);
    /**
     * Analyze user request and create requirements
     */
    analyzeRequest(userRequest: string): Promise<{
        requirements: Requirement[];
        projectContext: Partial<ProjectContext>;
    }>;
    /**
     * Use AI to analyze requirements
     */
    private analyzeWithAI;
    protected executeTask(task: AgentTask): Promise<any>;
    private extractRequirements;
    private structureRequirements;
    private determinePriority;
    private generateAcceptanceCriteria;
    private defineProjectContext;
    private extractProjectName;
    private generatePRD;
    private refineRequirements;
    private prioritizeFeatures;
}
//# sourceMappingURL=product-manager.d.ts.map