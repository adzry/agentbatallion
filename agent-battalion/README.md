# Agent Battalion

AI-powered full-stack app generator system.

## Project Structure

```
agent-battalion/
├── packages/
│   ├── agent-battalion/          # Core package with web server
│   └── agent-battalion-mcp/      # MCP server (future)
```

## Phase 1 - Web Version

This is the simplified web version that includes:
- Express server with WebSocket support (Socket.IO)
- Dark theme web UI
- Mock Next.js 15 app generator

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:4000`

## Usage

1. Enter your app specification in the chat interface
2. Click "Generate App" or press Enter
3. Watch the progress updates in real-time
4. View and download the generated Next.js 15 source code

## Generated Files

The mock generator creates a complete Next.js 15 application with:
- `package.json` with Next.js 15 and React 19
- `app/page.tsx` - Main page component
- `app/layout.tsx` - Root layout
- `app/globals.css` - Global styles with Tailwind CSS
- `tailwind.config.ts` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore file

## Future Phases

- Phase 2: LLM integration
- Phase 3: LangGraph agents (Analyzer, Planner, Coordinator)
- Phase 4: Temporal workflows
- Phase 5: E2B sandbox integration
- Phase 6: MCP server
