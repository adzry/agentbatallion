/**
 * Mobile Agent
 *
 * Responsible for:
 * - React Native / Expo project generation
 * - Mobile UI components
 * - Navigation setup
 * - Platform-specific code
 * - Mobile best practices
 */
import { BaseTeamAgent } from '../base-team-agent.js';
import { AgentTask, Requirement, ArchitectureSpec, DesignSystem, ProjectFile } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
export interface MobileOutput {
    projectType: 'expo' | 'react-native-cli';
    files: ProjectFile[];
    screens: string[];
    components: string[];
}
export declare class MobileAgent extends BaseTeamAgent {
    constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus);
    /**
     * Generate mobile app code
     */
    generateMobileApp(requirements: Requirement[], designSystem: DesignSystem, architecture?: ArchitectureSpec): Promise<MobileOutput>;
    protected executeTask(task: AgentTask): Promise<any>;
    private generateConfigFiles;
    private generateNavigation;
    private generateTheme;
    private generateComponents;
    private generateScreens;
    private generateUtils;
}
//# sourceMappingURL=mobile-agent.d.ts.map