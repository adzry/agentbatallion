/**
 * Planner Agent
 *
 * Takes analysis results and creates an execution plan for building
 * the application. Determines file structure, dependencies, and
 * build order.
 */
import { BaseAgent } from '../base-agent.js';
import { AnalysisResult, PlanResult, MissionConfig } from '../../temporal/types.js';
export declare class PlannerAgent extends BaseAgent {
    constructor();
    protected getSystemPrompt(): string;
    protected execute(input: Record<string, any>): Promise<PlanResult>;
    private planFileStructure;
    private createBuildPhases;
    private buildDependencyGraph;
}
/**
 * Run the planner agent
 */
export declare function runPlannerAgent(analysis: AnalysisResult, config?: MissionConfig): Promise<PlanResult>;
//# sourceMappingURL=planner-agent.d.ts.map