#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Tool schemas
const GenerateAppSchema = z.object({
  prompt: z.string().describe('Description of the app to generate'),
  projectName: z.string().optional().describe('Name for the project'),
  framework: z.enum(['nextjs', 'react', 'vue', 'svelte']).optional().default('nextjs'),
});

const ListTemplatesSchema = z.object({
  category: z.string().optional().describe('Filter templates by category'),
});

const GetProjectStatusSchema = z.object({
  projectId: z.string().describe('The project ID to check status for'),
});

// Define available tools
const tools: Tool[] = [
  {
    name: 'generate_app',
    description: 'Generate a full-stack web application from a natural language description. Creates a complete Next.js 15 app with React 19, Tailwind CSS, and TypeScript.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Description of the app to generate',
        },
        projectName: {
          type: 'string',
          description: 'Name for the project (optional)',
        },
        framework: {
          type: 'string',
          enum: ['nextjs', 'react', 'vue', 'svelte'],
          default: 'nextjs',
          description: 'Framework to use (defaults to nextjs)',
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'list_templates',
    description: 'List available app templates and starters',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter templates by category (e.g., "ecommerce", "dashboard", "landing")',
        },
      },
    },
  },
  {
    name: 'get_project_status',
    description: 'Get the generation status of a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The project ID to check status for',
        },
      },
      required: ['projectId'],
    },
  },
];

// Template data
const templates = [
  { id: 'landing', name: 'Landing Page', category: 'marketing', description: 'Beautiful landing page with hero, features, and CTA' },
  { id: 'dashboard', name: 'Admin Dashboard', category: 'dashboard', description: 'Full-featured admin dashboard with charts and tables' },
  { id: 'ecommerce', name: 'E-commerce Store', category: 'ecommerce', description: 'Complete online store with cart and checkout' },
  { id: 'blog', name: 'Blog Platform', category: 'content', description: 'Modern blog with MDX support' },
  { id: 'saas', name: 'SaaS Starter', category: 'saas', description: 'SaaS boilerplate with auth and billing' },
  { id: 'portfolio', name: 'Portfolio', category: 'marketing', description: 'Developer portfolio with projects showcase' },
];

// Create MCP server
const server = new Server(
  {
    name: 'agent-battalion-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_app': {
        const parsed = GenerateAppSchema.parse(args);
        
        // In production, this would call the Agent Battalion API
        // For now, return a mock response
        const projectId = `proj_${Date.now()}`;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                projectId,
                message: `Starting generation of ${parsed.framework} app: "${parsed.prompt}"`,
                status: 'queued',
                estimatedTime: '30-60 seconds',
                webUrl: `http://localhost:4000/projects/${projectId}`,
              }, null, 2),
            },
          ],
        };
      }

      case 'list_templates': {
        const parsed = ListTemplatesSchema.parse(args);
        
        const filtered = parsed.category
          ? templates.filter(t => t.category === parsed.category)
          : templates;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                templates: filtered,
                total: filtered.length,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_project_status': {
        const parsed = GetProjectStatusSchema.parse(args);
        
        // Mock status response
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                projectId: parsed.projectId,
                status: 'completed',
                progress: 100,
                files: [
                  'package.json',
                  'app/page.tsx',
                  'app/layout.tsx',
                  'tailwind.config.ts',
                  'next.config.ts',
                ],
                downloadUrl: `http://localhost:4000/api/download/${parsed.projectId}`,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: message }),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Agent Battalion MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
