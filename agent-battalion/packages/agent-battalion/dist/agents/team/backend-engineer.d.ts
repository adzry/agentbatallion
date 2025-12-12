/**
 * Backend Engineer Agent
 *
 * Responsible for:
 * - Database schema design (Prisma)
 * - API route generation
 * - Server-side logic
 * - Authentication setup
 * - Data validation
 */
import { BaseTeamAgent } from '../base-team-agent.js';
import { AgentTask, Requirement, ArchitectureSpec, DataModel, ProjectFile } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
export interface BackendOutput {
    schema: string;
    apiRoutes: ProjectFile[];
    middleware: ProjectFile[];
    utils: ProjectFile[];
}
export declare class BackendEngineerAgent extends BaseTeamAgent {
    constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus);
    /**
     * Generate backend code based on requirements and data models
     */
    generateBackend(requirements: Requirement[], dataModels: DataModel[], architecture: ArchitectureSpec): Promise<BackendOutput>;
    protected executeTask(task: AgentTask): Promise<any>;
    private generatePrismaSchema;
    private mapToPrismaType;
    private generateApiRoutes;
    private generateListCreateRoute;
    private generateCrudRoute;
    private mapToZodType;
    private generateAuthRegisterRoute;
    private generateAuthLoginRoute;
    private generateMiddleware;
    private generateUtils;
}
//# sourceMappingURL=backend-engineer.d.ts.map