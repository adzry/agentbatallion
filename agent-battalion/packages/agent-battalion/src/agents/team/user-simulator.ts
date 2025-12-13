/**
 * User Simulator Agent
 * 
 * Simulates end-user behavior to test applications behaviorally
 * Part of Phase 3: Dynamic Swarm & Simulation
 */

import { AIAgent } from '../ai-agent.js';
import { AgentProfile, AgentTask } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
import { E2BSandbox } from '../../sandbox/e2b-sandbox.js';

export interface UserJourneyResult {
  success: boolean;
  steps: string[];
  logs: string[];
  errors: string[];
  duration: number;
}

export class UserSimulatorAgent extends AIAgent {
  constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus) {
    const profile: AgentProfile = {
      id: 'user-simulator-agent',
      name: 'Alex',
      role: 'qa_engineer',
      avatar: '👤',
      description: 'End User Simulator - Tests applications from user perspective',
      capabilities: {
        canWriteCode: true,
        canDesign: false,
        canTest: true,
        canDeploy: false,
        canResearch: false,
        canReview: true,
        languages: ['JavaScript'],
        frameworks: ['Puppeteer'],
      },
      personality: 'Curious and thorough. Thinks like a real user, exploring edge cases.',
      systemPrompt: `You are Alex, an End User Simulator AI agent.

Your mission: Simulate real user interactions to test application functionality.

RULES:
1. Generate Puppeteer scripts to interact with the application
2. Click buttons, fill forms, navigate pages
3. Test user flows from start to finish
4. Report what works and what breaks
5. Think like a real user, not a developer
6. Be thorough but realistic

Output JavaScript code that uses Puppeteer to test the user journey.`,
    };

    super(profile, memory, tools, messageBus, {
      useRealAI: true,
      llmConfig: {
        provider: 'anthropic',
        temperature: 0.7,
      },
    });
  }

  /**
   * Simulate a user journey on the running application
   */
  async simulateUserJourney(
    appUrl: string,
    goal: string,
    sandbox?: E2BSandbox
  ): Promise<UserJourneyResult> {
    this.think(`Simulating user journey: ${goal}`);
    
    const startTime = Date.now();
    const steps: string[] = [];
    const logs: string[] = [];
    const errors: string[] = [];

    try {
      // Generate the puppeteer script
      const script = await this.generateUserScript(appUrl, goal);
      steps.push('Generated user interaction script');

      // If sandbox is provided, execute the script
      if (sandbox) {
        const result = await this.executeUserScript(sandbox, script);
        logs.push(...result.logs);
        errors.push(...result.errors);
        steps.push(...result.steps);
      } else {
        steps.push('Skipped execution (no sandbox provided)');
      }

      const duration = Date.now() - startTime;

      return {
        success: errors.length === 0,
        steps,
        logs,
        errors,
        duration,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.think(`User simulation failed: ${errorMsg}`);
      
      return {
        success: false,
        steps,
        logs,
        errors: [...errors, errorMsg],
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Generate a Puppeteer script for the user journey
   */
  private async generateUserScript(appUrl: string, goal: string): Promise<string> {
    const prompt = `Generate a Puppeteer script to test this user journey:

URL: ${appUrl}
Goal: ${goal}

Create a Node.js script that:
1. Launches headless Chrome
2. Navigates to the URL
3. Performs user actions to achieve the goal (click, type, etc.)
4. Logs progress
5. Captures any errors
6. Closes browser

Example structure:
\`\`\`javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto('${appUrl}');
    console.log('✓ Page loaded');
    
    // Your user journey steps here
    
    console.log('✓ Journey complete');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
\`\`\`

Generate NOW (code only):`;

    try {
      const response = await this.prompt(prompt);
      
      // Extract code
      let code = response;
      const codeMatch = response.match(/```(?:javascript|js)?\s*([\s\S]*?)```/);
      if (codeMatch) {
        code = codeMatch[1].trim();
      }
      
      return code;
    } catch (error) {
      // Fallback script
      return this.generateFallbackScript(appUrl, goal);
    }
  }

  /**
   * Execute the user script in the sandbox
   */
  private async executeUserScript(
    sandbox: E2BSandbox,
    script: string
  ): Promise<{
    steps: string[];
    logs: string[];
    errors: string[];
  }> {
    const steps: string[] = [];
    const logs: string[] = [];
    const errors: string[] = [];
    const scriptPath = '/tmp/user-simulation.js';

    try {
      // Check if puppeteer is installed
      steps.push('Checking Puppeteer installation');
      const checkResult = await sandbox.execute('npm list puppeteer');
      
      if (!checkResult.success || checkResult.exitCode !== 0) {
        steps.push('Installing Puppeteer');
        const installResult = await sandbox.execute('npm install puppeteer');
        if (!installResult.success) {
          errors.push('Failed to install Puppeteer: ' + installResult.stderr);
          return { steps, logs, errors };
        }
      }

      // Write the script
      steps.push('Writing simulation script');
      await sandbox.writeFiles([{ path: scriptPath, content: script }]);

      // Execute the script
      steps.push('Executing user simulation');
      const execResult = await sandbox.execute(`node ${scriptPath}`);
      
      if (execResult.stdout) {
        logs.push(execResult.stdout);
      }
      
      if (!execResult.success) {
        errors.push(execResult.stderr || 'Script execution failed');
      } else {
        steps.push('User simulation completed successfully');
      }

      // Cleanup
      await sandbox.execute(`rm ${scriptPath}`).catch(() => {
        // Ignore cleanup errors
      });

      return { steps, logs, errors };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { steps, logs, errors };
    }
  }

  /**
   * Generate a simple fallback script
   */
  private generateFallbackScript(appUrl: string, goal: string): string {
    return `const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('Navigating to ${appUrl}...');
    await page.goto('${appUrl}', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('✓ Page loaded successfully');
    
    // Get page title
    const title = await page.title();
    console.log(\`✓ Page title: \${title}\`);
    
    // Check for common elements
    const hasButtons = await page.$$('button').then(btns => btns.length > 0);
    console.log(\`✓ Found buttons: \${hasButtons}\`);
    
    const hasLinks = await page.$$('a').then(links => links.length > 0);
    console.log(\`✓ Found links: \${hasLinks}\`);
    
    console.log('✓ Basic simulation complete');
    console.log('Goal: ${goal}');
    
  } catch (error) {
    console.error('✗ Simulation error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();`;
  }

  protected async executeTask(task: AgentTask): Promise<any> {
    if (task.description) {
      return await this.simulateUserJourney(
        task.parameters?.appUrl || 'http://localhost:3000',
        task.description
      );
    }
    throw new Error('Task must have a description');
  }
}
