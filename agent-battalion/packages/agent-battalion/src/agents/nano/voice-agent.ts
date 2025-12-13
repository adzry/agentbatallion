/**
 * Voice Agent - Multimodal Voice Interface
 * 
 * Handles voice commands and audio responses for natural interaction
 * Part of Phase 7: "Project Siren"
 */

import { AIAgent } from '../ai-agent.js';
import { AgentProfile, AgentTask } from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';

export interface VoiceCommandResult {
  intent: string;
  responseText: string;
  confidence: number;
}

export class VoiceAgent extends AIAgent {
  constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus) {
    const profile: AgentProfile = {
      id: 'voice-agent',
      name: 'Siren',
      role: 'product_manager',
      avatar: '🎙️',
      description: 'Communications Officer - Handles voice commands and audio interaction',
      capabilities: {
        canWriteCode: false,
        canDesign: false,
        canTest: false,
        canDeploy: false,
        canResearch: true,
        canReview: true,
        languages: [],
        frameworks: [],
      },
      personality: 'Clear communicator. Listens carefully and responds concisely.',
      systemPrompt: `You are Siren, a Communications Officer AI agent.

Your mission: Process voice commands and provide clear responses.

Extract user intent from natural speech and respond in conversational language.
Keep responses under 50 words for audio synthesis.`,
    };

    super(profile, memory, tools, messageBus, {
      useRealAI: true,
      llmConfig: {
        provider: 'google',
        model: 'gemini-1.5-flash',
        temperature: 0.7,
      },
    });
  }

  /**
   * Process voice command from audio buffer
   */
  async processVoiceCommand(audioBuffer: Buffer): Promise<VoiceCommandResult> {
    this.think('Processing voice command from audio...');
    
    // In production, send audio directly to Gemini Audio API
    // For now, simulate transcription and intent extraction
    const transcript = await this.transcribeAudio(audioBuffer);
    
    const prompt = `Extract the intent from this voice command: "${transcript}"
    
Return JSON:
{
  "intent": "brief description of what user wants",
  "responseText": "conversational response under 50 words"
}`;

    try {
      const result = await this.promptJSON<{ intent: string; responseText: string }>(prompt);
      
      return {
        intent: result.intent,
        responseText: result.responseText,
        confidence: 0.9,
      };
    } catch (error) {
      return {
        intent: 'unclear',
        responseText: "I didn't quite catch that. Could you repeat?",
        confidence: 0.5,
      };
    }
  }

  private async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    // Placeholder: In production, use Gemini Audio or Whisper API
    this.think('Transcribing audio...');
    return 'Create a dashboard with sales charts';
  }

  protected async executeTask(task: AgentTask): Promise<any> {
    if (task.parameters?.audioBuffer) {
      return await this.processVoiceCommand(task.parameters.audioBuffer);
    }
    throw new Error('Task must have audioBuffer parameter');
  }
}
