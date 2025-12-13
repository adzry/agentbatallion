/**
 * UI Preview Activity
 * 
 * Temporal activity that generates rapid UI previews using the UIPreviewAgent
 * Part of Phase 1: "Nano Banana" Strategy
 */

import { UIPreviewAgent } from '../../agents/nano/ui-preview-agent.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';

export interface UIPreviewInput {
  request: string;
}

export interface UIPreviewResult {
  success: boolean;
  preview: string;
  error?: string;
}

/**
 * Generate a rapid UI preview
 */
export async function generateUiPreview(input: UIPreviewInput): Promise<UIPreviewResult> {
  console.log(`[Activity] Generating UI preview for: ${input.request.slice(0, 50)}...`);
  
  try {
    // Create minimal dependencies for the agent
    const memory = new MemoryManager();
    const tools = new ToolRegistry();
    const messageBus = new MessageBus();
    
    // Initialize and use the UI preview agent
    const agent = new UIPreviewAgent(memory, tools, messageBus);
    const preview = await agent.generatePreview(input.request);
    
    console.log('[Activity] UI preview generated successfully');
    
    return {
      success: true,
      preview,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Activity] UI preview generation failed:', message);
    
    return {
      success: false,
      preview: '',
      error: message,
    };
  }
}
