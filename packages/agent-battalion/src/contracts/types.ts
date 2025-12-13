/**
 * Contract Types
 * 
 * Defines TypeScript interfaces for agent contracts, artifacts, and ownership
 */

export type OwnershipLevel = 'owner' | 'propose-only' | 'read-only';

export interface ArtifactRef {
  type: string;
  version?: string;
  required: boolean;
}

export interface Ownership {
  artifactType: string;
  level: OwnershipLevel;
}

export interface AgentContract {
  agentId: string;
  inputs: ArtifactRef[];
  outputs: ArtifactRef[];
  invariants?: string[];
  forbiddenActions?: string[];
  ownership: Ownership[];
}

export interface StageIO {
  stageName: string;
  requires: string[];
  produces: string[];
}
