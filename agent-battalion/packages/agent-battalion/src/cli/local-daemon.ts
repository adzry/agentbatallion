/**
 * Local Daemon - WebSocket Server for Local File Access
 * 
 * Enables agents to work directly with local file system
 * Part of Phase 8: "Neural Link"
 */

import { WebSocketServer, WebSocket } from 'ws';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface DaemonConfig {
  port: number;
  authToken: string;
  projectRoot?: string;
}

/**
 * Start local development daemon
 */
export async function startLocalDaemon(config: DaemonConfig): Promise<void> {
  const projectRoot = config.projectRoot || process.cwd();
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔗 Neural Link Daemon                                   ║
║                                                           ║
║   Port:          ${config.port}                                    ║
║   Project Root:  ${projectRoot.slice(0, 30).padEnd(30)}║
║                                                           ║
║   Status: Listening for connections...                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  const wss = new WebSocketServer({ port: config.port });

  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 Client connected');
    let authenticated = false;

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle authentication
        if (message.type === 'auth') {
          if (message.token === config.authToken) {
            authenticated = true;
            console.log('✅ Client authenticated');
            ws.send(JSON.stringify({ type: 'auth', success: true }));
          } else {
            console.log('❌ Authentication failed');
            ws.send(JSON.stringify({ type: 'auth', success: false, error: 'Invalid token' }));
            ws.close();
          }
          return;
        }

        // Require authentication for all other requests
        if (!authenticated) {
          ws.send(JSON.stringify({
            requestId: message.requestId,
            success: false,
            error: 'Not authenticated',
          }));
          return;
        }

        // Handle requests
        switch (message.type) {
          case 'exec':
            await handleExec(ws, message, projectRoot);
            break;
          case 'writeFiles':
            await handleWriteFiles(ws, message, projectRoot);
            break;
          case 'readFile':
            await handleReadFile(ws, message, projectRoot);
            break;
          case 'listFiles':
            await handleListFiles(ws, message, projectRoot);
            break;
          default:
            ws.send(JSON.stringify({
              requestId: message.requestId,
              success: false,
              error: `Unknown request type: ${message.type}`,
            }));
        }
      } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    });

    ws.on('close', () => {
      console.log('🔌 Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('✨ Daemon ready. Agents can now access local files securely.\n');
}

/**
 * Execute command
 */
async function handleExec(ws: WebSocket, message: any, projectRoot: string): Promise<void> {
  const { requestId, command, cwd } = message;
  const workDir = path.resolve(projectRoot, cwd || '.');

  console.log(`📝 Executing: ${command} in ${workDir}`);

  try {
    const { stdout, stderr } = await execAsync(command, { 
      cwd: workDir,
      timeout: 30000,
    });

    ws.send(JSON.stringify({
      requestId,
      success: true,
      result: {
        stdout,
        stderr,
        exitCode: 0,
      },
    }));
  } catch (error: any) {
    ws.send(JSON.stringify({
      requestId,
      success: true,
      result: {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1,
      },
    }));
  }
}

/**
 * Write files
 */
async function handleWriteFiles(ws: WebSocket, message: any, projectRoot: string): Promise<void> {
  const { requestId, files } = message;

  console.log(`📝 Writing ${files.length} files`);

  try {
    for (const file of files) {
      const filePath = path.resolve(projectRoot, file.path);
      
      // Security: Ensure file is within project root
      if (!filePath.startsWith(projectRoot)) {
        throw new Error(`Security: Attempted to write outside project root: ${file.path}`);
      }

      // Create directory if needed
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      
      // Write file
      await fs.writeFile(filePath, file.content, 'utf-8');
      console.log(`   ✓ ${file.path}`);
    }

    ws.send(JSON.stringify({
      requestId,
      success: true,
      result: { filesWritten: files.length },
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      requestId,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to write files',
    }));
  }
}

/**
 * Read file
 */
async function handleReadFile(ws: WebSocket, message: any, projectRoot: string): Promise<void> {
  const { requestId, path: filePath } = message;
  const fullPath = path.resolve(projectRoot, filePath);

  console.log(`📖 Reading: ${filePath}`);

  try {
    // Security check
    if (!fullPath.startsWith(projectRoot)) {
      throw new Error(`Security: Attempted to read outside project root: ${filePath}`);
    }

    const content = await fs.readFile(fullPath, 'utf-8');

    ws.send(JSON.stringify({
      requestId,
      success: true,
      result: { content },
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      requestId,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read file',
    }));
  }
}

/**
 * List files
 */
async function handleListFiles(ws: WebSocket, message: any, projectRoot: string): Promise<void> {
  const { requestId, directory } = message;
  const fullPath = path.resolve(projectRoot, directory || '.');

  console.log(`📂 Listing: ${directory || '.'}`);

  try {
    // Security check
    if (!fullPath.startsWith(projectRoot)) {
      throw new Error(`Security: Attempted to list outside project root: ${directory}`);
    }

    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const files = entries.map(e => e.name);

    ws.send(JSON.stringify({
      requestId,
      success: true,
      result: { files },
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      requestId,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list files',
    }));
  }
}
