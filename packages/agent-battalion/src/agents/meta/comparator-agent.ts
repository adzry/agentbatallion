/**
 * Comparator Agent - Architectural A/B Testing
 * 
 * Compares outcomes of parallel mission forks
 * Part of Phase 9: "Chronos"
 */

import { AIAgent } from '../ai-agent.js';
import { AgentProfile, AgentTask, ProjectFile } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';

export interface ComparisonResult {
  winner: 'A' | 'B' | 'tie';
  reasoning: string;
  scores: {
    A: {
      architecture: number;
      performance: number;
      maintainability: number;
      scalability: number;
      overall: number;
    };
    B: {
      architecture: number;
      performance: number;
      maintainability: number;
      scalability: number;
      overall: number;
    };
  };
  recommendations: string[];
}

export class ComparatorAgent extends AIAgent {
  constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus) {
    const profile: AgentProfile = {
      id: 'comparator-agent',
      name: 'Oracle',
      role: 'tech_lead',
      avatar: '⚖️',
      description: 'Tech Lead - Compares architectural approaches and recommends best path',
      capabilities: {
        canWriteCode: false,
        canDesign: false,
        canTest: false,
        canDeploy: false,
        canResearch: true,
        canReview: true,
        languages: [],
        frameworks: [],
      },
      personality: 'Analytical and objective. Makes data-driven architectural decisions.',
      systemPrompt: `You are Oracle, a Tech Lead AI agent specializing in architectural comparison.

Your mission: Compare two parallel implementations and determine the better approach.

Evaluate based on:
1. Architecture quality and design patterns
2. Performance and scalability
3. Maintainability and code quality
4. Implementation complexity
5. Future extensibility

Be objective and provide clear reasoning for your assessment.`,
    };

    super(profile, memory, tools, messageBus, {
      useRealAI: true,
      llmConfig: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        temperature: 0.3,
      },
    });
  }

  /**
   * Compare two architectural outcomes
   */
  async compareOutcomes(
    resultA: { files: ProjectFile[]; description: string },
    resultB: { files: ProjectFile[]; description: string }
  ): Promise<ComparisonResult> {
    this.think('Comparing two architectural approaches...');
    
    const prompt = `Compare these two parallel implementations:

APPROACH A: ${resultA.description}
Files: ${resultA.files.length}
Key files: ${resultA.files.slice(0, 5).map(f => f.path).join(', ')}

APPROACH B: ${resultB.description}
Files: ${resultB.files.length}
Key files: ${resultB.files.slice(0, 5).map(f => f.path).join(', ')}

Analyze both approaches and provide a comprehensive comparison.

Return JSON:
{
  "winner": "A" | "B" | "tie",
  "reasoning": "detailed explanation of why this approach is better",
  "scores": {
    "A": {
      "architecture": 0-10,
      "performance": 0-10,
      "maintainability": 0-10,
      "scalability": 0-10,
      "overall": 0-10
    },
    "B": {
      "architecture": 0-10,
      "performance": 0-10,
      "maintainability": 0-10,
      "scalability": 0-10,
      "overall": 0-10
    }
  },
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

    try {
      const result = await this.promptJSON<ComparisonResult>(prompt);
      
      this.think(`Winner: ${result.winner} (A: ${result.scores.A.overall}/10, B: ${result.scores.B.overall}/10)`);
      
      return result;
    } catch (error) {
      this.think(`Comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback comparison
      return {
        winner: 'tie',
        reasoning: 'Unable to perform detailed comparison. Both approaches appear viable.',
        scores: {
          A: {
            architecture: 7,
            performance: 7,
            maintainability: 7,
            scalability: 7,
            overall: 7,
          },
          B: {
            architecture: 7,
            performance: 7,
            maintainability: 7,
            scalability: 7,
            overall: 7,
          },
        },
        recommendations: [
          'Manual review recommended',
          'Consider hybrid approach',
          'Test both in production',
        ],
      };
    }
  }

  protected async executeTask(task: AgentTask): Promise<any> {
    if (task.parameters?.resultA && task.parameters?.resultB) {
      return await this.compareOutcomes(
        task.parameters.resultA,
        task.parameters.resultB
      );
    }
    throw new Error('Task must have resultA and resultB parameters');
  }
}
