/**
 * Designer Agent
 *
 * Responsible for:
 * - Creating design systems
 * - Defining color palettes and typography
 * - Designing UI components
 * - Ensuring visual consistency
 * - Creating responsive layouts
 */
import { BaseTeamAgent } from '../base-team-agent.js';
import { AgentTask, Requirement, DesignSystem, ProjectContext } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
export declare class DesignerAgent extends BaseTeamAgent {
    constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus);
    /**
     * Create design system based on project requirements
     */
    createDesignSystem(requirements: Requirement[], projectContext: Partial<ProjectContext>): Promise<DesignSystem>;
    /**
     * Use AI to create design system
     */
    private createDesignWithAI;
    protected executeTask(task: AgentTask): Promise<any>;
    private analyzeDesignNeeds;
    private createColorPalette;
    private defineTypography;
    private createSpacingSystem;
    private designComponents;
    private generateDesignDoc;
    private generateTailwindConfig;
    private generateGlobalsCss;
    private reviewDesign;
    private createComponentStyles;
}
//# sourceMappingURL=designer.d.ts.map