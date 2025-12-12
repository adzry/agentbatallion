/**
 * Analyzer Agent
 *
 * Responsible for analyzing user requirements and extracting structured
 * specifications for the app to be generated.
 */
import { BaseAgent } from '../base-agent.js';
import { AnalysisResult, MissionConfig } from '../../temporal/types.js';
export declare class AnalyzerAgent extends BaseAgent {
    constructor();
    protected getSystemPrompt(): string;
    protected execute(input: Record<string, any>): Promise<AnalysisResult>;
    private extractRequirements;
    private extractComponents;
    private extractDataModels;
    private extractRoutes;
    private extractFeatures;
}
/**
 * Run the analyzer agent
 */
export declare function runAnalyzerAgent(prompt: string, config?: MissionConfig): Promise<AnalysisResult>;
//# sourceMappingURL=analyzer-agent.d.ts.map