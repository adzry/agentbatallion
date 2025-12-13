/**
 * Visual QA Activity
 * 
 * Performs visual quality assurance by taking screenshots and analyzing them
 * Part of Phase 2: "Eye of Sauron" Visual QA
 */

import { E2BSandbox } from '../../sandbox/e2b-sandbox.js';
import { DesignerAgent } from '../../agents/team/designer.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';

export interface VisualQAInput {
  missionId: string;
  appUrl: string;
  designIntent: string;
}

export interface VisualQAResult {
  success: boolean;
  screenshotTaken: boolean;
  approved: boolean;
  defects: string[];
  suggestions: string[];
  error?: string;
}

/**
 * Verify visuals by taking screenshots and analyzing them
 */
export async function verifyVisuals(input: VisualQAInput): Promise<VisualQAResult> {
  console.log(`[Activity] Verifying visuals for mission: ${input.missionId}`);
  console.log(`[Activity] App URL: ${input.appUrl}`);
  
  try {
    // Create sandbox instance
    const sandbox = new E2BSandbox();
    await sandbox.connect();

    // Take screenshot
    console.log('[Activity] Taking screenshot...');
    const screenshotBase64 = await sandbox.takeScreenshot(input.appUrl);
    console.log('[Activity] Screenshot captured');

    // Create designer agent for visual review
    const memory = new MemoryManager();
    const tools = new ToolRegistry();
    const messageBus = new MessageBus();
    const designer = new DesignerAgent(memory, tools, messageBus);

    // Perform visual review
    console.log('[Activity] Analyzing visual implementation...');
    const review = await designer.reviewVisualImplementation(
      input.designIntent,
      screenshotBase64
    );

    // Cleanup
    await sandbox.disconnect();

    console.log(`[Activity] Visual QA complete: ${review.approved ? 'APPROVED' : 'NEEDS WORK'}`);
    if (review.defects.length > 0) {
      console.log(`[Activity] Defects found:`, review.defects);
    }

    return {
      success: true,
      screenshotTaken: true,
      approved: review.approved,
      defects: review.defects,
      suggestions: review.suggestions,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Activity] Visual QA failed:', message);
    
    // On failure, don't auto-approve - require manual review
    return {
      success: false,
      screenshotTaken: false,
      approved: false,
      defects: ['Visual QA failed - manual review required'],
      suggestions: ['Retry visual QA or perform manual visual inspection'],
      error: message,
    };
  }
}
