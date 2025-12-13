/**
 * Infrastructure Generation Activity
 * 
 * Generates Infrastructure as Code based on application requirements
 * Part of Phase 10: "Project Titan"
 */

import { DevOpsEngineerAgent, InfrastructureRequirements } from '../../agents/team/devops-engineer.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
import { ProjectFile } from '../../agents/types.js';

export interface InfrastructureInput {
  missionId: string;
  appType: string;
  expectedTraffic: string;
  database?: string;
  storage?: string;
  budget: string;
  region?: string;
}

export interface InfrastructureResult {
  success: boolean;
  provider?: string;
  files?: ProjectFile[];
  estimatedCost?: string;
  resources?: Array<{
    type: string;
    name: string;
    purpose: string;
  }>;
  setupInstructions?: string;
  error?: string;
}

/**
 * Generate infrastructure code
 */
export async function generateInfrastructure(input: InfrastructureInput): Promise<InfrastructureResult> {
  console.log(`[Activity] Generating infrastructure for mission: ${input.missionId}`);
  console.log(`[Activity] App type: ${input.appType}, Budget: ${input.budget}`);
  
  try {
    const memory = new MemoryManager();
    const tools = new ToolRegistry();
    const messageBus = new MessageBus();
    const devopsAgent = new DevOpsEngineerAgent(memory, tools, messageBus);

    const requirements: InfrastructureRequirements = {
      appType: input.appType,
      expectedTraffic: input.expectedTraffic,
      database: input.database,
      storage: input.storage,
      budget: input.budget,
      region: input.region,
    };

    const result = await devopsAgent.generateInfrastructure(requirements);

    console.log(`[Activity] Infrastructure generated: ${result.files.length} files`);
    console.log(`[Activity] Estimated cost: ${result.estimatedCost}`);
    console.log(`[Activity] Resources: ${result.resources.length}`);

    return {
      success: true,
      provider: result.provider,
      files: result.files,
      estimatedCost: result.estimatedCost,
      resources: result.resources,
      setupInstructions: result.setupInstructions,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Activity] Infrastructure generation failed:', message);
    
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Validate infrastructure budget
 */
export async function validateInfrastructureBudget(input: {
  estimatedCost: string;
  maxBudget: string;
}): Promise<{
  withinBudget: boolean;
  estimated: number;
  maximum: number;
  savings?: string[];
}> {
  console.log(`[Activity] Validating budget: estimated ${input.estimatedCost}, max ${input.maxBudget}`);
  
  // Parse cost strings (e.g., "$50-125/month" or "$100/month")
  const parseRange = (cost: string): number => {
    const match = cost.match(/\$(\d+)(?:-(\d+))?/);
    if (!match) return 0;
    // Use upper bound if range, otherwise use single value
    return parseInt(match[2] || match[1]);
  };

  const estimated = parseRange(input.estimatedCost);
  const maximum = parseRange(input.maxBudget);

  const withinBudget = estimated <= maximum;

  const savings: string[] = [];
  if (!withinBudget) {
    savings.push('Use smaller instance types (t3.micro instead of t3.medium)');
    savings.push('Enable single NAT gateway instead of multi-AZ');
    savings.push('Use Aurora Serverless for database (pay per use)');
    savings.push('Reduce log retention period');
    savings.push('Use Reserved Instances for 1-year commitment');
  }

  return {
    withinBudget,
    estimated,
    maximum,
    savings: savings.length > 0 ? savings : undefined,
  };
}
