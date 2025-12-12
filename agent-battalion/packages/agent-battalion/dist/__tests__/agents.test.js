"use strict";
/**
 * Agent Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const memory_manager_js_1 = require("../memory/memory-manager.js");
const tool_registry_js_1 = require("../tools/tool-registry.js");
const message_bus_js_1 = require("../communication/message-bus.js");
const product_manager_js_1 = require("../agents/team/product-manager.js");
const architect_js_1 = require("../agents/team/architect.js");
const designer_js_1 = require("../agents/team/designer.js");
const frontend_engineer_js_1 = require("../agents/team/frontend-engineer.js");
const qa_engineer_js_1 = require("../agents/team/qa-engineer.js");
const backend_engineer_js_1 = require("../agents/team/backend-engineer.js");
const security_agent_js_1 = require("../agents/team/security-agent.js");
(0, vitest_1.describe)('ProductManagerAgent', () => {
    let agent;
    let memory;
    let tools;
    let messageBus;
    (0, vitest_1.beforeEach)(() => {
        memory = new memory_manager_js_1.MemoryManager();
        tools = new tool_registry_js_1.ToolRegistry();
        messageBus = new message_bus_js_1.MessageBus();
        agent = new product_manager_js_1.ProductManagerAgent(memory, tools, messageBus);
    });
    (0, vitest_1.it)('should have correct profile', () => {
        const state = agent.getState();
        (0, vitest_1.expect)(state.profile.name).toBe('Alex');
        (0, vitest_1.expect)(state.profile.role).toBe('product_manager');
        (0, vitest_1.expect)(state.profile.avatar).toBe('📋');
    });
    (0, vitest_1.it)('should analyze requirements', async () => {
        const result = await agent.analyzeRequirements('Build a todo app with user authentication');
        (0, vitest_1.expect)(result.requirements).toBeDefined();
        (0, vitest_1.expect)(result.requirements.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(result.context).toBeDefined();
    });
    (0, vitest_1.it)('should emit progress events', async () => {
        const progressHandler = vitest_1.vi.fn();
        agent.on('progress', progressHandler);
        await agent.analyzeRequirements('Build a simple app');
        (0, vitest_1.expect)(progressHandler).toHaveBeenCalled();
    });
    (0, vitest_1.it)('should update status during execution', async () => {
        let statuses = [];
        agent.on('event', (event) => {
            if (event.type === 'agent_working' || event.type === 'agent_complete') {
                statuses.push(event.data.status);
            }
        });
        await agent.analyzeRequirements('Test app');
        (0, vitest_1.expect)(statuses).toContain('working');
        (0, vitest_1.expect)(statuses).toContain('complete');
    });
});
(0, vitest_1.describe)('ArchitectAgent', () => {
    let agent;
    let memory;
    let tools;
    let messageBus;
    (0, vitest_1.beforeEach)(() => {
        memory = new memory_manager_js_1.MemoryManager();
        tools = new tool_registry_js_1.ToolRegistry();
        messageBus = new message_bus_js_1.MessageBus();
        agent = new architect_js_1.ArchitectAgent(memory, tools, messageBus);
    });
    (0, vitest_1.it)('should have correct profile', () => {
        const state = agent.getState();
        (0, vitest_1.expect)(state.profile.name).toBe('Sam');
        (0, vitest_1.expect)(state.profile.role).toBe('architect');
        (0, vitest_1.expect)(state.profile.avatar).toBe('🏗️');
    });
    (0, vitest_1.it)('should design architecture', async () => {
        const requirements = [{
                id: '1',
                description: 'User authentication',
                type: 'functional',
                priority: 'high',
            }];
        const result = await agent.designArchitecture(requirements);
        (0, vitest_1.expect)(result.techStack).toBeDefined();
        (0, vitest_1.expect)(result.components).toBeDefined();
        (0, vitest_1.expect)(result.fileStructure).toBeDefined();
    });
});
(0, vitest_1.describe)('DesignerAgent', () => {
    let agent;
    let memory;
    let tools;
    let messageBus;
    (0, vitest_1.beforeEach)(() => {
        memory = new memory_manager_js_1.MemoryManager();
        tools = new tool_registry_js_1.ToolRegistry();
        messageBus = new message_bus_js_1.MessageBus();
        agent = new designer_js_1.DesignerAgent(memory, tools, messageBus);
    });
    (0, vitest_1.it)('should have correct profile', () => {
        const state = agent.getState();
        (0, vitest_1.expect)(state.profile.name).toBe('Maya');
        (0, vitest_1.expect)(state.profile.role).toBe('designer');
        (0, vitest_1.expect)(state.profile.avatar).toBe('🎨');
    });
    (0, vitest_1.it)('should create design system', async () => {
        const requirements = [{
                id: '1',
                description: 'Modern dashboard with dark mode',
                type: 'functional',
                priority: 'high',
            }];
        const result = await agent.createDesignSystem(requirements);
        (0, vitest_1.expect)(result.designSystem).toBeDefined();
        (0, vitest_1.expect)(result.designSystem.colors).toBeDefined();
        (0, vitest_1.expect)(result.files).toBeDefined();
        (0, vitest_1.expect)(result.files.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('should generate Tailwind config', async () => {
        const requirements = [{
                id: '1',
                description: 'Professional looking app',
                type: 'functional',
                priority: 'high',
            }];
        const result = await agent.createDesignSystem(requirements);
        const tailwindFile = result.files.find(f => f.path.includes('tailwind'));
        (0, vitest_1.expect)(tailwindFile).toBeDefined();
        (0, vitest_1.expect)(tailwindFile?.content).toContain('primary');
    });
});
(0, vitest_1.describe)('FrontendEngineerAgent', () => {
    let agent;
    let memory;
    let tools;
    let messageBus;
    (0, vitest_1.beforeEach)(() => {
        memory = new memory_manager_js_1.MemoryManager();
        tools = new tool_registry_js_1.ToolRegistry();
        messageBus = new message_bus_js_1.MessageBus();
        agent = new frontend_engineer_js_1.FrontendEngineerAgent(memory, tools, messageBus);
    });
    (0, vitest_1.it)('should have correct profile', () => {
        const state = agent.getState();
        (0, vitest_1.expect)(state.profile.name).toBe('Jordan');
        (0, vitest_1.expect)(state.profile.role).toBe('frontend_engineer');
        (0, vitest_1.expect)(state.profile.avatar).toBe('💻');
    });
    (0, vitest_1.it)('should generate frontend code', async () => {
        const architecture = {
            techStack: {
                frontend: 'Next.js 15',
                styling: 'Tailwind CSS',
                database: '',
            },
            components: [
                { name: 'Header', purpose: 'Navigation', dependencies: [] },
            ],
            fileStructure: [],
        };
        const designSystem = {
            colors: { primary: '#3b82f6', secondary: '#10b981', accent: '#f59e0b', background: '#ffffff', text: '#1f2937', error: '#ef4444', success: '#22c55e', warning: '#f59e0b' },
            typography: { fontFamily: 'Inter', headings: {}, body: {} },
            spacing: {},
            borderRadius: {},
        };
        const result = await agent.generateFrontend(architecture, designSystem);
        (0, vitest_1.expect)(result).toBeDefined();
        (0, vitest_1.expect)(result.length).toBeGreaterThan(0);
        const hasPackageJson = result.some(f => f.path === 'package.json');
        (0, vitest_1.expect)(hasPackageJson).toBe(true);
    });
});
(0, vitest_1.describe)('QAEngineerAgent', () => {
    let agent;
    let memory;
    let tools;
    let messageBus;
    (0, vitest_1.beforeEach)(() => {
        memory = new memory_manager_js_1.MemoryManager();
        tools = new tool_registry_js_1.ToolRegistry();
        messageBus = new message_bus_js_1.MessageBus();
        agent = new qa_engineer_js_1.QAEngineerAgent(memory, tools, messageBus);
    });
    (0, vitest_1.it)('should have correct profile', () => {
        const state = agent.getState();
        (0, vitest_1.expect)(state.profile.name).toBe('Riley');
        (0, vitest_1.expect)(state.profile.role).toBe('qa_engineer');
        (0, vitest_1.expect)(state.profile.avatar).toBe('🔍');
    });
    (0, vitest_1.it)('should review code quality', async () => {
        const files = [{
                path: 'app/page.tsx',
                content: `export default function Page() {
        console.log('debug');
        return <div>Hello</div>;
      }`,
                type: 'source',
                createdBy: 'test',
                createdAt: new Date(),
                updatedAt: new Date(),
                version: 1,
            }];
        const requirements = [{
                id: '1',
                description: 'Display greeting',
                type: 'functional',
                priority: 'high',
            }];
        const result = await agent.reviewCode(files, requirements);
        (0, vitest_1.expect)(result).toBeDefined();
        (0, vitest_1.expect)(result.score).toBeDefined();
        (0, vitest_1.expect)(result.issues).toBeDefined();
    });
});
(0, vitest_1.describe)('BackendEngineerAgent', () => {
    let agent;
    let memory;
    let tools;
    let messageBus;
    (0, vitest_1.beforeEach)(() => {
        memory = new memory_manager_js_1.MemoryManager();
        tools = new tool_registry_js_1.ToolRegistry();
        messageBus = new message_bus_js_1.MessageBus();
        agent = new backend_engineer_js_1.BackendEngineerAgent(memory, tools, messageBus);
    });
    (0, vitest_1.it)('should have correct profile', () => {
        const state = agent.getState();
        (0, vitest_1.expect)(state.profile.name).toBe('Morgan');
        (0, vitest_1.expect)(state.profile.role).toBe('backend_engineer');
        (0, vitest_1.expect)(state.profile.avatar).toBe('🗄️');
    });
    (0, vitest_1.it)('should generate backend code', async () => {
        const requirements = [{
                id: '1',
                description: 'User management API',
                type: 'functional',
                priority: 'high',
            }];
        const dataModels = [{
                name: 'Task',
                fields: [
                    { name: 'id', type: 'string', required: true },
                    { name: 'title', type: 'string', required: true },
                    { name: 'completed', type: 'boolean', required: true },
                ],
            }];
        const architecture = {
            techStack: {
                frontend: 'Next.js 15',
                styling: 'Tailwind CSS',
                database: 'PostgreSQL',
            },
            components: [],
            fileStructure: [],
        };
        const result = await agent.generateBackend(requirements, dataModels, architecture);
        (0, vitest_1.expect)(result).toBeDefined();
        (0, vitest_1.expect)(result.schema).toBeDefined();
        (0, vitest_1.expect)(result.apiRoutes).toBeDefined();
        (0, vitest_1.expect)(result.apiRoutes.length).toBeGreaterThan(0);
    });
});
(0, vitest_1.describe)('SecurityAgent', () => {
    let agent;
    let memory;
    let tools;
    let messageBus;
    (0, vitest_1.beforeEach)(() => {
        memory = new memory_manager_js_1.MemoryManager();
        tools = new tool_registry_js_1.ToolRegistry();
        messageBus = new message_bus_js_1.MessageBus();
        agent = new security_agent_js_1.SecurityAgent(memory, tools, messageBus);
    });
    (0, vitest_1.it)('should have correct profile', () => {
        const state = agent.getState();
        (0, vitest_1.expect)(state.profile.name).toBe('Casey');
        (0, vitest_1.expect)(state.profile.avatar).toBe('🔐');
    });
    (0, vitest_1.it)('should audit security', async () => {
        const files = [{
                path: 'app/api/route.ts',
                content: `
        export async function GET() {
          const apiKey = 'sk-secret-12345';
          return Response.json({ key: apiKey });
        }
      `,
                type: 'source',
                createdBy: 'test',
                createdAt: new Date(),
                updatedAt: new Date(),
                version: 1,
            }];
        const result = await agent.auditSecurity(files);
        (0, vitest_1.expect)(result).toBeDefined();
        (0, vitest_1.expect)(result.score).toBeDefined();
        (0, vitest_1.expect)(result.issues).toBeDefined();
        (0, vitest_1.expect)(result.issues.length).toBeGreaterThan(0);
        // Should detect hardcoded secret
        const hasSecretIssue = result.issues.some(i => i.category === 'sensitive_data');
        (0, vitest_1.expect)(hasSecretIssue).toBe(true);
    });
    (0, vitest_1.it)('should detect XSS vulnerabilities', async () => {
        const files = [{
                path: 'app/page.tsx',
                content: `
        export default function Page({ html }) {
          return <div dangerouslySetInnerHTML={{ __html: html }} />;
        }
      `,
                type: 'source',
                createdBy: 'test',
                createdAt: new Date(),
                updatedAt: new Date(),
                version: 1,
            }];
        const result = await agent.auditSecurity(files);
        const hasXssIssue = result.issues.some(i => i.category === 'xss');
        (0, vitest_1.expect)(hasXssIssue).toBe(true);
    });
});
//# sourceMappingURL=agents.test.js.map