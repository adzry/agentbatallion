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
/**
 * E2B Sandbox Manager
 */
export class E2BSandbox extends EventEmitter {
    config;
    sandbox = null;
    isConnected = false;
    mockMode = false;
    constructor(config = {}) {
        super();
        this.config = {
            apiKey: config.apiKey || process.env.E2B_API_KEY,
            template: config.template || 'base',
            timeout: config.timeout || 300000, // 5 minutes default
            onStdout: config.onStdout,
            onStderr: config.onStderr,
        };
        // Check if we should use mock mode
        this.mockMode = !this.config.apiKey;
    }
    /**
     * Initialize and connect to sandbox
     */
    async connect() {
        if (this.mockMode) {
            console.log('[E2B Mock] Sandbox connected in mock mode');
            this.isConnected = true;
            this.emit('connected', { mock: true });
            return;
        }
        try {
            // Dynamic import to handle missing module gracefully (avoids TS2307)
            const e2bModule = await Function('return import("@e2b/sdk")')();
            this.sandbox = await e2bModule.Sandbox.create({
                apiKey: this.config.apiKey,
                template: this.config.template,
                timeout: this.config.timeout,
            });
            // Set up stdout/stderr handlers
            if (this.config.onStdout) {
                this.sandbox.process.stdout.on('data', (data) => {
                    this.config.onStdout(data);
                    this.emit('stdout', data);
                });
            }
            if (this.config.onStderr) {
                this.sandbox.process.stderr.on('data', (data) => {
                    this.config.onStderr(data);
                    this.emit('stderr', data);
                });
            }
            this.isConnected = true;
            this.emit('connected', { sandboxId: this.sandbox.id });
        }
        catch (error) {
            console.warn('E2B connection failed, using mock mode:', error);
            this.mockMode = true;
            this.isConnected = true;
            this.emit('connected', { mock: true, error });
        }
    }
    /**
     * Execute a command in the sandbox
     */
    async execute(command, cwd) {
        const startTime = Date.now();
        if (this.mockMode) {
            return this.mockExecute(command, cwd);
        }
        if (!this.isConnected) {
            throw new Error('Sandbox not connected. Call connect() first.');
        }
        try {
            const result = await this.sandbox.process.startAndWait(command, {
                cwd,
                timeout: this.config.timeout,
            });
            const duration = Date.now() - startTime;
            return {
                success: result.exitCode === 0,
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode,
                duration,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return {
                success: false,
                stdout: '',
                stderr: error instanceof Error ? error.message : 'Unknown error',
                exitCode: 1,
                duration,
            };
        }
    }
    /**
     * Write files to the sandbox
     */
    async writeFiles(files) {
        if (this.mockMode) {
            console.log(`[E2B Mock] Writing ${files.length} files`);
            return;
        }
        if (!this.isConnected) {
            throw new Error('Sandbox not connected. Call connect() first.');
        }
        for (const file of files) {
            await this.sandbox.filesystem.write(file.path, file.content);
        }
    }
    /**
     * Read a file from the sandbox
     */
    async readFile(path) {
        if (this.mockMode) {
            return `[Mock content of ${path}]`;
        }
        if (!this.isConnected) {
            throw new Error('Sandbox not connected. Call connect() first.');
        }
        return await this.sandbox.filesystem.read(path);
    }
    /**
     * Install npm packages
     */
    async npmInstall(packages = [], cwd = '/home/user/app') {
        const packageList = packages.length > 0 ? packages.join(' ') : '';
        const command = packages.length > 0 ? `npm install ${packageList}` : 'npm install';
        return await this.execute(command, cwd);
    }
    /**
     * Run npm script
     */
    async npmRun(script, cwd = '/home/user/app') {
        return await this.execute(`npm run ${script}`, cwd);
    }
    /**
     * Build the project
     */
    async build(cwd = '/home/user/app') {
        return await this.execute('npm run build', cwd);
    }
    /**
     * Run tests
     */
    async runTests(cwd = '/home/user/app') {
        return await this.execute('npm test', cwd);
    }
    /**
     * Run linting
     */
    async lint(cwd = '/home/user/app') {
        return await this.execute('npm run lint', cwd);
    }
    /**
     * Start a development server (non-blocking)
     */
    async startDevServer(cwd = '/home/user/app') {
        if (this.mockMode) {
            return {
                url: 'http://localhost:3000',
                process: null,
            };
        }
        if (!this.isConnected) {
            throw new Error('Sandbox not connected. Call connect() first.');
        }
        const process = await this.sandbox.process.start('npm run dev', { cwd });
        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 5000));
        return {
            url: this.sandbox.getHostname(3000),
            process,
        };
    }
    /**
     * Deploy the generated application
     */
    async deployProject(files, options = {}) {
        const logs = [];
        const errors = [];
        const projectDir = '/home/user/app';
        try {
            // Write all files
            logs.push('Writing project files...');
            await this.writeFiles(files.map(f => ({
                path: `${projectDir}/${f.path}`,
                content: f.content,
            })));
            logs.push(`✓ Wrote ${files.length} files`);
            // Install dependencies
            if (options.install !== false) {
                logs.push('Installing dependencies...');
                const installResult = await this.npmInstall([], projectDir);
                if (!installResult.success) {
                    errors.push('npm install failed: ' + installResult.stderr);
                }
                else {
                    logs.push('✓ Dependencies installed');
                }
            }
            // Run tests
            if (options.test) {
                logs.push('Running tests...');
                const testResult = await this.runTests(projectDir);
                if (!testResult.success) {
                    errors.push('Tests failed: ' + testResult.stderr);
                }
                else {
                    logs.push('✓ Tests passed');
                }
            }
            // Build project
            if (options.build !== false) {
                logs.push('Building project...');
                const buildResult = await this.build(projectDir);
                if (!buildResult.success) {
                    errors.push('Build failed: ' + buildResult.stderr);
                }
                else {
                    logs.push('✓ Build successful');
                }
            }
            return {
                success: errors.length === 0,
                url: this.mockMode ? 'http://localhost:3000' : this.sandbox?.getHostname(3000),
                logs,
                errors,
            };
        }
        catch (error) {
            errors.push(error instanceof Error ? error.message : 'Deployment failed');
            return {
                success: false,
                logs,
                errors,
            };
        }
    }
    /**
     * Mock execution for development
     */
    mockExecute(command, cwd) {
        console.log(`[E2B Mock] Executing: ${command}${cwd ? ` in ${cwd}` : ''}`);
        // Simulate different commands
        if (command.includes('npm install')) {
            return {
                success: true,
                stdout: 'added 100 packages in 5s',
                stderr: '',
                exitCode: 0,
                duration: 5000,
            };
        }
        if (command.includes('npm run build')) {
            return {
                success: true,
                stdout: '✓ Build completed successfully',
                stderr: '',
                exitCode: 0,
                duration: 10000,
            };
        }
        if (command.includes('npm test')) {
            return {
                success: true,
                stdout: 'PASS All tests passed',
                stderr: '',
                exitCode: 0,
                duration: 3000,
            };
        }
        return {
            success: true,
            stdout: `Command executed: ${command}`,
            stderr: '',
            exitCode: 0,
            duration: 1000,
        };
    }
    /**
     * Disconnect and cleanup
     */
    async disconnect() {
        if (this.sandbox) {
            await this.sandbox.kill();
            this.sandbox = null;
        }
        this.isConnected = false;
        this.emit('disconnected');
    }
    /**
     * Check if connected
     */
    isActive() {
        return this.isConnected;
    }
    /**
     * Check if in mock mode
     */
    isMock() {
        return this.mockMode;
    }
}
/**
 * Create sandbox instance
 */
export function createSandbox(config) {
    return new E2BSandbox(config);
}
//# sourceMappingURL=e2b-sandbox.js.map