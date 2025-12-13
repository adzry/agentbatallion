# 🤖 Agent Battalion v3.0

> **Production-Ready AI-Powered Full-Stack App Generator**

[![Version](https://img.shields.io/badge/version-3.0.0-blue)](https://github.com/adzry/agentbatallion)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/tests-86%20passing-green)](./packages/agent-battalion)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

An advanced multi-agent system that generates complete, production-ready applications through collaborative AI agents. Inspired by MGX.dev.

## ✨ Features

### 🤖 8 Specialized AI Agents

| Agent | Role | Responsibilities |
|-------|------|------------------|
| 👔 Alex | Product Manager | Requirements analysis, project scoping |
| 🏗️ Sam | Architect | System design, tech stack selection |
| 🎨 Maya | Designer | Design systems, UI/UX, Tailwind config |
| 💻 Jordan | Frontend Engineer | Next.js 15, React 19, components |
| 🗄️ Morgan | Backend Engineer | Prisma, API routes, authentication |
| 🔐 Casey | Security Agent | Vulnerability scanning, OWASP audit |
| 📱 Taylor | Mobile Engineer | React Native / Expo generation |
| 🔍 Riley | QA Engineer | Code review, accessibility, testing |

### 🚀 Core Capabilities

- **Multi-Provider LLM** - Claude, GPT-4, Gemini with automatic failover
- **CLI Tool** - Generate apps from command line
- **86 Unit Tests** - Comprehensive test coverage
- **Code Quality** - Automatic cleanup, 88/100 QA score
- **Real-time Collaboration** - Watch agents work via Socket.IO
- **Docker Ready** - Production containerization
- **Temporal Workflows** - Durable, retryable pipelines (optional)

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp packages/agent-battalion/.env.example packages/agent-battalion/.env
# Edit .env and add your API keys

# Start development server
npm run dev
```

## 🖥️ CLI Usage

```bash
# Generate an app
npm run cli -- create "Build a todo app" --output ./my-app

# With real AI (requires API keys)
npm run cli -- create "Build a blog" --output ./blog --real-ai

# List LLM providers
npm run cli -- providers

# Start web server
npm run cli -- serve --port 4000
```

### CLI Options

```
Commands:
  create <prompt>   Generate a new application
  providers         List available LLM providers
  serve             Start the web server

Create Options:
  -o, --output      Output directory (default: ./generated-app)
  -n, --name        Project name (default: my-app)
  -p, --provider    LLM provider (anthropic, openai, google)
  --real-ai         Use real AI (requires API keys)
  --mock            Use mock/template generation
```

## 🔧 Configuration

### Environment Variables

```env
# LLM Provider (anthropic, openai, google, ollama, mock)
LLM_PROVIDER=anthropic
USE_REAL_AI=true

# API Keys (add one or more)
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
GOOGLE_AI_API_KEY=xxx

# Optional: Vector Memory
PINECONE_API_KEY=xxx

# Optional: Code Sandbox
E2B_API_KEY=xxx
```

## 🏗️ Project Structure

```
agent-battalion/
├── packages/
│   └── agent-battalion/          # Main package
│       ├── src/
│       │   ├── agents/           # AI Agents
│       │   │   ├── team/         # Specialized agents
│       │   │   ├── team-orchestrator.ts
│       │   │   └── base-team-agent.ts
│       │   ├── cli/              # CLI tool
│       │   ├── llm/              # LLM service
│       │   ├── memory/           # Memory management
│       │   ├── communication/    # Message bus
│       │   ├── tools/            # Tool registry
│       │   ├── temporal/         # Temporal workflows
│       │   ├── utils/            # Code cleanup
│       │   └── web/              # Express server
│       └── __tests__/            # Unit tests
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 🐳 Docker Deployment

```bash
# Build and run
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f agent-battalion
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🎯 Generated Output

Each project includes:

- **Next.js 15** App Router with TypeScript
- **Tailwind CSS** design system
- **React 19** components with proper types
- **API Routes** with Zod validation
- **Accessibility** compliant (WCAG 2.1)
- **QA Report** with code quality score

## 📊 API Usage

```typescript
import { createTeamOrchestrator } from '@meta/agent-battalion';

const orchestrator = createTeamOrchestrator({
  projectName: 'My App',
});

orchestrator.on('progress', (data) => {
  console.log(`${data.agent}: ${data.message}`);
});

const result = await orchestrator.run('Build a task management app');
console.log(`Generated ${result.files.length} files`);
console.log(`QA Score: ${result.qaReport?.score}/100`);
```

## 🔒 Security

- **Vulnerability Scanning** - Detects XSS, SQL injection, secrets
- **OWASP Top 10** - Checks for common vulnerabilities
- **Input Validation** - Zod schemas for all inputs
- **Multi-Provider Failover** - Automatic LLM provider switching

## 📈 Roadmap

- [x] CLI Tool
- [x] Unit Tests (86 tests)
- [x] Multi-Provider LLM with failover
- [x] Code Quality Improvements
- [ ] VS Code Extension
- [ ] Custom Agent Creation
- [ ] Cloud Deployment (Vercel, Netlify)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ by the Agent Battalion Team
