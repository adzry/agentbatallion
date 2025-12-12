"use strict";
/**
 * LLM Service Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const llm_service_js_1 = require("../llm/llm-service.js");
(0, vitest_1.describe)('LLMService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        service = (0, llm_service_js_1.createLLMService)({ provider: 'mock' });
    });
    (0, vitest_1.describe)('constructor', () => {
        (0, vitest_1.it)('should create service with default mock provider', () => {
            const config = service.getConfig();
            (0, vitest_1.expect)(config.provider).toBe('mock');
        });
        (0, vitest_1.it)('should respect provider configuration', () => {
            const openaiService = (0, llm_service_js_1.createLLMService)({
                provider: 'openai',
                apiKey: 'test-key',
            });
            (0, vitest_1.expect)(openaiService.getConfig().provider).toBe('openai');
        });
    });
    (0, vitest_1.describe)('complete', () => {
        (0, vitest_1.it)('should return mock response for mock provider', async () => {
            const response = await service.complete([
                { role: 'user', content: 'Hello' }
            ]);
            (0, vitest_1.expect)(response).toBeDefined();
            (0, vitest_1.expect)(response.content).toBeDefined();
            (0, vitest_1.expect)(response.provider).toBe('mock');
            (0, vitest_1.expect)(response.model).toBe('mock-model');
        });
        (0, vitest_1.it)('should increment request count', async () => {
            (0, vitest_1.expect)(service.getRequestCount()).toBe(0);
            await service.complete([{ role: 'user', content: 'Test' }]);
            (0, vitest_1.expect)(service.getRequestCount()).toBe(1);
            await service.complete([{ role: 'user', content: 'Test 2' }]);
            (0, vitest_1.expect)(service.getRequestCount()).toBe(2);
        });
        (0, vitest_1.it)('should emit events', async () => {
            const requestHandler = vitest_1.vi.fn();
            const responseHandler = vitest_1.vi.fn();
            service.on('request', requestHandler);
            service.on('response', responseHandler);
            await service.complete([{ role: 'user', content: 'Test' }]);
            (0, vitest_1.expect)(requestHandler).toHaveBeenCalled();
            (0, vitest_1.expect)(responseHandler).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should handle requirements analysis context', async () => {
            const response = await service.complete([
                { role: 'user', content: 'Analyze these requirements' }
            ]);
            (0, vitest_1.expect)(response.content).toContain('requirements');
        });
        (0, vitest_1.it)('should handle architecture context', async () => {
            const response = await service.complete([
                { role: 'user', content: 'Design the architecture' }
            ]);
            (0, vitest_1.expect)(response.content).toContain('architecture');
        });
        (0, vitest_1.it)('should handle code generation context', async () => {
            const response = await service.complete([
                { role: 'user', content: 'Implement this code' }
            ]);
            (0, vitest_1.expect)(response.content).toContain('Component');
        });
    });
    (0, vitest_1.describe)('stream', () => {
        (0, vitest_1.it)('should yield chunks for mock provider', async () => {
            const chunks = [];
            for await (const chunk of service.stream([
                { role: 'user', content: 'Stream test' }
            ])) {
                if (!chunk.done) {
                    chunks.push(chunk.content);
                }
            }
            (0, vitest_1.expect)(chunks.length).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('isRealLLM', () => {
        (0, vitest_1.it)('should return false for mock provider', () => {
            (0, vitest_1.expect)(service.isRealLLM()).toBe(false);
        });
        (0, vitest_1.it)('should return true for configured providers', () => {
            const realService = (0, llm_service_js_1.createLLMService)({
                provider: 'openai',
                apiKey: 'sk-test-key',
            });
            (0, vitest_1.expect)(realService.isRealLLM()).toBe(true);
        });
    });
});
(0, vitest_1.describe)('LLMService - Provider Tests', () => {
    (0, vitest_1.describe)('OpenAI', () => {
        (0, vitest_1.it)('should configure OpenAI correctly', () => {
            const service = (0, llm_service_js_1.createLLMService)({
                provider: 'openai',
                model: 'gpt-4',
                apiKey: 'test-key',
            });
            const config = service.getConfig();
            (0, vitest_1.expect)(config.provider).toBe('openai');
            (0, vitest_1.expect)(config.model).toBe('gpt-4');
        });
    });
    (0, vitest_1.describe)('Anthropic', () => {
        (0, vitest_1.it)('should configure Anthropic correctly', () => {
            const service = (0, llm_service_js_1.createLLMService)({
                provider: 'anthropic',
                model: 'claude-3-opus-20240229',
                apiKey: 'test-key',
            });
            const config = service.getConfig();
            (0, vitest_1.expect)(config.provider).toBe('anthropic');
        });
    });
    (0, vitest_1.describe)('Google', () => {
        (0, vitest_1.it)('should configure Google AI correctly', () => {
            const service = (0, llm_service_js_1.createLLMService)({
                provider: 'google',
                apiKey: 'test-key',
            });
            const config = service.getConfig();
            (0, vitest_1.expect)(config.provider).toBe('google');
            (0, vitest_1.expect)(config.model).toBe('gemini-pro');
        });
    });
});
//# sourceMappingURL=llm-service.test.js.map