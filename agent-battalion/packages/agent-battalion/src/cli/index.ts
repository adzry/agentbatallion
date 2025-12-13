#!/usr/bin/env node
/**
 * Agent Battalion CLI
 * 
 * Command-line interface for generating full-stack applications
 * 
 * Usage:
 *   npx agent-battalion create "Build a todo app" --output ./my-app
 *   npx agent-battalion create "E-commerce site" --provider openai
 */

import { program } from 'commander';
import { createTeamOrchestrator } from '../agents/team-orchestrator.js';
import { createLLMService } from '../llm/llm-service.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get package version
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(emoji: string, message: string) {
  console.log(`${emoji}  ${message}`);
}

// Progress bar
function progressBar(progress: number, width: number = 30): string {
  const filled = Math.round((progress / 100) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${progress}%`;
}

// Banner
function showBanner() {
  console.log(`
${colors.cyan}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ${colors.bright}🚀 Agent Battalion CLI${colors.reset}${colors.cyan}                                    ║
║   ${colors.dim}AI-Powered Full-Stack App Generator${colors.reset}${colors.cyan}                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);
}

// Create command
async function createProject(prompt: string, options: {
  output?: string;
  provider?: string;
  name?: string;
  realAi?: boolean;
}) {
  showBanner();
  
  const outputDir = options.output || './generated-app';
  const projectName = options.name || 'my-app';
  const useRealAI = options.realAi ?? (process.env.USE_REAL_AI === 'true');
  
  // Check LLM configuration
  const llm = createLLMService({
    provider: options.provider as any || undefined,
  });
  
  const availableProviders = llm.getAvailableProviders().filter(p => p !== 'mock' && p !== 'ollama');
  
  log(`📝 Prompt: "${prompt}"`, 'cyan');
  log(`📁 Output: ${path.resolve(outputDir)}`, 'dim');
  log(`🤖 AI Mode: ${useRealAI ? 'Real AI' : 'Mock (templates)'}`, 'dim');
  
  if (useRealAI) {
    log(`🔌 Provider: ${llm.getPrimaryProvider()} (failover: ${availableProviders.join(' → ')})`, 'dim');
  }
  
  console.log('');
  log('─'.repeat(60), 'dim');
  console.log('');

  // Create orchestrator
  const orchestrator = createTeamOrchestrator({
    projectName,
  });

  // Listen for progress events
  orchestrator.on('progress', (data) => {
    const { agent, message, progress } = data;
    const emojiMap: Record<string, string> = {
      'system': '🚀',
      'product_manager': '👔',
      'architect': '🏗️',
      'designer': '🎨',
      'frontend_engineer': '💻',
      'qa_engineer': '🔍',
    };
    const emoji = emojiMap[agent] || '🤖';
    
    process.stdout.write(`\r${emoji}  ${progressBar(progress)} ${message.padEnd(40)}`);
  });

  try {
    // Run generation
    const startTime = Date.now();
    const result = await orchestrator.run(prompt);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n');
    
    if (!result.success) {
      log('❌ Generation failed', 'red');
      process.exit(1);
    }

    // Create output directory
    const absOutputDir = path.resolve(outputDir);
    if (!fs.existsSync(absOutputDir)) {
      fs.mkdirSync(absOutputDir, { recursive: true });
    }

    // Write files
    let filesWritten = 0;
    for (const file of result.files) {
      const filePath = path.join(absOutputDir, file.path);
      const fileDir = path.dirname(filePath);
      
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, file.content, 'utf-8');
      filesWritten++;
    }

    // Summary
    log('─'.repeat(60), 'dim');
    console.log('');
    log('✅ Generation Complete!', 'green');
    console.log('');
    log(`   📁 Files generated: ${filesWritten}`, 'reset');
    log(`   ⏱️  Duration: ${duration}s`, 'reset');
    log(`   📊 QA Score: ${result.qaReport?.score || 'N/A'}/100`, 'reset');
    log(`   📂 Output: ${absOutputDir}`, 'reset');
    console.log('');
    
    log('📄 Generated files:', 'cyan');
    const displayFiles = result.files.slice(0, 10);
    for (const file of displayFiles) {
      log(`   - ${file.path}`, 'dim');
    }
    if (result.files.length > 10) {
      log(`   ... and ${result.files.length - 10} more files`, 'dim');
    }
    
    console.log('');
    log('🚀 Next steps:', 'yellow');
    log(`   cd ${outputDir}`, 'dim');
    log('   npm install', 'dim');
    log('   npm run dev', 'dim');
    console.log('');

  } catch (error) {
    console.log('\n');
    log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
    process.exit(1);
  }
}

// List providers command
function listProviders() {
  showBanner();
  
  const llm = createLLMService();
  const available = llm.getAvailableProviders();
  const primary = llm.getPrimaryProvider();
  
  log('🔌 Available LLM Providers:', 'cyan');
  console.log('');
  
  const providers = [
    { id: 'anthropic', name: 'Anthropic (Claude)', model: 'claude-sonnet-4-20250514' },
    { id: 'openai', name: 'OpenAI (GPT-4)', model: 'gpt-4o-mini' },
    { id: 'google', name: 'Google AI (Gemini)', model: 'gemini-2.5-flash' },
    { id: 'ollama', name: 'Ollama (Local)', model: 'llama2' },
    { id: 'mock', name: 'Mock (Templates)', model: 'mock-model' },
  ];
  
  for (const provider of providers) {
    const isAvailable = available.includes(provider.id as any);
    const isPrimary = primary === provider.id;
    const status = isPrimary ? '⭐ PRIMARY' : (isAvailable ? '✅ Ready' : '❌ Not configured');
    
    log(`   ${provider.name}`, isAvailable ? 'green' : 'dim');
    log(`      Model: ${provider.model}`, 'dim');
    log(`      Status: ${status}`, isPrimary ? 'yellow' : 'dim');
    console.log('');
  }
  
  log('💡 To change provider:', 'yellow');
  log('   export LLM_PROVIDER=openai', 'dim');
  log('   # or use --provider flag', 'dim');
  console.log('');
}

// Setup CLI
program
  .name('agent-battalion')
  .description('AI-Powered Full-Stack App Generator')
  .version(packageJson.version);

program
  .command('create <prompt>')
  .description('Generate a new application from a prompt')
  .option('-o, --output <directory>', 'Output directory', './generated-app')
  .option('-n, --name <name>', 'Project name', 'my-app')
  .option('-p, --provider <provider>', 'LLM provider (anthropic, openai, google)')
  .option('--real-ai', 'Use real AI (requires API keys)')
  .option('--mock', 'Use mock/template generation')
  .action(async (prompt, options) => {
    const realAi = options.realAi ? true : (options.mock ? false : undefined);
    await createProject(prompt, { ...options, realAi });
  });

program
  .command('providers')
  .description('List available LLM providers')
  .action(listProviders);

program
  .command('serve')
  .description('Start the web server')
  .option('-p, --port <port>', 'Port number', '4000')
  .action(async (options) => {
    showBanner();
    log(`Starting web server on port ${options.port}...`, 'cyan');
    log('Use Ctrl+C to stop', 'dim');
    console.log('');
    
    // Dynamic import to avoid loading server code for CLI commands
    const { startServer } = await import('../web/server.js');
    await startServer(parseInt(options.port));
  });

// Parse arguments
program.parse();
