/**
 * Team Orchestrator Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTeamOrchestrator, TeamOrchestrator } from '../agents/team-orchestrator.js';

describe('TeamOrchestrator', () => {
  let orchestrator: TeamOrchestrator;

  beforeEach(() => {
    orchestrator = createTeamOrchestrator({
      projectName: 'Test Project',
    });
  });

  describe('constructor', () => {
    it('should create orchestrator with default config', () => {
      const orch = createTeamOrchestrator();
      expect(orch).toBeInstanceOf(TeamOrchestrator);
    });

    it('should create orchestrator with custom config', () => {
      const orch = createTeamOrchestrator({
        projectName: 'Custom Project',
        maxIterations: 5,
        qualityThreshold: 90,
      });
      expect(orch).toBeInstanceOf(TeamOrchestrator);
    });
  });

  describe('getAllAgents', () => {
    it('should return all initialized agents', () => {
      const agents = orchestrator.getAllAgents();
      
      expect(agents.length).toBeGreaterThan(0);
    });

    it('should have default 7 agents', () => {
      const agents = orchestrator.getAllAgents();
      
      expect(agents.length).toBe(7);
    });
  });

  describe('getAgent', () => {
    it('should get product_manager agent', () => {
      const agent = orchestrator.getAgent('product_manager');
      
      expect(agent).toBeDefined();
      expect(agent?.getProfile().role).toBe('product_manager');
    });

    it('should get architect agent', () => {
      const agent = orchestrator.getAgent('architect');
      
      expect(agent).toBeDefined();
      expect(agent?.getProfile().role).toBe('architect');
    });

    it('should get designer agent', () => {
      const agent = orchestrator.getAgent('designer');
      
      expect(agent).toBeDefined();
      expect(agent?.getProfile().role).toBe('designer');
    });

    it('should get frontend_engineer agent', () => {
      const agent = orchestrator.getAgent('frontend_engineer');
      
      expect(agent).toBeDefined();
      expect(agent?.getProfile().role).toBe('frontend_engineer');
    });

    it('should get qa_engineer agent', () => {
      const agent = orchestrator.getAgent('qa_engineer');
      
      expect(agent).toBeDefined();
      expect(agent?.getProfile().role).toBe('qa_engineer');
    });

    it('should return undefined for invalid role', () => {
      const agent = orchestrator.getAgent('invalid_role' as any);
      expect(agent).toBeUndefined();
    });
  });

  describe('getMemory', () => {
    it('should return memory manager', () => {
      const memory = orchestrator.getMemory();
      expect(memory).toBeDefined();
    });
  });

  describe('reset', () => {
    it('should reset orchestrator state', async () => {
      // Run a generation first
      await orchestrator.run('Build a simple app');
      
      // Get events
      const eventsBefore = orchestrator.getEvents();
      expect(eventsBefore.length).toBeGreaterThan(0);
      
      // Reset
      orchestrator.reset();
      
      // Check events are cleared
      const eventsAfter = orchestrator.getEvents();
      expect(eventsAfter.length).toBe(0);
    });
  });

  describe('run', () => {
    it('should complete generation successfully', async () => {
      const result = await orchestrator.run('Build a simple landing page');
      
      expect(result.success).toBe(true);
      expect(result.projectId).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
    });

    it('should generate multiple files', async () => {
      const result = await orchestrator.run('Build a todo app');
      
      expect(result.files.length).toBeGreaterThan(10);
    });

    it('should include QA report', async () => {
      const result = await orchestrator.run('Build a blog');
      
      expect(result.qaReport).toBeDefined();
      expect(result.qaReport?.score).toBeGreaterThanOrEqual(0);
      expect(result.qaReport?.score).toBeLessThanOrEqual(100);
    });

    it('should track duration', async () => {
      const result = await orchestrator.run('Build an app');
      
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should track iterations', async () => {
      const result = await orchestrator.run('Build an app');
      
      expect(result.iterations).toBeGreaterThanOrEqual(1);
    });

    it('should emit progress events', async () => {
      const progressHandler = vi.fn();
      
      orchestrator.on('progress', progressHandler);
      
      await orchestrator.run('Build a simple app');
      
      expect(progressHandler).toHaveBeenCalled();
    });

    it('should generate expected file types', async () => {
      const result = await orchestrator.run('Build a Next.js app');
      
      const fileTypes = result.files.map(f => f.path.split('.').pop());
      
      expect(fileTypes).toContain('tsx');
      expect(fileTypes).toContain('json');
      expect(fileTypes).toContain('ts');
    });

    it('should generate package.json', async () => {
      const result = await orchestrator.run('Build an app');
      
      const packageJson = result.files.find(f => f.path === 'package.json');
      expect(packageJson).toBeDefined();
      expect(packageJson?.content).toContain('dependencies');
    });

    it('should generate layout.tsx', async () => {
      const result = await orchestrator.run('Build an app');
      
      const layout = result.files.find(f => f.path.includes('layout.tsx'));
      expect(layout).toBeDefined();
    });

    it('should generate page.tsx', async () => {
      const result = await orchestrator.run('Build an app');
      
      const page = result.files.find(f => f.path.includes('page.tsx'));
      expect(page).toBeDefined();
    });
  });

  describe('getProjectContext', () => {
    it('should return null before generation', () => {
      const ctx = orchestrator.getProjectContext();
      expect(ctx).toBeNull();
    });

    it('should return context after generation', async () => {
      await orchestrator.run('Build a test app');
      
      const ctx = orchestrator.getProjectContext();
      expect(ctx).toBeDefined();
      expect(ctx?.name).toBeDefined();
    });
  });

  describe('getEvents', () => {
    it('should return empty array initially', () => {
      const events = orchestrator.getEvents();
      expect(events).toEqual([]);
    });

    it('should collect events during run', async () => {
      await orchestrator.run('Build an app');
      
      const events = orchestrator.getEvents();
      expect(events.length).toBeGreaterThan(0);
    });
  });
});
