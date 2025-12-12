"use strict";
/**
 * Planner Agent
 *
 * Takes analysis results and creates an execution plan for building
 * the application. Determines file structure, dependencies, and
 * build order.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerAgent = void 0;
exports.runPlannerAgent = runPlannerAgent;
const base_agent_js_1 = require("../base-agent.js");
class PlannerAgent extends base_agent_js_1.BaseAgent {
    constructor() {
        super('planner', 'Creates execution plans for building applications');
    }
    getSystemPrompt() {
        return `You are an expert software architect and project planner.
Your job is to take application specifications and create detailed execution plans.

You should:
1. Determine the optimal file structure
2. Plan the order of file creation
3. Identify dependencies between components
4. Estimate complexity and time requirements

Focus on:
- Next.js 15 App Router conventions
- Proper component organization
- Configuration files setup
- Testing infrastructure
- Documentation`;
    }
    async execute(input) {
        const analysis = input.analysis;
        const config = input.config;
        // Plan the file structure
        const structure = this.planFileStructure(analysis);
        // Create build phases
        const phases = this.createBuildPhases(analysis, structure);
        // Build dependency graph
        const dependencies = this.buildDependencyGraph(phases);
        // Calculate estimated duration
        const estimatedDuration = phases.reduce((total, phase) => {
            return total + phase.tasks.length * 2; // 2 seconds per task estimate
        }, 0);
        return {
            phases,
            estimatedDuration,
            dependencies,
        };
    }
    planFileStructure(analysis) {
        const files = [
            // Config files
            'package.json',
            'tsconfig.json',
            'next.config.ts',
            'tailwind.config.ts',
            'postcss.config.mjs',
            // App files
            'app/layout.tsx',
            'app/page.tsx',
            'app/globals.css',
        ];
        // Add component files based on analysis
        for (const component of analysis.components) {
            if (component.type === 'page') {
                if (component.name !== 'HomePage') {
                    const pageName = component.name.replace('Page', '').toLowerCase();
                    files.push(`app/${pageName}/page.tsx`);
                }
            }
            else if (component.type === 'component') {
                files.push(`components/${component.name}.tsx`);
            }
        }
        // Add README
        files.push('README.md');
        return files;
    }
    createBuildPhases(analysis, structure) {
        const phases = [];
        // Phase 1: Configuration
        phases.push({
            id: 'config',
            name: 'Configuration',
            parallel: true,
            tasks: [
                {
                    id: 'create-package-json',
                    type: 'create-file',
                    description: 'Create package.json',
                    target: 'package.json',
                },
                {
                    id: 'create-tsconfig',
                    type: 'create-file',
                    description: 'Create TypeScript config',
                    target: 'tsconfig.json',
                },
                {
                    id: 'create-next-config',
                    type: 'create-file',
                    description: 'Create Next.js config',
                    target: 'next.config.ts',
                },
                {
                    id: 'create-tailwind-config',
                    type: 'create-file',
                    description: 'Create Tailwind config',
                    target: 'tailwind.config.ts',
                },
                {
                    id: 'create-postcss-config',
                    type: 'create-file',
                    description: 'Create PostCSS config',
                    target: 'postcss.config.mjs',
                },
            ],
        });
        // Phase 2: Core App Files
        phases.push({
            id: 'core',
            name: 'Core App Structure',
            parallel: false,
            tasks: [
                {
                    id: 'create-layout',
                    type: 'create-file',
                    description: 'Create root layout',
                    target: 'app/layout.tsx',
                    dependencies: ['create-tailwind-config'],
                },
                {
                    id: 'create-globals-css',
                    type: 'create-file',
                    description: 'Create global styles',
                    target: 'app/globals.css',
                },
                {
                    id: 'create-page',
                    type: 'create-file',
                    description: 'Create home page',
                    target: 'app/page.tsx',
                    dependencies: ['create-layout'],
                },
            ],
        });
        // Phase 3: Components
        const componentTasks = [];
        for (const component of analysis.components) {
            if (component.type === 'component') {
                componentTasks.push({
                    id: `create-${component.name.toLowerCase()}`,
                    type: 'create-file',
                    description: `Create ${component.name} component`,
                    target: `components/${component.name}.tsx`,
                });
            }
        }
        if (componentTasks.length > 0) {
            phases.push({
                id: 'components',
                name: 'UI Components',
                parallel: true,
                tasks: componentTasks,
            });
        }
        // Phase 4: Additional Pages
        const pageTasks = [];
        for (const route of analysis.routes) {
            if (route.path !== '/') {
                const pageName = route.path.replace(/\//g, '-').replace(/^\-/, '');
                pageTasks.push({
                    id: `create-page-${pageName}`,
                    type: 'create-file',
                    description: `Create ${route.component}`,
                    target: `app${route.path}/page.tsx`,
                });
            }
        }
        if (pageTasks.length > 0) {
            phases.push({
                id: 'pages',
                name: 'Additional Pages',
                parallel: true,
                tasks: pageTasks,
            });
        }
        // Phase 5: Documentation
        phases.push({
            id: 'docs',
            name: 'Documentation',
            parallel: true,
            tasks: [
                {
                    id: 'create-readme',
                    type: 'create-file',
                    description: 'Create README',
                    target: 'README.md',
                },
            ],
        });
        return phases;
    }
    buildDependencyGraph(phases) {
        const nodes = [];
        const edges = [];
        for (const phase of phases) {
            for (const task of phase.tasks) {
                nodes.push(task.id);
                if (task.dependencies) {
                    for (const dep of task.dependencies) {
                        edges.push([dep, task.id]);
                    }
                }
            }
        }
        return { nodes, edges };
    }
}
exports.PlannerAgent = PlannerAgent;
/**
 * Run the planner agent
 */
async function runPlannerAgent(analysis, config) {
    const agent = new PlannerAgent();
    const result = await agent.run({ analysis, config });
    return result;
}
//# sourceMappingURL=planner-agent.js.map