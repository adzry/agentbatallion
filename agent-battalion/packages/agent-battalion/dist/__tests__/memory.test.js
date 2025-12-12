"use strict";
/**
 * Memory Manager Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const memory_manager_js_1 = require("../memory/memory-manager.js");
(0, vitest_1.describe)('MemoryManager', () => {
    let memory;
    (0, vitest_1.beforeEach)(() => {
        memory = new memory_manager_js_1.MemoryManager();
    });
    (0, vitest_1.describe)('store', () => {
        (0, vitest_1.it)('should store entries', () => {
            const entry = memory.store('test-type', { key: 'value' });
            (0, vitest_1.expect)(entry).toBeDefined();
            (0, vitest_1.expect)(entry.id).toBeDefined();
            (0, vitest_1.expect)(entry.type).toBe('test-type');
            (0, vitest_1.expect)(entry.content).toEqual({ key: 'value' });
        });
        (0, vitest_1.it)('should assign unique IDs', () => {
            const entry1 = memory.store('type', { a: 1 });
            const entry2 = memory.store('type', { a: 2 });
            (0, vitest_1.expect)(entry1.id).not.toBe(entry2.id);
        });
        (0, vitest_1.it)('should store metadata', () => {
            const entry = memory.store('type', { data: 'test' }, {
                tags: ['important', 'test'],
                source: 'unit-test',
            });
            (0, vitest_1.expect)(entry.metadata).toBeDefined();
            (0, vitest_1.expect)(entry.metadata.tags).toContain('important');
            (0, vitest_1.expect)(entry.metadata.source).toBe('unit-test');
        });
    });
    (0, vitest_1.describe)('retrieve', () => {
        (0, vitest_1.it)('should retrieve by id', () => {
            const stored = memory.store('test', { value: 42 });
            const retrieved = memory.retrieve(stored.id);
            (0, vitest_1.expect)(retrieved).toBeDefined();
            (0, vitest_1.expect)(retrieved?.content).toEqual({ value: 42 });
        });
        (0, vitest_1.it)('should return undefined for non-existent id', () => {
            const result = memory.retrieve('non-existent-id');
            (0, vitest_1.expect)(result).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('recall', () => {
        (0, vitest_1.beforeEach)(() => {
            memory.store('requirement', { desc: 'Auth system' });
            memory.store('requirement', { desc: 'Dashboard' });
            memory.store('design', { colors: {} });
            memory.store('requirement', { desc: 'API' });
        });
        (0, vitest_1.it)('should recall by type', () => {
            const requirements = memory.recall('requirement');
            (0, vitest_1.expect)(requirements.length).toBe(3);
        });
        (0, vitest_1.it)('should respect limit', () => {
            const requirements = memory.recall('requirement', 2);
            (0, vitest_1.expect)(requirements.length).toBe(2);
        });
        (0, vitest_1.it)('should return empty array for unknown type', () => {
            const unknown = memory.recall('unknown-type');
            (0, vitest_1.expect)(unknown).toEqual([]);
        });
    });
    (0, vitest_1.describe)('search', () => {
        (0, vitest_1.beforeEach)(() => {
            memory.store('doc', { text: 'User authentication with OAuth' });
            memory.store('doc', { text: 'Database schema design' });
            memory.store('doc', { text: 'API authentication endpoints' });
        });
        (0, vitest_1.it)('should find matching entries', () => {
            const results = memory.search('authentication');
            (0, vitest_1.expect)(results.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should be case insensitive', () => {
            const results = memory.search('AUTHENTICATION');
            (0, vitest_1.expect)(results.length).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('context', () => {
        (0, vitest_1.it)('should set and get context', () => {
            memory.setContext('project-name', 'TestApp');
            const value = memory.getContext('project-name');
            (0, vitest_1.expect)(value).toBe('TestApp');
        });
        (0, vitest_1.it)('should return undefined for missing context', () => {
            const value = memory.getContext('missing-key');
            (0, vitest_1.expect)(value).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('clear', () => {
        (0, vitest_1.it)('should clear all entries', () => {
            memory.store('type1', { a: 1 });
            memory.store('type2', { b: 2 });
            memory.setContext('key', 'value');
            memory.clear();
            (0, vitest_1.expect)(memory.recall('type1')).toEqual([]);
            (0, vitest_1.expect)(memory.recall('type2')).toEqual([]);
            (0, vitest_1.expect)(memory.getContext('key')).toBeUndefined();
        });
    });
});
//# sourceMappingURL=memory.test.js.map