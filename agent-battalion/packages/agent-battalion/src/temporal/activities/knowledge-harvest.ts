/**
 * Knowledge Harvesting Activity
 * 
 * Extracts and stores learnings from completed missions
 * Part of Phase 6: "The Overmind" Global Knowledge Graph
 */

import { VectorMemory } from '../../memory/vector-memory.js';

export interface KnowledgeHarvestInput {
  missionId: string;
  initialCode: string;
  finalCode: string;
  techStack: string[];
  problemsSolved: string[];
}

export interface KnowledgeHarvestResult {
  success: boolean;
  patternsStored: number;
  error?: string;
}

/**
 * Harvest knowledge from a completed mission
 */
export async function harvestKnowledge(input: KnowledgeHarvestInput): Promise<KnowledgeHarvestResult> {
  console.log(`[Activity] Harvesting knowledge from mission: ${input.missionId}`);
  
  try {
    const globalKnowledge = new VectorMemory();
    await globalKnowledge.initialize();

    let patternsStored = 0;

    // Store problem-solution pairs
    for (const problem of input.problemsSolved) {
      // Extract the solution from the code diff
      const solution = `Fixed by modifying code. Tech stack: ${input.techStack.join(', ')}`;
      
      await globalKnowledge.storeSolutionPattern(
        problem,
        solution,
        [...input.techStack, 'mission:' + input.missionId]
      );
      
      patternsStored++;
    }

    // Store tech stack specific learnings
    if (input.techStack.length > 0) {
      const stackLearning = `Successfully built application with: ${input.techStack.join(', ')}`;
      await globalKnowledge.storeSolutionPattern(
        `How to set up ${input.techStack[0]} project`,
        stackLearning,
        input.techStack
      );
      patternsStored++;
    }

    // Analyze code changes for patterns
    if (input.initialCode && input.finalCode) {
      // Simple pattern detection (could be enhanced with AI)
      const patterns = detectPatterns(input.initialCode, input.finalCode);
      
      for (const pattern of patterns) {
        await globalKnowledge.storeSolutionPattern(
          pattern.problem,
          pattern.solution,
          [...input.techStack, 'code_pattern']
        );
        patternsStored++;
      }
    }

    console.log(`[Activity] Harvested ${patternsStored} knowledge patterns`);

    return {
      success: true,
      patternsStored,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Activity] Knowledge harvesting failed:', message);
    
    return {
      success: false,
      patternsStored: 0,
      error: message,
    };
  }
}

/**
 * Detect common patterns from code changes
 */
function detectPatterns(
  initialCode: string,
  finalCode: string
): Array<{ problem: string; solution: string }> {
  const patterns: Array<{ problem: string; solution: string }> = [];

  // Pattern: Added 'use client' directive
  if (!initialCode.includes("'use client'") && finalCode.includes("'use client'")) {
    patterns.push({
      problem: "React hooks used without 'use client' directive",
      solution: "Add 'use client' directive at the top of the file when using hooks like useState, useEffect in Next.js 13+",
    });
  }

  // Pattern: Added missing imports
  const initialImports = initialCode.match(/import .* from ['"].*['"]/g) || [];
  const finalImports = finalCode.match(/import .* from ['"].*['"]/g) || [];
  
  if (finalImports.length > initialImports.length) {
    patterns.push({
      problem: "Missing imports causing build errors",
      solution: "Always import required dependencies. Common ones: React, useState, useEffect from 'react'",
    });
  }

  // Pattern: Added type annotations
  if (!initialCode.includes(': any') && finalCode.includes(': any')) {
    patterns.push({
      problem: "TypeScript implicit any errors",
      solution: "Add explicit type annotations or use ': any' for dynamic types",
    });
  }

  // Pattern: Fixed async/await
  if (!initialCode.includes('async') && finalCode.includes('async')) {
    patterns.push({
      problem: "Promise handling without async/await",
      solution: "Use async/await for cleaner promise handling",
    });
  }

  return patterns;
}
