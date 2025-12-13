/**
 * Run Store
 * 
 * In-memory storage for artifacts produced during a pipeline run
 */

import { ArtifactType } from '../contracts/registry.js';
import { OwnershipLevel } from '../contracts/types.js';
import { AGENT_CONTRACTS } from '../contracts/registry.js';

export interface StoredArtifact {
  type: ArtifactType;
  data: any;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface RunManifest {
  runId: string;
  artifacts: string[];
  createdAt: Date;
  status: 'in-progress' | 'complete' | 'failed';
}

/**
 * RunStore manages artifacts for a single pipeline run
 */
export class RunStore {
  private runId: string;
  private artifacts: Map<ArtifactType, StoredArtifact> = new Map();
  private createdAt: Date;

  constructor(runId: string) {
    this.runId = runId;
    this.createdAt = new Date();
  }

  /**
   * Store an artifact
   */
  put(type: ArtifactType, data: any, createdBy: string): void {
    const existing = this.artifacts.get(type);
    
    this.artifacts.set(type, {
      type,
      data,
      createdBy,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
      version: existing ? existing.version + 1 : 1,
    });
  }

  /**
   * Retrieve an artifact
   */
  get(type: ArtifactType): any | null {
    const artifact = this.artifacts.get(type);
    return artifact ? artifact.data : null;
  }

  /**
   * Check if an artifact exists
   */
  has(type: ArtifactType): boolean {
    return this.artifacts.has(type);
  }

  /**
   * Get access level for an agent on an artifact type
   * 
   * TODO: Integrate with AGENT_CONTRACTS to determine true access levels
   * For now, returns 'owner' for all types as a placeholder
   */
  getAccess(agentId: string, artifactType: ArtifactType): OwnershipLevel {
    const contract = AGENT_CONTRACTS[agentId];
    if (!contract) {
      return 'read-only';
    }

    const ownership = contract.ownership.find(o => o.artifactType === artifactType);
    return ownership?.level || 'read-only';
  }

  /**
   * Get all artifacts
   */
  getAll(): Map<ArtifactType, StoredArtifact> {
    return new Map(this.artifacts);
  }

  /**
   * Build a manifest of all artifacts in this run
   * 
   * TODO: Eventually produce a manifest matching run_manifest.schema.json
   * For now, returns a simple list of artifact keys
   */
  buildManifest(): RunManifest {
    return {
      runId: this.runId,
      artifacts: Array.from(this.artifacts.keys()),
      createdAt: this.createdAt,
      status: 'complete',
    };
  }

  /**
   * Get run ID
   */
  getRunId(): string {
    return this.runId;
  }

  /**
   * Get artifact metadata
   */
  getMetadata(type: ArtifactType): Omit<StoredArtifact, 'data'> | null {
    const artifact = this.artifacts.get(type);
    if (!artifact) return null;

    const { data, ...metadata } = artifact;
    return metadata;
  }

  /**
   * Clear all artifacts
   */
  clear(): void {
    this.artifacts.clear();
  }
}

/**
 * Create a new RunStore instance
 */
export function createRunStore(runId: string): RunStore {
  return new RunStore(runId);
}
