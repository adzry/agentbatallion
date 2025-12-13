/**
 * Memory Manager Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryManager, MemoryManager } from '../memory/memory-manager.js';

describe('MemoryManager', () => {
  let memory: MemoryManager;

  beforeEach(() => {
    memory = createMemoryManager();
  });

  describe('store', () => {
    it('should store a value', async () => {
      await memory.store('requirements', 'req-1', { name: 'Test Requirement' });
      
      const result = await memory.recall('requirements', 10);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'Test Requirement' });
    });

    it('should store multiple values in same category', async () => {
      await memory.store('requirements', 'req-1', { name: 'Req 1' });
      await memory.store('requirements', 'req-2', { name: 'Req 2' });
      await memory.store('requirements', 'req-3', { name: 'Req 3' });
      
      const result = await memory.recall('requirements', 10);
      expect(result).toHaveLength(3);
    });

    it('should store values in different categories', async () => {
      await memory.store('requirements', 'req-1', { name: 'Requirement' });
      await memory.store('architecture', 'arch-1', { type: 'microservices' });
      
      const reqs = await memory.recall('requirements', 10);
      const archs = await memory.recall('architecture', 10);
      
      expect(reqs).toHaveLength(1);
      expect(archs).toHaveLength(1);
    });

    it('should overwrite existing key', async () => {
      await memory.store('requirements', 'req-1', { name: 'Original' });
      await memory.store('requirements', 'req-1', { name: 'Updated' });
      
      const result = await memory.recall('requirements', 10);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'Updated' });
    });
  });

  describe('recall', () => {
    it('should return empty array for empty category', async () => {
      const result = await memory.recall('nonexistent', 10);
      expect(result).toEqual([]);
    });

    it('should limit results', async () => {
      await memory.store('items', '1', { id: 1 });
      await memory.store('items', '2', { id: 2 });
      await memory.store('items', '3', { id: 3 });
      await memory.store('items', '4', { id: 4 });
      await memory.store('items', '5', { id: 5 });
      
      const result = await memory.recall('items', 3);
      expect(result).toHaveLength(3);
    });

    it('should return all if limit exceeds count', async () => {
      await memory.store('items', '1', { id: 1 });
      await memory.store('items', '2', { id: 2 });
      
      const result = await memory.recall('items', 10);
      expect(result).toHaveLength(2);
    });
  });

  describe('setContext and getContext', () => {
    it('should set and get context', async () => {
      const projectContext = {
        name: 'Test Project',
        description: 'A test project',
      };
      
      await memory.setContext('project', projectContext);
      const result = await memory.getContext('project');
      
      expect(result).toEqual(projectContext);
    });

    it('should return undefined for nonexistent context', async () => {
      const result = await memory.getContext('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should overwrite existing context', async () => {
      await memory.setContext('project', { name: 'Original' });
      await memory.setContext('project', { name: 'Updated' });
      
      const result = await memory.getContext('project');
      expect(result).toEqual({ name: 'Updated' });
    });
  });

  describe('clearAll', () => {
    it('should clear all memory', async () => {
      await memory.store('requirements', 'req-1', { name: 'Req' });
      await memory.store('architecture', 'arch-1', { type: 'mono' });
      await memory.setContext('project', { name: 'Test' });
      
      memory.clearAll();
      
      const reqs = await memory.recall('requirements', 10);
      const archs = await memory.recall('architecture', 10);
      const ctx = await memory.getContext('project');
      
      expect(reqs).toEqual([]);
      expect(archs).toEqual([]);
      expect(ctx).toBeUndefined();
    });
  });
});
