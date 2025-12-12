import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';
import { Readable } from 'stream';
import 'dotenv/config';

// Types
interface GenerationRequest {
  prompt: string;
  projectName?: string;
}

interface GeneratedFile {
  path: string;
  content: string;
}

interface GenerationProgress {
  phase: string;
  message: string;
  progress: number;
  files?: GeneratedFile[];
}

// Mock generator for Next.js 15 apps
class MockAppGenerator {
  private socket: Socket;
  private projectName: string;

  constructor(socket: Socket, projectName: string = 'my-nextjs-app') {
    this.socket = socket;
    this.projectName = projectName.toLowerCase().replace(/\s+/g, '-');
  }

  private emit(phase: string, message: string, progress: number, files?: GeneratedFile[]) {
    const payload: GenerationProgress = { phase, message, progress, files };
    this.socket.emit('generation:progress', payload);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generate(prompt: string): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Phase 1: Analyzing requirements
    this.emit('analyzing', '🔍 Analyzing your requirements...', 5);
    await this.delay(800);
    this.emit('analyzing', '📝 Understanding app specifications...', 10);
    await this.delay(600);

    // Phase 2: Planning architecture
    this.emit('planning', '🏗️ Planning application architecture...', 15);
    await this.delay(700);
    this.emit('planning', '📐 Designing component structure...', 20);
    await this.delay(500);

    // Phase 3: Generating package.json
    this.emit('generating', '📦 Creating package.json...', 25);
    const packageJson = this.generatePackageJson(prompt);
    files.push(packageJson);
    await this.delay(600);

    // Phase 4: Generating config files
    this.emit('generating', '⚙️ Generating configuration files...', 35);
    const nextConfig = this.generateNextConfig();
    const tailwindConfig = this.generateTailwindConfig();
    const tsConfig = this.generateTsConfig();
    const postcssConfig = this.generatePostCssConfig();
    files.push(nextConfig, tailwindConfig, tsConfig, postcssConfig);
    await this.delay(700);

    // Phase 5: Generating layout
    this.emit('generating', '🎨 Creating app layout...', 50);
    const layout = this.generateLayout(prompt);
    const globalsCss = this.generateGlobalsCss();
    files.push(layout, globalsCss);
    await this.delay(600);

    // Phase 6: Generating main page
    this.emit('generating', '📄 Building main page component...', 65);
    const page = this.generatePage(prompt);
    files.push(page);
    await this.delay(800);

    // Phase 7: Generating additional components
    this.emit('generating', '🧩 Creating UI components...', 80);
    const components = this.generateComponents(prompt);
    files.push(...components);
    await this.delay(600);

    // Phase 8: Generating README
    this.emit('generating', '📚 Writing documentation...', 90);
    const readme = this.generateReadme(prompt);
    files.push(readme);
    await this.delay(400);

    // Phase 9: Complete
    this.emit('complete', '✅ Application generated successfully!', 100, files);

    return files;
  }

  private generatePackageJson(prompt: string): GeneratedFile {
    const content = JSON.stringify({
      name: this.projectName,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        'next': '15.0.0',
        'react': '19.0.0',
        'react-dom': '19.0.0'
      },
      devDependencies: {
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
        'typescript': '^5',
        'tailwindcss': '^3.4.0',
        'postcss': '^8',
        'autoprefixer': '^10',
        'eslint': '^8',
        'eslint-config-next': '15.0.0'
      }
    }, null, 2);

    return { path: 'package.json', content };
  }

  private generateNextConfig(): GeneratedFile {
    const content = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable React 19 features
  },
};

export default nextConfig;
`;
    return { path: 'next.config.ts', content };
  }

  private generateTailwindConfig(): GeneratedFile {
    const content = `import type { Config } from 'tailwindcss';

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
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
`;
    return { path: 'tailwind.config.ts', content };
  }

  private generateTsConfig(): GeneratedFile {
    const content = JSON.stringify({
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
          '@/*': ['./*']
        }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules']
    }, null, 2);

    return { path: 'tsconfig.json', content };
  }

  private generatePostCssConfig(): GeneratedFile {
    const content = `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
`;
    return { path: 'postcss.config.mjs', content };
  }

  private generateLayout(prompt: string): GeneratedFile {
    const appTitle = this.extractAppTitle(prompt);
    const content = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${appTitle}',
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
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"></div>
                <span className="text-xl font-bold">${appTitle}</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
                <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500 transition-colors">
                  Get Started
                </button>
              </div>
            </nav>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-gray-700/50 bg-gray-900/50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <p className="text-center text-gray-400">
                Built with Next.js 15 & React 19 • Generated by Agent Battalion
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
`;
    return { path: 'app/layout.tsx', content };
  }

  private generateGlobalsCss(): GeneratedFile {
    const content = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .glass {
    @apply bg-white/5 backdrop-blur-xl border border-white/10;
  }
  
  .gradient-text {
    @apply bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgb(31 41 55);
}

::-webkit-scrollbar-thumb {
  background: rgb(75 85 99);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(107 114 128);
}
`;
    return { path: 'app/globals.css', content };
  }

  private generatePage(prompt: string): GeneratedFile {
    const appTitle = this.extractAppTitle(prompt);
    const features = this.extractFeatures(prompt);

    const content = `import { FeatureCard } from '@/components/FeatureCard';
import { HeroSection } from '@/components/HeroSection';

export default function Home() {
  const features = ${JSON.stringify(features, null, 4)};

  return (
    <div className="animate-fade-in">
      <HeroSection 
        title="${appTitle}"
        subtitle="Built with the latest Next.js 15 and React 19 features"
      />
      
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold gradient-text mb-4">Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover what makes this application special
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-gray-700/50 bg-gray-800/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="glass rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Start building amazing things with Next.js 15 and React 19 today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="rounded-lg bg-blue-600 px-8 py-3 font-medium hover:bg-blue-500 transition-all hover:scale-105">
                Get Started Free
              </button>
              <button className="rounded-lg border border-gray-600 px-8 py-3 font-medium hover:bg-gray-700 transition-all">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
`;
    return { path: 'app/page.tsx', content };
  }

  private generateComponents(prompt: string): GeneratedFile[] {
    const components: GeneratedFile[] = [];

    // HeroSection component
    const heroContent = `'use client';

interface HeroSectionProps {
  title: string;
  subtitle: string;
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-purple-600/10 to-transparent"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-slide-up">
            <span className="gradient-text">{title}</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {subtitle}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all hover:scale-105 hover:shadow-blue-500/40">
              Get Started
            </button>
            <button className="group flex items-center gap-2 text-lg font-semibold text-gray-300 hover:text-white transition-colors">
              Learn more
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
    components.push({ path: 'components/HeroSection.tsx', content: heroContent });

    // FeatureCard component
    const featureCardContent = `'use client';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="group glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
        {description}
      </p>
    </div>
  );
}
`;
    components.push({ path: 'components/FeatureCard.tsx', content: featureCardContent });

    return components;
  }

  private generateReadme(prompt: string): GeneratedFile {
    const appTitle = this.extractAppTitle(prompt);
    const content = `# ${appTitle}

A modern web application built with Next.js 15 and React 19.

## 🚀 Features

- ⚡ **Next.js 15** - The latest version with improved performance
- ⚛️ **React 19** - Cutting-edge React features
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📱 **Responsive Design** - Works on all devices
- 🌙 **Dark Mode** - Beautiful dark theme by default

## 📦 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn or pnpm

### Installation

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

\`\`\`
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/
│   ├── FeatureCard.tsx  # Feature card component
│   └── HeroSection.tsx  # Hero section component
├── public/              # Static assets
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
\`\`\`

## 📝 Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React framework
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

Generated with ❤️ by **Agent Battalion**
`;
    return { path: 'README.md', content };
  }

  private extractAppTitle(prompt: string): string {
    // Simple extraction - look for common patterns
    const patterns = [
      /(?:build|create|make|generate)\s+(?:a|an|the)?\s*(.+?)\s*(?:app|application|website|site|platform)/i,
      /(.+?)\s*(?:app|application|website|site|platform)/i,
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        return match[1].trim().split(' ').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        ).join(' ');
      }
    }

    return 'My Awesome App';
  }

  private extractFeatures(prompt: string): Array<{ title: string; description: string; icon: string }> {
    // Default features based on common patterns in the prompt
    const defaultFeatures = [
      {
        title: 'Lightning Fast',
        description: 'Built with Next.js 15 for optimal performance and instant page loads.',
        icon: '⚡'
      },
      {
        title: 'Modern Stack',
        description: 'Leveraging React 19 with the latest features and best practices.',
        icon: '🚀'
      },
      {
        title: 'Beautiful Design',
        description: 'Crafted with Tailwind CSS for a stunning, responsive interface.',
        icon: '✨'
      },
      {
        title: 'Type Safe',
        description: 'Full TypeScript support for better developer experience.',
        icon: '🔒'
      },
      {
        title: 'SEO Optimized',
        description: 'Built-in SEO best practices for better discoverability.',
        icon: '🔍'
      },
      {
        title: 'Easy to Customize',
        description: 'Clean, modular code that\'s easy to extend and modify.',
        icon: '🎨'
      }
    ];

    return defaultFeatures;
  }
}

// Store for generated projects
const projectStore = new Map<string, GeneratedFile[]>();

// Create Express app
const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Download endpoint
app.get('/api/download/:projectId', (req: Request, res: Response) => {
  const { projectId } = req.params;
  const files = projectStore.get(projectId);

  if (!files) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${projectId}.zip"`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);

  for (const file of files) {
    archive.append(file.content, { name: file.path });
  }

  archive.finalize();
});

// WebSocket connection handling
io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('generate:start', async (data: GenerationRequest) => {
    const { prompt, projectName } = data;
    const projectId = uuidv4();

    console.log(`Starting generation for project: ${projectId}`);
    console.log(`Prompt: ${prompt}`);

    try {
      const generator = new MockAppGenerator(socket, projectName || 'my-nextjs-app');
      const files = await generator.generate(prompt);

      // Store generated files
      projectStore.set(projectId, files);

      // Send completion with download URL
      socket.emit('generation:complete', {
        projectId,
        downloadUrl: `/api/download/${projectId}`,
        files: files.map(f => ({ path: f.path, size: f.content.length }))
      });
    } catch (error) {
      console.error('Generation error:', error);
      socket.emit('generation:error', {
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 Agent Battalion Server                               ║
  ║                                                           ║
  ║   Web UI:    http://localhost:${PORT}                       ║
  ║   API:       http://localhost:${PORT}/api                   ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

export { app, server, io };
