/**
 * Contract Enforcement
 * 
 * Validates artifacts and enforces ownership rules
 */

import { ArtifactType, AGENT_CONTRACTS } from '../registry.js';
import { validateArtifact, ValidationResult } from '../validators.js';
import { OwnershipLevel } from '../types.js';

export class ContractViolationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ContractViolationError';
  }
}

/**
 * Validate an artifact against its schema
 * Throws an error if validation fails
 */
export function contractValidateArtifact(
  artifactType: ArtifactType,
  data: any
): void {
  const result: ValidationResult = validateArtifact(artifactType, data);
  
  if (!result.valid) {
    const errorMessages = result.errors?.map(e => `${e.path}: ${e.message}`).join('; ') || 'Unknown error';
    throw new ContractViolationError(
      `Artifact validation failed for type '${artifactType}': ${errorMessages}`,
      { artifactType, errors: result.errors }
    );
  }
}

/**
 * Check if an agent has owner rights for an artifact type
 */
export function hasOwnership(agentId: string, artifactType: string): boolean {
  const contract = AGENT_CONTRACTS[agentId];
  if (!contract) {
    return false;
  }

  const ownership = contract.ownership.find(o => o.artifactType === artifactType);
  return ownership?.level === 'owner';
}

/**
 * Get the ownership level an agent has for an artifact type
 */
export function getOwnershipLevel(
  agentId: string,
  artifactType: string
): OwnershipLevel | null {
  const contract = AGENT_CONTRACTS[agentId];
  if (!contract) {
    return null;
  }

  const ownership = contract.ownership.find(o => o.artifactType === artifactType);
  return ownership?.level || null;
}

/**
 * Enforce ownership rules before writing an artifact
 * Throws an error if the agent doesn't have owner rights
 */
export function enforceOwnership(
  agentId: string,
  artifactType: string,
  isOverwrite: boolean
): void {
  if (isOverwrite && !hasOwnership(agentId, artifactType)) {
    throw new ContractViolationError(
      `Agent '${agentId}' does not have owner rights to overwrite artifact type '${artifactType}'`,
      { agentId, artifactType, operation: 'overwrite' }
    );
  }

  const level = getOwnershipLevel(agentId, artifactType);
  
  // Check if agent can write at all
  if (level === 'read-only') {
    throw new ContractViolationError(
      `Agent '${agentId}' has read-only access to artifact type '${artifactType}'`,
      { agentId, artifactType, level }
    );
  }
  
  // Propose-only agents can create but not overwrite
  if (level === 'propose-only' && isOverwrite) {
    throw new ContractViolationError(
      `Agent '${agentId}' can only propose (not overwrite) artifact type '${artifactType}'`,
      { agentId, artifactType, level, operation: 'overwrite' }
    );
  }
}
