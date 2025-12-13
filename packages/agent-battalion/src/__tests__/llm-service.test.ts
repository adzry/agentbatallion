/**
 * LLM Service Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LLMService, createLLMService } from '../llm/llm-service.js';

describe('LLMService', () => {
  // Store original env values
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetAllMocks();
    // Clear LLM-related env vars for testing
    delete process.env.LLM_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GOOGLE_AI_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original env
    Object.assign(process.env, originalEnv);
  });

  describe('constructor', () => {
    it('should create with default mock provider', () => {
      const service = createLLMService();
      expect(service.getConfig().provider).toBe('mock');
    });

    it('should use environment variable for provider', () => {
      process.env.LLM_PROVIDER = 'openai';
      
      const service = createLLMService();
      expect(service.getConfig().provider).toBe('openai');
    });

    it('should use provided config over environment', () => {
      process.env.LLM_PROVIDER = 'openai';
      
      const service = createLLMService({ provider: 'anthropic' });
      expect(service.getConfig().provider).toBe('anthropic');
    });

    it('should set default temperature', () => {
      const service = createLLMService();
      expect(service.getConfig().temperature).toBe(0.7);
    });

    it('should set custom temperature', () => {
      const service = createLLMService({ temperature: 0.5 });
      expect(service.getConfig().temperature).toBe(0.5);
    });

    it('should set default maxTokens', () => {
      const service = createLLMService();
      expect(service.getConfig().maxTokens).toBe(4096);
    });
  });

  describe('complete (mock provider)', () => {
    it('should return mock response', async () => {
      const service = createLLMService({ provider: 'mock' });
      
      const response = await service.complete([
        { role: 'user', content: 'Hello' }
      ]);

      expect(response.provider).toBe('mock');
      expect(response.model).toBe('mock-model');
      expect(response.content).toBeDefined();
    });

    it('should increment request count', async () => {
      const service = createLLMService({ provider: 'mock' });
      
      expect(service.getRequestCount()).toBe(0);
      
      await service.complete([{ role: 'user', content: 'Hello' }]);
      expect(service.getRequestCount()).toBe(1);
      
      await service.complete([{ role: 'user', content: 'Hello again' }]);
      expect(service.getRequestCount()).toBe(2);
    });

    it('should emit request event', async () => {
      const service = createLLMService({ provider: 'mock' });
      const requestHandler = vi.fn();
      
      service.on('request', requestHandler);
      
      await service.complete([{ role: 'user', content: 'Hello' }]);
      
      expect(requestHandler).toHaveBeenCalledTimes(1);
      expect(requestHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: 'Hello' }],
        })
      );
    });

    it('should emit response event', async () => {
      const service = createLLMService({ provider: 'mock' });
      const responseHandler = vi.fn();
      
      service.on('response', responseHandler);
      
      await service.complete([{ role: 'user', content: 'Hello' }]);
      
      expect(responseHandler).toHaveBeenCalledTimes(1);
    });

    it('should generate contextual mock response for requirements', async () => {
      const service = createLLMService({ provider: 'mock' });
      
      const response = await service.complete([
        { role: 'user', content: 'Analyze the requirements for this project' }
      ]);

      expect(response.content).toContain('requirements');
    });

    it('should generate contextual mock response for architecture', async () => {
      const service = createLLMService({ provider: 'mock' });
      
      const response = await service.complete([
        { role: 'user', content: 'Design the architecture for this app' }
      ]);

      expect(response.content).toContain('architecture');
    });
  });

  describe('isRealLLM', () => {
    it('should return false for mock provider', () => {
      const service = createLLMService({ provider: 'mock' });
      expect(service.isRealLLM()).toBe(false);
    });

    it('should return true for real provider with API key', () => {
      const service = createLLMService({ 
        provider: 'openai',
        apiKey: 'test-key'
      });
      expect(service.isRealLLM()).toBe(true);
    });

    it('should return true for real provider with env API key', () => {
      process.env.OPENAI_API_KEY = 'env-test-key';
      
      const service = createLLMService({ provider: 'openai' });
      expect(service.isRealLLM()).toBe(true);
    });
  });

  describe('getAvailableProviders', () => {
    it('should always include mock and ollama', () => {
      const service = createLLMService();
      const providers = service.getAvailableProviders();
      
      expect(providers).toContain('mock');
      expect(providers).toContain('ollama');
    });

    it('should include anthropic when key is set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      
      const service = createLLMService();
      const providers = service.getAvailableProviders();
      
      expect(providers).toContain('anthropic');
    });

    it('should include openai when key is set', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      
      const service = createLLMService();
      const providers = service.getAvailableProviders();
      
      expect(providers).toContain('openai');
    });
  });

  describe('getPrimaryProvider', () => {
    it('should return configured provider', () => {
      const service = createLLMService({ provider: 'anthropic' });
      expect(service.getPrimaryProvider()).toBe('anthropic');
    });

    it('should return mock by default', () => {
      const service = createLLMService();
      expect(service.getPrimaryProvider()).toBe('mock');
    });
  });

  describe('stream (mock provider)', () => {
    it('should yield chunks', async () => {
      const service = createLLMService({ provider: 'mock' });
      
      const chunks: string[] = [];
      for await (const chunk of service.stream([{ role: 'user', content: 'Hello' }])) {
        chunks.push(chunk.content);
        if (chunk.done) break;
      }

      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('usage tracking', () => {
    it('should include usage info in response', async () => {
      const service = createLLMService({ provider: 'mock' });
      
      const response = await service.complete([
        { role: 'user', content: 'Hello' }
      ]);

      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
    });
  });
});
