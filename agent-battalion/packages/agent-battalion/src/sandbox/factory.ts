/**
 * Sandbox Factory - Create appropriate sandbox based on environment
 * 
 * Part of Phase 8: "Neural Link"
 */

import { E2BSandbox, createSandbox as createE2BSandbox } from './e2b-sandbox.js';
import { LocalSandbox, createLocalSandbox } from './local-sandbox.js';

export type SandboxType = 'cloud' | 'local';
export type Sandbox = E2BSandbox | LocalSandbox;

/**
 * Create sandbox based on EXECUTION_MODE environment variable
 */
export function createSandbox(mode?: SandboxType): Sandbox {
  const executionMode = mode || (process.env.EXECUTION_MODE as SandboxType) || 'cloud';

  console.log(`[SandboxFactory] Creating ${executionMode} sandbox`);

  if (executionMode === 'local') {
    return createLocalSandbox();
  }

  return createE2BSandbox();
}

/**
 * Check if using local sandbox
 */
export function isLocalMode(): boolean {
  return (process.env.EXECUTION_MODE || 'cloud') === 'local';
}

/**
 * Check if using cloud sandbox
 */
export function isCloudMode(): boolean {
  return !isLocalMode();
}
