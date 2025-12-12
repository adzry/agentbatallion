/**
 * Security Agent
 *
 * Responsible for:
 * - Security vulnerability scanning
 * - Authentication review
 * - Input validation checks
 * - Dependency auditing
 * - Security best practices enforcement
 */
import { v4 as uuidv4 } from 'uuid';
import { BaseTeamAgent } from '../base-team-agent.js';
export class SecurityAgent extends BaseTeamAgent {
    constructor(memory, tools, messageBus) {
        const profile = {
            id: 'security-agent',
            name: 'Casey',
            role: 'devops_engineer', // Using devops as closest role
            avatar: '🔐',
            description: 'Security Engineer - Ensures application security',
            capabilities: {
                canWriteCode: true,
                canDesign: false,
                canTest: true,
                canDeploy: false,
                canResearch: true,
                canReview: true,
            },
            personality: 'Vigilant and thorough. Always thinking about attack vectors and defense.',
            systemPrompt: `You are Casey, an experienced Security Engineer AI agent.
Your responsibilities:
1. Scan code for security vulnerabilities
2. Review authentication and authorization logic
3. Check for common web vulnerabilities (XSS, CSRF, injection)
4. Audit dependencies for known vulnerabilities
5. Ensure secure coding practices
6. Generate security recommendations

Focus on:
- OWASP Top 10 vulnerabilities
- Input validation and sanitization
- Secure authentication flows
- Proper error handling (no info leakage)
- Secure headers and CORS configuration
- Environment variable security`,
        };
        super(profile, memory, tools, messageBus);
    }
    /**
     * Perform security audit on project files
     */
    async auditSecurity(files) {
        this.updateStatus('working');
        this.think('Starting comprehensive security audit...');
        const issues = [];
        // Check each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            this.think(`Scanning: ${file.path}`);
            const fileIssues = await this.act('review', `Scanning ${file.path}`, async () => {
                return this.scanFile(file);
            });
            issues.push(...fileIssues);
            this.updateProgress(((i + 1) / files.length) * 60);
        }
        // Check for missing security measures
        this.think('Checking for missing security measures...');
        const missingSecurityIssues = await this.act('review', 'Checking security measures', async () => {
            return this.checkMissingSecurityMeasures(files);
        });
        issues.push(...missingSecurityIssues);
        this.updateProgress(80);
        // Check dependencies
        this.think('Auditing dependencies...');
        const depIssues = await this.act('review', 'Auditing dependencies', async () => {
            return this.auditDependencies(files);
        });
        issues.push(...depIssues);
        this.updateProgress(90);
        // Generate report
        const report = this.generateReport(issues, files);
        // Create artifact
        this.createArtifact('documentation', 'Security Report', this.formatReportMarkdown(report), 'docs/SECURITY_REPORT.md');
        this.updateStatus('complete');
        this.updateProgress(100);
        return report;
    }
    async executeTask(task) {
        switch (task.title) {
            case 'security_audit':
                const files = await this.memory.recall('files', 100);
                return await this.auditSecurity(files);
            default:
                throw new Error(`Unknown task: ${task.title}`);
        }
    }
    scanFile(file) {
        const issues = [];
        const content = file.content;
        const lines = content.split('\n');
        // Skip non-code files
        if (!file.path.match(/\.(ts|tsx|js|jsx|json)$/)) {
            return issues;
        }
        // SQL Injection checks
        if (content.includes('raw(') || content.includes('$queryRaw')) {
            issues.push({
                id: uuidv4(),
                severity: 'high',
                category: 'injection',
                title: 'Potential SQL Injection',
                description: 'Raw SQL query detected. Ensure proper parameterization.',
                file: file.path,
                recommendation: 'Use parameterized queries or ORM methods instead of raw SQL.',
                cwe: 'CWE-89',
            });
        }
        // XSS checks
        if (content.includes('dangerouslySetInnerHTML')) {
            issues.push({
                id: uuidv4(),
                severity: 'high',
                category: 'xss',
                title: 'Potential XSS Vulnerability',
                description: 'dangerouslySetInnerHTML usage detected.',
                file: file.path,
                recommendation: 'Sanitize HTML content before rendering. Use DOMPurify or similar.',
                cwe: 'CWE-79',
            });
        }
        // Hardcoded secrets
        const secretPatterns = [
            /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
            /secret\s*[:=]\s*['"][^'"]+['"]/i,
            /password\s*[:=]\s*['"][^'"]+['"]/i,
            /token\s*[:=]\s*['"][^'"]+['"]/i,
        ];
        for (const pattern of secretPatterns) {
            if (pattern.test(content) && !file.path.includes('.env')) {
                issues.push({
                    id: uuidv4(),
                    severity: 'critical',
                    category: 'sensitive_data',
                    title: 'Hardcoded Secret Detected',
                    description: 'Potential hardcoded secret found in source code.',
                    file: file.path,
                    recommendation: 'Move secrets to environment variables.',
                    cwe: 'CWE-798',
                });
                break;
            }
        }
        // Insecure crypto
        if (content.includes('md5') || content.includes('sha1')) {
            issues.push({
                id: uuidv4(),
                severity: 'medium',
                category: 'cryptography',
                title: 'Weak Cryptographic Algorithm',
                description: 'MD5 or SHA1 detected. These are considered weak.',
                file: file.path,
                recommendation: 'Use SHA-256 or stronger algorithms.',
                cwe: 'CWE-328',
            });
        }
        // Console.log in production code
        lines.forEach((line, idx) => {
            if (line.includes('console.log') &&
                !file.path.includes('test') &&
                !file.path.includes('dev')) {
                issues.push({
                    id: uuidv4(),
                    severity: 'low',
                    category: 'logging',
                    title: 'Console Log Statement',
                    description: 'console.log found in production code.',
                    file: file.path,
                    line: idx + 1,
                    recommendation: 'Remove or replace with proper logging.',
                    cwe: 'CWE-532',
                });
            }
        });
        // Eval usage
        if (content.includes('eval(') || content.includes('new Function(')) {
            issues.push({
                id: uuidv4(),
                severity: 'critical',
                category: 'injection',
                title: 'Dangerous eval() Usage',
                description: 'eval() or Function constructor detected.',
                file: file.path,
                recommendation: 'Avoid eval(). Use safer alternatives.',
                cwe: 'CWE-95',
            });
        }
        // Regex DoS potential
        const regexPattern = /new RegExp\([^)]*\+/;
        if (regexPattern.test(content)) {
            issues.push({
                id: uuidv4(),
                severity: 'medium',
                category: 'injection',
                title: 'Potential ReDoS',
                description: 'Dynamic regex with concatenation detected.',
                file: file.path,
                recommendation: 'Validate and sanitize regex input.',
                cwe: 'CWE-1333',
            });
        }
        // CORS wildcard
        if (content.includes("origin: '*'") || content.includes('origin: "*"')) {
            issues.push({
                id: uuidv4(),
                severity: 'medium',
                category: 'misconfiguration',
                title: 'CORS Wildcard',
                description: 'CORS allows all origins.',
                file: file.path,
                recommendation: 'Restrict CORS to specific trusted origins.',
                cwe: 'CWE-942',
            });
        }
        // Missing input validation in API routes
        if (file.path.includes('api/') && file.path.endsWith('route.ts')) {
            if (!content.includes('z.') && !content.includes('zod') && !content.includes('validate')) {
                issues.push({
                    id: uuidv4(),
                    severity: 'medium',
                    category: 'injection',
                    title: 'Missing Input Validation',
                    description: 'API route may lack input validation.',
                    file: file.path,
                    recommendation: 'Add Zod or similar validation for all inputs.',
                    cwe: 'CWE-20',
                });
            }
        }
        return issues;
    }
    checkMissingSecurityMeasures(files) {
        const issues = [];
        const allContent = files.map(f => f.content).join('\n');
        const filePaths = files.map(f => f.path);
        // Check for CSRF protection
        if (!allContent.includes('csrf') && !allContent.includes('CSRF')) {
            issues.push({
                id: uuidv4(),
                severity: 'medium',
                category: 'csrf',
                title: 'No CSRF Protection Detected',
                description: 'Application may be vulnerable to CSRF attacks.',
                recommendation: 'Implement CSRF tokens for state-changing operations.',
                cwe: 'CWE-352',
            });
        }
        // Check for rate limiting
        if (!allContent.includes('rateLimit') && !allContent.includes('rate-limit')) {
            issues.push({
                id: uuidv4(),
                severity: 'medium',
                category: 'misconfiguration',
                title: 'No Rate Limiting',
                description: 'API endpoints may be vulnerable to brute force attacks.',
                recommendation: 'Implement rate limiting for API endpoints.',
                cwe: 'CWE-307',
            });
        }
        // Check for security headers
        if (!allContent.includes('Content-Security-Policy') && !allContent.includes('helmet')) {
            issues.push({
                id: uuidv4(),
                severity: 'low',
                category: 'misconfiguration',
                title: 'Missing Security Headers',
                description: 'Security headers like CSP may not be configured.',
                recommendation: 'Add security headers in middleware or next.config.',
            });
        }
        // Check for .env.example
        if (!filePaths.some(p => p.includes('.env.example') || p.includes('.env.local'))) {
            issues.push({
                id: uuidv4(),
                severity: 'info',
                category: 'misconfiguration',
                title: 'No Environment Template',
                description: 'No .env.example file found.',
                recommendation: 'Create .env.example with required variables (without values).',
            });
        }
        return issues;
    }
    auditDependencies(files) {
        const issues = [];
        const packageJson = files.find(f => f.path === 'package.json');
        if (!packageJson)
            return issues;
        try {
            const pkg = JSON.parse(packageJson.content);
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            // Check for known vulnerable versions (simplified check)
            const vulnerablePackages = {
                'lodash': { version: '<4.17.21', severity: 'high' },
                'axios': { version: '<0.21.1', severity: 'high' },
                'express': { version: '<4.17.3', severity: 'medium' },
            };
            for (const [pkg, info] of Object.entries(vulnerablePackages)) {
                if (deps[pkg]) {
                    issues.push({
                        id: uuidv4(),
                        severity: info.severity,
                        category: 'dependency',
                        title: `Potentially Vulnerable: ${pkg}`,
                        description: `${pkg} versions ${info.version} have known vulnerabilities.`,
                        file: 'package.json',
                        recommendation: `Update ${pkg} to the latest version.`,
                    });
                }
            }
        }
        catch {
            // Skip if package.json is invalid
        }
        return issues;
    }
    generateReport(issues, files) {
        const summary = {
            critical: issues.filter(i => i.severity === 'critical').length,
            high: issues.filter(i => i.severity === 'high').length,
            medium: issues.filter(i => i.severity === 'medium').length,
            low: issues.filter(i => i.severity === 'low').length,
            info: issues.filter(i => i.severity === 'info').length,
        };
        // Calculate score (100 - weighted issues)
        const score = Math.max(0, 100 -
            (summary.critical * 25) -
            (summary.high * 15) -
            (summary.medium * 8) -
            (summary.low * 3) -
            (summary.info * 1));
        // Determine grade
        let grade = 'F';
        if (score >= 90)
            grade = 'A';
        else if (score >= 80)
            grade = 'B';
        else if (score >= 70)
            grade = 'C';
        else if (score >= 60)
            grade = 'D';
        // Generate recommendations
        const recommendations = [];
        if (summary.critical > 0) {
            recommendations.push('🚨 Address critical vulnerabilities immediately');
        }
        if (summary.high > 0) {
            recommendations.push('⚠️ Fix high-severity issues before deployment');
        }
        recommendations.push('📋 Run npm audit regularly');
        recommendations.push('🔒 Enable Dependabot for automatic security updates');
        recommendations.push('🧪 Add security testing to CI/CD pipeline');
        // Passed checks
        const passedChecks = [];
        const allContent = files.map(f => f.content).join('\n');
        if (allContent.includes('bcrypt') || allContent.includes('argon')) {
            passedChecks.push('✅ Secure password hashing detected');
        }
        if (allContent.includes('zod') || allContent.includes('validate')) {
            passedChecks.push('✅ Input validation detected');
        }
        if (allContent.includes('JWT') || allContent.includes('jwt')) {
            passedChecks.push('✅ JWT authentication detected');
        }
        if (allContent.includes('https')) {
            passedChecks.push('✅ HTTPS usage detected');
        }
        return {
            score,
            grade,
            issues,
            summary,
            recommendations,
            passedChecks,
        };
    }
    formatReportMarkdown(report) {
        const severityEmoji = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🔵',
            info: 'ℹ️',
        };
        return `# Security Audit Report

## Summary

| Metric | Value |
|--------|-------|
| **Security Score** | ${report.score}/100 |
| **Grade** | ${report.grade} |
| **Total Issues** | ${report.issues.length} |

### Issues by Severity

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${report.summary.critical} |
| 🟠 High | ${report.summary.high} |
| 🟡 Medium | ${report.summary.medium} |
| 🔵 Low | ${report.summary.low} |
| ℹ️ Info | ${report.summary.info} |

## Passed Checks

${report.passedChecks.map(c => `- ${c}`).join('\n')}

## Issues

${report.issues.map(issue => `
### ${severityEmoji[issue.severity]} ${issue.title}

- **Severity:** ${issue.severity.toUpperCase()}
- **Category:** ${issue.category}
${issue.file ? `- **File:** \`${issue.file}\`${issue.line ? ` (line ${issue.line})` : ''}` : ''}
${issue.cwe ? `- **CWE:** ${issue.cwe}` : ''}

${issue.description}

**Recommendation:** ${issue.recommendation}
`).join('\n---\n')}

## Recommendations

${report.recommendations.map(r => `- ${r}`).join('\n')}

---

*Generated by Agent Battalion - Security Agent*
`;
    }
}
//# sourceMappingURL=security-agent.js.map