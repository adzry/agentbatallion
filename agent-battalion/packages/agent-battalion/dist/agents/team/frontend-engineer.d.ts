/**
 * Frontend Engineer Agent
 *
 * Responsible for:
 * - Implementing UI components
 * - Writing React/Next.js code
 * - Integrating with APIs
 * - Ensuring responsive design
 * - Performance optimization
 */
import { BaseTeamAgent } from '../base-team-agent.js';
import { AgentTask, ArchitectureSpec, DesignSystem, ProjectFile, TechStack } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
export declare class FrontendEngineerAgent extends BaseTeamAgent {
    constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus);
    /**
     * Generate all frontend code based on architecture and design
     */
    generateCode(architecture: ArchitectureSpec, designSystem: DesignSystem, techStack: TechStack, fileStructure: string[]): Promise<ProjectFile[]>;
    /**
     * Generate file content using AI
     */
    private generateWithAI;
    /**
     * Post-process generated code to ensure quality
     */
    private postProcessCode;
    protected executeTask(task: AgentTask): Promise<any>;
    private generateFileContent;
    private getFileType;
    private generatePackageJson;
    private generateTsConfig;
    private generateNextConfig;
    private generatePostCssConfig;
    private generateEnvLocal;
    private generateGitignore;
    private generateLayout;
    private generateHomePage;
    private generateLoadingPage;
    private generateErrorPage;
    private generateNotFoundPage;
    private generateComponent;
    private generateHeader;
    private generateFooter;
    private generateNavigation;
    private generateHeroSection;
    private generateFeaturesSection;
    private generateButtonComponent;
    private generateInputComponent;
    private generateCardComponent;
    private generateModalComponent;
    private generateUtils;
    private generateConstants;
    private generateTypes;
    private generateHook;
    private generateApiRoute;
    private generateReadme;
    private toPascalCase;
    private implementComponent;
    private fixBug;
}
//# sourceMappingURL=frontend-engineer.d.ts.map