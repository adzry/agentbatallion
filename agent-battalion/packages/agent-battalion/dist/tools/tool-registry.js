"use strict";
/**
 * Tool Registry
 *
 * Manages tools available to agents:
 * - File operations
 * - Code execution
 * - Web search
 * - Custom tools
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistry = void 0;
exports.createToolRegistry = createToolRegistry;
const uuid_1 = require("uuid");
class ToolRegistry {
    tools = new Map();
    executionLog = [];
    constructor() {
        this.registerBuiltInTools();
    }
    /**
     * Register a tool
     */
    register(tool) {
        this.tools.set(tool.name, tool);
    }
    /**
     * Unregister a tool
     */
    unregister(name) {
        this.tools.delete(name);
    }
    /**
     * Get a tool by name
     */
    get(name) {
        return this.tools.get(name);
    }
    /**
     * List all tools
     */
    list(category) {
        const tools = Array.from(this.tools.values());
        if (category) {
            return tools.filter(t => t.category === category);
        }
        return tools;
    }
    /**
     * Execute a tool
     */
    async execute(name, input) {
        const tool = this.tools.get(name);
        if (!tool) {
            return {
                success: false,
                output: null,
                error: `Tool not found: ${name}`,
                duration: 0,
            };
        }
        const startTime = Date.now();
        try {
            // Validate required parameters
            for (const param of tool.parameters) {
                if (param.required && !(param.name in input)) {
                    throw new Error(`Missing required parameter: ${param.name}`);
                }
            }
            const output = await tool.execute(input);
            const result = {
                success: true,
                output,
                duration: Date.now() - startTime,
            };
            this.logExecution(name, input, result);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                output: null,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration: Date.now() - startTime,
            };
            this.logExecution(name, input, result);
            return result;
        }
    }
    /**
     * Get execution log
     */
    getExecutionLog() {
        return [...this.executionLog];
    }
    /**
     * Clear execution log
     */
    clearLog() {
        this.executionLog = [];
    }
    /**
     * Log a tool execution
     */
    logExecution(toolName, input, result) {
        this.executionLog.push({
            toolName,
            input,
            result,
            timestamp: new Date(),
        });
        // Keep log size manageable
        if (this.executionLog.length > 100) {
            this.executionLog = this.executionLog.slice(-100);
        }
    }
    /**
     * Register built-in tools
     */
    registerBuiltInTools() {
        // File write tool
        this.register({
            name: 'write_file',
            description: 'Write content to a file',
            category: 'file',
            parameters: [
                { name: 'path', type: 'string', description: 'File path', required: true },
                { name: 'content', type: 'string', description: 'File content', required: true },
            ],
            execute: async (input) => {
                // In a real implementation, this would write to the file system or sandbox
                return {
                    path: input.path,
                    size: input.content.length,
                    written: true,
                };
            },
        });
        // File read tool
        this.register({
            name: 'read_file',
            description: 'Read content from a file',
            category: 'file',
            parameters: [
                { name: 'path', type: 'string', description: 'File path', required: true },
            ],
            execute: async (input) => {
                // In a real implementation, this would read from the file system or sandbox
                return {
                    path: input.path,
                    content: '',
                    exists: false,
                };
            },
        });
        // List files tool
        this.register({
            name: 'list_files',
            description: 'List files in a directory',
            category: 'file',
            parameters: [
                { name: 'path', type: 'string', description: 'Directory path', required: true },
                { name: 'pattern', type: 'string', description: 'Glob pattern', required: false },
            ],
            execute: async (input) => {
                return {
                    path: input.path,
                    files: [],
                };
            },
        });
        // Code analysis tool
        this.register({
            name: 'analyze_code',
            description: 'Analyze code for quality and issues',
            category: 'analysis',
            parameters: [
                { name: 'code', type: 'string', description: 'Code to analyze', required: true },
                { name: 'language', type: 'string', description: 'Programming language', required: true },
            ],
            execute: async (input) => {
                const code = input.code;
                return {
                    lines: code.split('\n').length,
                    characters: code.length,
                    issues: [],
                    suggestions: [],
                };
            },
        });
        // Search tool
        this.register({
            name: 'search_web',
            description: 'Search the web for information',
            category: 'search',
            parameters: [
                { name: 'query', type: 'string', description: 'Search query', required: true },
                { name: 'limit', type: 'number', description: 'Max results', required: false, default: 5 },
            ],
            execute: async (input) => {
                // In a real implementation, this would call a search API
                return {
                    query: input.query,
                    results: [],
                };
            },
        });
        // JSON formatter tool
        this.register({
            name: 'format_json',
            description: 'Format and validate JSON',
            category: 'utility',
            parameters: [
                { name: 'json', type: 'string', description: 'JSON string to format', required: true },
                { name: 'indent', type: 'number', description: 'Indentation spaces', required: false, default: 2 },
            ],
            execute: async (input) => {
                try {
                    const parsed = JSON.parse(input.json);
                    return {
                        valid: true,
                        formatted: JSON.stringify(parsed, null, input.indent || 2),
                    };
                }
                catch (error) {
                    return {
                        valid: false,
                        error: error instanceof Error ? error.message : 'Invalid JSON',
                    };
                }
            },
        });
        // Generate UUID tool
        this.register({
            name: 'generate_uuid',
            description: 'Generate a unique identifier',
            category: 'utility',
            parameters: [],
            execute: async () => {
                return { uuid: (0, uuid_1.v4)() };
            },
        });
        // Calculate hash tool
        this.register({
            name: 'calculate_hash',
            description: 'Calculate hash of content',
            category: 'utility',
            parameters: [
                { name: 'content', type: 'string', description: 'Content to hash', required: true },
            ],
            execute: async (input) => {
                // Simple hash for demonstration
                const content = input.content;
                let hash = 0;
                for (let i = 0; i < content.length; i++) {
                    const char = content.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                return {
                    hash: Math.abs(hash).toString(16),
                    length: content.length,
                };
            },
        });
    }
}
exports.ToolRegistry = ToolRegistry;
/**
 * Create a tool registry instance
 */
function createToolRegistry() {
    return new ToolRegistry();
}
//# sourceMappingURL=tool-registry.js.map