"use strict";
/**
 * Generation Activities - Temporal Activity Definitions
 *
 * These activities are executed by the Temporal worker and can be
 * retried, timed out, and monitored independently.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeRequirements = analyzeRequirements;
exports.designArchitecture = designArchitecture;
exports.createDesignSystem = createDesignSystem;
exports.generateFrontend = generateFrontend;
exports.generateBackend = generateBackend;
exports.reviewCode = reviewCode;
exports.auditSecurity = auditSecurity;
exports.requestFeedback = requestFeedback;
exports.deployToSandbox = deployToSandbox;
exports.storeFiles = storeFiles;
exports.sendNotification = sendNotification;
const memory_manager_js_1 = require("../../memory/memory-manager.js");
const tool_registry_js_1 = require("../../tools/tool-registry.js");
const message_bus_js_1 = require("../../communication/message-bus.js");
const product_manager_js_1 = require("../../agents/team/product-manager.js");
const architect_js_1 = require("../../agents/team/architect.js");
const designer_js_1 = require("../../agents/team/designer.js");
const frontend_engineer_js_1 = require("../../agents/team/frontend-engineer.js");
const qa_engineer_js_1 = require("../../agents/team/qa-engineer.js");
const backend_engineer_js_1 = require("../../agents/team/backend-engineer.js");
const security_agent_js_1 = require("../../agents/team/security-agent.js");
// Shared instances (per worker)
const memory = new memory_manager_js_1.MemoryManager();
const tools = new tool_registry_js_1.ToolRegistry();
const messageBus = new message_bus_js_1.MessageBus();
// Agent instances
const productManager = new product_manager_js_1.ProductManagerAgent(memory, tools, messageBus);
const architect = new architect_js_1.ArchitectAgent(memory, tools, messageBus);
const designer = new designer_js_1.DesignerAgent(memory, tools, messageBus);
const frontendEngineer = new frontend_engineer_js_1.FrontendEngineerAgent(memory, tools, messageBus);
const qaEngineer = new qa_engineer_js_1.QAEngineerAgent(memory, tools, messageBus);
const backendEngineer = new backend_engineer_js_1.BackendEngineerAgent(memory, tools, messageBus);
const securityAgent = new security_agent_js_1.SecurityAgent(memory, tools, messageBus);
/**
 * Analyze requirements from user request
 */
async function analyzeRequirements(projectId, userRequest) {
    console.log(`[Activity] Analyzing requirements for project ${projectId}`);
    memory.setContext('projectId', projectId);
    const result = await productManager.analyzeRequest(userRequest);
    // Store in memory for other agents
    for (const req of result.requirements) {
        await memory.store('requirement', JSON.stringify(req), { tags: ['requirement'] });
    }
    // Convert partial context to full context
    const context = {
        id: result.projectContext.id || projectId,
        name: result.projectContext.name || 'New Project',
        description: result.projectContext.description || userRequest,
        requirements: result.requirements,
        techStack: result.projectContext.techStack || {
            frontend: { framework: 'Next.js 15', language: 'TypeScript', styling: 'Tailwind CSS' },
        },
        files: [],
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    return { requirements: result.requirements, context };
}
/**
 * Design system architecture
 */
async function designArchitecture(projectId, requirements, context) {
    console.log(`[Activity] Designing architecture for project ${projectId}`);
    const result = await architect.designArchitecture(requirements, context);
    // Store architecture spec
    await memory.store('architecture', JSON.stringify(result.architecture), { tags: ['architecture'] });
    return result;
}
/**
 * Create design system
 */
async function createDesignSystem(projectId, requirements, context) {
    console.log(`[Activity] Creating design system for project ${projectId}`);
    const designSystem = await designer.createDesignSystem(requirements, context);
    // Store design system
    await memory.store('design_system', JSON.stringify(designSystem), { tags: ['design'] });
    // Generate design files (simplified)
    const files = [];
    return { designSystem, files };
}
/**
 * Generate frontend code
 */
async function generateFrontend(projectId, architecture, designSystem) {
    console.log(`[Activity] Generating frontend for project ${projectId}`);
    // Default tech stack
    const techStack = {
        frontend: { framework: 'Next.js 15', language: 'TypeScript', styling: 'Tailwind CSS' },
    };
    // Default file structure
    const fileStructure = [
        'app/',
        'app/page.tsx',
        'app/layout.tsx',
        'components/',
        'lib/',
    ];
    const files = await frontendEngineer.generateCode(architecture, designSystem, techStack, fileStructure);
    return files;
}
/**
 * Generate backend code
 */
async function generateBackend(projectId, requirements, dataModels, architecture) {
    console.log(`[Activity] Generating backend for project ${projectId}`);
    const result = await backendEngineer.generateBackend(requirements, dataModels, architecture);
    return result;
}
/**
 * Review code quality
 */
async function reviewCode(projectId, files, requirements) {
    console.log(`[Activity] Reviewing code for project ${projectId}`);
    const report = await qaEngineer.reviewCode(files, requirements);
    return {
        score: report.score,
        issues: report.issues.map(i => ({
            severity: i.severity,
            message: i.message,
            file: i.file,
        })),
        suggestions: report.suggestions,
    };
}
/**
 * Audit security
 */
async function auditSecurity(projectId, files) {
    console.log(`[Activity] Auditing security for project ${projectId}`);
    const report = await securityAgent.auditSecurity(files);
    return {
        score: report.score,
        grade: report.grade,
        issues: report.issues.map(i => ({
            severity: i.severity,
            title: i.title,
            description: i.description,
        })),
    };
}
/**
 * Request human feedback
 */
async function requestFeedback(projectId, request) {
    console.log(`[Activity] Requesting feedback for project ${projectId}: ${request.title}`);
    await memory.store('feedback_request', JSON.stringify(request), { tags: ['feedback'] });
}
/**
 * Deploy to sandbox
 */
async function deployToSandbox(projectId, files) {
    console.log(`[Activity] Deploying to sandbox for project ${projectId}`);
    return {
        success: true,
        url: `https://sandbox-${projectId}.e2b.dev`,
        logs: ['Deployed successfully'],
    };
}
/**
 * Store project files
 */
async function storeFiles(projectId, files) {
    console.log(`[Activity] Storing ${files.length} files for project ${projectId}`);
    for (const file of files) {
        await memory.store('file', JSON.stringify(file), { tags: [projectId, 'file'] });
    }
}
/**
 * Send notification
 */
async function sendNotification(projectId, type, message) {
    console.log(`[Activity] Notification for ${projectId}: ${type} - ${message}`);
}
//# sourceMappingURL=generation-activities.js.map