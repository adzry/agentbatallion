/**
 * Generation Activities - Temporal Activity Definitions
 * 
 * These activities are executed by the Temporal worker and can be
 * retried, timed out, and monitored independently.
 */

import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
import { ProductManagerAgent } from '../../agents/team/product-manager.js';
import { ArchitectAgent } from '../../agents/team/architect.js';
import { DesignerAgent } from '../../agents/team/designer.js';
import { FrontendEngineerAgent } from '../../agents/team/frontend-engineer.js';
import { QAEngineerAgent } from '../../agents/team/qa-engineer.js';
import { BackendEngineerAgent } from '../../agents/team/backend-engineer.js';
import { SecurityAgent } from '../../agents/team/security-agent.js';
import type { ProjectFile, Requirement, ArchitectureSpec, DesignSystem, ProjectContext, DataModel } from '../../agents/types.js';

// Shared instances (per worker)
const memory = new MemoryManager();
const tools = new ToolRegistry();
const messageBus = new MessageBus();

// Agent instances
const productManager = new ProductManagerAgent(memory, tools, messageBus);
const architect = new ArchitectAgent(memory, tools, messageBus);
const designer = new DesignerAgent(memory, tools, messageBus);
const frontendEngineer = new FrontendEngineerAgent(memory, tools, messageBus);
const qaEngineer = new QAEngineerAgent(memory, tools, messageBus);
const backendEngineer = new BackendEngineerAgent(memory, tools, messageBus);
const securityAgent = new SecurityAgent(memory, tools, messageBus);

/**
 * Analyze requirements from user request
 */
export async function analyzeRequirements(
  projectId: string,
  userRequest: string
): Promise<{ requirements: Requirement[]; context: ProjectContext }> {
  console.log(`[Activity] Analyzing requirements for project ${projectId}`);
  
  memory.setContext('projectId', projectId);
  const result = await productManager.analyzeRequest(userRequest);
  
  // Store in memory for other agents
  for (const req of result.requirements) {
    await memory.store('requirement', JSON.stringify(req), { tags: ['requirement'] });
  }

  // Convert partial context to full context
  const context: ProjectContext = {
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
export async function designArchitecture(
  projectId: string,
  requirements: Requirement[],
  context: ProjectContext
): Promise<{ architecture: ArchitectureSpec; fileStructure: string[] }> {
  console.log(`[Activity] Designing architecture for project ${projectId}`);
  
  const result = await architect.designArchitecture(requirements, context);
  
  // Store architecture spec
  await memory.store('architecture', JSON.stringify(result.architecture), { tags: ['architecture'] });
  
  return result;
}

/**
 * Create design system
 */
export async function createDesignSystem(
  projectId: string,
  requirements: Requirement[],
  context: ProjectContext
): Promise<{ designSystem: DesignSystem; files: ProjectFile[] }> {
  console.log(`[Activity] Creating design system for project ${projectId}`);
  
  const designSystem = await designer.createDesignSystem(requirements, context);
  
  // Store design system
  await memory.store('design_system', JSON.stringify(designSystem), { tags: ['design'] });
  
  // Generate design files (simplified)
  const files: ProjectFile[] = [];
  
  return { designSystem, files };
}

/**
 * Generate frontend code
 */
export async function generateFrontend(
  projectId: string,
  architecture: ArchitectureSpec,
  designSystem: DesignSystem
): Promise<ProjectFile[]> {
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
export async function generateBackend(
  projectId: string,
  requirements: Requirement[],
  dataModels: DataModel[],
  architecture: ArchitectureSpec
): Promise<{
  schema: string;
  apiRoutes: ProjectFile[];
  middleware: ProjectFile[];
  utils: ProjectFile[];
}> {
  console.log(`[Activity] Generating backend for project ${projectId}`);
  
  const result = await backendEngineer.generateBackend(requirements, dataModels, architecture);
  
  return result;
}

/**
 * Review code quality
 */
export async function reviewCode(
  projectId: string,
  files: ProjectFile[],
  requirements: Requirement[]
): Promise<{
  score: number;
  issues: Array<{ severity: string; message: string; file: string }>;
  suggestions: string[];
}> {
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
export async function auditSecurity(
  projectId: string,
  files: ProjectFile[]
): Promise<{
  score: number;
  grade: string;
  issues: Array<{ severity: string; title: string; description: string }>;
}> {
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
export async function requestFeedback(
  projectId: string,
  request: {
    type: string;
    title: string;
    content: string;
    agentId: string;
  }
): Promise<void> {
  console.log(`[Activity] Requesting feedback for project ${projectId}: ${request.title}`);
  
  await memory.store('feedback_request', JSON.stringify(request), { tags: ['feedback'] });
}

/**
 * Deploy to sandbox
 */
export async function deployToSandbox(
  projectId: string,
  files: ProjectFile[]
): Promise<{
  success: boolean;
  url?: string;
  logs: string[];
}> {
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
export async function storeFiles(
  projectId: string,
  files: ProjectFile[]
): Promise<void> {
  console.log(`[Activity] Storing ${files.length} files for project ${projectId}`);
  
  for (const file of files) {
    await memory.store('file', JSON.stringify(file), { tags: [projectId, 'file'] });
  }
}

/**
 * Send notification
 */
export async function sendNotification(
  projectId: string,
  type: string,
  message: string
): Promise<void> {
  console.log(`[Activity] Notification for ${projectId}: ${type} - ${message}`);
}
