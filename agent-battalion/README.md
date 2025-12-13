# Agent Battalion v3.0

> **AI-Powered Full-Stack App Generator with Multi-Agent Collaboration**

An advanced MGX-style multi-agent system that generates complete, production-ready applications through collaborative AI agents.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Agents](https://img.shields.io/badge/AI%20Agents-8-green)

## 🚀 Features

### Multi-Agent System (8 Specialized AI Agents)
| Agent | Name | Role | Responsibilities |
|-------|------|------|------------------|
| 👔 | Alex | Product Manager | Requirements analysis, project scoping, PRD generation |
| 🏗️ | Sam | Architect | System design, tech stack selection, API planning |
| 🎨 | Maya | Designer | Design systems, UI/UX, Tailwind configuration |
| 💻 | Jordan | Frontend Engineer | Next.js 15, React 19, component generation |
| 🗄️ | Morgan | Backend Engineer | Prisma schemas, API routes, authentication |
| 🔐 | Casey | Security Agent | Vulnerability scanning, security audit |
| 📱 | Taylor | Mobile Engineer | React Native / Expo app generation |
| 🔍 | Riley | QA Engineer | Code review, accessibility, testing |

### Phase 1: Core Features ✅
- **Real LLM Integration** - OpenAI, Anthropic, Google, Ollama support
- **Unit Tests** - Comprehensive test coverage with Vitest
- **Docker Deployment** - Production-ready containerization

### Phase 2: Extended Agents ✅
- **Backend Engineer** - Prisma schemas, CRUD APIs, authentication
- **Security Agent** - OWASP-based vulnerability scanning
- **Mobile Agent** - React Native / Expo project generation

### Phase 3: Advanced Features ✅
- **Vector Memory** - Semantic search with Pinecone/local embeddings
- **Temporal Workflows** - Durable, retryable generation pipeline
- **E2B Sandbox** - Secure code execution environment
- **Human Feedback Loop** - Approval workflows, iterative refinement

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/agent-battalion.git
cd agent-battalion

# Install dependencies
npm install

# Set up environment variables
cp packages/agent-battalion/.env.example packages/agent-battalion/.env

# Start development server
npm run dev -w @meta/agent-battalion
```

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=4000

# LLM Provider (openai, anthropic, google, ollama, mock)
LLM_PROVIDER=mock
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_AI_API_KEY=xxx

# Vector Memory (optional)
PINECONE_API_KEY=xxx
PINECONE_ENVIRONMENT=us-east1

# E2B Sandbox (optional)
E2B_API_KEY=xxx

# Temporal (optional)
TEMPORAL_ADDRESS=localhost:7233
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f agent-battalion
```

## 🏗️ Project Structure

```
agent-battalion/
├── packages/
│   ├── agent-battalion/           # Main package
│   │   ├── src/
│   │   │   ├── agents/            # AI Agent implementations
│   │   │   │   ├── team/          # Specialized team agents
│   │   │   │   │   ├── product-manager.ts
│   │   │   │   │   ├── architect.ts
│   │   │   │   │   ├── designer.ts
│   │   │   │   │   ├── frontend-engineer.ts
│   │   │   │   │   ├── backend-engineer.ts
│   │   │   │   │   ├── security-agent.ts
│   │   │   │   │   ├── mobile-agent.ts
│   │   │   │   │   └── qa-engineer.ts
│   │   │   │   ├── team-orchestrator.ts
│   │   │   │   ├── base-team-agent.ts
│   │   │   │   └── ai-agent.ts
│   │   │   ├── llm/               # LLM service integration
│   │   │   ├── memory/            # Memory management
│   │   │   │   ├── memory-manager.ts
│   │   │   │   └── vector-memory.ts
│   │   │   ├── communication/     # Inter-agent messaging
│   │   │   ├── tools/             # Tool registry
│   │   │   ├── sandbox/           # E2B sandbox integration
│   │   │   ├── feedback/          # Human feedback loop
│   │   │   ├── temporal/          # Temporal workflows
│   │   │   └── web/               # Express + Socket.IO server
│   │   └── public/                # Web UI
│   └── agent-battalion-mcp/       # MCP server (IDE integration)
├── Dockerfile                     # Production Docker image
├── Dockerfile.worker              # Temporal worker image
├── docker-compose.prod.yml        # Production deployment
└── nginx.conf                     # Nginx reverse proxy config
```

## 🎯 Usage

### Web Interface

1. Start the server: `npm run dev -w @meta/agent-battalion`
2. Open http://localhost:4000
3. Enter your app description
4. Watch the AI team collaborate in real-time
5. Download the generated project

### API

```typescript
import { createTeamOrchestrator } from '@meta/agent-battalion';

const orchestrator = createTeamOrchestrator({
  projectName: 'My App',
  useRealAI: true,
});

orchestrator.on('progress', (data) => {
  console.log(`${data.agent}: ${data.message}`);
});

const result = await orchestrator.generate('Build a task management app');
console.log(`Generated ${result.files.length} files`);
```

### LLM Service

```typescript
import { createLLMService } from '@meta/agent-battalion';

const llm = createLLMService({
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
});

const response = await llm.complete([
  { role: 'user', content: 'Write a React component' }
]);
```

## 📊 Generated Output

Each project includes:

- **Next.js 15 App Router** with TypeScript
- **Tailwind CSS** design system
- **React 19** components
- **Prisma** schema (when backend enabled)
- **API Routes** with Zod validation
- **Authentication** setup
- **Security audit** report
- **QA report** with accessibility checks

## 🔒 Security Features

- **Vulnerability Scanning** - Detects XSS, SQL injection, hardcoded secrets
- **OWASP Top 10** - Checks for common vulnerabilities
- **Dependency Audit** - Identifies vulnerable packages
- **Security Headers** - CSP, CORS configuration
- **Input Validation** - Zod schemas for all inputs

## 🧪 Testing

```bash
# Run tests
npm test -w @meta/agent-battalion

# Watch mode
npm run test:watch -w @meta/agent-battalion

# Coverage
npm run test:coverage -w @meta/agent-battalion
```

## 🖥️ CLI Tool

Generate apps directly from the command line:

```bash
# Generate an app
npm run cli -- create "Build a todo app" --output ./my-app

# With real AI
npm run cli -- create "Build a blog" --output ./blog --real-ai

# List LLM providers
npm run cli -- providers

# Start web server
npm run cli -- serve --port 4000
```

### CLI Options

| Command | Description |
|---------|-------------|
| `create <prompt>` | Generate a new application |
| `providers` | List available LLM providers |
| `serve` | Start the web server |

### Create Options

| Flag | Description | Default |
|------|-------------|---------|
| `-o, --output` | Output directory | `./generated-app` |
| `-n, --name` | Project name | `my-app` |
| `-p, --provider` | LLM provider | From env |
| `--real-ai` | Use real AI | `false` |
| `--mock` | Use mock generation | `true` |

## 📈 Roadmap

- [x] CLI Tool ✅
- [x] Unit Tests ✅
- [x] Multi-Provider LLM ✅
- [ ] VS Code Extension
- [ ] Custom Agent Creation
- [ ] Project Templates
- [ ] Team Collaboration
- [ ] Cloud Deployment (Vercel, Netlify)
- [ ] Analytics Dashboard

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ by the Agent Battalion Team
