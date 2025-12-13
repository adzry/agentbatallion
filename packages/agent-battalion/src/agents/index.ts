/**
 * Agent Battalion v3.0 - Multi-Agent System
 * 
 * Production-ready AI-powered full-stack app generator
 */

// Types
export * from './types.js';

// Base Agents
export { BaseTeamAgent } from './base-team-agent.js';

// Team Agents
export { ProductManagerAgent } from './team/product-manager.js';
export { ArchitectAgent } from './team/architect.js';
export { DesignerAgent } from './team/designer.js';
export { FrontendEngineerAgent } from './team/frontend-engineer.js';
export { QAEngineerAgent, type QAReport, type QAIssue } from './team/qa-engineer.js';
export { BackendEngineerAgent, type BackendOutput } from './team/backend-engineer.js';
export { SecurityAgent, type SecurityReport, type SecurityIssue, type SecurityCategory } from './team/security-agent.js';
export { MobileAgent, type MobileOutput } from './team/mobile-agent.js';

// Orchestrator
export { 
  TeamOrchestrator,
  createTeamOrchestrator,
  type OrchestrationResult,
  type OrchestrationProgress,
} from './team-orchestrator.js';

// LLM Service
export {
  LLMService,
  createLLMService,
  getDefaultLLMService,
  type LLMConfig,
  type LLMProvider,
  type LLMResponse,
  type Message as LLMMessage,
  type StreamChunk,
} from '../llm/llm-service.js';

// Memory
export { 
  MemoryManager,
  createMemoryManager,
  type MemoryEntry,
  type MemoryConfig,
} from '../memory/memory-manager.js';

// Vector Memory
export {
  VectorMemory,
  createVectorMemory,
  type VectorDocument,
  type VectorSearchResult,
  type VectorProvider,
  type VectorMemoryConfig,
} from '../memory/vector-memory.js';

// Communication
export {
  MessageBus,
  createMessageBus,
  type Message,
  type Subscription,
} from '../communication/message-bus.js';

// Tools
export {
  ToolRegistry,
  createToolRegistry,
  type Tool,
  type ToolParameter,
  type ToolCategory,
} from '../tools/tool-registry.js';

// Sandbox
export {
  E2BSandbox,
  createSandbox,
  type SandboxConfig,
  type SandboxFile,
  type ExecutionResult,
} from '../sandbox/e2b-sandbox.js';

// Human Feedback
export {
  HumanFeedbackManager,
  createFeedbackManager,
  requiresApproval,
  type FeedbackRequest,
  type FeedbackResponse,
  type FeedbackType,
  type FeedbackStatus,
  type FeedbackConfig,
} from '../feedback/human-feedback.js';

// Code Cleanup Utility
export { 
  cleanupCode, 
  cleanupTSX, 
  cleanupTS,
  cleanupCSS, 
  cleanupJSON,
  type CleanupResult,
  type CleanupOptions,
} from '../utils/code-cleanup.js';
