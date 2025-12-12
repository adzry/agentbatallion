"use strict";
/**
 * Tool Registry Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tool_registry_js_1 = require("../tools/tool-registry.js");
(0, vitest_1.describe)('ToolRegistry', () => {
    let registry;
    (0, vitest_1.beforeEach)(() => {
        registry = new tool_registry_js_1.ToolRegistry();
    });
    (0, vitest_1.describe)('built-in tools', () => {
        (0, vitest_1.it)('should have write_file tool', () => {
            const tools = registry.listTools();
            (0, vitest_1.expect)(tools).toContain('write_file');
        });
        (0, vitest_1.it)('should have read_file tool', () => {
            const tools = registry.listTools();
            (0, vitest_1.expect)(tools).toContain('read_file');
        });
        (0, vitest_1.it)('should have list_files tool', () => {
            const tools = registry.listTools();
            (0, vitest_1.expect)(tools).toContain('list_files');
        });
        (0, vitest_1.it)('should have format_json tool', () => {
            const tools = registry.listTools();
            (0, vitest_1.expect)(tools).toContain('format_json');
        });
        (0, vitest_1.it)('should have generate_uuid tool', () => {
            const tools = registry.listTools();
            (0, vitest_1.expect)(tools).toContain('generate_uuid');
        });
    });
    (0, vitest_1.describe)('register', () => {
        (0, vitest_1.it)('should register custom tools', () => {
            const customTool = {
                name: 'custom_tool',
                description: 'A custom tool',
                parameters: {},
                execute: async () => 'result',
            };
            registry.register(customTool);
            (0, vitest_1.expect)(registry.listTools()).toContain('custom_tool');
        });
        (0, vitest_1.it)('should not allow duplicate tool names', () => {
            const tool1 = {
                name: 'duplicate',
                description: 'First',
                parameters: {},
                execute: async () => 'first',
            };
            const tool2 = {
                name: 'duplicate',
                description: 'Second',
                parameters: {},
                execute: async () => 'second',
            };
            registry.register(tool1);
            (0, vitest_1.expect)(() => registry.register(tool2)).toThrow();
        });
    });
    (0, vitest_1.describe)('execute', () => {
        (0, vitest_1.it)('should execute format_json', async () => {
            const result = await registry.execute('format_json', {
                data: { key: 'value' },
            });
            (0, vitest_1.expect)(result).toBe('{\n  "key": "value"\n}');
        });
        (0, vitest_1.it)('should execute generate_uuid', async () => {
            const result = await registry.execute('generate_uuid', {});
            // UUID format check
            (0, vitest_1.expect)(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        });
        (0, vitest_1.it)('should execute calculate_hash', async () => {
            const result = await registry.execute('calculate_hash', {
                data: 'test',
                algorithm: 'sha256',
            });
            (0, vitest_1.expect)(result).toBeDefined();
            (0, vitest_1.expect)(typeof result).toBe('string');
        });
        (0, vitest_1.it)('should throw for unknown tool', async () => {
            await (0, vitest_1.expect)(registry.execute('unknown_tool', {})).rejects.toThrow('Tool not found');
        });
    });
    (0, vitest_1.describe)('getTool', () => {
        (0, vitest_1.it)('should get tool by name', () => {
            const tool = registry.getTool('format_json');
            (0, vitest_1.expect)(tool).toBeDefined();
            (0, vitest_1.expect)(tool?.name).toBe('format_json');
        });
        (0, vitest_1.it)('should return undefined for unknown tool', () => {
            const tool = registry.getTool('nonexistent');
            (0, vitest_1.expect)(tool).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('virtual file system', () => {
        (0, vitest_1.it)('should write and read files', async () => {
            await registry.execute('write_file', {
                path: 'test.txt',
                content: 'Hello World',
            });
            const content = await registry.execute('read_file', {
                path: 'test.txt',
            });
            (0, vitest_1.expect)(content).toBe('Hello World');
        });
        (0, vitest_1.it)('should list files', async () => {
            await registry.execute('write_file', {
                path: 'dir/file1.txt',
                content: 'content1',
            });
            await registry.execute('write_file', {
                path: 'dir/file2.txt',
                content: 'content2',
            });
            const files = await registry.execute('list_files', {
                path: 'dir',
            });
            (0, vitest_1.expect)(files).toContain('dir/file1.txt');
            (0, vitest_1.expect)(files).toContain('dir/file2.txt');
        });
    });
});
//# sourceMappingURL=tool-registry.test.js.map