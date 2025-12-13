/**
 * Tests for Gating Logic
 */

import { describe, it, expect } from 'vitest';
import { gateFromVerification, alwaysPassGate, alwaysFailGate } from '../orchestration/gating/gate.js';
import { VerificationResult } from '../verification/verificationOrchestrator.js';

describe('Gating Logic', () => {
  describe('gateFromVerification', () => {
    it('should pass when no issues found', () => {
      const verification: VerificationResult = {
        status: 'pass',
        checks: [
          {
            name: 'Build',
            status: 'pass',
            issues: [],
          },
        ],
        summary: { total: 1, passed: 1, failed: 0 },
      };

      const result = gateFromVerification(verification);
      expect(result.status).toBe('pass');
    });

    it('should pass with only low severity issues', () => {
      const verification: VerificationResult = {
        status: 'pass',
        checks: [
          {
            name: 'Lint',
            status: 'fail',
            issues: [
              { severity: 'low', message: 'Missing semicolon' },
            ],
          },
        ],
        summary: { total: 1, passed: 0, failed: 1 },
      };

      const result = gateFromVerification(verification);
      expect(result.status).toBe('pass');
    });

    it('should fail with high severity issues', () => {
      const verification: VerificationResult = {
        status: 'fail',
        checks: [
          {
            name: 'Security',
            status: 'fail',
            issues: [
              { severity: 'high', message: 'SQL injection vulnerability' },
            ],
          },
        ],
        summary: { total: 1, passed: 0, failed: 1 },
      };

      const result = gateFromVerification(verification);
      expect(result.status).toBe('fail');
      expect(result.blocking).toHaveLength(1);
    });

    it('should fail with critical severity issues', () => {
      const verification: VerificationResult = {
        status: 'fail',
        checks: [
          {
            name: 'Security',
            status: 'fail',
            issues: [
              { severity: 'critical', message: 'Authentication bypass' },
            ],
          },
        ],
        summary: { total: 1, passed: 0, failed: 1 },
      };

      const result = gateFromVerification(verification);
      expect(result.status).toBe('fail');
      expect(result.blocking).toHaveLength(1);
    });
  });

  describe('alwaysPassGate', () => {
    it('should always return pass', () => {
      const result = alwaysPassGate();
      expect(result.status).toBe('pass');
    });
  });

  describe('alwaysFailGate', () => {
    it('should always return fail', () => {
      const result = alwaysFailGate('Test failure');
      expect(result.status).toBe('fail');
      expect(result.message).toBe('Test failure');
    });
  });
});
