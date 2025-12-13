/**
 * Repair Activity
 * 
 * Attempts to automatically repair build/test failures
 * Part of Phase 4: "Lazarus Protocol" Self-Healing
 */

import { RepairAgent } from '../../agents/team/repair-agent.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
import { E2BSandbox, SandboxFile } from '../../sandbox/e2b-sandbox.js';

export interface RepairInput {
  missionId: string;
  errorLog: string;
  filePath: string;
}

export interface RepairResult {
  success: boolean;
  fixed: boolean;
  fixedCode?: string;
  explanation?: string;
  buildSuccess?: boolean;
  error?: string;
}

/**
 * Attempt to repair a failing file
 */
export async function attemptRepair(input: RepairInput): Promise<RepairResult> {
  console.log(`[Activity] Attempting repair for mission: ${input.missionId}`);
  console.log(`[Activity] Failed file: ${input.filePath}`);
  
  try {
    // Create sandbox to work with
    const sandbox = new E2BSandbox();
    await sandbox.connect();

    // Read the failing file
    console.log('[Activity] Reading failing file...');
    let fileContent: string;
    try {
      fileContent = await sandbox.readFile(input.filePath);
    } catch (readError) {
      console.error('[Activity] Failed to read file:', readError);
      await sandbox.disconnect();
      return {
        success: false,
        fixed: false,
        error: 'Could not read failing file',
      };
    }

    // Create repair agent
    const memory = new MemoryManager();
    const tools = new ToolRegistry();
    const messageBus = new MessageBus();
    const repairAgent = new RepairAgent(memory, tools, messageBus);

    // Diagnose and fix
    console.log('[Activity] Analyzing error and generating fix...');
    const repair = await repairAgent.diagnoseAndFix(
      input.errorLog,
      fileContent,
      input.filePath
    );

    if (!repair.fixed) {
      console.log('[Activity] No fix could be generated');
      await sandbox.disconnect();
      return {
        success: false,
        fixed: false,
        explanation: repair.explanation,
      };
    }

    console.log('[Activity] Fix generated:', repair.explanation);

    // Write the fixed code back
    console.log('[Activity] Applying fix...');
    const files: SandboxFile[] = [{
      path: input.filePath,
      content: repair.fixedCode,
    }];
    await sandbox.writeFiles(files);

    // Try to build again to verify the fix
    console.log('[Activity] Verifying fix with build...');
    const buildResult = await sandbox.build();
    
    const buildSuccess = buildResult.success;
    console.log(`[Activity] Build after repair: ${buildSuccess ? 'SUCCESS' : 'FAILED'}`);

    // Cleanup
    await sandbox.disconnect();

    return {
      success: true,
      fixed: repair.fixed,
      fixedCode: repair.fixedCode,
      explanation: repair.explanation,
      buildSuccess,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Activity] Repair attempt failed:', message);
    
    return {
      success: false,
      fixed: false,
      error: message,
    };
  }
}
