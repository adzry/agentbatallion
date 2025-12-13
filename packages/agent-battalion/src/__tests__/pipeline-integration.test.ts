/**
 * Tests for Pipeline Integration
 */

import { describe, it, expect } from 'vitest';
import { createAppPipeline } from '../orchestration/pipeline/createAppPipeline.js';

describe('Pipeline Integration', () => {
  it('should execute pipeline successfully with stub data', async () => {
    const result = await createAppPipeline({
      prompt: 'Build a todo app',
      projectName: 'Test App',
      outputDir: './test-output',
      maxRepairAttempts: 1,
    });

    expect(result.success).toBe(true);
    expect(result.runId).toBeDefined();
    expect(result.artifacts.size).toBeGreaterThan(0);
    expect(result.manifest).toBeDefined();
  });

  it('should include all expected artifacts', async () => {
    const result = await createAppPipeline({
      prompt: 'Build a simple app',
      projectName: 'Test App',
      outputDir: './test-output',
    });

    const artifactTypes = Array.from(result.artifacts.keys());
    expect(artifactTypes).toContain('prd');
    expect(artifactTypes).toContain('architecture');
    expect(artifactTypes).toContain('api_contract');
    expect(artifactTypes).toContain('ui_spec');
    expect(artifactTypes).toContain('backend_spec');
  });

  it('should generate a valid manifest', async () => {
    const result = await createAppPipeline({
      prompt: 'Build an app',
      projectName: 'Test',
      outputDir: './test',
    });

    expect(result.manifest.runId).toBe(result.runId);
    expect(result.manifest.status).toBe('complete');
    expect(result.manifest.artifacts.length).toBeGreaterThan(0);
  });
});
