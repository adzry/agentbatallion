/**
 * Agent Battalion Web Server
 * 
 * MGX-style multi-agent app generation with real-time collaboration
 */

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';
import 'dotenv/config';

import {
  createTeamOrchestrator,
  TeamOrchestrator,
  OrchestrationProgress,
  ProjectFile,
} from '../agents/index.js';

// Types
interface GenerationRequest {
  prompt: string;
  projectName?: string;
  options?: {
    teamSize?: 'small' | 'medium' | 'large';
    maxIterations?: number;
  };
}

interface AgentInfo {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
}

// Store for generated projects
const projectStore = new Map<string, {
  files: ProjectFile[];
  context: any;
  createdAt: Date;
}>();

// Active orchestrators
const activeOrchestrators = new Map<string, TeamOrchestrator>();

// Create Express app
const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: ['mgx-style-agents', 'multi-agent-collaboration', 'real-time-progress'],
  });
});

// Get team info
app.get('/api/team', (req: Request, res: Response) => {
  const team: AgentInfo[] = [
    { id: 'pm-agent', name: 'Alex', role: 'Product Manager', avatar: '👔', status: 'ready' },
    { id: 'architect-agent', name: 'Sam', role: 'Architect', avatar: '🏗️', status: 'ready' },
    { id: 'designer-agent', name: 'Maya', role: 'Designer', avatar: '🎨', status: 'ready' },
    { id: 'frontend-engineer-agent', name: 'Jordan', role: 'Frontend Engineer', avatar: '💻', status: 'ready' },
    { id: 'qa-engineer-agent', name: 'Riley', role: 'QA Engineer', avatar: '🔍', status: 'ready' },
  ];
  res.json({ team });
});

// Download endpoint
app.get('/api/download/:projectId', (req: Request, res: Response) => {
  const { projectId } = req.params;
  const project = projectStore.get(projectId);

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${projectId}.zip"`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);

  for (const file of project.files) {
    archive.append(file.content, { name: file.path });
  }

  archive.finalize();
});

// Get project details
app.get('/api/project/:projectId', (req: Request, res: Response) => {
  const { projectId } = req.params;
  const project = projectStore.get(projectId);

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  res.json({
    projectId,
    files: project.files.map(f => ({
      path: f.path,
      type: f.type,
      size: f.content.length,
    })),
    context: project.context,
    createdAt: project.createdAt,
  });
});

// WebSocket connection handling
io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Get team info
  socket.on('team:info', () => {
    const team: AgentInfo[] = [
      { id: 'pm-agent', name: 'Alex', role: 'Product Manager', avatar: '👔', status: 'ready' },
      { id: 'architect-agent', name: 'Sam', role: 'Architect', avatar: '🏗️', status: 'ready' },
      { id: 'designer-agent', name: 'Maya', role: 'Designer', avatar: '🎨', status: 'ready' },
      { id: 'frontend-engineer-agent', name: 'Jordan', role: 'Frontend Engineer', avatar: '💻', status: 'ready' },
      { id: 'qa-engineer-agent', name: 'Riley', role: 'QA Engineer', avatar: '🔍', status: 'ready' },
    ];
    socket.emit('team:info', { team });
  });

  // Start generation
  socket.on('generate:start', async (data: GenerationRequest) => {
    const { prompt, projectName, options } = data;
    const projectId = uuidv4();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Starting generation for project: ${projectId}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      // Create orchestrator
      const orchestrator = createTeamOrchestrator({
        projectId,
        projectName: projectName || 'My App',
        teamSize: options?.teamSize || 'medium',
        maxIterations: options?.maxIterations || 3,
      });

      activeOrchestrators.set(projectId, orchestrator);

      // Listen to progress events
      orchestrator.on('progress', (progress: OrchestrationProgress) => {
        socket.emit('generation:progress', {
          projectId,
          ...progress,
        });

        console.log(`[${progress.agentAvatar}] ${progress.agent}: ${progress.message} (${progress.progress}%)`);
      });

      // Listen to team events
      orchestrator.on('event', (event) => {
        socket.emit('team:event', {
          projectId,
          event,
        });
      });

      // Run the orchestration
      const result = await orchestrator.run(prompt);

      if (result.success) {
        // Store the project
        projectStore.set(projectId, {
          files: result.files,
          context: orchestrator.getProjectContext(),
          createdAt: new Date(),
        });

        // Send completion
        socket.emit('generation:complete', {
          projectId,
          downloadUrl: `/api/download/${projectId}`,
          files: result.files.map(f => ({
            path: f.path,
            type: f.type,
            size: f.content.length,
          })),
          qaReport: result.qaReport,
          duration: result.duration,
          iterations: result.iterations,
        });

        console.log(`\n✅ Project ${projectId} completed in ${result.duration}ms`);
        console.log(`   Files: ${result.files.length}`);
        console.log(`   QA Score: ${result.qaReport?.score || 'N/A'}`);
      } else {
        socket.emit('generation:error', {
          projectId,
          message: 'Generation failed',
        });
      }

      // Cleanup
      activeOrchestrators.delete(projectId);

    } catch (error) {
      console.error('Generation error:', error);
      socket.emit('generation:error', {
        projectId,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      activeOrchestrators.delete(projectId);
    }
  });

  // Cancel generation
  socket.on('generate:cancel', (data: { projectId: string }) => {
    const orchestrator = activeOrchestrators.get(data.projectId);
    if (orchestrator) {
      orchestrator.reset();
      activeOrchestrators.delete(data.projectId);
      socket.emit('generation:cancelled', { projectId: data.projectId });
    }
  });

  // Get file content
  socket.on('file:content', (data: { projectId: string; path: string }) => {
    const project = projectStore.get(data.projectId);
    if (project) {
      const file = project.files.find(f => f.path === data.path);
      if (file) {
        socket.emit('file:content', {
          path: file.path,
          content: file.content,
          type: file.type,
        });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server function
export function startServer(port?: number): Promise<void> {
  const PORT = port || parseInt(process.env.PORT || '4000');
  
  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   🚀 Agent Battalion v3.0 - MGX-Style Multi-Agent System     ║
  ║                                                               ║
  ║   Web UI:    http://localhost:${PORT}                           ║
  ║   API:       http://localhost:${PORT}/api                       ║
  ║                                                               ║
  ║   Features:                                                   ║
  ║   • 8 Specialized AI Agents                                   ║
  ║   • Real-time Collaboration                                   ║
  ║   • Multi-Provider LLM (Claude, GPT-4, Gemini)               ║
  ║   • Quality Assurance                                         ║
  ║   • Design System Generation                                  ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
      `);
      resolve();
    });
  });
}

// Auto-start if run directly (not imported)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  startServer();
}

export { app, server, io };
