/**
 * Frontend Engineer Agent
 * 
 * Responsible for:
 * - Implementing UI components
 * - Writing React/Next.js code
 * - Integrating with APIs
 * - Ensuring responsive design
 * - Performance optimization
 */

import { v4 as uuidv4 } from 'uuid';
import { BaseTeamAgent } from '../base-team-agent.js';
import {
  AgentProfile,
  AgentTask,
  ArchitectureSpec,
  DesignSystem,
  ComponentSpec,
  ProjectFile,
  TechStack,
} from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';

export class FrontendEngineerAgent extends BaseTeamAgent {
  constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus) {
    const profile: AgentProfile = {
      id: 'frontend-engineer-agent',
      name: 'Jordan',
      role: 'frontend_engineer',
      avatar: '💻',
      description: 'Frontend Engineer - Builds beautiful, performant user interfaces',
      capabilities: {
        canWriteCode: true,
        canDesign: false,
        canTest: true,
        canDeploy: false,
        canResearch: true,
        canReview: true,
        languages: ['TypeScript', 'JavaScript', 'CSS', 'HTML'],
        frameworks: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion'],
      },
      personality: 'Detail-oriented and passionate about clean code. Loves creating smooth user experiences.',
      systemPrompt: `You are Jordan, an experienced Frontend Engineer AI agent.
Your responsibilities:
1. Implement UI components based on designs
2. Write clean, maintainable React/Next.js code
3. Ensure responsive design across devices
4. Optimize performance (Core Web Vitals)
5. Implement animations and interactions
6. Handle state management effectively

Best practices:
- Use TypeScript for type safety
- Follow React hooks best practices
- Implement proper error boundaries
- Use semantic HTML for accessibility
- Optimize images and assets
- Write self-documenting code`,
    };

    super(profile, memory, tools, messageBus);
  }

  /**
   * Generate all frontend code based on architecture and design
   */
  async generateCode(
    architecture: ArchitectureSpec,
    designSystem: DesignSystem,
    techStack: TechStack,
    fileStructure: string[]
  ): Promise<ProjectFile[]> {
    this.updateStatus('working');
    this.think('Starting code generation based on architecture and design...');

    const files: ProjectFile[] = [];
    const totalFiles = fileStructure.length;
    let completedFiles = 0;

    // Files that should be AI-generated when real AI is enabled
    const aiGeneratedFiles = new Set([
      'app/page.tsx',
      'components/sections/hero-section.tsx',
      'components/sections/features-section.tsx',
    ]);

    // Generate each file
    for (const filePath of fileStructure) {
      this.think(`Generating: ${filePath}`);

      let content: string | null = null;

      // Use AI for key files when real AI is enabled
      if (this.isRealAIEnabled() && aiGeneratedFiles.has(filePath)) {
        content = await this.act('code', `AI generating ${filePath}`, async () => {
          return this.generateWithAI(filePath, architecture, designSystem, techStack);
        });
      }

      // Fall back to template-based generation
      if (!content) {
        content = await this.act('code', `Generating ${filePath}`, async () => {
          return this.generateFileContent(filePath, architecture, designSystem, techStack);
        });
      }

      if (content) {
        const file: ProjectFile = {
          path: filePath,
          content,
          type: this.getFileType(filePath),
          createdBy: this.profile.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        };

        files.push(file);

        // Create artifact
        this.createArtifact(
          'code',
          filePath.split('/').pop() || filePath,
          content,
          filePath
        );
      }

      completedFiles++;
      this.updateProgress((completedFiles / totalFiles) * 100);
    }

    this.updateStatus('complete');

    return files;
  }

  /**
   * Generate file content using AI
   */
  private async generateWithAI(
    filePath: string,
    architecture: ArchitectureSpec,
    designSystem: DesignSystem,
    techStack: TechStack
  ): Promise<string | null> {
    const projectName = this.projectContext?.name || 'My App';
    const projectDescription = this.projectContext?.description || 'A modern web application';
    
    const colorsList = Object.entries(designSystem.colors)
      .slice(0, 10)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', ');

    // Common quality guidelines for all prompts
    const qualityGuidelines = `
CRITICAL CODE QUALITY RULES:
1. ALWAYS add aria-label to buttons that only contain icons
2. ALWAYS add alt="" to decorative images, descriptive alt for content images
3. ALWAYS use semantic HTML (main, section, header, footer, nav, article)
4. ALWAYS include proper TypeScript types - NO 'any' types
5. ALWAYS add key prop when mapping arrays
6. ALWAYS handle loading and error states in components
7. Use className instead of inline styles
8. Add proper spacing with Tailwind (p-4, m-2, gap-4, etc.)
9. Use forwardRef for reusable components that need ref access
10. Ensure color contrast meets WCAG AA standards`;

    let prompt = '';

    if (filePath === 'app/page.tsx') {
      prompt = `Generate a Next.js 15 home page component for this project:

Project: ${projectName}
Description: ${projectDescription}

Components available: ${architecture.components.map(c => c.name).join(', ')}
Design colors: ${colorsList}
Theme: ${designSystem.theme}

Requirements:
- Use Next.js 15 App Router (Server Component by default)
- Import Header from '@/components/layout/header'
- Import Footer from '@/components/layout/footer'
- Create a beautiful hero section with gradient backgrounds
- Add a features section if the architecture includes it
- Use Tailwind CSS classes for all styling
- Make it responsive with mobile-first approach
- Include proper TypeScript types
- Use semantic HTML elements (main, section, etc.)

${qualityGuidelines}

Return ONLY the complete TypeScript/TSX code. No markdown, no explanations, no code fences.`;
    } else if (filePath.includes('hero-section')) {
      prompt = `Generate a beautiful Hero Section React component:

Project: ${projectName}
Description: ${projectDescription}
Design colors: ${colorsList}
Theme: ${designSystem.theme}

Requirements:
- Export a named function HeroSection (Server Component)
- Create an eye-catching hero with headline, description, and CTA buttons
- Add decorative background elements (gradients, blurs)
- Include CSS animations via Tailwind (animate-fade-in, etc.)
- Use Tailwind CSS classes exclusively
- Make it responsive (mobile-first)
- Include social proof section at the bottom
- All buttons must have type="button" attribute
- Use semantic HTML (section, h1 for main heading, etc.)

${qualityGuidelines}

Return ONLY the complete TypeScript/TSX code. No markdown, no explanations, no code fences.`;
    } else if (filePath.includes('features-section')) {
      prompt = `Generate a Features Section React component:

Project: ${projectName}  
Description: ${projectDescription}
Design colors: ${colorsList}
Theme: ${designSystem.theme}

Requirements:
- Export a named function FeaturesSection (Server Component)
- Create a grid of 6 feature cards with emoji icons, titles, and descriptions
- Features should be relevant to: ${projectDescription}
- Add hover effects on cards (hover:shadow-lg, hover:scale-105, etc.)
- Use Tailwind CSS classes exclusively
- Make it responsive (1 col mobile, 2 cols tablet, 3 cols desktop)
- Include section header with h2 title and subtitle paragraph
- Each feature card must have a unique key when mapping
- Use semantic HTML (section with id="features", article for cards)

${qualityGuidelines}

Return ONLY the complete TypeScript/TSX code. No markdown, no explanations, no code fences.`;
    }

    if (!prompt) return null;

    try {
      const response = await this.promptLLM<string>(prompt);
      
      // Clean and post-process the generated code
      let cleanedCode = this.postProcessCode(response);

      return cleanedCode;
    } catch (error) {
      this.think(`AI generation failed for ${filePath}, using template`);
      return null;
    }
  }

  /**
   * Post-process generated code to ensure quality
   */
  private postProcessCode(code: string): string {
    let processed = code
      // Remove markdown code blocks if present
      .replace(/^```(?:tsx|typescript|javascript|jsx)?\n?/gm, '')
      .replace(/```$/gm, '')
      .trim();

    // Ensure button type attributes
    processed = processed.replace(
      /<button(?![^>]*type=)([^>]*)>/g,
      '<button type="button"$1>'
    );

    // Ensure img elements have alt attribute
    processed = processed.replace(
      /<img(?![^>]*alt=)([^>]*)>/g,
      '<img alt=""$1>'
    );

    // Fix common issues with quotes
    processed = processed.replace(/className='/g, "className=\"");
    processed = processed.replace(/'>/g, "\">");

    return processed;
  }

  protected async executeTask(task: AgentTask): Promise<any> {
    switch (task.title) {
      case 'generate_code':
        const arch = await this.memory.recall('architecture', 1);
        const design = await this.memory.recall('design_system', 1);
        const stack = await this.memory.recall('tech_stack', 1);
        const structure = await this.memory.recall('file_structure', 1);
        return await this.generateCode(
          arch[0] as ArchitectureSpec,
          design[0] as DesignSystem,
          stack[0] as TechStack,
          structure[0] as string[]
        );
      case 'implement_component':
        return await this.implementComponent(task);
      case 'fix_bug':
        return await this.fixBug(task);
      default:
        throw new Error(`Unknown task: ${task.title}`);
    }
  }

  private generateFileContent(
    filePath: string,
    architecture: ArchitectureSpec,
    designSystem: DesignSystem,
    techStack: TechStack
  ): string | null {
    const fileName = filePath.split('/').pop() || '';

    // Config files
    if (fileName === 'package.json') return this.generatePackageJson(techStack);
    if (fileName === 'tsconfig.json') return this.generateTsConfig();
    if (fileName === 'next.config.ts') return this.generateNextConfig();
    if (fileName === 'postcss.config.mjs') return this.generatePostCssConfig();
    if (fileName === '.env.local') return this.generateEnvLocal();
    if (fileName === '.gitignore') return this.generateGitignore();

    // App structure
    if (filePath === 'app/layout.tsx') return this.generateLayout(designSystem);
    if (filePath === 'app/page.tsx') return this.generateHomePage(architecture, designSystem);
    if (filePath === 'app/loading.tsx') return this.generateLoadingPage();
    if (filePath === 'app/error.tsx') return this.generateErrorPage();
    if (filePath === 'app/not-found.tsx') return this.generateNotFoundPage();

    // Components
    if (filePath.includes('components/')) {
      return this.generateComponent(filePath, architecture, designSystem);
    }

    // Lib files
    if (filePath === 'lib/utils.ts') return this.generateUtils();
    if (filePath === 'lib/constants.ts') return this.generateConstants();

    // Types
    if (filePath === 'types/index.ts') return this.generateTypes();

    // Hooks
    if (filePath.includes('hooks/')) return this.generateHook(filePath);

    // API routes
    if (filePath.includes('app/api/')) return this.generateApiRoute(filePath);

    // Docs
    if (fileName === 'README.md') return this.generateReadme(techStack);

    return null;
  }

  private getFileType(filePath: string): string {
    if (filePath.endsWith('.json') || filePath.includes('config')) return 'config';
    if (filePath.endsWith('.md')) return 'doc';
    if (filePath.endsWith('.css')) return 'style';
    return 'source';
  }

  private generatePackageJson(techStack: TechStack): string {
    const projectName = this.projectContext?.name?.toLowerCase().replace(/\s+/g, '-') || 'my-app';

    return JSON.stringify({
      name: projectName,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
        'type-check': 'tsc --noEmit',
      },
      dependencies: {
        next: '15.0.0',
        react: '19.0.0',
        'react-dom': '19.0.0',
        'class-variance-authority': '^0.7.0',
        clsx: '^2.1.0',
        'tailwind-merge': '^2.2.0',
      },
      devDependencies: {
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
        typescript: '^5',
        tailwindcss: '^3.4.0',
        postcss: '^8',
        autoprefixer: '^10',
        eslint: '^8',
        'eslint-config-next': '15.0.0',
      },
    }, null, 2);
  }

  private generateTsConfig(): string {
    return JSON.stringify({
      compilerOptions: {
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: {
          '@/*': ['./*'],
          '@/components/*': ['./components/*'],
          '@/lib/*': ['./lib/*'],
          '@/hooks/*': ['./hooks/*'],
          '@/types/*': ['./types/*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    }, null, 2);
  }

  private generateNextConfig(): string {
    return `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
`;
  }

  private generatePostCssConfig(): string {
    return `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
`;
  }

  private generateEnvLocal(): string {
    return `# Environment Variables
# Copy this file to .env.local and fill in the values

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API (if needed)
# API_URL=http://localhost:3001
`;
  }

  private generateGitignore(): string {
    return `# Dependencies
node_modules
.pnpm-store

# Next.js
.next
out
build

# Production
dist

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.idea
.vscode
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;
  }

  private generateLayout(designSystem: DesignSystem): string {
    const projectName = this.projectContext?.name || 'My App';

    return `import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: '${projectName}',
    template: \`%s | ${projectName}\`,
  },
  description: '${this.projectContext?.description || 'Built with Agent Battalion'}',
  keywords: ['nextjs', 'react', 'typescript'],
  authors: [{ name: 'Agent Battalion' }],
  creator: 'Agent Battalion',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: '${projectName}',
    description: '${this.projectContext?.description || 'Built with Agent Battalion'}',
    siteName: '${projectName}',
  },
  twitter: {
    card: 'summary_large_image',
    title: '${projectName}',
    description: '${this.projectContext?.description || 'Built with Agent Battalion'}',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '${designSystem.colors.primary}',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="${designSystem.theme === 'dark' ? 'dark' : ''}">
      <body className={\`\${inter.variable} font-sans antialiased\`}>
        <div className="relative min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
`;
  }

  private generateHomePage(architecture: ArchitectureSpec, designSystem: DesignSystem): string {
    const projectName = this.projectContext?.name || 'My App';

    // Find relevant components
    const hasHero = architecture.components.some(c => c.name.toLowerCase().includes('hero'));
    const hasFeatures = architecture.components.some(c => c.name.toLowerCase().includes('feature'));

    return `import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
${hasHero ? "import { HeroSection } from '@/components/sections/hero-section';" : ''}
${hasFeatures ? "import { FeaturesSection } from '@/components/sections/features-section';" : ''}

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        ${hasHero ? '<HeroSection />' : `
        <section className="section-padding">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Welcome to <span className="gradient-text">${projectName}</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-8">
              ${this.projectContext?.description || 'Your amazing application starts here.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors">
                Get Started
              </button>
              <button className="px-6 py-3 border border-border hover:bg-surface-hover text-text font-medium rounded-lg transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </section>
        `}
        ${hasFeatures ? '<FeaturesSection />' : ''}
      </main>
      <Footer />
    </>
  );
}
`;
  }

  private generateLoadingPage(): string {
    return `export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}
`;
  }

  private generateErrorPage(): string {
    return `'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
        <p className="text-text-secondary mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
`;
  }

  private generateNotFoundPage(): string {
    return `import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-text-secondary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
`;
  }

  private generateComponent(
    filePath: string,
    architecture: ArchitectureSpec,
    designSystem: DesignSystem
  ): string {
    const fileName = filePath.split('/').pop()?.replace('.tsx', '') || '';
    const componentName = this.toPascalCase(fileName);

    // Check component type based on path
    if (filePath.includes('layout/header')) return this.generateHeader();
    if (filePath.includes('layout/footer')) return this.generateFooter();
    if (filePath.includes('layout/navigation')) return this.generateNavigation();
    if (filePath.includes('sections/hero')) return this.generateHeroSection();
    if (filePath.includes('sections/features')) return this.generateFeaturesSection();
    if (filePath.includes('ui/button')) return this.generateButtonComponent();
    if (filePath.includes('ui/input')) return this.generateInputComponent();
    if (filePath.includes('ui/card')) return this.generateCardComponent();
    if (filePath.includes('ui/modal')) return this.generateModalComponent();

    // Generic component
    return `'use client';

import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${componentName}({ className, children }: ${componentName}Props) {
  return (
    <div className={cn('', className)}>
      {children || <p>${componentName} component</p>}
    </div>
  );
}
`;
  }

  private generateHeader(): string {
    const projectName = this.projectContext?.name || 'App';

    return `'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">${projectName.charAt(0)}</span>
            </div>
            <span className="font-bold text-xl">${projectName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-text-secondary hover:text-text transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={cn(
                "w-full h-0.5 bg-text transition-all",
                isMenuOpen && "rotate-45 translate-y-2"
              )} />
              <span className={cn(
                "w-full h-0.5 bg-text transition-all",
                isMenuOpen && "opacity-0"
              )} />
              <span className={cn(
                "w-full h-0.5 bg-text transition-all",
                isMenuOpen && "-rotate-45 -translate-y-2"
              )} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-down">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-text-secondary hover:text-text transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors">
                Get Started
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
`;
  }

  private generateFooter(): string {
    const projectName = this.projectContext?.name || 'App';
    const year = new Date().getFullYear();

    return `import Link from 'next/link';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Roadmap', href: '/roadmap' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Help Center', href: '/help' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-secondary">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">${projectName.charAt(0)}</span>
              </div>
              <span className="font-bold text-xl">${projectName}</span>
            </Link>
            <p className="text-text-secondary text-sm">
              Built with Next.js 15 & React 19
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-secondary hover:text-text transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            © ${year} ${projectName}. All rights reserved.
          </p>
          <p className="text-text-muted text-sm">
            Built with ❤️ by Agent Battalion
          </p>
        </div>
      </div>
    </footer>
  );
}
`;
  }

  private generateNavigation(): string {
    return `'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors',
        isActive ? 'text-primary' : 'text-text-secondary hover:text-text'
      )}
    >
      {children}
    </Link>
  );
}
`;
  }

  private generateHeroSection(): string {
    const projectName = this.projectContext?.name || 'App';

    return `export function HeroSection() {
  return (
    <section className="relative overflow-hidden section-padding">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

      <div className="relative container-custom">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-primary">Now Available</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            Welcome to{' '}
            <span className="gradient-text">${projectName}</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-slide-up animate-delay-100">
            ${this.projectContext?.description || 'Build something amazing with the latest technologies. Fast, secure, and beautifully designed.'}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animate-delay-200">
            <button className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105">
              Get Started Free
            </button>
            <button className="px-8 py-4 border-2 border-border hover:border-primary text-text font-semibold rounded-xl transition-all hover:scale-105 group">
              Learn More
              <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
            </button>
          </div>

          {/* Social proof */}
          <div className="mt-16 pt-8 border-t border-border animate-fade-in animate-delay-300">
            <p className="text-text-muted text-sm mb-4">Trusted by innovative teams</p>
            <div className="flex justify-center items-center gap-8 opacity-50">
              {['Company A', 'Company B', 'Company C', 'Company D'].map((company) => (
                <span key={company} className="text-text-secondary font-semibold">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
  }

  private generateFeaturesSection(): string {
    return `const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Built with Next.js 15 for optimal performance and instant page loads.',
  },
  {
    icon: '🎨',
    title: 'Beautiful Design',
    description: 'Carefully crafted UI with attention to every detail.',
  },
  {
    icon: '📱',
    title: 'Fully Responsive',
    description: 'Works perfectly on all devices, from mobile to desktop.',
  },
  {
    icon: '🔒',
    title: 'Secure by Default',
    description: 'Built with security best practices from the ground up.',
  },
  {
    icon: '🚀',
    title: 'Easy Deployment',
    description: 'Deploy in seconds with Vercel or any hosting platform.',
  },
  {
    icon: '♿',
    title: 'Accessible',
    description: 'WCAG compliant for an inclusive user experience.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding bg-background-secondary">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-text-secondary text-lg">
            Packed with features to help you build amazing products faster.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
              style={{ animationDelay: \`\${index * 100}ms\` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
  }

  private generateButtonComponent(): string {
    return `import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-ring disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary hover:bg-primary-hover text-white shadow-sm',
        secondary: 'bg-secondary hover:bg-secondary-hover text-white shadow-sm',
        outline: 'border-2 border-border hover:border-primary hover:text-primary bg-transparent',
        ghost: 'hover:bg-surface-hover text-text-secondary hover:text-text',
        danger: 'bg-error hover:opacity-90 text-white shadow-sm',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
`;
  }

  private generateInputComponent(): string {
    return `import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-text">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border bg-transparent transition-all focus-ring',
            error
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-border focus:border-primary focus:ring-primary/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn(
            'mt-1.5 text-sm',
            error ? 'text-error' : 'text-text-muted'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
`;
  }

  private generateCardComponent(): string {
    return `import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline' | 'glass';
}

export function Card({ className, children, variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-surface',
    elevated: 'bg-surface shadow-lg',
    outline: 'bg-transparent border border-border',
    glass: 'glass',
  };

  return (
    <div className={cn('rounded-xl p-6', variants[variant], className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-xl font-semibold', className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-text-secondary', className)}>{children}</p>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('', className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mt-4 pt-4 border-t border-border', className)}>{children}</div>;
}
`;
  }

  private generateModalComponent(): string {
    return `'use client';

import { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-surface border border-border rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-scale-in',
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
`;
  }

  private generateUtils(): string {
    return `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
`;
  }

  private generateConstants(): string {
    const projectName = this.projectContext?.name || 'App';

    return `export const APP_NAME = '${projectName}';
export const APP_DESCRIPTION = '${this.projectContext?.description || 'Built with Agent Battalion'}';

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  FEATURES: '#features',
  PRICING: '/pricing',
} as const;

export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com',
  GITHUB: 'https://github.com',
  LINKEDIN: 'https://linkedin.com',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
`;
  }

  private generateTypes(): string {
    return `// Global type definitions

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
`;
  }

  private generateHook(filePath: string): string {
    if (filePath.includes('use-media-query')) {
      return `'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
`;
    }

    return `'use client';

// Custom hook
export function useCustomHook() {
  // Implementation
  return {};
}
`;
  }

  private generateApiRoute(filePath: string): string {
    if (filePath.includes('health')) {
      return `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
`;
    }

    return `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'API route' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
`;
  }

  private generateReadme(techStack: TechStack): string {
    const projectName = this.projectContext?.name || 'My App';

    return `# ${projectName}

${this.projectContext?.description || 'A modern web application built with Next.js 15 and React 19.'}

## 🚀 Tech Stack

- **Framework:** ${techStack.frontend.framework}
- **Language:** ${techStack.frontend.language}
- **Styling:** ${techStack.frontend.styling}
- **State Management:** ${techStack.frontend.stateManagement}

## 📦 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn or pnpm

### Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

\`\`\`
├── app/                 # Next.js App Router
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── ui/              # UI primitives
│   ├── layout/          # Layout components
│   └── sections/        # Page sections
├── lib/                 # Utility functions
├── hooks/               # Custom React hooks
├── types/               # TypeScript types
└── public/              # Static assets
\`\`\`

## 📝 Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint
- \`npm run type-check\` - Run TypeScript type checking

## 🎨 Features

- ⚡ **Next.js 15** - Latest React framework features
- 🎨 **Tailwind CSS** - Utility-first styling
- 📱 **Responsive** - Mobile-first design
- 🌙 **Dark Mode** - Beautiful dark theme
- ♿ **Accessible** - WCAG compliant
- 🔒 **Type Safe** - Full TypeScript support

---

Built with ❤️ by **Agent Battalion**
`;
  }

  private toPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private async implementComponent(task: AgentTask): Promise<any> {
    this.think(`Implementing component: ${task.description}`);
    return {};
  }

  private async fixBug(task: AgentTask): Promise<any> {
    this.think(`Fixing bug: ${task.description}`);
    return {};
  }
}
