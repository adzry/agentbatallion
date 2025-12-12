"use strict";
/**
 * Agent Battalion Web Server
 *
 * MGX-style multi-agent app generation with real-time collaboration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const archiver_1 = __importDefault(require("archiver"));
require("dotenv/config");
const index_js_1 = require("../agents/index.js");
// Store for generated projects
const projectStore = new Map();
// Active orchestrators
const activeOrchestrators = new Map();
// Create Express app
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
exports.io = io;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../../public')));
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        features: ['mgx-style-agents', 'multi-agent-collaboration', 'real-time-progress'],
    });
});
// Get team info
app.get('/api/team', (req, res) => {
    const team = [
        { id: 'pm-agent', name: 'Alex', role: 'Product Manager', avatar: '👔', status: 'ready' },
        { id: 'architect-agent', name: 'Sam', role: 'Architect', avatar: '🏗️', status: 'ready' },
        { id: 'designer-agent', name: 'Maya', role: 'Designer', avatar: '🎨', status: 'ready' },
        { id: 'frontend-engineer-agent', name: 'Jordan', role: 'Frontend Engineer', avatar: '💻', status: 'ready' },
        { id: 'qa-engineer-agent', name: 'Riley', role: 'QA Engineer', avatar: '🔍', status: 'ready' },
    ];
    res.json({ team });
});
// Download endpoint
app.get('/api/download/:projectId', (req, res) => {
    const { projectId } = req.params;
    const project = projectStore.get(projectId);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectId}.zip"`);
    const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    for (const file of project.files) {
        archive.append(file.content, { name: file.path });
    }
    archive.finalize();
});
// Get project details
app.get('/api/project/:projectId', (req, res) => {
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
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    // Get team info
    socket.on('team:info', () => {
        const team = [
            { id: 'pm-agent', name: 'Alex', role: 'Product Manager', avatar: '👔', status: 'ready' },
            { id: 'architect-agent', name: 'Sam', role: 'Architect', avatar: '🏗️', status: 'ready' },
            { id: 'designer-agent', name: 'Maya', role: 'Designer', avatar: '🎨', status: 'ready' },
            { id: 'frontend-engineer-agent', name: 'Jordan', role: 'Frontend Engineer', avatar: '💻', status: 'ready' },
            { id: 'qa-engineer-agent', name: 'Riley', role: 'QA Engineer', avatar: '🔍', status: 'ready' },
        ];
        socket.emit('team:info', { team });
    });
    // Start generation
    socket.on('generate:start', async (data) => {
        const { prompt, projectName, options } = data;
        const projectId = (0, uuid_1.v4)();
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Starting generation for project: ${projectId}`);
        console.log(`Prompt: ${prompt}`);
        console.log(`${'='.repeat(60)}\n`);
        try {
            // Create orchestrator
            const orchestrator = (0, index_js_1.createTeamOrchestrator)({
                projectId,
                projectName: projectName || 'My App',
                teamSize: options?.teamSize || 'medium',
                maxIterations: options?.maxIterations || 3,
            });
            activeOrchestrators.set(projectId, orchestrator);
            // Listen to progress events
            orchestrator.on('progress', (progress) => {
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
            }
            else {
                socket.emit('generation:error', {
                    projectId,
                    message: 'Generation failed',
                });
            }
            // Cleanup
            activeOrchestrators.delete(projectId);
        }
        catch (error) {
            console.error('Generation error:', error);
            socket.emit('generation:error', {
                projectId,
                message: error instanceof Error ? error.message : 'Unknown error occurred',
            });
            activeOrchestrators.delete(projectId);
        }
    });
    // Cancel generation
    socket.on('generate:cancel', (data) => {
        const orchestrator = activeOrchestrators.get(data.projectId);
        if (orchestrator) {
            orchestrator.reset();
            activeOrchestrators.delete(data.projectId);
            socket.emit('generation:cancelled', { projectId: data.projectId });
        }
    });
    // Get file content
    socket.on('file:content', (data) => {
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
// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   🚀 Agent Battalion v2.0 - MGX-Style Multi-Agent System     ║
  ║                                                               ║
  ║   Web UI:    http://localhost:${PORT}                           ║
  ║   API:       http://localhost:${PORT}/api                       ║
  ║                                                               ║
  ║   Features:                                                   ║
  ║   • 5 Specialized AI Agents                                   ║
  ║   • Real-time Collaboration                                   ║
  ║   • Quality Assurance                                         ║
  ║   • Design System Generation                                  ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
});
//# sourceMappingURL=server.js.map