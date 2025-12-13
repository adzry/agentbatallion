/**
 * Tests for Contract Enforcement
 */

import { describe, it, expect } from 'vitest';
import {
  contractValidateArtifact,
  enforceOwnership,
  hasOwnership,
  getOwnershipLevel,
  ContractViolationError,
} from '../contracts/enforcement/contractValidator.js';

describe('Contract Enforcement', () => {
  describe('contractValidateArtifact', () => {
    it('should validate valid artifact data', () => {
      const validData = { title: 'Test PRD', description: 'Test description' };
      expect(() => contractValidateArtifact('prd', validData)).not.toThrow();
    });

    it('should throw on invalid artifact data', () => {
      expect(() => contractValidateArtifact('prd', null)).toThrow(ContractViolationError);
      expect(() => contractValidateArtifact('prd', 'not an object')).toThrow(ContractViolationError);
    });
  });

  describe('hasOwnership', () => {
    it('should return true for agents with owner rights', () => {
      expect(hasOwnership('alex_pm', 'prd')).toBe(true);
      expect(hasOwnership('sam_architect', 'architecture')).toBe(true);
    });

    it('should return false for agents without owner rights', () => {
      expect(hasOwnership('alex_pm', 'architecture')).toBe(false);
      expect(hasOwnership('unknown_agent', 'prd')).toBe(false);
    });
  });

  describe('getOwnershipLevel', () => {
    it('should return correct ownership level', () => {
      expect(getOwnershipLevel('alex_pm', 'prd')).toBe('owner');
      expect(getOwnershipLevel('sam_architect', 'architecture')).toBe('owner');
    });

    it('should return null for agents without ownership', () => {
      expect(getOwnershipLevel('alex_pm', 'architecture')).toBeNull();
      expect(getOwnershipLevel('unknown_agent', 'prd')).toBeNull();
    });
  });

  describe('enforceOwnership', () => {
    it('should allow owners to overwrite', () => {
      expect(() => enforceOwnership('alex_pm', 'prd', true)).not.toThrow();
    });

    it('should prevent non-owners from overwriting', () => {
      expect(() => enforceOwnership('sam_architect', 'prd', true)).toThrow(ContractViolationError);
    });

    it('should allow anyone to create new artifacts when they have access', () => {
      // This is a basic check - the actual logic depends on ownership levels
      expect(() => enforceOwnership('alex_pm', 'prd', false)).not.toThrow();
    });
  });
});
