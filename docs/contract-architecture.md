# Contract-Based Architecture

This document describes the new contract-based architecture implemented in Agent Battalion.

## Overview

The contract-based architecture provides a structured pipeline for application generation with explicit contracts between agents, artifact validation, ownership enforcement, and quality gates.

## Directory Structure

```
packages/agent-battalion/src/
├── contracts/           # Schema definitions, registry, and validation
│   ├── types.ts        # TypeScript interfaces for contracts
│   ├── registry.ts     # Schema mappings and agent contracts
│   ├── validators.ts   # Validation helpers
│   ├── enforcement/    # Contract enforcement logic
│   │   └── contractValidator.ts
│   └── index.ts
├── verification/        # Build, lint, test, security checks
│   ├── verificationOrchestrator.ts
│   └── index.ts
├── orchestration/       # Pipeline, gating, and repair logic
│   ├── pipeline/       # Pipeline orchestration
│   │   └── createAppPipeline.ts
│   ├── gating/         # Quality gates
│   │   └── gate.ts
│   ├── repair/         # Self-correction logic
│   │   └── repairController.ts
│   └── index.ts
└── memory/             # Artifact storage
    ├── runStore.ts     # In-memory artifact store
    └── ...
```

## Key Components

### 1. Contracts Module

**Purpose**: Defines and enforces contracts between agents and artifacts.

**Files**:
- `types.ts`: Core TypeScript interfaces (AgentContract, ArtifactRef, Ownership)
- `registry.ts`: Maps artifacts to schemas and defines agent contracts
- `validators.ts`: Stub validation functions (ready for Ajv integration)
- `enforcement/contractValidator.ts`: Validates artifacts and enforces ownership

**Key Concepts**:
- **Artifact Types**: PRD, architecture, API contract, UI spec, backend spec, mobile spec, test plan, security report, verification result, run manifest
- **Ownership Levels**: owner, propose-only, read-only
- **Agent Contracts**: Each agent has defined inputs, outputs, invariants, forbidden actions, and ownership

### 2. Verification Module

**Purpose**: Runs build, lint, test, and security checks.

**Files**:
- `verificationOrchestrator.ts`: Orchestrates all verification checks

**Current Status**: Stub implementation that returns pass results. Ready to be extended with:
- TypeScript build checks
- ESLint/Prettier
- Unit tests
- API schema validation
- Security scans (npm audit, Snyk)

### 3. Orchestration Module

**Purpose**: Coordinates the entire pipeline execution.

**Files**:
- `pipeline/createAppPipeline.ts`: Main pipeline orchestrator with 10 stages
- `gating/gate.ts`: Quality gate logic based on verification results
- `repair/repairController.ts`: Self-correction when verification fails

**Pipeline Stages**:
1. PRD Creation
2. Architecture & API Contract
3. UI Design
4. Backend Spec
5. Mobile Spec
6. Security Review
7. Test Planning
8. Implementation
9. Verification & Gating
10. Manifest Generation

**Gating Logic**: Fails on "high" or "critical" severity issues, passes otherwise.

### 4. Memory Module (RunStore)

**Purpose**: In-memory storage for artifacts during a pipeline run.

**Files**:
- `runStore.ts`: Manages artifacts with versioning and access control

**Features**:
- Store/retrieve artifacts by type
- Version tracking
- Access level enforcement
- Manifest generation

## Integration

### CLI Integration

Added `--use-pipeline` flag to the `create` command:

```bash
npm run cli -- create "Build a todo app" --use-pipeline
```

### Web Server Integration

Added new WebSocket event `generate:pipeline` for pipeline-based generation:

```javascript
socket.emit('generate:pipeline', {
  prompt: 'Build a todo app',
  projectName: 'My App'
});
```

## Testing

All new modules include comprehensive unit tests:
- `contract-enforcement.test.ts`: Tests for validation and ownership
- `runStore.test.ts`: Tests for artifact storage
- `gating.test.ts`: Tests for quality gates
- `pipeline-integration.test.ts`: End-to-end pipeline tests

Run tests: `npm test`

## Future Enhancements

1. **JSON Schema Validation**: Integrate Ajv for actual schema validation
2. **Repair Loop**: Implement self-correction with agent feedback
3. **Persistence**: Extend RunStore to save artifacts to disk/database
4. **Failure Memory**: Track common mistakes to avoid repeating them
5. **Schema Files**: Create actual JSON schema files for all artifact types
6. **Agent Wiring**: Connect placeholder functions to real agent implementations

## Usage Example

```typescript
import { createAppPipeline } from './orchestration/pipeline/createAppPipeline.js';

const result = await createAppPipeline({
  prompt: 'Build a todo app with user authentication',
  projectName: 'Todo App',
  outputDir: './generated-app',
  maxRepairAttempts: 3,
});

if (result.success) {
  console.log(`✅ Pipeline completed!`);
  console.log(`Run ID: ${result.runId}`);
  console.log(`Artifacts: ${result.artifacts.size}`);
} else {
  console.error(`❌ Pipeline failed: ${result.error}`);
}
```

## Agent Contracts Example

```typescript
// From registry.ts
export const AGENT_CONTRACTS = {
  alex_pm: {
    agentId: 'alex_pm',
    inputs: [],
    outputs: [{ type: 'prd', required: true }],
    invariants: ['PRD must include clear acceptance criteria'],
    forbiddenActions: ['Cannot modify architecture', 'Cannot modify code'],
    ownership: [{ artifactType: 'prd', level: 'owner' }],
  },
  // ... more agents
};
```

## Notes

- All verification checks are currently stubs that return pass results
- Agent invocation uses placeholder functions that return stub data
- Schema files are referenced but not yet created
- The pipeline is fully functional but doesn't generate actual code yet
- Integration with existing agent system is via placeholder functions
