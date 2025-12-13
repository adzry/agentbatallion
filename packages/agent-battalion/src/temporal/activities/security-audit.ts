/**
 * Security Audit Activity
 * 
 * Performs adversarial security testing on the application
 * Part of Phase 5: "Red Sparrow" Operation
 */

import { SecurityAgent } from '../../agents/team/security-agent.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';
import { E2BSandbox } from '../../sandbox/e2b-sandbox.js';

export interface SecurityAuditInput {
  missionId: string;
  appUrl: string;
  appDescription: string;
}

export interface SecurityAuditResult {
  success: boolean;
  attacksRun: number;
  vulnerabilitiesFound: number;
  attacks: Array<{
    name: string;
    vulnerable: boolean;
    logs: string[];
  }>;
  recommendations: string[];
  error?: string;
}

/**
 * Perform security audit with adversarial testing
 */
export async function performSecurityAudit(input: SecurityAuditInput): Promise<SecurityAuditResult> {
  console.log(`[Activity] Performing security audit for mission: ${input.missionId}`);
  console.log(`[Activity] Target: ${input.appUrl}`);
  
  try {
    // Create security agent
    const memory = new MemoryManager();
    const tools = new ToolRegistry();
    const messageBus = new MessageBus();
    const securityAgent = new SecurityAgent(memory, tools, messageBus);

    // Generate attack vectors
    console.log('[Activity] Generating attack vectors...');
    const attackVectors = await securityAgent.generateAttackVectors(input.appDescription);
    console.log(`[Activity] Generated ${attackVectors.length} attack vectors`);

    // Create sandbox for attack execution
    const sandbox = new E2BSandbox();
    await sandbox.connect();

    const attacks: Array<{
      name: string;
      vulnerable: boolean;
      logs: string[];
    }> = [];

    let vulnerabilitiesFound = 0;

    // Execute each attack
    for (const attack of attackVectors) {
      console.log(`[Activity] Executing: ${attack.name}`);
      
      try {
        const result = await sandbox.executeAttackScript(
          input.appUrl,
          attack.payload,
          attack.target
        );

        attacks.push({
          name: attack.name,
          vulnerable: result.vulnerable,
          logs: result.logs,
        });

        if (result.vulnerable) {
          vulnerabilitiesFound++;
          console.log(`[Activity] ⚠️  VULNERABILITY FOUND: ${attack.name}`);
        } else {
          console.log(`[Activity] ✓ Protected against: ${attack.name}`);
        }
      } catch (error) {
        console.error(`[Activity] Attack failed: ${attack.name}`, error);
        attacks.push({
          name: attack.name,
          vulnerable: false,
          logs: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        });
      }
    }

    // Cleanup
    await sandbox.disconnect();

    // Generate recommendations
    const recommendations: string[] = [];
    if (vulnerabilitiesFound > 0) {
      recommendations.push('🚨 Critical: Fix detected vulnerabilities before deployment');
      recommendations.push('Implement input sanitization and validation');
      recommendations.push('Add Content Security Policy (CSP) headers');
      recommendations.push('Enable CSRF protection');
    } else {
      recommendations.push('✅ No vulnerabilities detected in attack simulation');
      recommendations.push('Continue monitoring for new threats');
      recommendations.push('Perform regular security audits');
    }

    console.log(`[Activity] Security audit complete: ${vulnerabilitiesFound} vulnerabilities found`);

    return {
      success: true,
      attacksRun: attackVectors.length,
      vulnerabilitiesFound,
      attacks,
      recommendations,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Activity] Security audit failed:', message);
    
    return {
      success: false,
      attacksRun: 0,
      vulnerabilitiesFound: 0,
      attacks: [],
      recommendations: ['Security audit failed - manual review recommended'],
      error: message,
    };
  }
}
