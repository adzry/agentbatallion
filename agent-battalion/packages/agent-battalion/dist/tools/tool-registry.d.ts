/**
 * Tool Registry
 *
 * Manages tools available to agents:
 * - File operations
 * - Code execution
 * - Web search
 * - Custom tools
 */
export interface Tool {
    name: string;
    description: string;
    category: ToolCategory;
    parameters: ToolParameter[];
    execute: (input: Record<string, unknown>) => Promise<any>;
}
export interface ToolParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description: string;
    required: boolean;
    default?: any;
}
export type ToolCategory = 'file' | 'code' | 'search' | 'communication' | 'analysis' | 'generation' | 'utility';
export interface ToolExecutionResult {
    success: boolean;
    output: any;
    error?: string;
    duration: number;
}
export declare class ToolRegistry {
    private tools;
    private executionLog;
    constructor();
    /**
     * Register a tool
     */
    register(tool: Tool): void;
    /**
     * Unregister a tool
     */
    unregister(name: string): void;
    /**
     * Get a tool by name
     */
    get(name: string): Tool | undefined;
    /**
     * List all tools
     */
    list(category?: ToolCategory): Tool[];
    /**
     * Execute a tool
     */
    execute(name: string, input: Record<string, unknown>): Promise<ToolExecutionResult>;
    /**
     * Get execution log
     */
    getExecutionLog(): typeof this.executionLog;
    /**
     * Clear execution log
     */
    clearLog(): void;
    /**
     * Log a tool execution
     */
    private logExecution;
    /**
     * Register built-in tools
     */
    private registerBuiltInTools;
}
/**
 * Create a tool registry instance
 */
export declare function createToolRegistry(): ToolRegistry;
//# sourceMappingURL=tool-registry.d.ts.map