"use strict";
/**
 * AI Agent - Real LLM-Powered Agent Base
 *
 * Extends BaseTeamAgent with actual AI capabilities using LLM service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAgent = void 0;
const base_team_agent_js_1 = require("./base-team-agent.js");
const llm_service_js_1 = require("../llm/llm-service.js");
class AIAgent extends base_team_agent_js_1.BaseTeamAgent {
    llm;
    useRealAI;
    conversationHistory = [];
    constructor(profile, memory, tools, messageBus, config) {
        super(profile, memory, tools, messageBus);
        this.useRealAI = config?.useRealAI ??
            (process.env.USE_REAL_AI === 'true');
        this.llm = (0, llm_service_js_1.createLLMService)(config?.llmConfig);
        // Initialize conversation with system prompt
        this.conversationHistory = [{
                role: 'system',
                content: this.profile.systemPrompt,
            }];
    }
    /**
     * Send a prompt to the LLM and get a response
     */
    async prompt(userMessage) {
        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            content: userMessage,
        });
        this.think(`Processing: ${userMessage.slice(0, 100)}...`);
        try {
            const response = await this.llm.complete(this.conversationHistory);
            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: response.content,
            });
            return response.content;
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            this.think(`LLM Error: ${errorMsg}`);
            throw error;
        }
    }
    /**
     * Stream a response from the LLM
     */
    async *promptStream(userMessage) {
        this.conversationHistory.push({
            role: 'user',
            content: userMessage,
        });
        let fullResponse = '';
        for await (const chunk of this.llm.stream(this.conversationHistory)) {
            if (!chunk.done) {
                fullResponse += chunk.content;
                yield chunk.content;
            }
        }
        this.conversationHistory.push({
            role: 'assistant',
            content: fullResponse,
        });
    }
    /**
     * Ask LLM for structured JSON response
     */
    async promptJSON(userMessage, schema) {
        const prompt = schema
            ? `${userMessage}\n\nRespond with valid JSON matching this schema:\n${schema}`
            : `${userMessage}\n\nRespond with valid JSON only, no markdown or explanation.`;
        const response = await this.prompt(prompt);
        // Extract JSON from response (handle markdown code blocks)
        let jsonStr = response;
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
        }
        try {
            return JSON.parse(jsonStr);
        }
        catch {
            // Try to find JSON object in response
            const objectMatch = response.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                return JSON.parse(objectMatch[0]);
            }
            throw new Error(`Failed to parse JSON response: ${response.slice(0, 200)}`);
        }
    }
    /**
     * Ask LLM for code generation
     */
    async promptCode(description, language = 'typescript', context) {
        const prompt = `Generate ${language} code for: ${description}
${context ? `\nContext:\n${context}` : ''}

Requirements:
- Write clean, production-ready code
- Include proper TypeScript types
- Follow best practices
- No explanations, just the code

Respond with only the code, no markdown code blocks.`;
        const response = await this.prompt(prompt);
        // Extract code from response (handle markdown code blocks)
        const codeMatch = response.match(/```(?:\w+)?\s*([\s\S]*?)```/);
        if (codeMatch) {
            return codeMatch[1].trim();
        }
        return response.trim();
    }
    /**
     * Clear conversation history (keep system prompt)
     */
    clearHistory() {
        this.conversationHistory = [{
                role: 'system',
                content: this.profile.systemPrompt,
            }];
    }
    /**
     * Add context to the conversation
     */
    addContext(context) {
        this.conversationHistory.push({
            role: 'user',
            content: `Context information:\n${context}`,
        });
        this.conversationHistory.push({
            role: 'assistant',
            content: 'I understand the context. I will use this information for my tasks.',
        });
    }
    /**
     * Check if using real AI
     */
    isUsingRealAI() {
        return this.llm.isRealLLM();
    }
}
exports.AIAgent = AIAgent;
//# sourceMappingURL=ai-agent.js.map