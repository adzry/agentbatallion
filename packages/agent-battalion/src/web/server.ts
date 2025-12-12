import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import archiver from 'archiver';
import { Readable } from 'stream';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// Mock Next.js 15 + React 19 App Generator
interface GeneratedFile {
  path: string;
  content: string;
}

function generateNextJsApp(specification: string): GeneratedFile[] {
  const appName = extractAppName(specification);
  const features = extractFeatures(specification);
  
  return [
    {
      path: 'package.json',
      content: generatePackageJson(appName, features)
    },
    {
      path: 'next.config.js',
      content: generateNextConfig()
    },
    {
      path: 'tailwind.config.ts',
      content: generateTailwindConfig()
    },
    {
      path: 'postcss.config.js',
      content: generatePostcssConfig()
    },
    {
      path: 'tsconfig.json',
      content: generateTsConfig()
    },
    {
      path: 'app/layout.tsx',
      content: generateLayout(appName)
    },
    {
      path: 'app/page.tsx',
      content: generateHomePage(appName, specification, features)
    },
    {
      path: 'app/globals.css',
      content: generateGlobalCss()
    },
    {
      path: '.gitignore',
      content: generateGitignore()
    },
    {
      path: 'README.md',
      content: generateReadme(appName, specification)
    }
  ];
}

function extractAppName(spec: string): string {
  const match = spec.match(/(?:called|named)\s+["']?([^"'\s]+)["']?/i);
  if (match) return match[1];
  
  const keywords = ['app', 'dashboard', 'portal', 'system', 'platform'];
  for (const keyword of keywords) {
    if (spec.toLowerCase().includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  return 'MyApp';
}

function extractFeatures(spec: string): string[] {
  const features: string[] = [];
  const keywords = {
    'authentication': ['login', 'auth', 'signin', 'signup'],
    'database': ['database', 'data', 'store', 'crud'],
    'api': ['api', 'backend', 'endpoint'],
    'dashboard': ['dashboard', 'admin', 'analytics'],
    'chat': ['chat', 'messaging', 'messages'],
    'ecommerce': ['ecommerce', 'shop', 'store', 'cart'],
    'blog': ['blog', 'posts', 'articles']
  };
  
  const lowerSpec = spec.toLowerCase();
  for (const [feature, words] of Object.entries(keywords)) {
    if (words.some(word => lowerSpec.includes(word))) {
      features.push(feature);
    }
  }
  
  return features;
}

function generatePackageJson(appName: string, features: string[]): string {
  const deps: Record<string, string> = {
    "next": "15.0.3",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  };
  
  const devDeps: Record<string, string> = {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-config-next": "15.0.3"
  };
  
  return JSON.stringify({
    name: appName.toLowerCase().replace(/\s+/g, '-'),
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint"
    },
    dependencies: deps,
    devDependencies: devDeps
  }, null, 2);
}

function generateNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`;
}

function generateTailwindConfig(): string {
  return `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}
export default config
`;
}

function generatePostcssConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
}

function generateTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [
        {
          name: "next"
        }
      ],
      paths: {
        "@/*": ["./*"]
      }
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"]
  }, null, 2);
}

function generateLayout(appName: string): string {
  return `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '${appName}',
  description: 'Generated by Agent Battalion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  )
}
`;
}

function generateHomePage(appName: string, spec: string, features: string[]): string {
  const featuresList = features.length > 0 
    ? features.map(f => `          <li className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span className="capitalize">${f}</span>
          </li>`).join('\n')
    : '          <li className="text-gray-400">No specific features detected</li>';
  
  return `export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            ${appName}
          </h1>
          <p className="text-xl text-gray-400">
            Generated by Agent Battalion
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">
            Your Specification
          </h2>
          <p className="text-gray-300 leading-relaxed">
            ${spec}
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
            Detected Features
          </h2>
          <ul className="space-y-2">
${featuresList}
          </ul>
        </div>

        <div className="bg-gradient-to-r from-blue-900/50 to-emerald-900/50 rounded-lg border border-blue-800/50 p-8">
          <h2 className="text-2xl font-semibold mb-4">
            🚀 Getting Started
          </h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <p className="font-semibold text-blue-400 mb-2">1. Install dependencies:</p>
              <code className="block bg-gray-950 p-3 rounded border border-gray-800">
                npm install
              </code>
            </div>
            <div>
              <p className="font-semibold text-blue-400 mb-2">2. Run development server:</p>
              <code className="block bg-gray-950 p-3 rounded border border-gray-800">
                npm run dev
              </code>
            </div>
            <div>
              <p className="font-semibold text-blue-400 mb-2">3. Open your browser:</p>
              <code className="block bg-gray-950 p-3 rounded border border-gray-800">
                http://localhost:3000
              </code>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500">
          <p>This is a starter template. Customize it to match your needs!</p>
        </div>
      </div>
    </main>
  )
}
`;
}

function generateGlobalCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #030712;
  --foreground: #f9fafb;
}

body {
  color: var(--foreground);
  background: var(--background);
}
`;
}

function generateGitignore(): string {
  return `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;
}

function generateReadme(appName: string, spec: string): string {
  return `# ${appName}

Generated by Agent Battalion - An AI-powered full-stack app generator.

## Specification

${spec}

## Getting Started

First, install dependencies:

\`\`\`bash
npm install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ESLint** - Code quality

## Project Structure

\`\`\`
├── app/
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── public/           # Static assets
├── next.config.js    # Next.js configuration
├── tailwind.config.ts # Tailwind configuration
└── package.json      # Dependencies
\`\`\`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

---

Generated with ❤️ by Agent Battalion
`;
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('generate-app', async (data: { specification: string }) => {
    const { specification } = data;
    
    try {
      // Simulate generation steps with progress updates
      socket.emit('progress', { 
        step: 'Analyzing specification...', 
        progress: 10 
      });
      await sleep(800);

      socket.emit('progress', { 
        step: 'Planning application structure...', 
        progress: 25 
      });
      await sleep(1000);

      socket.emit('progress', { 
        step: 'Generating Next.js 15 project...', 
        progress: 40 
      });
      await sleep(1200);

      const files = generateNextJsApp(specification);

      socket.emit('progress', { 
        step: 'Creating configuration files...', 
        progress: 60 
      });
      await sleep(800);

      socket.emit('progress', { 
        step: 'Setting up Tailwind CSS...', 
        progress: 75 
      });
      await sleep(600);

      socket.emit('progress', { 
        step: 'Finalizing application...', 
        progress: 90 
      });
      await sleep(500);

      socket.emit('generation-complete', { files });
      socket.emit('progress', { 
        step: 'Complete! Ready to download.', 
        progress: 100 
      });

      console.log('App generated successfully for:', specification);
    } catch (error) {
      console.error('Generation error:', error);
      socket.emit('generation-error', { 
        error: 'Failed to generate app. Please try again.' 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// REST endpoint for downloading generated app as ZIP
app.post('/api/download', express.json(), (req, res) => {
  const { files } = req.body as { files: GeneratedFile[] };
  
  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: 'Invalid files data' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="generated-app.zip"');

  const archive = archiver('zip', { zlib: { level: 9 } });
  
  archive.on('error', (err) => {
    console.error('Archive error:', err);
    res.status(500).json({ error: 'Failed to create archive' });
  });

  archive.pipe(res);

  // Add files to archive
  files.forEach(file => {
    archive.append(file.content, { name: file.path });
  });

  archive.finalize();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Agent Battalion Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
});
