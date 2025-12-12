"use strict";
/**
 * QA Engineer Agent
 *
 * Responsible for:
 * - Reviewing code quality
 * - Validating against requirements
 * - Checking for bugs and issues
 * - Ensuring accessibility
 * - Testing responsiveness
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QAEngineerAgent = void 0;
const uuid_1 = require("uuid");
const base_team_agent_js_1 = require("../base-team-agent.js");
class QAEngineerAgent extends base_team_agent_js_1.BaseTeamAgent {
    constructor(memory, tools, messageBus) {
        const profile = {
            id: 'qa-engineer-agent',
            name: 'Riley',
            role: 'qa_engineer',
            avatar: '🔍',
            description: 'QA Engineer - Ensures quality and reliability',
            capabilities: {
                canWriteCode: true,
                canDesign: false,
                canTest: true,
                canDeploy: false,
                canResearch: true,
                canReview: true,
            },
            personality: 'Meticulous and thorough. Has a keen eye for detail and edge cases.',
            systemPrompt: `You are Riley, an experienced QA Engineer AI agent.
Your responsibilities:
1. Review code for quality and best practices
2. Validate implementation against requirements
3. Check for accessibility issues (WCAG 2.1)
4. Identify potential bugs and edge cases
5. Review security considerations
6. Suggest improvements

Focus on:
- Code quality and maintainability
- User experience edge cases
- Accessibility compliance
- Performance considerations
- Security vulnerabilities`,
        };
        super(profile, memory, tools, messageBus);
    }
    /**
     * Review all generated code
     */
    async reviewCode(files, requirements) {
        this.updateStatus('working');
        this.think('Starting comprehensive code review...');
        let issues = [];
        let suggestions = [];
        if (this.isRealAIEnabled()) {
            // Use AI for comprehensive code review
            this.think('Using AI for deep code review...');
            const aiReport = await this.act('review', 'AI code review', async () => {
                return this.reviewWithAI(files, requirements);
            });
            issues = aiReport.issues;
            suggestions = aiReport.suggestions;
            this.updateProgress(80);
        }
        else {
            // Use rule-based review
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                this.think(`Reviewing: ${file.path}`);
                const fileIssues = await this.act('review', `Reviewing ${file.path}`, async () => {
                    return this.reviewFile(file);
                });
                issues.push(...fileIssues);
                this.updateProgress(((i + 1) / files.length) * 70);
            }
            // Check accessibility
            this.think('Checking accessibility...');
            const a11yIssues = await this.act('review', 'Accessibility check', async () => {
                return this.checkAccessibility(files);
            });
            issues.push(...a11yIssues);
            this.updateProgress(80);
            suggestions = this.generateSuggestions(issues, files);
        }
        // Check requirements coverage
        this.think('Checking requirements coverage...');
        const reqCoverage = await this.act('review', 'Checking requirements', async () => {
            return this.checkRequirementsCoverage(files, requirements);
        });
        this.updateProgress(90);
        // Calculate scores
        const criticalIssues = issues.filter(i => i.severity === 'critical').length;
        const majorIssues = issues.filter(i => i.severity === 'major').length;
        const score = Math.max(0, 100 - (criticalIssues * 20) - (majorIssues * 10) - (issues.length * 2));
        const report = {
            passed: criticalIssues === 0 && score >= 70,
            score,
            issues,
            suggestions,
            coverage: {
                requirements: reqCoverage,
                components: this.calculateComponentCoverage(files),
                accessibility: this.calculateA11yScore(issues.filter(i => i.category === 'accessibility')),
            },
        };
        // Create report artifact
        this.createArtifact('documentation', 'QA Report', this.generateReportMarkdown(report), 'docs/QA_REPORT.md');
        this.updateStatus('complete');
        this.updateProgress(100);
        return report;
    }
    /**
     * Use AI for comprehensive code review
     */
    async reviewWithAI(files, requirements) {
        // Select key files for AI review (to manage API costs/time)
        const keyFiles = files.filter(f => f.path.includes('page.tsx') ||
            f.path.includes('layout.tsx') ||
            f.path.includes('components/')).slice(0, 5);
        const filesContext = keyFiles.map(f => `### ${f.path}\n\`\`\`tsx\n${f.content.slice(0, 2000)}${f.content.length > 2000 ? '\n// ... truncated' : ''}\n\`\`\``).join('\n\n');
        const reqsList = requirements.map(r => `- ${r.description}`).join('\n');
        const prompt = `Review this Next.js 15 codebase for quality, bugs, accessibility, and best practices:

## Requirements to validate:
${reqsList}

## Code to review:
${filesContext}

Return a JSON object with this structure:
{
  "issues": [
    {
      "severity": "critical" | "major" | "minor" | "info",
      "category": "bug" | "accessibility" | "performance" | "security" | "style" | "best-practice",
      "file": "file path",
      "message": "Description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "suggestions": [
    "General improvement suggestion 1",
    "General improvement suggestion 2"
  ]
}

Check for:
1. TypeScript type safety issues
2. React best practices (hooks rules, key props, etc.)
3. Accessibility issues (WCAG 2.1)
4. Performance issues (unnecessary re-renders, missing optimizations)
5. Security vulnerabilities
6. Missing error handling
7. Code quality and maintainability

Be thorough but concise. Include 3-8 issues and 3-5 suggestions.`;
        try {
            const aiResponse = await this.promptLLM(prompt, { expectJson: true });
            const issues = aiResponse.issues.map(issue => ({
                id: (0, uuid_1.v4)(),
                severity: issue.severity,
                category: issue.category,
                file: issue.file,
                line: issue.line,
                message: issue.message,
                suggestion: issue.suggestion,
            }));
            return {
                issues,
                suggestions: aiResponse.suggestions || [],
            };
        }
        catch (error) {
            this.think('AI review failed, falling back to rule-based review');
            // Fall back to basic review
            const basicIssues = [];
            for (const file of files) {
                basicIssues.push(...this.reviewFile(file));
            }
            basicIssues.push(...this.checkAccessibility(files));
            return {
                issues: basicIssues,
                suggestions: this.generateSuggestions(basicIssues, files),
            };
        }
    }
    async executeTask(task) {
        switch (task.title) {
            case 'review_code':
                const files = await this.memory.recall('files', 50);
                const reqs = await this.memory.recall('requirements', 20);
                return await this.reviewCode(files, reqs);
            case 'fix_issues':
                return await this.suggestFixes(task);
            default:
                throw new Error(`Unknown task: ${task.title}`);
        }
    }
    reviewFile(file) {
        const issues = [];
        const content = file.content;
        const lines = content.split('\n');
        // TypeScript/React specific checks
        if (file.path.endsWith('.tsx') || file.path.endsWith('.ts')) {
            // Check for console.log statements
            lines.forEach((line, idx) => {
                if (line.includes('console.log') && !file.path.includes('utils')) {
                    issues.push({
                        id: (0, uuid_1.v4)(),
                        severity: 'minor',
                        category: 'best-practice',
                        file: file.path,
                        line: idx + 1,
                        message: 'Remove console.log statement before production',
                        suggestion: 'Use a proper logging service or remove debug statements',
                    });
                }
            });
            // Check for missing error handling
            if (content.includes('fetch(') && !content.includes('catch') && !content.includes('try')) {
                issues.push({
                    id: (0, uuid_1.v4)(),
                    severity: 'major',
                    category: 'bug',
                    file: file.path,
                    message: 'Fetch call without error handling',
                    suggestion: 'Add try/catch or .catch() to handle network errors',
                });
            }
            // Check for empty catch blocks
            if (content.includes('catch') && content.includes('catch (') && content.includes('{ }')) {
                issues.push({
                    id: (0, uuid_1.v4)(),
                    severity: 'major',
                    category: 'best-practice',
                    file: file.path,
                    message: 'Empty catch block detected',
                    suggestion: 'Handle errors properly or log them',
                });
            }
            // Check for missing key prop in lists
            if (content.includes('.map(') && !content.includes('key=')) {
                issues.push({
                    id: (0, uuid_1.v4)(),
                    severity: 'major',
                    category: 'bug',
                    file: file.path,
                    message: 'Possible missing key prop in list rendering',
                    suggestion: 'Add a unique key prop to list items',
                });
            }
            // Check for inline styles (prefer Tailwind)
            if (content.includes('style={{') && !file.path.includes('animation')) {
                issues.push({
                    id: (0, uuid_1.v4)(),
                    severity: 'minor',
                    category: 'style',
                    file: file.path,
                    message: 'Inline styles detected - prefer Tailwind classes',
                    suggestion: 'Use Tailwind CSS classes for styling',
                });
            }
            // Check for proper TypeScript usage
            if (content.includes(': any') || content.includes('as any')) {
                issues.push({
                    id: (0, uuid_1.v4)(),
                    severity: 'minor',
                    category: 'best-practice',
                    file: file.path,
                    message: 'Use of "any" type detected',
                    suggestion: 'Define proper TypeScript types',
                });
            }
            // Check for missing alt text on images
            if (content.includes('<img') && !content.includes('alt=')) {
                issues.push({
                    id: (0, uuid_1.v4)(),
                    severity: 'major',
                    category: 'accessibility',
                    file: file.path,
                    message: 'Image missing alt attribute',
                    suggestion: 'Add descriptive alt text for accessibility',
                });
            }
            // Check for proper button types
            if (content.includes('<button') && !content.includes('type=')) {
                issues.push({
                    id: (0, uuid_1.v4)(),
                    severity: 'minor',
                    category: 'accessibility',
                    file: file.path,
                    message: 'Button missing explicit type attribute',
                    suggestion: 'Add type="button" or type="submit"',
                });
            }
        }
        // CSS checks
        if (file.path.endsWith('.css')) {
            // Check for !important usage
            if (content.includes('!important')) {
                issues.push({
                    id: (0, uuid_1.v4)(),
                    severity: 'minor',
                    category: 'style',
                    file: file.path,
                    message: 'Use of !important detected',
                    suggestion: 'Avoid !important - use more specific selectors',
                });
            }
        }
        // Check file size
        if (content.length > 10000 && file.path.includes('components/')) {
            issues.push({
                id: (0, uuid_1.v4)(),
                severity: 'minor',
                category: 'best-practice',
                file: file.path,
                message: 'Component file is quite large',
                suggestion: 'Consider splitting into smaller components',
            });
        }
        return issues;
    }
    checkRequirementsCoverage(files, requirements) {
        const allContent = files.map(f => f.content.toLowerCase()).join(' ');
        let covered = 0;
        for (const req of requirements) {
            const keywords = req.description.toLowerCase().split(' ').filter(w => w.length > 4);
            const isImplemented = keywords.some(kw => allContent.includes(kw));
            if (isImplemented)
                covered++;
        }
        return Math.round((covered / Math.max(requirements.length, 1)) * 100);
    }
    checkAccessibility(files) {
        const issues = [];
        for (const file of files) {
            if (!file.path.endsWith('.tsx'))
                continue;
            const content = file.content;
            // Check for proper heading hierarchy
            const headings = content.match(/<h[1-6]/g) || [];
            if (headings.length > 0) {
                // Check if there's an h1
                const hasH1 = headings.some(h => h === '<h1');
                if (!hasH1) {
                    issues.push({
                        id: (0, uuid_1.v4)(),
                        severity: 'minor',
                        category: 'accessibility',
                        file: file.path,
                        message: 'Page may be missing h1 heading',
                        suggestion: 'Ensure each page has exactly one h1 heading',
                    });
                }
            }
            // Check for aria-label on icon-only buttons
            if (content.includes('<button') && content.includes('aria-label')) {
                // Good - has aria-label
            }
            else if (content.includes('<button') && content.includes('svg') && !content.match(/<button[^>]*>[^<]*[a-zA-Z]/)) {
                issues.push({
                    id: (0, uuid_1.v4)(),
                    severity: 'major',
                    category: 'accessibility',
                    file: file.path,
                    message: 'Icon-only button may be missing aria-label',
                    suggestion: 'Add aria-label to buttons with only icons',
                });
            }
            // Check for color contrast (basic check)
            if (content.includes('text-gray-400') && content.includes('bg-gray-300')) {
                issues.push({
                    id: (0, uuid_1.v4)(),
                    severity: 'minor',
                    category: 'accessibility',
                    file: file.path,
                    message: 'Potential low color contrast',
                    suggestion: 'Verify color contrast ratio meets WCAG 2.1 requirements',
                });
            }
            // Check for form labels
            if (content.includes('<input') && !content.includes('<label') && !content.includes('aria-label')) {
                issues.push({
                    id: (0, uuid_1.v4)(),
                    severity: 'major',
                    category: 'accessibility',
                    file: file.path,
                    message: 'Form input may be missing associated label',
                    suggestion: 'Add a label element or aria-label attribute',
                });
            }
            // Check for skip links
            if (file.path.includes('layout') && !content.includes('skip')) {
                issues.push({
                    id: (0, uuid_1.v4)(),
                    severity: 'minor',
                    category: 'accessibility',
                    file: file.path,
                    message: 'Consider adding skip navigation link',
                    suggestion: 'Add a "skip to main content" link for keyboard users',
                });
            }
        }
        return issues;
    }
    calculateComponentCoverage(files) {
        const componentFiles = files.filter(f => f.path.includes('components/'));
        const hasExport = componentFiles.filter(f => f.content.includes('export function') || f.content.includes('export const'));
        return Math.round((hasExport.length / Math.max(componentFiles.length, 1)) * 100);
    }
    calculateA11yScore(issues) {
        const a11yIssues = issues.filter(i => i.category === 'accessibility');
        const criticalA11y = a11yIssues.filter(i => i.severity === 'critical' || i.severity === 'major');
        return Math.max(0, 100 - (criticalA11y.length * 15) - (a11yIssues.length * 5));
    }
    generateSuggestions(issues, files) {
        const suggestions = [];
        // Based on issue patterns
        const hasA11yIssues = issues.some(i => i.category === 'accessibility');
        const hasPerfIssues = issues.some(i => i.category === 'performance');
        const hasSecurityIssues = issues.some(i => i.category === 'security');
        if (hasA11yIssues) {
            suggestions.push('Consider using an accessibility linting tool like eslint-plugin-jsx-a11y');
            suggestions.push('Test with screen readers (VoiceOver, NVDA) for comprehensive a11y testing');
        }
        if (hasPerfIssues) {
            suggestions.push('Use Next.js Image component for optimized image loading');
            suggestions.push('Consider implementing code splitting for larger components');
        }
        if (hasSecurityIssues) {
            suggestions.push('Review and sanitize all user inputs');
            suggestions.push('Implement Content Security Policy headers');
        }
        // General suggestions
        if (!files.some(f => f.path.includes('.test.') || f.path.includes('.spec.'))) {
            suggestions.push('Add unit tests for critical components');
        }
        suggestions.push('Set up Lighthouse CI for continuous performance monitoring');
        suggestions.push('Consider adding E2E tests with Playwright or Cypress');
        return suggestions;
    }
    generateReportMarkdown(report) {
        const severityEmoji = {
            critical: '🔴',
            major: '🟠',
            minor: '🟡',
            info: '🔵',
        };
        return `# QA Report

## Summary

- **Status:** ${report.passed ? '✅ PASSED' : '❌ NEEDS ATTENTION'}
- **Quality Score:** ${report.score}/100
- **Total Issues:** ${report.issues.length}

## Coverage

| Category | Score |
|----------|-------|
| Requirements | ${report.coverage.requirements}% |
| Components | ${report.coverage.components}% |
| Accessibility | ${report.coverage.accessibility}% |

## Issues by Severity

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${report.issues.filter(i => i.severity === 'critical').length} |
| 🟠 Major | ${report.issues.filter(i => i.severity === 'major').length} |
| 🟡 Minor | ${report.issues.filter(i => i.severity === 'minor').length} |
| 🔵 Info | ${report.issues.filter(i => i.severity === 'info').length} |

## Issues Detail

${report.issues.map(issue => `
### ${severityEmoji[issue.severity]} ${issue.message}

- **File:** \`${issue.file}\`${issue.line ? ` (line ${issue.line})` : ''}
- **Category:** ${issue.category}
- **Severity:** ${issue.severity}
${issue.suggestion ? `- **Suggestion:** ${issue.suggestion}` : ''}
`).join('\n')}

## Recommendations

${report.suggestions.map(s => `- ${s}`).join('\n')}

---

*Generated by Agent Battalion - QA Engineer Agent*
`;
    }
    async suggestFixes(task) {
        this.think('Generating fix suggestions...');
        return {};
    }
}
exports.QAEngineerAgent = QAEngineerAgent;
//# sourceMappingURL=qa-engineer.js.map