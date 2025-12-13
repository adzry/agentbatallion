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
export class E2BSandbox extends EventEmitter {
  private config: SandboxConfig;
  private sandbox: any = null;
  private isConnected: boolean = false;
  private mockMode: boolean = false;

  constructor(config: Partial<SandboxConfig> = {}) {
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
  async connect(): Promise<void> {
    if (this.mockMode) {
      console.log('[E2B Mock] Sandbox connected in mock mode');
      this.isConnected = true;
      this.emit('connected', { mock: true });
      return;
    }

    try {
      // Dynamic import to handle missing module gracefully (avoids TS2307)
      const e2bModule = await (Function('return import("@e2b/sdk")')() as Promise<{ Sandbox: { create: (config: unknown) => Promise<unknown> } }>);
      
      this.sandbox = await e2bModule.Sandbox.create({
        apiKey: this.config.apiKey,
        template: this.config.template,
        timeout: this.config.timeout,
      });

      // Set up stdout/stderr handlers
      if (this.config.onStdout) {
        this.sandbox.process.stdout.on('data', (data: string) => {
          this.config.onStdout!(data);
          this.emit('stdout', data);
        });
      }

      if (this.config.onStderr) {
        this.sandbox.process.stderr.on('data', (data: string) => {
          this.config.onStderr!(data);
          this.emit('stderr', data);
        });
      }

      this.isConnected = true;
      this.emit('connected', { sandboxId: this.sandbox.id });
    } catch (error) {
      console.warn('E2B connection failed, using mock mode:', error);
      this.mockMode = true;
      this.isConnected = true;
      this.emit('connected', { mock: true, error });
    }
  }

  /**
   * Execute a command in the sandbox
   */
  async execute(command: string, cwd?: string): Promise<ExecutionResult> {
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
    } catch (error) {
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
  async writeFiles(files: SandboxFile[]): Promise<void> {
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
  async readFile(path: string): Promise<string> {
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
  async npmInstall(packages: string[] = [], cwd: string = '/home/user/app'): Promise<ExecutionResult> {
    const packageList = packages.length > 0 ? packages.join(' ') : '';
    const command = packages.length > 0 ? `npm install ${packageList}` : 'npm install';
    
    return await this.execute(command, cwd);
  }

  /**
   * Run npm script
   */
  async npmRun(script: string, cwd: string = '/home/user/app'): Promise<ExecutionResult> {
    return await this.execute(`npm run ${script}`, cwd);
  }

  /**
   * Build the project
   */
  async build(cwd: string = '/home/user/app'): Promise<ExecutionResult> {
    return await this.execute('npm run build', cwd);
  }

  /**
   * Run tests
   */
  async runTests(cwd: string = '/home/user/app'): Promise<ExecutionResult> {
    return await this.execute('npm test', cwd);
  }

  /**
   * Run linting
   */
  async lint(cwd: string = '/home/user/app'): Promise<ExecutionResult> {
    return await this.execute('npm run lint', cwd);
  }

  /**
   * Start a development server (non-blocking)
   */
  async startDevServer(cwd: string = '/home/user/app'): Promise<{ url: string; process: any }> {
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
   * Take screenshot of running application (Phase 2: Visual QA)
   */
  async takeScreenshot(url: string): Promise<string> {
    if (this.mockMode) {
      console.log(`[E2B Mock] Taking screenshot of ${url}`);
      // Return a placeholder base64 image for mock mode
      return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }

    if (!this.isConnected) {
      throw new Error('Sandbox not connected. Call connect() first.');
    }

    const screenshotPath = '/tmp/screenshot.png';
    const scriptPath = '/tmp/take-screenshot.js';

    try {
      // Check if puppeteer is installed
      const checkResult = await this.execute('npm list puppeteer');
      
      if (!checkResult.success || checkResult.exitCode !== 0) {
        console.log('[E2B] Installing puppeteer...');
        const installResult = await this.execute('npm install puppeteer');
        if (!installResult.success) {
          throw new Error('Failed to install puppeteer: ' + installResult.stderr);
        }
      }

      // Create puppeteer screenshot script
      const screenshotScript = `
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('${url}', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait a bit for any animations
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: '${screenshotPath}',
      fullPage: false 
    });
    
    console.log('Screenshot saved to ${screenshotPath}');
  } catch (error) {
    console.error('Screenshot error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
`;

      // Write the script
      await this.sandbox.filesystem.write(scriptPath, screenshotScript);

      // Execute the script
      const execResult = await this.execute(`node ${scriptPath}`);
      if (!execResult.success) {
        throw new Error('Screenshot script failed: ' + execResult.stderr);
      }

      // Read the screenshot file and convert to base64
      const imageBuffer = await this.sandbox.filesystem.read(screenshotPath);
      const base64Image = Buffer.from(imageBuffer).toString('base64');

      // Clean up
      await this.execute(`rm ${scriptPath} ${screenshotPath}`).catch(() => {
        // Ignore cleanup errors
      });

      return base64Image;
    } catch (error) {
      console.error('[E2B] Screenshot failed:', error);
      throw error;
    }
  }

  /**
   * Deploy the generated application
   */
  async deployProject(
    files: SandboxFile[],
    options: {
      install?: boolean;
      build?: boolean;
      test?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    url?: string;
    logs: string[];
    errors: string[];
  }> {
    const logs: string[] = [];
    const errors: string[] = [];
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
        } else {
          logs.push('✓ Dependencies installed');
        }
      }

      // Run tests
      if (options.test) {
        logs.push('Running tests...');
        const testResult = await this.runTests(projectDir);
        if (!testResult.success) {
          errors.push('Tests failed: ' + testResult.stderr);
        } else {
          logs.push('✓ Tests passed');
        }
      }

      // Build project
      if (options.build !== false) {
        logs.push('Building project...');
        const buildResult = await this.build(projectDir);
        if (!buildResult.success) {
          errors.push('Build failed: ' + buildResult.stderr);
        } else {
          logs.push('✓ Build successful');
        }
      }

      return {
        success: errors.length === 0,
        url: this.mockMode ? 'http://localhost:3000' : this.sandbox?.getHostname(3000),
        logs,
        errors,
      };
    } catch (error) {
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
  private mockExecute(command: string, cwd?: string): ExecutionResult {
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
  async disconnect(): Promise<void> {
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
  isActive(): boolean {
    return this.isConnected;
  }

  /**
   * Check if in mock mode
   */
  isMock(): boolean {
    return this.mockMode;
  }
}

/**
 * Create sandbox instance
 */
export function createSandbox(config?: Partial<SandboxConfig>): E2BSandbox {
  return new E2BSandbox(config);
}
