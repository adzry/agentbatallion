/**
 * Local Sandbox - Direct Local File System Access
 * 
 * Connects to local CLI daemon via WebSocket for direct file manipulation
 * Part of Phase 8: "Neural Link"
 */

import { EventEmitter } from 'events';
import { WebSocket } from 'ws';

export interface LocalSandboxConfig {
  daemonUrl?: string;
  authToken?: string;
  projectRoot?: string;
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export interface SandboxFile {
  path: string;
  content: string;
}

/**
 * Local Sandbox - Works with local file system via CLI daemon
 */
export class LocalSandbox extends EventEmitter {
  private config: LocalSandboxConfig;
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private requestMap: Map<string, { resolve: Function; reject: Function }> = new Map();

  constructor(config: Partial<LocalSandboxConfig> = {}) {
    super();

    this.config = {
      daemonUrl: config.daemonUrl || process.env.LOCAL_DAEMON_URL || 'ws://localhost:3001',
      authToken: config.authToken || process.env.LOCAL_DAEMON_TOKEN,
      projectRoot: config.projectRoot || process.cwd(),
    };
  }

  /**
   * Connect to local CLI daemon
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`[LocalSandbox] Connecting to daemon at ${this.config.daemonUrl}`);

      this.ws = new WebSocket(this.config.daemonUrl!);

      this.ws.on('open', () => {
        console.log('[LocalSandbox] Connected to local daemon');
        
        // Authenticate
        this.ws!.send(JSON.stringify({
          type: 'auth',
          token: this.config.authToken,
        }));

        this.isConnected = true;
        this.emit('connected');
        resolve();
      });

      this.ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('[LocalSandbox] Failed to parse message:', error);
        }
      });

      this.ws.on('error', (error) => {
        console.error('[LocalSandbox] WebSocket error:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('[LocalSandbox] Disconnected from daemon');
        this.isConnected = false;
        this.emit('disconnected');
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 5000);
    });
  }

  /**
   * Handle messages from daemon
   */
  private handleMessage(message: any): void {
    if (message.requestId && this.requestMap.has(message.requestId)) {
      const { resolve, reject } = this.requestMap.get(message.requestId)!;
      this.requestMap.delete(message.requestId);

      if (message.success) {
        resolve(message.result);
      } else {
        reject(new Error(message.error || 'Request failed'));
      }
    }
  }

  /**
   * Send request to daemon and wait for response
   */
  private async sendRequest(type: string, payload: any): Promise<any> {
    if (!this.isConnected || !this.ws) {
      throw new Error('Not connected to local daemon');
    }

    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random()}`;
      
      this.requestMap.set(requestId, { resolve, reject });

      this.ws!.send(JSON.stringify({
        requestId,
        type,
        ...payload,
      }));

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.requestMap.has(requestId)) {
          this.requestMap.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  /**
   * Execute command in local environment
   */
  async execute(command: string, cwd?: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    const result = await this.sendRequest('exec', {
      command,
      cwd: cwd || this.config.projectRoot,
    });

    return {
      success: result.exitCode === 0,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      exitCode: result.exitCode,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Write files to local filesystem
   */
  async writeFiles(files: SandboxFile[]): Promise<void> {
    await this.sendRequest('writeFiles', { files });
  }

  /**
   * Read file from local filesystem
   */
  async readFile(path: string): Promise<string> {
    const result = await this.sendRequest('readFile', { path });
    return result.content;
  }

  /**
   * List files in directory
   */
  async listFiles(directory: string = '.'): Promise<string[]> {
    const result = await this.sendRequest('listFiles', { directory });
    return result.files;
  }

  /**
   * Disconnect from daemon
   */
  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  /**
   * Check if connected
   */
  isActive(): boolean {
    return this.isConnected;
  }

  // Compatibility methods with E2BSandbox interface
  async npmInstall(packages: string[] = [], cwd?: string): Promise<ExecutionResult> {
    const packageList = packages.length > 0 ? packages.join(' ') : '';
    const command = packages.length > 0 ? `npm install ${packageList}` : 'npm install';
    return await this.execute(command, cwd);
  }

  async build(cwd?: string): Promise<ExecutionResult> {
    return await this.execute('npm run build', cwd);
  }

  async runTests(cwd?: string): Promise<ExecutionResult> {
    return await this.execute('npm test', cwd);
  }
}

/**
 * Create local sandbox instance
 */
export function createLocalSandbox(config?: Partial<LocalSandboxConfig>): LocalSandbox {
  return new LocalSandbox(config);
}
