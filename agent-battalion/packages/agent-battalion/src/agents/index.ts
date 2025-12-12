/**
 * Agent Battalion - MGX-style Multi-Agent System
 * 
 * Export all agents and orchestration components
 */

// Types
export * from './types.js';

// Base Agent
export { BaseTeamAgent } from './base-team-agent.js';

// Team Agents
export { ProductManagerAgent } from './team/product-manager.js';
export { ArchitectAgent } from './team/architect.js';
export { DesignerAgent } from './team/designer.js';
export { FrontendEngineerAgent } from './team/frontend-engineer.js';
export { QAEngineerAgent, type QAReport, type QAIssue } from './team/qa-engineer.js';

// Orchestrator
export { 
  TeamOrchestrator,
  createTeamOrchestrator,
  type OrchestrationResult,
  type OrchestrationProgress,
} from './team-orchestrator.js';

// Memory
export { 
  MemoryManager,
  createMemoryManager,
  type MemoryEntry,
  type MemoryConfig,
} from '../memory/memory-manager.js';

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
