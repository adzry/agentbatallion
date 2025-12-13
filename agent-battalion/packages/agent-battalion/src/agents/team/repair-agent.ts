/**
 * Repair Agent - Autonomous Code Repair
 * 
 * Analyzes build/test failures and automatically fixes them
 * Part of Phase 4: "Lazarus Protocol" Self-Healing
 */

import { AIAgent } from '../ai-agent.js';
import { AgentProfile, AgentTask } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';

export interface RepairResult {
  fixed: boolean;
  fixedCode: string;
  explanation: string;
  attempts: number;
}

export class RepairAgent extends AIAgent {
  constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus) {
    const profile: AgentProfile = {
      id: 'repair-agent',
      name: 'Doc',
      role: 'backend_engineer',
      avatar: '🚑',
      description: 'Code Repair Specialist - Fixes build and runtime errors autonomously',
      capabilities: {
        canWriteCode: true,
        canDesign: false,
        canTest: true,
        canDeploy: false,
        canResearch: true,
        canReview: true,
        languages: ['TypeScript', 'JavaScript', 'Python'],
        frameworks: ['Next.js', 'React', 'Node.js'],
      },
      personality: 'Methodical and persistent. Expert at diagnosing and fixing code issues.',
      systemPrompt: `You are Doc, a Senior SRE and Code Repair Specialist AI agent.

Your mission: Diagnose build/test failures and generate fixes automatically.

EXPERTISE:
- TypeScript/JavaScript errors
- Missing imports and dependencies
- Type mismatches
- Syntax errors
- Configuration issues
- Runtime errors

PROCESS:
1. Analyze the error message and stack trace
2. Review the failing code
3. Identify the root cause
4. Generate a corrected version
5. Explain what was wrong and how you fixed it

RULES:
- Return ONLY the fixed code, no markdown
- Preserve the original structure and logic
- Fix ONLY what's broken
- Add missing imports if needed
- Ensure type safety

Be surgical and precise. Make minimal changes.`,
    };

    super(profile, memory, tools, messageBus, {
      useRealAI: true,
      llmConfig: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        temperature: 0.3, // Lower temperature for more precise fixes
      },
    });
  }

  /**
   * Diagnose and fix a code error
   */
  async diagnoseAndFix(
    errorCode: string,
    fileContext: string,
    filePath: string
  ): Promise<RepairResult> {
    this.think(`Analyzing error in ${filePath}...`);
    
    try {
      const prompt = `You are fixing a build/test error. Analyze and fix the code.

ERROR:
\`\`\`
${errorCode}
\`\`\`

FILE: ${filePath}
CURRENT CODE:
\`\`\`typescript
${fileContext}
\`\`\`

TASK:
1. Identify what's causing the error
2. Generate the FIXED version of the entire file
3. Explain what was wrong

Return JSON:
{
  "fixedCode": "complete fixed file content here",
  "explanation": "brief explanation of the fix"
}

Common fixes:
- Add missing imports (e.g., "import { X } from 'Y';")
- Fix type errors by adding proper types
- Correct syntax errors
- Fix undefined references
- Update configuration

Return the complete fixed code, not just the changed lines.`;

      interface FixResponse {
        fixedCode: string;
        explanation: string;
      }

      const response = await this.promptJSON<FixResponse>(prompt);
      
      this.think(`Fix generated: ${response.explanation}`);
      
      return {
        fixed: true,
        fixedCode: response.fixedCode,
        explanation: response.explanation,
        attempts: 1,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.think(`Repair failed: ${errorMsg}`);
      
      // Try a simpler approach
      return await this.attemptSimpleFix(errorCode, fileContext);
    }
  }

  /**
   * Attempt a simple pattern-based fix
   */
  private async attemptSimpleFix(
    errorCode: string,
    fileContext: string
  ): Promise<RepairResult> {
    this.think('Attempting pattern-based fix...');
    
    let fixedCode = fileContext;
    let explanation = 'Applied pattern-based fixes: ';
    const fixes: string[] = [];

    // Fix common missing imports
    if (errorCode.includes("Cannot find name 'React'")) {
      if (!fixedCode.includes("import React from 'react'")) {
        fixedCode = "import React from 'react';\n" + fixedCode;
        fixes.push('Added React import');
      }
    }

    if (errorCode.includes("Cannot find name 'useState'") || 
        errorCode.includes("Cannot find name 'useEffect'")) {
      if (!fixedCode.includes('import {') && !fixedCode.includes('useState')) {
        const hooks: string[] = [];
        if (errorCode.includes('useState')) hooks.push('useState');
        if (errorCode.includes('useEffect')) hooks.push('useEffect');
        fixedCode = `import { ${hooks.join(', ')} } from 'react';\n` + fixedCode;
        fixes.push(`Added React hooks: ${hooks.join(', ')}`);
      }
    }

    // Fix type errors for event handlers
    if (errorCode.includes('Parameter') && errorCode.includes('implicitly has an')) {
      fixedCode = fixedCode.replace(
        /(\w+)\s*=>\s*{/g,
        '($1: any) => {'
      );
      fixes.push('Added any type to event handlers');
    }

    // Fix missing 'use client' directive
    if (errorCode.includes('useState') && !fixedCode.startsWith("'use client'")) {
      fixedCode = "'use client';\n\n" + fixedCode;
      fixes.push("Added 'use client' directive");
    }

    explanation += fixes.join(', ') || 'No automatic fixes applied';

    return {
      fixed: fixes.length > 0,
      fixedCode,
      explanation,
      attempts: 1,
    };
  }

  protected async executeTask(task: AgentTask): Promise<any> {
    if (task.parameters?.errorCode && task.parameters?.fileContext) {
      return await this.diagnoseAndFix(
        task.parameters.errorCode,
        task.parameters.fileContext,
        task.parameters.filePath || 'unknown'
      );
    }
    throw new Error('Task must have errorCode and fileContext parameters');
  }
}
