/**
 * E2B Sandbox Integration
 *
 * Provides secure code execution environment for:
 * - Running generated code
 * - Installing dependencies
 * - Testing applications
 * - File system operations
 */
import { EventEmitter } from 'events';
export interface SandboxConfig {
    apiKey?: string;
    template?: string;
    timeout?: number;
    onStdout?: (output: string) => void;
    onStderr?: (output: string) => void;
}
export interface ExecutionResult {
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
    duration: number;
    files?: Record<string, string>;
}
export interface SandboxFile {
    path: string;
    content: string;
}
/**
 * E2B Sandbox Manager
 */
export declare class E2BSandbox extends EventEmitter {
    private config;
    private sandbox;
    private isConnected;
    private mockMode;
    constructor(config?: Partial<SandboxConfig>);
    /**
     * Initialize and connect to sandbox
     */
    connect(): Promise<void>;
    /**
     * Execute a command in the sandbox
     */
    execute(command: string, cwd?: string): Promise<ExecutionResult>;
    /**
     * Write files to the sandbox
     */
    writeFiles(files: SandboxFile[]): Promise<void>;
    /**
     * Read a file from the sandbox
     */
    readFile(path: string): Promise<string>;
    /**
     * Install npm packages
     */
    npmInstall(packages?: string[], cwd?: string): Promise<ExecutionResult>;
    /**
     * Run npm script
     */
    npmRun(script: string, cwd?: string): Promise<ExecutionResult>;
    /**
     * Build the project
     */
    build(cwd?: string): Promise<ExecutionResult>;
    /**
     * Run tests
     */
    runTests(cwd?: string): Promise<ExecutionResult>;
    /**
     * Run linting
     */
    lint(cwd?: string): Promise<ExecutionResult>;
    /**
     * Start a development server (non-blocking)
     */
    startDevServer(cwd?: string): Promise<{
        url: string;
        process: any;
    }>;
    /**
     * Take screenshot of running application (Phase 2: Visual QA)
     */
    takeScreenshot(url: string): Promise<string>;
    /**
     * Execute attack script for security testing (Phase 5: Red Sparrow)
     */
    executeAttackScript(url: string, payload: string, target: string): Promise<{
        success: boolean;
        vulnerable: boolean;
        logs: string[];
        error?: string;
    }>;
    /**
     * Deploy the generated application
     */
    deployProject(files: SandboxFile[], options?: {
        install?: boolean;
        build?: boolean;
        test?: boolean;
    }): Promise<{
        success: boolean;
        url?: string;
        logs: string[];
        errors: string[];
    }>;
    /**
     * Mock execution for development
     */
    private mockExecute;
    /**
     * Disconnect and cleanup
     */
    disconnect(): Promise<void>;
    /**
     * Check if connected
     */
    isActive(): boolean;
    /**
     * Check if in mock mode
     */
    isMock(): boolean;
}
/**
 * Create sandbox instance
 */
export declare function createSandbox(config?: Partial<SandboxConfig>): E2BSandbox;
//# sourceMappingURL=e2b-sandbox.d.ts.map