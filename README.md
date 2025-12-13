# 🤖 Agent Battalion

> **AI-Powered Full-Stack App Generator with Multi-Agent Collaboration**

[![Version](https://img.shields.io/badge/version-3.0.0-blue)](https://github.com/adzry/agentbatallion)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Agents](https://img.shields.io/badge/AI%20Agents-8-green)](./agent-battalion)

An advanced MGX-style multi-agent system that generates complete, production-ready applications through collaborative AI agents.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/adzry/agentbatallion.git
cd agentbatallion

# Install dependencies
cd agent-battalion
npm install

# Configure environment
cp packages/agent-battalion/.env.example packages/agent-battalion/.env
# Add your API keys to .env

# Start development server
npm run dev -w @meta/agent-battalion
```

## 🖥️ CLI Usage

```bash
# Generate an app from command line
npm run cli -w @meta/agent-battalion -- create "Build a todo app" --output ./my-app

# List available LLM providers
npm run cli -w @meta/agent-battalion -- providers

# Start web server
npm run cli -w @meta/agent-battalion -- serve --port 4000
```

## 🤖 Multi-Agent Team

| Agent | Name | Role |
|-------|------|------|
| 👔 | Alex | Product Manager |
| 🏗️ | Sam | Architect |
| 🎨 | Maya | Designer |
| 💻 | Jordan | Frontend Engineer |
| 🗄️ | Morgan | Backend Engineer |
| 🔐 | Casey | Security Agent |
| 📱 | Taylor | Mobile Engineer |
| 🔍 | Riley | QA Engineer |

## 📦 Features

- ✅ **Multi-Provider LLM** - Claude, GPT-4, Gemini with automatic failover
- ✅ **CLI Tool** - Generate apps from command line
- ✅ **86 Unit Tests** - Comprehensive test coverage
- ✅ **Code Quality** - Automatic cleanup, 88/100 QA score
- ✅ **Real-time Collaboration** - Watch agents work via Socket.IO
- ✅ **Docker Ready** - Production containerization

## 📁 Project Structure

```
agentbatallion/
├── .github/workflows/     # GitHub Actions (deploy-agent)
├── agent-battalion/       # Main monorepo
│   ├── packages/
│   │   └── agent-battalion/
│   │       ├── src/
│   │       │   ├── agents/      # AI agents
│   │       │   ├── cli/         # CLI tool
│   │       │   ├── llm/         # LLM service
│   │       │   └── web/         # Web server
│   │       └── __tests__/       # Unit tests
│   └── docker-compose.yml
└── README.md
```

## 🔗 Links

- [Full Documentation](./agent-battalion/README.md)
- [GitHub Actions](https://github.com/adzry/agentbatallion/actions)

## 📄 License

MIT License

---

Built with ❤️ by the Agent Battalion Team
