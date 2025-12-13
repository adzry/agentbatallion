/**
 * Contract Registry
 * 
 * Maps artifact types to JSON schemas and defines agent contracts
 */

import { AgentContract, StageIO } from './types.js';

/**
 * Schema URLs for each artifact type
 * These are logical references - in production, these would point to actual JSON schema files
 */
export const SCHEMAS = {
  prd: '/schemas/prd.schema.json',
  architecture: '/schemas/architecture.schema.json',
  api_contract: '/schemas/api_contract.schema.json',
  ui_spec: '/schemas/ui_spec.schema.json',
  backend_spec: '/schemas/backend_spec.schema.json',
  mobile_spec: '/schemas/mobile_spec.schema.json',
  test_plan: '/schemas/test_plan.schema.json',
  security_report: '/schemas/security_report.schema.json',
  verification_result: '/schemas/verification_result.schema.json',
  run_manifest: '/schemas/run_manifest.schema.json',
} as const;

export type ArtifactType = keyof typeof SCHEMAS;

/**
 * Agent Contracts
 * Defines inputs, outputs, invariants, forbidden actions, and ownership for each agent
 */
export const AGENT_CONTRACTS: Record<string, AgentContract> = {
  alex_pm: {
    agentId: 'alex_pm',
    inputs: [],
    outputs: [
      { type: 'prd', required: true },
    ],
    invariants: [
      'PRD must include clear acceptance criteria',
      'PRD must be validated against schema',
    ],
    forbiddenActions: [
      'Cannot modify architecture',
      'Cannot modify code',
    ],
    ownership: [
      { artifactType: 'prd', level: 'owner' },
    ],
  },
  sam_architect: {
    agentId: 'sam_architect',
    inputs: [
      { type: 'prd', required: true },
    ],
    outputs: [
      { type: 'architecture', required: true },
      { type: 'api_contract', required: true },
    ],
    invariants: [
      'Architecture must be consistent with PRD requirements',
      'API contract must follow RESTful principles',
    ],
    forbiddenActions: [
      'Cannot modify PRD',
      'Cannot implement code directly',
    ],
    ownership: [
      { artifactType: 'architecture', level: 'owner' },
      { artifactType: 'api_contract', level: 'owner' },
    ],
  },
  dana_designer: {
    agentId: 'dana_designer',
    inputs: [
      { type: 'prd', required: true },
      { type: 'architecture', required: false },
    ],
    outputs: [
      { type: 'ui_spec', required: true },
    ],
    invariants: [
      'UI spec must follow design system guidelines',
      'UI spec must be consistent with PRD',
    ],
    forbiddenActions: [
      'Cannot modify backend implementation',
    ],
    ownership: [
      { artifactType: 'ui_spec', level: 'owner' },
    ],
  },
  frontend_engineer: {
    agentId: 'frontend_engineer',
    inputs: [
      { type: 'ui_spec', required: true },
      { type: 'api_contract', required: true },
    ],
    outputs: [],
    invariants: [
      'Code must match UI spec',
      'Code must integrate with API contract',
    ],
    forbiddenActions: [
      'Cannot modify API contract',
      'Cannot modify UI spec without approval',
    ],
    ownership: [],
  },
  backend_engineer: {
    agentId: 'backend_engineer',
    inputs: [
      { type: 'architecture', required: true },
      { type: 'api_contract', required: true },
    ],
    outputs: [
      { type: 'backend_spec', required: true },
    ],
    invariants: [
      'Implementation must match architecture',
      'APIs must match contract',
    ],
    forbiddenActions: [
      'Cannot modify architecture without approval',
    ],
    ownership: [
      { artifactType: 'backend_spec', level: 'owner' },
    ],
  },
  mobile_engineer: {
    agentId: 'mobile_engineer',
    inputs: [
      { type: 'ui_spec', required: true },
      { type: 'api_contract', required: true },
    ],
    outputs: [
      { type: 'mobile_spec', required: true },
    ],
    invariants: [
      'Mobile app must match UI spec',
      'Mobile app must integrate with API contract',
    ],
    forbiddenActions: [
      'Cannot modify backend implementation',
    ],
    ownership: [
      { artifactType: 'mobile_spec', level: 'owner' },
    ],
  },
  security_analyst: {
    agentId: 'security_analyst',
    inputs: [
      { type: 'architecture', required: true },
      { type: 'backend_spec', required: false },
    ],
    outputs: [
      { type: 'security_report', required: true },
    ],
    invariants: [
      'Security report must identify all critical vulnerabilities',
    ],
    forbiddenActions: [
      'Cannot modify code directly',
    ],
    ownership: [
      { artifactType: 'security_report', level: 'owner' },
    ],
  },
  qa_engineer: {
    agentId: 'qa_engineer',
    inputs: [
      { type: 'prd', required: true },
      { type: 'architecture', required: false },
    ],
    outputs: [
      { type: 'test_plan', required: true },
    ],
    invariants: [
      'Test plan must cover all PRD requirements',
    ],
    forbiddenActions: [
      'Cannot modify implementation',
    ],
    ownership: [
      { artifactType: 'test_plan', level: 'owner' },
    ],
  },
};

/**
 * Stage IO Definitions
 * Maps pipeline stages to their required inputs and produced outputs
 */
export const STAGE_IO: StageIO[] = [
  {
    stageName: 'prd_creation',
    requires: [],
    produces: ['prd'],
  },
  {
    stageName: 'architecture_design',
    requires: ['prd'],
    produces: ['architecture', 'api_contract'],
  },
  {
    stageName: 'ui_design',
    requires: ['prd', 'architecture'],
    produces: ['ui_spec'],
  },
  {
    stageName: 'backend_spec',
    requires: ['architecture', 'api_contract'],
    produces: ['backend_spec'],
  },
  {
    stageName: 'mobile_spec',
    requires: ['ui_spec', 'api_contract'],
    produces: ['mobile_spec'],
  },
  {
    stageName: 'security_review',
    requires: ['architecture', 'backend_spec'],
    produces: ['security_report'],
  },
  {
    stageName: 'test_planning',
    requires: ['prd', 'architecture'],
    produces: ['test_plan'],
  },
  {
    stageName: 'implementation',
    requires: ['ui_spec', 'backend_spec', 'api_contract'],
    produces: [],
  },
  {
    stageName: 'verification',
    requires: ['test_plan'],
    produces: ['verification_result'],
  },
  {
    stageName: 'manifest_generation',
    requires: ['verification_result'],
    produces: ['run_manifest'],
  },
];
