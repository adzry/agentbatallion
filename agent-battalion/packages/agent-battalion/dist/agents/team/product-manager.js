/**
 * Product Manager Agent
 *
 * Responsible for:
 * - Understanding user requirements
 * - Creating product specifications
 * - Defining user stories and acceptance criteria
 * - Prioritizing features
 * - Coordinating with the team
 */
import { v4 as uuidv4 } from 'uuid';
import { BaseTeamAgent } from '../base-team-agent.js';
export class ProductManagerAgent extends BaseTeamAgent {
    constructor(memory, tools, messageBus) {
        const profile = {
            id: 'pm-agent',
            name: 'Alex',
            role: 'product_manager',
            avatar: '👔',
            description: 'Product Manager - Transforms user needs into actionable specifications',
            capabilities: {
                canWriteCode: false,
                canDesign: false,
                canTest: false,
                canDeploy: false,
                canResearch: true,
                canReview: true,
            },
            personality: 'Analytical, user-focused, and detail-oriented. Excellent at breaking down complex requirements.',
            systemPrompt: `You are Alex, an experienced Product Manager AI agent.
Your responsibilities:
1. Analyze user requests to understand their true needs
2. Break down requirements into clear, actionable specifications
3. Define user stories with acceptance criteria
4. Prioritize features using MoSCoW method
5. Create product requirement documents (PRDs)
6. Coordinate with the development team

Always think from the user's perspective and ensure requirements are:
- Clear and unambiguous
- Testable and measurable
- Prioritized appropriately
- Technically feasible`,
        };
        super(profile, memory, tools, messageBus);
    }
    /**
     * Analyze user request and create requirements
     */
    async analyzeRequest(userRequest) {
        this.updateStatus('thinking');
        this.think('Analyzing user request to understand core requirements...');
        let requirements;
        let projectContext;
        if (this.isRealAIEnabled()) {
            // Use real AI for requirement analysis
            this.think('Using AI to analyze requirements...');
            const aiAnalysis = await this.act('think', 'AI analyzing requirements', async () => {
                return this.analyzeWithAI(userRequest);
            });
            this.updateProgress(50);
            requirements = aiAnalysis.requirements;
            projectContext = aiAnalysis.projectContext;
        }
        else {
            // Use template-based analysis
            const analysis = await this.act('think', 'Analyzing user requirements', async () => {
                return this.extractRequirements(userRequest);
            });
            this.updateProgress(30);
            requirements = await this.act('plan', 'Creating structured requirements', async () => {
                return this.structureRequirements(analysis, userRequest);
            });
            this.updateProgress(60);
            projectContext = await this.act('plan', 'Defining project context', async () => {
                return this.defineProjectContext(userRequest, requirements);
            });
        }
        this.updateProgress(90);
        // Create PRD artifact
        this.createArtifact('requirement', 'Product Requirements Document', this.generatePRD(requirements, projectContext), 'docs/PRD.md');
        this.updateStatus('complete');
        this.updateProgress(100);
        return { requirements, projectContext };
    }
    /**
     * Use AI to analyze requirements
     */
    async analyzeWithAI(userRequest) {
        const prompt = `Analyze this user request and extract requirements:

"${userRequest}"

Return a JSON object with this exact structure:
{
  "projectName": "Name of the project",
  "projectDescription": "Brief description",
  "requirements": [
    {
      "type": "functional" | "non_functional" | "constraint",
      "priority": "must" | "should" | "could" | "wont",
      "description": "Clear description of the requirement",
      "acceptanceCriteria": ["Criteria 1", "Criteria 2"]
    }
  ],
  "techStack": {
    "frontend": {
      "framework": "Next.js 15",
      "language": "TypeScript",
      "styling": "Tailwind CSS",
      "stateManagement": "React hooks"
    }
  }
}

Include at least 5 requirements covering:
- Core functionality (must have)
- User experience features (should have)
- Performance requirements (non-functional)
- Any constraints mentioned

Be specific and actionable.`;
        const aiResponse = await this.promptLLM(prompt, { expectJson: true });
        // Convert AI response to internal format
        const requirements = aiResponse.requirements.map((req) => ({
            id: uuidv4(),
            type: req.type,
            priority: req.priority,
            description: req.description,
            acceptanceCriteria: req.acceptanceCriteria || [],
            status: 'proposed',
        }));
        const projectContext = {
            name: aiResponse.projectName,
            description: aiResponse.projectDescription,
            requirements,
            techStack: aiResponse.techStack,
            status: 'planning',
        };
        return { requirements, projectContext };
    }
    async executeTask(task) {
        switch (task.title) {
            case 'analyze_requirements':
                return await this.analyzeRequest(task.description);
            case 'refine_requirements':
                return await this.refineRequirements(task);
            case 'prioritize_features':
                return await this.prioritizeFeatures(task);
            default:
                throw new Error(`Unknown task: ${task.title}`);
        }
    }
    extractRequirements(userRequest) {
        const lowerRequest = userRequest.toLowerCase();
        // Determine app type
        let appType = 'web application';
        if (lowerRequest.includes('dashboard'))
            appType = 'dashboard application';
        else if (lowerRequest.includes('e-commerce') || lowerRequest.includes('store'))
            appType = 'e-commerce platform';
        else if (lowerRequest.includes('blog'))
            appType = 'blog/content platform';
        else if (lowerRequest.includes('portfolio'))
            appType = 'portfolio website';
        else if (lowerRequest.includes('saas'))
            appType = 'SaaS application';
        else if (lowerRequest.includes('landing'))
            appType = 'landing page';
        // Extract features
        const features = [];
        const featurePatterns = [
            { pattern: /hero\s*(section)?/i, feature: 'Hero section with call-to-action' },
            { pattern: /auth(entication)?|login|signup/i, feature: 'User authentication system' },
            { pattern: /dashboard/i, feature: 'Admin/User dashboard' },
            { pattern: /payment|checkout|cart/i, feature: 'Payment and checkout flow' },
            { pattern: /blog|post|article/i, feature: 'Blog/Content management' },
            { pattern: /search/i, feature: 'Search functionality' },
            { pattern: /profile/i, feature: 'User profiles' },
            { pattern: /notification/i, feature: 'Notification system' },
            { pattern: /chat|message/i, feature: 'Messaging/Chat feature' },
            { pattern: /gallery|portfolio|showcase/i, feature: 'Image/Project gallery' },
            { pattern: /contact/i, feature: 'Contact form' },
            { pattern: /testimonial|review/i, feature: 'Testimonials/Reviews section' },
            { pattern: /pricing/i, feature: 'Pricing page' },
            { pattern: /faq/i, feature: 'FAQ section' },
            { pattern: /analytics/i, feature: 'Analytics integration' },
            { pattern: /dark\s*mode|theme/i, feature: 'Dark mode support' },
            { pattern: /responsive|mobile/i, feature: 'Responsive design' },
            { pattern: /animation/i, feature: 'Smooth animations' },
        ];
        for (const { pattern, feature } of featurePatterns) {
            if (pattern.test(userRequest)) {
                features.push(feature);
            }
        }
        // Add default features
        if (!features.some(f => f.includes('Responsive'))) {
            features.push('Responsive design');
        }
        // Extract constraints
        const constraints = [];
        if (lowerRequest.includes('fast') || lowerRequest.includes('performance')) {
            constraints.push('High performance requirements');
        }
        if (lowerRequest.includes('accessible') || lowerRequest.includes('a11y')) {
            constraints.push('WCAG accessibility compliance');
        }
        if (lowerRequest.includes('seo')) {
            constraints.push('SEO optimization required');
        }
        // Determine target users
        let targetUsers = 'General users';
        if (lowerRequest.includes('developer'))
            targetUsers = 'Developers';
        else if (lowerRequest.includes('business'))
            targetUsers = 'Business professionals';
        else if (lowerRequest.includes('customer'))
            targetUsers = 'Customers/End users';
        return { appType, features, constraints, targetUsers };
    }
    structureRequirements(analysis, userRequest) {
        const requirements = [];
        // Core app requirement
        requirements.push({
            id: uuidv4(),
            type: 'functional',
            priority: 'must',
            description: `Build a ${analysis.appType} based on user specifications`,
            acceptanceCriteria: [
                'Application loads without errors',
                'All primary features are functional',
                'Responsive on mobile and desktop',
            ],
            status: 'approved',
        });
        // Feature requirements
        for (const feature of analysis.features) {
            const priority = this.determinePriority(feature);
            requirements.push({
                id: uuidv4(),
                type: 'functional',
                priority,
                description: feature,
                acceptanceCriteria: this.generateAcceptanceCriteria(feature),
                status: 'proposed',
            });
        }
        // Non-functional requirements
        requirements.push({
            id: uuidv4(),
            type: 'non_functional',
            priority: 'should',
            description: 'Application should load within 3 seconds',
            acceptanceCriteria: ['First contentful paint < 1.5s', 'Time to interactive < 3s'],
            status: 'approved',
        });
        requirements.push({
            id: uuidv4(),
            type: 'non_functional',
            priority: 'should',
            description: 'Mobile-responsive design with touch support',
            acceptanceCriteria: ['Works on screens 320px and above', 'Touch-friendly buttons and controls'],
            status: 'approved',
        });
        // Constraint requirements
        for (const constraint of analysis.constraints) {
            requirements.push({
                id: uuidv4(),
                type: 'constraint',
                priority: 'must',
                description: constraint,
                status: 'approved',
            });
        }
        return requirements;
    }
    determinePriority(feature) {
        const mustHave = ['hero', 'responsive', 'navigation', 'layout'];
        const shouldHave = ['authentication', 'search', 'contact', 'dark mode'];
        const couldHave = ['animation', 'analytics', 'chat', 'notification'];
        const lowerFeature = feature.toLowerCase();
        if (mustHave.some(kw => lowerFeature.includes(kw)))
            return 'must';
        if (shouldHave.some(kw => lowerFeature.includes(kw)))
            return 'should';
        if (couldHave.some(kw => lowerFeature.includes(kw)))
            return 'could';
        return 'should';
    }
    generateAcceptanceCriteria(feature) {
        const criteria = ['Feature is visible and accessible'];
        if (feature.toLowerCase().includes('form')) {
            criteria.push('Form validates input correctly');
            criteria.push('Form submits successfully');
            criteria.push('Error messages are clear');
        }
        if (feature.toLowerCase().includes('button') || feature.toLowerCase().includes('cta')) {
            criteria.push('Button is clickable and has hover state');
            criteria.push('Button performs expected action');
        }
        if (feature.toLowerCase().includes('auth')) {
            criteria.push('Users can register and login');
            criteria.push('Session is maintained correctly');
            criteria.push('Logout works properly');
        }
        return criteria;
    }
    defineProjectContext(userRequest, requirements) {
        const analysis = this.extractRequirements(userRequest);
        return {
            name: this.extractProjectName(userRequest),
            description: userRequest,
            requirements,
            techStack: {
                frontend: {
                    framework: 'Next.js 15',
                    language: 'TypeScript',
                    styling: 'Tailwind CSS',
                    stateManagement: 'React hooks',
                },
            },
            status: 'planning',
        };
    }
    extractProjectName(userRequest) {
        const patterns = [
            /(?:build|create|make|generate)\s+(?:a|an|the)?\s*(.+?)\s*(?:app|application|website|site|platform)/i,
            /(.+?)\s*(?:app|application|website|site|platform)/i,
        ];
        for (const pattern of patterns) {
            const match = userRequest.match(pattern);
            if (match && match[1]) {
                return match[1]
                    .trim()
                    .split(' ')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(' ');
            }
        }
        return 'New Project';
    }
    generatePRD(requirements, context) {
        const mustHave = requirements.filter(r => r.priority === 'must');
        const shouldHave = requirements.filter(r => r.priority === 'should');
        const couldHave = requirements.filter(r => r.priority === 'could');
        return `# Product Requirements Document

## Project: ${context.name}

### Overview
${context.description}

### Tech Stack
- **Framework:** ${context.techStack?.frontend.framework}
- **Language:** ${context.techStack?.frontend.language}
- **Styling:** ${context.techStack?.frontend.styling}

---

## Requirements

### Must Have (P0)
${mustHave.map(r => `- ${r.description}`).join('\n')}

### Should Have (P1)
${shouldHave.map(r => `- ${r.description}`).join('\n')}

### Could Have (P2)
${couldHave.map(r => `- ${r.description}`).join('\n')}

---

## Acceptance Criteria

${requirements.filter(r => r.acceptanceCriteria).map(r => `
### ${r.description}
${r.acceptanceCriteria?.map(c => `- [ ] ${c}`).join('\n')}
`).join('\n')}

---

*Generated by Agent Battalion - Product Manager Agent*
`;
    }
    async refineRequirements(task) {
        // Refine existing requirements based on feedback
        const currentReqs = await this.memory.recall('requirements', 10);
        return currentReqs;
    }
    async prioritizeFeatures(task) {
        // Re-prioritize features
        const currentReqs = await this.memory.recall('requirements', 10);
        return currentReqs;
    }
}
//# sourceMappingURL=product-manager.js.map