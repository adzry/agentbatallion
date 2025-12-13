# ⚔️ ENLISTMENT PROTOCOLS

Welcome to the **AGENT BATTALION** - an elite force of autonomous AI agents. Before you submit your patch, read these tactical guidelines.

---

## 🎖️ CODE OF CONDUCT

All operatives must adhere to professional standards:

- **Respect** - Treat all contributors with respect and professionalism
- **Collaboration** - Work together to achieve mission objectives
- **Quality** - Maintain high standards for code and documentation
- **Security** - Never commit secrets, API keys, or sensitive data

---

## 🚀 MISSION BRIEFING

### Prerequisites

Before deployment, ensure you have:

- **Node.js** v18+ installed
- **npm** v9+ package manager
- **Git** version control
- API keys for LLM providers (Anthropic, OpenAI, or Google)

### Local Deployment

```bash
# CLONE THE REPOSITORY
git clone https://github.com/adzry/agentbatallion.git
cd agentbatallion

# INSTALL DEPENDENCIES
npm install

# CONFIGURE ENVIRONMENT
cp .env.example .env
# Edit .env with your API keys

# RUN TESTS
npm test

# START DEVELOPMENT SERVER
npm run dev
```

---

## 🎯 SUBMITTING A PATCH

### 1. RECONNAISSANCE (Find an Issue)

- Check the [Issues](https://github.com/adzry/agentbatallion/issues) page for open missions
- Look for issues tagged with `good first issue` or `help wanted`
- Comment on the issue to claim it before starting work

### 2. ESTABLISH BASE (Fork & Branch)

```bash
# FORK THE REPOSITORY
# Click "Fork" button on GitHub

# CLONE YOUR FORK
git clone https://github.com/YOUR_USERNAME/agentbatallion.git
cd agentbatallion

# CREATE A TACTICAL BRANCH
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. EXECUTE MISSION (Make Changes)

- Write clean, maintainable code
- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Keep commits focused and atomic

```bash
# MAKE YOUR CHANGES
# ... code, code, code ...

# RUN TESTS
npm test

# RUN LINTER
npm run lint

# STAGE CHANGES
git add .

# COMMIT WITH CLEAR MESSAGE
git commit -m "feat: add new agent capability"
# or
git commit -m "fix: resolve orchestrator bug"
```

### 4. DEPLOY PATCH (Submit PR)

```bash
# PUSH TO YOUR FORK
git push origin feature/your-feature-name
```

Then on GitHub:

1. Navigate to your fork
2. Click "New Pull Request"
3. Fill out the PR template with:
   - **Mission Objective** - What problem does this solve?
   - **Tactical Approach** - How did you solve it?
   - **Test Coverage** - What tests did you add?
   - **Screenshots** - If UI changes, include visuals

---

## 📝 COMMIT MESSAGE PROTOCOLS

Use conventional commit format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add security vulnerability scanner
fix: resolve memory leak in orchestrator
docs: update deployment instructions
test: add unit tests for QA agent
```

---

## 🔍 CODE REVIEW DEBRIEFING

After submitting your PR:

1. **Automated Checks** - CI/CD pipeline will run tests and linters
2. **Peer Review** - Maintainers will review your code
3. **Feedback Loop** - Address any requested changes
4. **Approval** - Once approved, your code will be merged

### What We Look For

- ✅ Tests pass (86+ tests must remain green)
- ✅ Code follows existing patterns
- ✅ Documentation is updated
- ✅ No security vulnerabilities introduced
- ✅ Performance impact is minimal
- ✅ Commit messages are clear

---

## 🧪 TESTING PROTOCOLS

All patches must include tests:

```bash
# RUN ALL TESTS
npm test

# RUN SPECIFIC TEST FILE
npm test -- agents.test.ts

# WATCH MODE
npm run test:watch

# COVERAGE REPORT
npm run test:coverage
```

Maintain test coverage above **80%**.

---

## 🏗️ PROJECT STRUCTURE

Understand the codebase before making changes:

```
agentbatallion/
├── packages/
│   └── agent-battalion/
│       ├── src/
│       │   ├── agents/           # AI agents (add new agents here)
│       │   ├── cli/              # CLI commands
│       │   ├── llm/              # LLM service layer
│       │   ├── memory/           # Memory management
│       │   ├── communication/    # Message bus
│       │   └── web/              # Web server
│       └── __tests__/            # Unit tests (mirror src/ structure)
├── docs/                         # Documentation
└── .github/                      # GitHub workflows
```

---

## 🎨 CODING STANDARDS

### TypeScript

- Use strict TypeScript (`strict: true`)
- Avoid `any` types
- Prefer interfaces over types for objects
- Use async/await over callbacks

### Naming Conventions

- **Classes**: `PascalCase` (e.g., `TeamOrchestrator`)
- **Functions**: `camelCase` (e.g., `executeTask`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Files**: `kebab-case` (e.g., `team-orchestrator.ts`)

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Max line length: 100 characters

---

## 🚨 REPORTING ISSUES

Found a bug? Follow these steps:

1. **Search existing issues** - Check if already reported
2. **Create detailed report** - Use issue template
3. **Include:**
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details (OS, Node version)
   - Screenshots or logs

---

## 💡 FEATURE REQUESTS

Have an idea? We want to hear it!

1. **Check roadmap** - See if it's already planned
2. **Open feature request** - Use issue template
3. **Describe:**
   - Problem it solves
   - Proposed solution
   - Alternative approaches
   - Impact on existing system

---

## 🏅 RECOGNITION

Contributors who submit quality patches will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in documentation

---

## 📞 COMMUNICATION CHANNELS

- **GitHub Issues** - Bug reports and feature requests
- **Pull Requests** - Code discussions
- **Discussions** - General questions and ideas

---

## ⚖️ LICENSE

By contributing, you agree that your contributions will be licensed under the MIT License.

---

<div align="center">

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Thank you for joining the AGENT BATTALION!**

Your contributions make the system stronger.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

</div>
