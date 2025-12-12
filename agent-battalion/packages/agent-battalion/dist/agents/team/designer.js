"use strict";
/**
 * Designer Agent
 *
 * Responsible for:
 * - Creating design systems
 * - Defining color palettes and typography
 * - Designing UI components
 * - Ensuring visual consistency
 * - Creating responsive layouts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignerAgent = void 0;
const base_team_agent_js_1 = require("../base-team-agent.js");
class DesignerAgent extends base_team_agent_js_1.BaseTeamAgent {
    constructor(memory, tools, messageBus) {
        const profile = {
            id: 'designer-agent',
            name: 'Maya',
            role: 'designer',
            avatar: '🎨',
            description: 'UI/UX Designer - Creates beautiful and intuitive interfaces',
            capabilities: {
                canWriteCode: true,
                canDesign: true,
                canTest: false,
                canDeploy: false,
                canResearch: true,
                canReview: true,
                languages: ['CSS', 'TypeScript'],
                frameworks: ['Tailwind CSS', 'Figma'],
            },
            personality: 'Creative and detail-oriented. Passionate about user experience and visual harmony.',
            systemPrompt: `You are Maya, an experienced UI/UX Designer AI agent.
Your responsibilities:
1. Create cohesive design systems
2. Define color palettes that convey the right mood
3. Select typography that enhances readability
4. Design responsive layouts
5. Ensure accessibility (WCAG 2.1)
6. Create consistent component styles

Design principles:
- Less is more (minimalism)
- Consistency is key
- Accessibility first
- Mobile-first responsive design
- Smooth micro-interactions`,
        };
        super(profile, memory, tools, messageBus);
    }
    /**
     * Create design system based on project requirements
     */
    async createDesignSystem(requirements, projectContext) {
        this.updateStatus('thinking');
        this.think('Analyzing requirements for design direction...');
        // Analyze design requirements
        const analysis = await this.act('think', 'Analyzing design requirements', async () => {
            return this.analyzeDesignNeeds(requirements, projectContext);
        });
        this.updateProgress(20);
        // Create color palette
        const colors = await this.act('design', 'Creating color palette', async () => {
            return this.createColorPalette(analysis);
        });
        this.updateProgress(40);
        // Define typography
        const typography = await this.act('design', 'Defining typography', async () => {
            return this.defineTypography(analysis);
        });
        this.updateProgress(60);
        // Create component styles
        const components = await this.act('design', 'Designing component styles', async () => {
            return this.designComponents(analysis, colors);
        });
        this.updateProgress(80);
        // Create spacing system
        const spacing = this.createSpacingSystem();
        const designSystem = {
            colors,
            typography,
            spacing,
            components,
            theme: analysis.prefersDark ? 'dark' : 'light',
        };
        // Create design system artifact
        this.createArtifact('design', 'Design System', this.generateDesignDoc(designSystem), 'docs/DESIGN_SYSTEM.md');
        // Create Tailwind config artifact
        this.createArtifact('config', 'Tailwind Config', this.generateTailwindConfig(designSystem), 'tailwind.config.ts');
        // Create globals.css artifact
        this.createArtifact('code', 'Global Styles', this.generateGlobalsCss(designSystem), 'app/globals.css');
        this.updateStatus('complete');
        this.updateProgress(100);
        return designSystem;
    }
    async executeTask(task) {
        switch (task.title) {
            case 'create_design_system':
                const reqs = await this.memory.recall('requirements', 20);
                const ctx = await this.memory.getContext('project');
                return await this.createDesignSystem(reqs, ctx);
            case 'review_design':
                return await this.reviewDesign(task);
            case 'create_component_styles':
                return await this.createComponentStyles(task);
            default:
                throw new Error(`Unknown task: ${task.title}`);
        }
    }
    analyzeDesignNeeds(requirements, context) {
        const reqTexts = requirements.map(r => r.description.toLowerCase()).join(' ');
        const projectName = (context.name || '').toLowerCase();
        const description = (context.description || '').toLowerCase();
        const allText = `${reqTexts} ${projectName} ${description}`;
        // Determine mood
        let mood = 'professional';
        if (/fun|playful|creative|colorful/i.test(allText))
            mood = 'playful';
        else if (/elegant|luxury|premium|minimal/i.test(allText))
            mood = 'elegant';
        else if (/tech|startup|modern|innovation/i.test(allText))
            mood = 'modern';
        else if (/corporate|enterprise|business/i.test(allText))
            mood = 'corporate';
        // Dark mode preference
        const prefersDark = /dark|night|black/i.test(allText) || mood === 'modern' || mood === 'elegant';
        // Minimal design
        const isMinimal = /minimal|clean|simple|zen/i.test(allText) || mood === 'elegant';
        // Animations
        const hasAnimations = /animation|animated|motion|dynamic|interactive/i.test(allText);
        // Color scheme
        let colorScheme = 'professional';
        if (mood === 'playful')
            colorScheme = 'playful';
        else if (mood === 'modern')
            colorScheme = 'vibrant';
        else if (mood === 'elegant')
            colorScheme = 'neutral';
        return { mood, prefersDark, isMinimal, hasAnimations, colorScheme };
    }
    createColorPalette(analysis) {
        // Base palettes
        const palettes = {
            vibrant: {
                primary: '#3b82f6',
                'primary-hover': '#2563eb',
                'primary-light': '#60a5fa',
                secondary: '#8b5cf6',
                'secondary-hover': '#7c3aed',
                accent: '#ec4899',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
            },
            professional: {
                primary: '#2563eb',
                'primary-hover': '#1d4ed8',
                'primary-light': '#3b82f6',
                secondary: '#64748b',
                'secondary-hover': '#475569',
                accent: '#0ea5e9',
                success: '#059669',
                warning: '#d97706',
                error: '#dc2626',
            },
            playful: {
                primary: '#f97316',
                'primary-hover': '#ea580c',
                'primary-light': '#fb923c',
                secondary: '#a855f7',
                'secondary-hover': '#9333ea',
                accent: '#14b8a6',
                success: '#22c55e',
                warning: '#eab308',
                error: '#f43f5e',
            },
            neutral: {
                primary: '#18181b',
                'primary-hover': '#27272a',
                'primary-light': '#3f3f46',
                secondary: '#71717a',
                'secondary-hover': '#52525b',
                accent: '#a1a1aa',
                success: '#22c55e',
                warning: '#f59e0b',
                error: '#ef4444',
            },
        };
        const basePalette = palettes[analysis.colorScheme];
        // Add background and text colors based on dark/light mode
        if (analysis.prefersDark) {
            return {
                ...basePalette,
                background: '#0f172a',
                'background-secondary': '#1e293b',
                'background-tertiary': '#334155',
                surface: '#1e293b',
                'surface-hover': '#334155',
                border: '#334155',
                'border-light': '#475569',
                text: '#f8fafc',
                'text-secondary': '#94a3b8',
                'text-muted': '#64748b',
            };
        }
        else {
            return {
                ...basePalette,
                background: '#ffffff',
                'background-secondary': '#f8fafc',
                'background-tertiary': '#f1f5f9',
                surface: '#ffffff',
                'surface-hover': '#f8fafc',
                border: '#e2e8f0',
                'border-light': '#f1f5f9',
                text: '#0f172a',
                'text-secondary': '#475569',
                'text-muted': '#94a3b8',
            };
        }
    }
    defineTypography(analysis) {
        // Font families based on mood
        const fontFamilies = {
            professional: 'Inter, system-ui, sans-serif',
            modern: 'Plus Jakarta Sans, system-ui, sans-serif',
            elegant: 'Playfair Display, Georgia, serif',
            playful: 'Poppins, system-ui, sans-serif',
            corporate: 'IBM Plex Sans, system-ui, sans-serif',
        };
        const fontFamily = fontFamilies[analysis.mood] || fontFamilies.professional;
        return {
            fontFamily,
            headings: {
                h1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
                h2: 'text-3xl md:text-4xl font-bold tracking-tight',
                h3: 'text-2xl md:text-3xl font-semibold',
                h4: 'text-xl md:text-2xl font-semibold',
                h5: 'text-lg md:text-xl font-medium',
                h6: 'text-base md:text-lg font-medium',
            },
            body: 'text-base leading-relaxed',
        };
    }
    createSpacingSystem() {
        return {
            xs: '0.25rem',
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
            '2xl': '3rem',
            '3xl': '4rem',
            '4xl': '6rem',
            section: '5rem',
            container: '7rem',
        };
    }
    designComponents(analysis, colors) {
        const components = [];
        // Button component
        components.push({
            name: 'Button',
            variants: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
            props: {
                primary: `bg-[${colors.primary}] hover:bg-[${colors['primary-hover']}] text-white font-medium px-4 py-2 rounded-lg transition-all`,
                secondary: `bg-[${colors.secondary}] hover:bg-[${colors['secondary-hover']}] text-white font-medium px-4 py-2 rounded-lg transition-all`,
                outline: `border-2 border-[${colors.primary}] text-[${colors.primary}] hover:bg-[${colors.primary}] hover:text-white font-medium px-4 py-2 rounded-lg transition-all`,
                ghost: `text-[${colors['text-secondary']}] hover:bg-[${colors['surface-hover']}] font-medium px-4 py-2 rounded-lg transition-all`,
                danger: `bg-[${colors.error}] hover:opacity-90 text-white font-medium px-4 py-2 rounded-lg transition-all`,
            },
        });
        // Card component
        components.push({
            name: 'Card',
            variants: ['default', 'elevated', 'outline', 'glass'],
            props: {
                default: `bg-[${colors.surface}] rounded-xl p-6`,
                elevated: `bg-[${colors.surface}] rounded-xl p-6 shadow-lg`,
                outline: `bg-transparent border border-[${colors.border}] rounded-xl p-6`,
                glass: `bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6`,
            },
        });
        // Input component
        components.push({
            name: 'Input',
            variants: ['default', 'filled', 'underline'],
            props: {
                default: `w-full px-4 py-2 border border-[${colors.border}] rounded-lg bg-transparent focus:border-[${colors.primary}] focus:ring-2 focus:ring-[${colors.primary}]/20 outline-none transition-all`,
                filled: `w-full px-4 py-2 bg-[${colors['background-secondary']}] border border-transparent rounded-lg focus:border-[${colors.primary}] outline-none transition-all`,
                underline: `w-full px-0 py-2 border-b border-[${colors.border}] bg-transparent focus:border-[${colors.primary}] outline-none transition-all`,
            },
        });
        // Badge component
        components.push({
            name: 'Badge',
            variants: ['default', 'success', 'warning', 'error'],
            props: {
                default: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[${colors.primary}]/10 text-[${colors.primary}]`,
                success: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[${colors.success}]/10 text-[${colors.success}]`,
                warning: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[${colors.warning}]/10 text-[${colors.warning}]`,
                error: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[${colors.error}]/10 text-[${colors.error}]`,
            },
        });
        return components;
    }
    generateDesignDoc(system) {
        return `# Design System

## Theme: ${system.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}

## Color Palette

| Token | Value |
|-------|-------|
${Object.entries(system.colors).map(([name, value]) => `| ${name} | \`${value}\` |`).join('\n')}

## Typography

**Font Family:** ${system.typography.fontFamily}

### Headings
${Object.entries(system.typography.headings).map(([level, styles]) => `- **${level.toUpperCase()}:** \`${styles}\``).join('\n')}

### Body
\`${system.typography.body}\`

## Spacing

${Object.entries(system.spacing).map(([name, value]) => `- **${name}:** \`${value}\``).join('\n')}

## Components

${system.components.map(comp => `
### ${comp.name}

**Variants:** ${comp.variants.join(', ')}

${Object.entries(comp.props).map(([variant, styles]) => `
#### ${variant}
\`\`\`
${styles}
\`\`\`
`).join('')}
`).join('\n')}

---

*Generated by Agent Battalion - Designer Agent*
`;
    }
    generateTailwindConfig(system) {
        const colorEntries = Object.entries(system.colors)
            .map(([name, value]) => `        '${name}': '${value}',`)
            .join('\n');
        return `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
${colorEntries}
      },
      fontFamily: {
        sans: ['${system.typography.fontFamily.split(',')[0]}', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
`;
    }
    generateGlobalsCss(system) {
        return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
${Object.entries(system.colors).map(([name, value]) => `    --${name}: ${value};`).join('\n')}
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-background text-text antialiased;
    font-family: ${system.typography.fontFamily};
  }
}

@layer components {
  .container-custom {
    @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
  }

  .section-padding {
    @apply py-16 md:py-24 lg:py-32;
  }

  .glass {
    @apply bg-white/5 backdrop-blur-xl border border-white/10;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent;
  }

  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .animate-delay-100 {
    animation-delay: 100ms;
  }

  .animate-delay-200 {
    animation-delay: 200ms;
  }

  .animate-delay-300 {
    animation-delay: 300ms;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-background-secondary;
}

::-webkit-scrollbar-thumb {
  @apply bg-border rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-text-muted;
}
`;
    }
    async reviewDesign(task) {
        this.think('Reviewing design for consistency and accessibility...');
        return { approved: true, suggestions: [] };
    }
    async createComponentStyles(task) {
        this.think('Creating component styles...');
        return {};
    }
}
exports.DesignerAgent = DesignerAgent;
//# sourceMappingURL=designer.js.map