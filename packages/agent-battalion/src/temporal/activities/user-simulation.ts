/**
 * User Simulation Activity
 * 
 * Simulates end-user behavior to test applications
 * Part of Phase 3: Dynamic Swarm & Simulation
 */

import { UserSimulatorAgent } from '../../agents/team/user-simulator.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
import { E2BSandbox } from '../../sandbox/e2b-sandbox.js';

export interface UserSimulationInput {
  missionId: string;
  appUrl: string;
  goal: string;
}

export interface UserSimulationResult {
  success: boolean;
  steps: string[];
  logs: string[];
  errors: string[];
  duration: number;
}

/**
 * Simulate user behavior on the application
 */
export async function simulateUser(input: UserSimulationInput): Promise<UserSimulationResult> {
  console.log(`[Activity] Simulating user for mission: ${input.missionId}`);
  console.log(`[Activity] Goal: ${input.goal}`);
  
  try {
    // Create sandbox for script execution
    const sandbox = new E2BSandbox();
    await sandbox.connect();

    // Create user simulator agent
    const memory = new MemoryManager();
    const tools = new ToolRegistry();
    const messageBus = new MessageBus();
    const simulator = new UserSimulatorAgent(memory, tools, messageBus);

    // Simulate user journey
    const result = await simulator.simulateUserJourney(
      input.appUrl,
      input.goal,
      sandbox
    );

    // Cleanup
    await sandbox.disconnect();

    console.log(`[Activity] User simulation complete: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (result.errors.length > 0) {
      console.log('[Activity] Errors:', result.errors);
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Activity] User simulation failed:', message);
    
    return {
      success: false,
      steps: [],
      logs: [],
      errors: [message],
      duration: 0,
    };
  }
}
