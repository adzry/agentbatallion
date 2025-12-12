/**
 * Architect Agent
 *
 * Responsible for:
 * - Designing system architecture
 * - Defining component structure
 * - Planning data models and APIs
 * - Making technology decisions
 * - Creating technical specifications
 */
import { BaseTeamAgent } from '../base-team-agent.js';
import { AgentTask, Requirement, ArchitectureSpec, TechStack, ProjectContext } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
export declare class ArchitectAgent extends BaseTeamAgent {
    constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus);
    /**
     * Design architecture based on requirements
     */
    designArchitecture(requirements: Requirement[], projectContext: Partial<ProjectContext>): Promise<{
        architecture: ArchitectureSpec;
        fileStructure: string[];
        techStack: TechStack;
    }>;
    /**
     * Use AI to design architecture
     */
    private designWithAI;
    protected executeTask(task: AgentTask): Promise<any>;
    private analyzeForArchitecture;
    private defineTechStack;
    private designComponents;
    private createArchitectureSpec;
    private planFileStructure;
    private categorizeComponent;
    private toKebabCase;
    private generateArchDoc;
    private reviewArchitecture;
    private optimizeArchitecture;
}
//# sourceMappingURL=architect.d.ts.map