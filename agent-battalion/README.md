# 🚀 Agent Battalion v2.0

**MGX-Style Multi-Agent AI App Generator**

Agent Battalion is an AI-powered full-stack application generator that uses a team of 5 specialized AI agents to collaboratively build complete Next.js 15 applications from natural language descriptions.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)

## ✨ Features

- 🤖 **5 Specialized AI Agents** - Product Manager, Architect, Designer, Engineer, QA
- 🎨 **Dynamic Design System** - Custom colors, typography, and components for each project
- 📊 **Quality Assurance** - Automated code review with accessibility checks
- ⚡ **Real-time Collaboration** - Watch agents work together via WebSocket
- 📦 **Production-Ready Output** - Complete Next.js 15 apps with best practices

## 🤖 Meet the Team

| Agent | Name | Role | Responsibilities |
|-------|------|------|-----------------|
| 👔 | **Alex** | Product Manager | Analyzes requirements, creates PRDs, prioritizes features |
| 🏗️ | **Sam** | Architect | Designs system architecture, plans file structure |
| 🎨 | **Maya** | Designer | Creates design systems, color palettes, component styles |
| 💻 | **Jordan** | Frontend Engineer | Writes React/Next.js code, implements components |
| 🔍 | **Riley** | QA Engineer | Reviews code quality, checks accessibility |

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd agent-battalion

# Install dependencies
npm install

# Start the development server
npm run dev

# Open in browser
open http://localhost:4000
```

## 📁 Project Structure

```
agent-battalion/
├── package.json                    # Monorepo configuration
├── docker-compose.yml              # Docker services (Temporal, Redis, PostgreSQL)
├── .env                            # Environment configuration
│
├── packages/
│   ├── agent-battalion/            # Main package
│   │   ├── src/
│   │   │   ├── agents/             # MGX-style multi-agent system
│   │   │   │   ├── team/           # Specialized agents
│   │   │   │   │   ├── product-manager.ts
│   │   │   │   │   ├── architect.ts
│   │   │   │   │   ├── designer.ts
│   │   │   │   │   ├── frontend-engineer.ts
│   │   │   │   │   └── qa-engineer.ts
│   │   │   │   ├── base-team-agent.ts
│   │   │   │   ├── team-orchestrator.ts
│   │   │   │   └── types.ts
│   │   │   ├── memory/             # Agent memory system
│   │   │   ├── communication/      # Agent messaging
│   │   │   ├── tools/              # Agent tools
│   │   │   └── web/                # Express + Socket.IO server
│   │   └── public/                 # Web UI
│   │
│   └── agent-battalion-mcp/        # MCP server integration
```

## 🎯 How It Works

1. **User Input** → Describe your app in natural language
2. **Alex (PM)** → Analyzes requirements, creates PRD
3. **Sam (Architect)** → Designs architecture, plans file structure
4. **Maya (Designer)** → Creates design system (colors, typography, components)
5. **Jordan (Engineer)** → Generates all code files
6. **Riley (QA)** → Reviews code, checks quality & accessibility
7. **Output** → Download complete Next.js 15 application

## 📄 Generated Output

Each project includes:

### Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript with path aliases
- `tailwind.config.ts` - Custom design system
- `next.config.ts` - Next.js configuration
- `.env.local` - Environment template

### Application
- `app/layout.tsx` - Root layout with SEO
- `app/page.tsx` - Home page
- `app/globals.css` - Design tokens
- `app/loading.tsx` - Loading state
- `app/error.tsx` - Error boundary
- `app/not-found.tsx` - 404 page

### Components
- `components/ui/` - Button, Input, Card, Modal
- `components/layout/` - Header, Footer, Navigation
- `components/sections/` - Hero, Features

### Utilities
- `lib/utils.ts` - Helper functions
- `lib/constants.ts` - App constants
- `types/index.ts` - TypeScript definitions
- `hooks/` - Custom React hooks

### Documentation
- `README.md` - Project documentation
- `docs/PRD.md` - Product Requirements
- `docs/ARCHITECTURE.md` - System architecture
- `docs/DESIGN_SYSTEM.md` - Design specifications
- `docs/QA_REPORT.md` - Quality report

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=4000
NODE_ENV=development

# LLM Provider (for future AI integration)
LLM_PROVIDER=openai
OPENAI_API_KEY=your-api-key

# Temporal (for workflow orchestration)
TEMPORAL_ADDRESS=localhost:7233
```

### Docker Services

```bash
# Start all services
docker-compose up -d

# Services:
# - Temporal: localhost:7233
# - Temporal UI: localhost:8080
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/team` | GET | Get agent team info |
| `/api/download/:id` | GET | Download project ZIP |
| `/api/project/:id` | GET | Get project details |

## 🔌 WebSocket Events

### Client → Server
- `generate:start` - Start app generation
- `generate:cancel` - Cancel generation
- `file:content` - Request file content

### Server → Client
- `generation:progress` - Progress updates
- `generation:complete` - Generation finished
- `generation:error` - Error occurred
- `team:event` - Agent events
- `file:content` - File content response

## 🛠️ Development

```bash
# Run in development mode
npm run dev

# Type check
npm run build

# Run Temporal worker (optional)
npm run worker --workspace=@meta/agent-battalion
```

## 🏗️ Architecture

### Agent Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Team Orchestrator                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────┐ │
│  │   PM    │→│ Architect│→│ Designer│→│ Engineer│→│  QA │ │
│  │  Alex   │  │   Sam   │  │  Maya   │  │ Jordan  │  │Riley│ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └────┘ │
│       ↓            ↓            ↓            ↓          ↓    │
│  Requirements  Architecture  Design     Code Files  QA Report│
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  Message Bus    │
                    │  + Memory       │
                    │  + Tools        │
                    └─────────────────┘
```

## 📝 Example Usage

**Input:**
> "Create a SaaS landing page with hero section, features grid, pricing plans, testimonials, and contact form"

**Output:**
- Complete Next.js 15 application
- Custom design system (dark theme, gradient accents)
- 20+ production-ready components
- Responsive mobile-first design
- Accessibility compliant (WCAG 2.1)
- QA score: 85+/100

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ by **Agent Battalion Team**

*Inspired by MGX.dev's multi-agent architecture*
