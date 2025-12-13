/**
 * UI Preview Agent - Fast-track "Hallucination" UI Generator
 * 
 * Uses a fast LLM (Gemini Flash) to provide immediate visual feedback
 * while the main architect is still planning.
 * 
 * Part of Phase 1: "Nano Banana" Strategy
 */

import { AIAgent } from '../ai-agent.js';
import { AgentProfile } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';

export class UIPreviewAgent extends AIAgent {
  constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus) {
    const profile: AgentProfile = {
      id: 'ui-preview-agent',
      name: 'Flash',
      role: 'designer',
      avatar: '⚡',
      description: 'Rapid UI Prototyper - Provides instant visual mockups',
      capabilities: {
        canWriteCode: true,
        canDesign: true,
        canTest: false,
        canDeploy: false,
        canResearch: false,
        canReview: false,
        languages: ['TypeScript', 'JSX'],
        frameworks: ['React', 'Tailwind CSS'],
      },
      personality: 'Lightning-fast and creative. Optimized for speed over perfection.',
      systemPrompt: `You are Flash, a Rapid UI Prototyper AI agent.

Your mission: Generate instant UI previews to provide immediate visual feedback.

RULES:
1. Ignore backend logic, authentication, and database concerns
2. Output a SINGLE-FILE React component using Tailwind CSS
3. Use lucide-react icons (assume they're available)
4. Use MOCK DATA only - hardcode everything
5. Focus on visual appeal and layout
6. Output RAW JSX ONLY - no explanations, no markdown
7. Component should be named "Preview"
8. Make it beautiful and modern

SPEED is your priority. Create a visually appealing mockup in seconds.`,
    };

    // Initialize with fast model (Gemini Flash)
    super(profile, memory, tools, messageBus, {
      useRealAI: true,
      llmConfig: {
        provider: 'google',
        model: 'gemini-2.0-flash-exp',
        temperature: 0.7,
      },
    });
  }

  /**
   * Generate a rapid UI preview based on user request
   */
  async generatePreview(userRequest: string): Promise<string> {
    this.think('Generating rapid UI preview...');
    
    const prompt = `Generate a React component for this request:

"${userRequest}"

Create a beautiful, modern UI mockup with:
- Tailwind CSS styling
- lucide-react icons (import what you need)
- Mock/hardcoded data
- Responsive design
- Modern aesthetics

Output ONLY the component code, starting with imports. No explanations.

Example structure:
\`\`\`tsx
import { Icon1, Icon2 } from 'lucide-react';

export default function Preview() {
  return (
    <div className="...">
      {/* Your beautiful UI here */}
    </div>
  );
}
\`\`\`

Generate NOW:`;

    try {
      const response = await this.prompt(prompt);
      
      // Extract code from response (handle markdown)
      let code = response;
      const codeMatch = response.match(/```(?:tsx|typescript|jsx|javascript)?\s*([\s\S]*?)```/);
      if (codeMatch) {
        code = codeMatch[1].trim();
      }
      
      this.think('Preview generated!');
      return code;
    } catch (error) {
      this.think(`Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Return a fallback preview
      return this.generateFallbackPreview(userRequest);
    }
  }

  /**
   * Generate a simple fallback preview if AI fails
   */
  private generateFallbackPreview(userRequest: string): string {
    return `import { Sparkles } from 'lucide-react';

export default function Preview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            ${userRequest.slice(0, 50)}
          </h1>
        </div>
        <p className="text-gray-600 mb-8">
          This is a rapid preview mockup. The full implementation will include
          all features, proper data handling, and complete functionality.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
              <div className="w-12 h-12 bg-indigo-200 rounded-lg mb-4"></div>
              <h3 className="font-semibold text-lg mb-2">Feature {i}</h3>
              <p className="text-sm text-gray-600">
                Feature description placeholder
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
  }

  protected async executeTask(task: any): Promise<any> {
    if (task.description) {
      return await this.generatePreview(task.description);
    }
    throw new Error('Task must have a description');
  }
}
