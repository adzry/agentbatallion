/**
 * Tool Registry Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createToolRegistry, ToolRegistry } from '../tools/tool-registry.js';

describe('ToolRegistry', () => {
  let tools: ToolRegistry;

  beforeEach(() => {
    tools = createToolRegistry();
  });

  describe('get', () => {
    it('should get read_file tool', () => {
      const tool = tools.get('read_file');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('read_file');
    });

    it('should get write_file tool', () => {
      const tool = tools.get('write_file');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('write_file');
    });

    it('should get analyze_code tool', () => {
      const tool = tools.get('analyze_code');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('analyze_code');
    });

    it('should get list_files tool', () => {
      const tool = tools.get('list_files');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('list_files');
    });

    it('should return undefined for nonexistent tool', () => {
      const tool = tools.get('nonexistent_tool');
      expect(tool).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should list all registered tools', () => {
      const toolList = tools.list();
      const toolNames = toolList.map(t => t.name);
      
      expect(toolNames).toContain('read_file');
      expect(toolNames).toContain('write_file');
      expect(toolNames).toContain('list_files');
      expect(toolNames).toContain('analyze_code');
      expect(toolNames).toContain('search_web');
    });

    it('should return at least 6 tools', () => {
      const toolList = tools.list();
      expect(toolList.length).toBeGreaterThanOrEqual(6);
    });

    it('should filter by category', () => {
      const fileTools = tools.list('file');
      expect(fileTools.length).toBeGreaterThan(0);
      fileTools.forEach(tool => {
        expect(tool.category).toBe('file');
      });
    });
  });

  describe('register', () => {
    it('should register a new tool', () => {
      tools.register({
        name: 'custom_tool',
        description: 'A custom tool',
        category: 'utility',
        parameters: [],
        execute: async (input) => ({ result: 'custom' }),
      });

      const tool = tools.get('custom_tool');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('custom_tool');
    });

    it('should overwrite existing tool', () => {
      tools.register({
        name: 'read_file',
        description: 'Custom file read',
        category: 'file',
        parameters: [],
        execute: async () => ({ custom: true }),
      });

      const tool = tools.get('read_file');
      expect(tool?.description).toBe('Custom file read');
    });
  });

  describe('tool execution', () => {
    it('should execute write_file tool', async () => {
      const tool = tools.get('write_file');
      expect(tool).toBeDefined();

      const result = await tool!.execute({
        path: 'test.txt',
        content: 'Hello World',
      });

      // write_file returns { path, size, created }
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('size');
    });

    it('should execute analyze_code tool', async () => {
      const tool = tools.get('analyze_code');
      expect(tool).toBeDefined();

      const result = await tool!.execute({
        code: 'const x = 1;',
        language: 'typescript',
      });

      // analyze_code returns { lines, characters, language, hasErrors }
      expect(result).toHaveProperty('lines');
      expect(result).toHaveProperty('characters');
    });

    it('should execute search_web tool', async () => {
      const tool = tools.get('search_web');
      expect(tool).toBeDefined();

      const result = await tool!.execute({
        query: 'test query',
      });

      expect(result).toHaveProperty('results');
    });

    it('should execute format_json tool', async () => {
      const tool = tools.get('format_json');
      expect(tool).toBeDefined();

      const result = await tool!.execute({
        json: '{"name":"test"}',
      });

      expect(result).toHaveProperty('formatted');
    });

    it('should execute generate_uuid tool', async () => {
      const tool = tools.get('generate_uuid');
      expect(tool).toBeDefined();

      const result = await tool!.execute({});
      expect(result).toHaveProperty('uuid');
    });
  });

});
