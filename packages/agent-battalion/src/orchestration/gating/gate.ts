/**
 * Gate Logic
 * 
 * Determines if verification results should allow pipeline to continue
 */

import { VerificationResult, Issue } from '../../verification/verificationOrchestrator.js';

export interface GateResult {
  status: 'pass' | 'fail';
  blocking?: Issue[];
  message?: string;
}

/**
 * Gate based on verification results
 * 
 * Fails the gate if there are any "high" or "critical" severity issues
 */
export function gateFromVerification(verification: VerificationResult): GateResult {
  const blockingIssues: Issue[] = [];

  // Collect all high and critical issues from all checks
  for (const check of verification.checks) {
    for (const issue of check.issues) {
      if (issue.severity === 'high' || issue.severity === 'critical') {
        blockingIssues.push(issue);
      }
    }
  }

  if (blockingIssues.length > 0) {
    return {
      status: 'fail',
      blocking: blockingIssues,
      message: `Found ${blockingIssues.length} blocking issue(s) with high or critical severity`,
    };
  }

  return {
    status: 'pass',
    message: 'All verification checks passed or had only low/medium severity issues',
  };
}

/**
 * Simple gate that always passes (for testing)
 */
export function alwaysPassGate(): GateResult {
  return {
    status: 'pass',
    message: 'Gate bypassed',
  };
}

/**
 * Simple gate that always fails (for testing)
 */
export function alwaysFailGate(reason: string = 'Gate forced to fail'): GateResult {
  return {
    status: 'fail',
    message: reason,
  };
}
