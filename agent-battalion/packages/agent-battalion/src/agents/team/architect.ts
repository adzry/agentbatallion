/**
 * Architect Agent
 * 
 * Responsible for:
 * - Designing system architecture
 * - Defining component structure
 * - Planning data models and APIs
 * - Making technology decisions
 * - Creating technical specifications
 */

import { v4 as uuidv4 } from 'uuid';
import { BaseTeamAgent } from '../base-team-agent.js';
import {
  AgentProfile,
  AgentTask,
  Requirement,
  ArchitectureSpec,
  ComponentSpec,
  TechStack,
  ProjectContext,
} from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';

export class ArchitectAgent extends BaseTeamAgent {
  constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus) {
    const profile: AgentProfile = {
      id: 'architect-agent',
      name: 'Sam',
      role: 'architect',
      avatar: '🏗️',
      description: 'Software Architect - Designs scalable and maintainable systems',
      capabilities: {
        canWriteCode: true,
        canDesign: true,
        canTest: false,
        canDeploy: false,
        canResearch: true,
        canReview: true,
        languages: ['TypeScript', 'JavaScript', 'Python'],
        frameworks: ['Next.js', 'React', 'Node.js', 'Express'],
      },
      personality: 'Strategic thinker with deep technical expertise. Focuses on scalability, maintainability, and best practices.',
      systemPrompt: `You are Sam, an experienced Software Architect AI agent.
Your responsibilities:
1. Design system architecture based on requirements
2. Define component structure and relationships
3. Plan data models and API contracts
4. Make technology stack decisions
5. Create technical specifications
6. Ensure scalability and maintainability

Always consider:
- Separation of concerns
- SOLID principles
- Performance implications
- Security best practices
- Developer experience`,
    };

    super(profile, memory, tools, messageBus);
  }

  /**
   * Design architecture based on requirements
   */
  async designArchitecture(
    requirements: Requirement[],
    projectContext: Partial<ProjectContext>
  ): Promise<{
    architecture: ArchitectureSpec;
    fileStructure: string[];
    techStack: TechStack;
  }> {
    this.updateStatus('thinking');
    this.think('Analyzing requirements to design optimal architecture...');

    // Analyze requirements for architecture decisions
    const analysis = await this.act('think', 'Analyzing requirements', async () => {
      return this.analyzeForArchitecture(requirements);
    });

    this.updateProgress(20);

    // Define tech stack
    const techStack = await this.act('plan', 'Defining technology stack', async () => {
      return this.defineTechStack(analysis, projectContext);
    });

    this.updateProgress(40);

    // Design component structure
    const components = await this.act('plan', 'Designing component structure', async () => {
      return this.designComponents(requirements, analysis);
    });

    this.updateProgress(60);

    // Create architecture specification
    const architecture = await this.act('plan', 'Creating architecture spec', async () => {
      return this.createArchitectureSpec(components, analysis);
    });

    this.updateProgress(80);

    // Define file structure
    const fileStructure = await this.act('plan', 'Planning file structure', async () => {
      return this.planFileStructure(architecture, techStack);
    });

    // Create architecture document artifact
    this.createArtifact(
      'architecture',
      'Architecture Specification',
      this.generateArchDoc(architecture, techStack, fileStructure),
      'docs/ARCHITECTURE.md'
    );

    this.updateStatus('complete');
    this.updateProgress(100);

    return { architecture, fileStructure, techStack };
  }

  protected async executeTask(task: AgentTask): Promise<any> {
    switch (task.title) {
      case 'design_architecture':
        const reqs = await this.memory.recall('requirements', 20);
        const ctx = await this.memory.getContext('project');
        return await this.designArchitecture(reqs as Requirement[], ctx);
      case 'review_architecture':
        return await this.reviewArchitecture(task);
      case 'optimize_architecture':
        return await this.optimizeArchitecture(task);
      default:
        throw new Error(`Unknown task: ${task.title}`);
    }
  }

  private analyzeForArchitecture(requirements: Requirement[]): {
    needsAuth: boolean;
    needsDatabase: boolean;
    needsAPI: boolean;
    needsRealtime: boolean;
    complexity: 'simple' | 'medium' | 'complex';
    pageCount: number;
    componentCount: number;
  } {
    const reqTexts = requirements.map(r => r.description.toLowerCase()).join(' ');

    const needsAuth = /auth|login|signup|user|account/i.test(reqTexts);
    const needsDatabase = /database|store|persist|save|crud/i.test(reqTexts) || needsAuth;
    const needsAPI = needsDatabase || /api|fetch|data|backend/i.test(reqTexts);
    const needsRealtime = /realtime|live|chat|notification|websocket/i.test(reqTexts);

    // Estimate complexity
    const featureCount = requirements.filter(r => r.type === 'functional').length;
    let complexity: 'simple' | 'medium' | 'complex' = 'simple';
    if (featureCount > 10 || needsAuth || needsRealtime) complexity = 'complex';
    else if (featureCount > 5 || needsDatabase) complexity = 'medium';

    // Estimate page count
    let pageCount = 1;
    if (/dashboard/i.test(reqTexts)) pageCount += 2;
    if (/blog/i.test(reqTexts)) pageCount += 2;
    if (/about/i.test(reqTexts)) pageCount += 1;
    if (/contact/i.test(reqTexts)) pageCount += 1;
    if (/pricing/i.test(reqTexts)) pageCount += 1;
    if (needsAuth) pageCount += 2;

    return {
      needsAuth,
      needsDatabase,
      needsAPI,
      needsRealtime,
      complexity,
      pageCount,
      componentCount: Math.max(5, featureCount * 2),
    };
  }

  private defineTechStack(
    analysis: ReturnType<typeof this.analyzeForArchitecture>,
    context: Partial<ProjectContext>
  ): TechStack {
    const stack: TechStack = {
      frontend: {
        framework: 'Next.js 15',
        language: 'TypeScript',
        styling: 'Tailwind CSS',
        stateManagement: analysis.complexity === 'complex' ? 'Zustand' : 'React useState/useReducer',
      },
    };

    if (analysis.needsAPI || analysis.needsDatabase) {
      stack.backend = {
        framework: 'Next.js API Routes',
        language: 'TypeScript',
        database: analysis.needsDatabase ? 'PostgreSQL' : undefined,
        orm: analysis.needsDatabase ? 'Prisma' : undefined,
      };
    }

    stack.infrastructure = {
      hosting: 'Vercel',
      ci_cd: 'GitHub Actions',
    };

    return stack;
  }

  private designComponents(
    requirements: Requirement[],
    analysis: ReturnType<typeof this.analyzeForArchitecture>
  ): ComponentSpec[] {
    const components: ComponentSpec[] = [];

    // Layout components
    components.push({
      name: 'RootLayout',
      type: 'layout',
      description: 'Root application layout with header, footer, and providers',
      dependencies: ['Header', 'Footer'],
    });

    components.push({
      name: 'Header',
      type: 'component',
      description: 'Site header with navigation',
      dependencies: ['Navigation', 'Logo'],
    });

    components.push({
      name: 'Footer',
      type: 'component',
      description: 'Site footer with links and info',
      dependencies: [],
    });

    components.push({
      name: 'Navigation',
      type: 'component',
      description: 'Main navigation menu',
      dependencies: ['NavLink'],
    });

    // Page components based on requirements
    for (const req of requirements) {
      const desc = req.description.toLowerCase();

      if (desc.includes('hero')) {
        components.push({
          name: 'HeroSection',
          type: 'component',
          description: 'Hero section with headline, subtitle, and CTA',
          dependencies: ['Button'],
        });
      }

      if (desc.includes('feature')) {
        components.push({
          name: 'FeatureSection',
          type: 'component',
          description: 'Features grid showcasing app capabilities',
          dependencies: ['FeatureCard'],
        });
        components.push({
          name: 'FeatureCard',
          type: 'component',
          description: 'Individual feature card with icon and description',
          dependencies: [],
        });
      }

      if (desc.includes('testimonial')) {
        components.push({
          name: 'TestimonialSection',
          type: 'component',
          description: 'Customer testimonials carousel',
          dependencies: ['TestimonialCard'],
        });
      }

      if (desc.includes('pricing')) {
        components.push({
          name: 'PricingSection',
          type: 'component',
          description: 'Pricing plans comparison',
          dependencies: ['PricingCard'],
        });
      }

      if (desc.includes('contact')) {
        components.push({
          name: 'ContactForm',
          type: 'component',
          description: 'Contact form with validation',
          dependencies: ['Input', 'Button', 'Textarea'],
        });
      }

      if (desc.includes('gallery') || desc.includes('portfolio')) {
        components.push({
          name: 'Gallery',
          type: 'component',
          description: 'Image/project gallery grid',
          dependencies: ['GalleryItem', 'Modal'],
        });
      }
    }

    // UI primitives
    components.push(
      { name: 'Button', type: 'component', description: 'Reusable button component', dependencies: [] },
      { name: 'Input', type: 'component', description: 'Form input component', dependencies: [] },
      { name: 'Card', type: 'component', description: 'Reusable card container', dependencies: [] },
      { name: 'Modal', type: 'component', description: 'Modal dialog component', dependencies: [] }
    );

    // Auth components if needed
    if (analysis.needsAuth) {
      components.push(
        { name: 'LoginForm', type: 'component', description: 'User login form', dependencies: ['Input', 'Button'] },
        { name: 'SignupForm', type: 'component', description: 'User registration form', dependencies: ['Input', 'Button'] },
        { name: 'AuthProvider', type: 'component', description: 'Authentication context provider', dependencies: [] }
      );
    }

    return components;
  }

  private createArchitectureSpec(
    components: ComponentSpec[],
    analysis: ReturnType<typeof this.analyzeForArchitecture>
  ): ArchitectureSpec {
    return {
      type: analysis.needsAPI ? 'jamstack' : 'monolith',
      components,
      dataFlow: [
        { from: 'User', to: 'Frontend', data: 'User interactions', protocol: 'HTTP' },
        { from: 'Frontend', to: 'API Routes', data: 'API requests', protocol: 'HTTP' },
        ...(analysis.needsDatabase
          ? [{ from: 'API Routes', to: 'Database', data: 'CRUD operations', protocol: 'PostgreSQL' }]
          : []),
      ],
      integrations: [
        { name: 'Vercel', type: 'hosting' },
        { name: 'GitHub', type: 'version_control' },
      ],
    };
  }

  private planFileStructure(
    architecture: ArchitectureSpec,
    techStack: TechStack
  ): string[] {
    const files: string[] = [
      // Config
      'package.json',
      'tsconfig.json',
      'next.config.ts',
      'tailwind.config.ts',
      'postcss.config.mjs',
      '.env.local',
      '.gitignore',

      // App structure
      'app/layout.tsx',
      'app/page.tsx',
      'app/globals.css',
      'app/loading.tsx',
      'app/error.tsx',
      'app/not-found.tsx',

      // Components
      'components/ui/button.tsx',
      'components/ui/input.tsx',
      'components/ui/card.tsx',
      'components/ui/modal.tsx',
      'components/layout/header.tsx',
      'components/layout/footer.tsx',
      'components/layout/navigation.tsx',
    ];

    // Add component files
    for (const comp of architecture.components) {
      if (!files.some(f => f.toLowerCase().includes(comp.name.toLowerCase()))) {
        const category = this.categorizeComponent(comp);
        files.push(`components/${category}/${this.toKebabCase(comp.name)}.tsx`);
      }
    }

    // Add lib files
    files.push(
      'lib/utils.ts',
      'lib/constants.ts',
    );

    // Add types
    files.push('types/index.ts');

    // Add hooks if complex
    files.push('hooks/use-media-query.ts');

    // Add API routes if needed
    if (techStack.backend) {
      files.push(
        'app/api/health/route.ts',
      );
    }

    // Add docs
    files.push('README.md');

    return files;
  }

  private categorizeComponent(comp: ComponentSpec): string {
    const name = comp.name.toLowerCase();
    if (name.includes('section') || name.includes('hero') || name.includes('feature')) return 'sections';
    if (name.includes('form') || name.includes('input') || name.includes('button')) return 'ui';
    if (name.includes('header') || name.includes('footer') || name.includes('nav')) return 'layout';
    if (name.includes('card') || name.includes('modal')) return 'ui';
    if (name.includes('provider') || name.includes('context')) return 'providers';
    return 'common';
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  private generateArchDoc(
    architecture: ArchitectureSpec,
    techStack: TechStack,
    fileStructure: string[]
  ): string {
    return `# Architecture Specification

## System Overview

**Architecture Type:** ${architecture.type}

## Technology Stack

### Frontend
- **Framework:** ${techStack.frontend.framework}
- **Language:** ${techStack.frontend.language}
- **Styling:** ${techStack.frontend.styling}
- **State Management:** ${techStack.frontend.stateManagement}

${techStack.backend ? `### Backend
- **Framework:** ${techStack.backend.framework}
- **Language:** ${techStack.backend.language}
${techStack.backend.database ? `- **Database:** ${techStack.backend.database}` : ''}
${techStack.backend.orm ? `- **ORM:** ${techStack.backend.orm}` : ''}
` : ''}

### Infrastructure
- **Hosting:** ${techStack.infrastructure?.hosting}
- **CI/CD:** ${techStack.infrastructure?.ci_cd}

---

## Component Architecture

${architecture.components.map(c => `### ${c.name}
- **Type:** ${c.type}
- **Description:** ${c.description}
${c.dependencies?.length ? `- **Dependencies:** ${c.dependencies.join(', ')}` : ''}
`).join('\n')}

---

## Data Flow

\`\`\`
${architecture.dataFlow.map(d => `${d.from} --> ${d.to}: ${d.data}`).join('\n')}
\`\`\`

---

## File Structure

\`\`\`
${fileStructure.map(f => f).join('\n')}
\`\`\`

---

*Generated by Agent Battalion - Architect Agent*
`;
  }

  private async reviewArchitecture(task: AgentTask): Promise<any> {
    this.think('Reviewing architecture for potential improvements...');
    return { approved: true, suggestions: [] };
  }

  private async optimizeArchitecture(task: AgentTask): Promise<any> {
    this.think('Optimizing architecture based on feedback...');
    return { optimized: true };
  }
}
