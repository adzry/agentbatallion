/**
 * Tests for RunStore
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RunStore, createRunStore } from '../memory/runStore.js';

describe('RunStore', () => {
  let store: RunStore;

  beforeEach(() => {
    store = createRunStore('test-run-id');
  });

  describe('put and get', () => {
    it('should store and retrieve artifacts', () => {
      const data = { title: 'Test PRD' };
      store.put('prd', data, 'alex_pm');

      const retrieved = store.get('prd');
      expect(retrieved).toEqual(data);
    });

    it('should return null for non-existent artifacts', () => {
      expect(store.get('prd')).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true for existing artifacts', () => {
      store.put('prd', { title: 'Test' }, 'alex_pm');
      expect(store.has('prd')).toBe(true);
    });

    it('should return false for non-existent artifacts', () => {
      expect(store.has('prd')).toBe(false);
    });
  });

  describe('getAccess', () => {
    it('should return ownership level for known agents', () => {
      const level = store.getAccess('alex_pm', 'prd');
      expect(level).toBe('owner');
    });

    it('should return read-only for unknown agents', () => {
      const level = store.getAccess('unknown_agent', 'prd');
      expect(level).toBe('read-only');
    });
  });

  describe('buildManifest', () => {
    it('should build manifest with run metadata', () => {
      store.put('prd', { title: 'Test' }, 'alex_pm');
      store.put('architecture', { type: 'jamstack' }, 'sam_architect');

      const manifest = store.buildManifest();
      expect(manifest.runId).toBe('test-run-id');
      expect(manifest.artifacts).toEqual(['prd', 'architecture']);
      expect(manifest.status).toBe('complete');
    });
  });

  describe('getMetadata', () => {
    it('should return artifact metadata without data', () => {
      store.put('prd', { title: 'Test' }, 'alex_pm');

      const metadata = store.getMetadata('prd');
      expect(metadata).toBeDefined();
      expect(metadata?.type).toBe('prd');
      expect(metadata?.createdBy).toBe('alex_pm');
      expect(metadata?.version).toBe(1);
      expect((metadata as any).data).toBeUndefined();
    });
  });

  describe('version tracking', () => {
    it('should increment version on updates', () => {
      store.put('prd', { title: 'V1' }, 'alex_pm');
      let metadata = store.getMetadata('prd');
      expect(metadata?.version).toBe(1);

      store.put('prd', { title: 'V2' }, 'alex_pm');
      metadata = store.getMetadata('prd');
      expect(metadata?.version).toBe(2);
    });
  });
});
