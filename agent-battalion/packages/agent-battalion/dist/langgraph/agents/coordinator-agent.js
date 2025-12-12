"use strict";
/**
 * Coordinator Agent
 *
 * Orchestrates the code generation process, managing multiple coder agents
 * and ensuring files are generated in the correct order with proper
 * dependencies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoordinatorAgent = void 0;
exports.runCoordinatorAgent = runCoordinatorAgent;
const base_agent_js_1 = require("../base-agent.js");
class CoordinatorAgent extends base_agent_js_1.BaseAgent {
    constructor() {
        super('coordinator', 'Coordinates code generation across multiple agents');
    }
    getSystemPrompt() {
        return `You are a code generation coordinator.
Your job is to:
1. Execute build phases in order
2. Generate code for each task
3. Ensure dependencies are met
4. Collect and validate generated files

Generate modern, production-ready code using:
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS`;
    }
    async execute(input) {
        const plan = input.plan;
        const projectName = input.projectName;
        const files = [];
        // Execute each phase
        for (const phase of plan.phases) {
            const phaseFiles = await this.executePhase(phase, projectName);
            files.push(...phaseFiles);
        }
        return files;
    }
    async executePhase(phase, projectName) {
        const files = [];
        for (const task of phase.tasks) {
            const file = await this.executeTask(task, projectName);
            if (file) {
                files.push(file);
            }
        }
        return files;
    }
    async executeTask(task, projectName) {
        if (task.type !== 'create-file' || !task.target) {
            return null;
        }
        const content = this.generateFileContent(task.target, projectName);
        return {
            path: task.target,
            content,
            type: this.getFileType(task.target),
        };
    }
    generateFileContent(filePath, projectName) {
        const fileName = filePath.split('/').pop() || '';
        // Generate content based on file type
        if (fileName === 'package.json') {
            return this.generatePackageJson(projectName);
        }
        if (fileName === 'tsconfig.json') {
            return this.generateTsConfig();
        }
        if (fileName === 'next.config.ts') {
            return this.generateNextConfig();
        }
        if (fileName === 'tailwind.config.ts') {
            return this.generateTailwindConfig();
        }
        if (fileName === 'postcss.config.mjs') {
            return this.generatePostCssConfig();
        }
        if (fileName === 'layout.tsx') {
            return this.generateLayout(projectName);
        }
        if (fileName === 'globals.css') {
            return this.generateGlobalsCss();
        }
        if (fileName === 'page.tsx' && filePath === 'app/page.tsx') {
            return this.generateHomePage(projectName);
        }
        if (fileName === 'page.tsx') {
            const pagePath = filePath.replace('app/', '').replace('/page.tsx', '');
            return this.generatePage(projectName, pagePath);
        }
        if (fileName === 'README.md') {
            return this.generateReadme(projectName);
        }
        if (fileName.endsWith('.tsx') && filePath.includes('components/')) {
            const componentName = fileName.replace('.tsx', '');
            return this.generateComponent(componentName);
        }
        return `// Generated file: ${filePath}`;
    }
    getFileType(filePath) {
        if (filePath.endsWith('.json') || filePath.endsWith('.config.ts') || filePath.endsWith('.config.mjs')) {
            return 'config';
        }
        if (filePath.endsWith('.md')) {
            return 'doc';
        }
        if (filePath.endsWith('.css')) {
            return 'asset';
        }
        return 'source';
    }
    generatePackageJson(projectName) {
        return JSON.stringify({
            name: projectName.toLowerCase().replace(/\s+/g, '-'),
            version: '0.1.0',
            private: true,
            scripts: {
                dev: 'next dev',
                build: 'next build',
                start: 'next start',
                lint: 'next lint',
            },
            dependencies: {
                next: '15.0.0',
                react: '19.0.0',
                'react-dom': '19.0.0',
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
    generateTsConfig() {
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
                paths: { '@/*': ['./*'] },
            },
            include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
            exclude: ['node_modules'],
        }, null, 2);
    }
    generateNextConfig() {
        return `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`;
    }
    generateTailwindConfig() {
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
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
};

export default config;
`;
    }
    generatePostCssConfig() {
        return `const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
`;
    }
    generateLayout(projectName) {
        return `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Generated by Agent Battalion',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white antialiased">
        <header className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-xl">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="text-xl font-bold">${projectName}</div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
              <a href="/about" className="text-gray-300 hover:text-white transition-colors">About</a>
            </div>
          </nav>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-gray-700/50 bg-gray-900/50 py-8">
          <div className="mx-auto max-w-7xl px-4 text-center text-gray-400">
            Built with Next.js 15 & React 19 • Generated by Agent Battalion
          </div>
        </footer>
      </body>
    </html>
  );
}
`;
    }
    generateGlobalsCss() {
        return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-900 text-white;
  }
}

@layer utilities {
  .gradient-text {
    @apply bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent;
  }
}
`;
    }
    generateHomePage(projectName) {
        return `export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-purple-600/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="gradient-text">${projectName}</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
            Built with the latest Next.js 15 and React 19 features.
            A modern, fast, and beautiful web application.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold shadow-lg hover:bg-blue-500 transition-all">
              Get Started
            </button>
            <button className="text-lg font-semibold text-gray-300 hover:text-white transition-colors">
              Learn more →
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Lightning Fast', description: 'Built with Next.js 15 for optimal performance', icon: '⚡' },
              { title: 'Modern Stack', description: 'React 19 with the latest features', icon: '🚀' },
              { title: 'Beautiful Design', description: 'Crafted with Tailwind CSS', icon: '✨' },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
`;
    }
    generatePage(projectName, pagePath) {
        const pageName = pagePath.charAt(0).toUpperCase() + pagePath.slice(1);
        return `export default function ${pageName}Page() {
  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">${pageName}</h1>
        <p className="text-gray-400">
          This is the ${pageName.toLowerCase()} page. Add your content here.
        </p>
      </div>
    </div>
  );
}
`;
    }
    generateReadme(projectName) {
        return `# ${projectName}

Generated with Agent Battalion - AI-Powered App Generator.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS

## Project Structure

\`\`\`
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # Reusable components
├── public/              # Static assets
└── package.json
\`\`\`

## Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint

---

Built with ❤️ by Agent Battalion
`;
    }
    generateComponent(name) {
        return `'use client';

interface ${name}Props {
  className?: string;
}

export function ${name}({ className = '' }: ${name}Props) {
  return (
    <div className={\`p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10 \${className}\`}>
      <h3 className="text-xl font-semibold mb-2">${name}</h3>
      <p className="text-gray-400">Add your component content here.</p>
    </div>
  );
}
`;
    }
}
exports.CoordinatorAgent = CoordinatorAgent;
/**
 * Run the coordinator agent
 */
async function runCoordinatorAgent(plan, projectName) {
    const agent = new CoordinatorAgent();
    const result = await agent.run({ plan, projectName });
    return result;
}
//# sourceMappingURL=coordinator-agent.js.map