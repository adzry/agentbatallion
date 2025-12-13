# 🤖 Agent Battalion

> **AI-Powered Full-Stack App Generator with Multi-Agent Collaboration**

[![Version](https://img.shields.io/badge/version-3.0.0-blue)](https://github.com/adzry/agentbatallion)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-86%20passing-green)](./agent-battalion)

Generate complete, production-ready applications using 8 specialized AI agents that collaborate in real-time.

## 🚀 Quick Start

```bash
cd agent-battalion
npm install
npm run dev
```

Open http://localhost:4000 to use the web UI.

## 🖥️ CLI

```bash
cd agent-battalion
npm run cli -- create "Build a todo app" --output ./my-app
```

## 📁 Structure

```
agentbatallion/
├── .github/workflows/    # CI/CD pipelines
├── agent-battalion/      # Main application
│   ├── packages/
│   │   └── agent-battalion/
│   │       ├── src/
│   │       │   ├── agents/    # 8 AI agents
│   │       │   ├── cli/       # CLI tool
│   │       │   ├── llm/       # LLM service
│   │       │   └── web/       # Web server
│   │       └── __tests__/     # 86 unit tests
│   └── docker-compose.yml
└── README.md
```

## 🤖 AI Agents

| Agent | Role |
|-------|------|
| 👔 Alex | Product Manager |
| 🏗️ Sam | Architect |
| 🎨 Maya | Designer |
| 💻 Jordan | Frontend Engineer |
| 🗄️ Morgan | Backend Engineer |
| 🔐 Casey | Security Agent |
| 📱 Taylor | Mobile Engineer |
| 🔍 Riley | QA Engineer |

## 📚 Documentation

See [agent-battalion/README.md](./agent-battalion/README.md) for full documentation.

## 📄 License

MIT
