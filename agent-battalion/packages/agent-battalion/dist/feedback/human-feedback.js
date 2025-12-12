/**
 * Human Feedback Loop
 *
 * Enables human-in-the-loop interactions for:
 * - Approval workflows
 * - Iterative refinement
 * - Design reviews
 * - Code reviews
 * - Priority decisions
 */
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
/**
 * Human Feedback Manager
 */
export class HumanFeedbackManager extends EventEmitter {
    config;
    pendingRequests = new Map();
    responseHandlers = new Map();
    history = [];
    constructor(config = {}) {
        super();
        this.config = {
            defaultTimeout: config.defaultTimeout || 300000, // 5 minutes
            autoApprove: config.autoApprove ?? false,
            webhookUrl: config.webhookUrl,
        };
    }
    /**
     * Request approval from human
     */
    async requestApproval(title, description, context, options) {
        const request = this.createRequest('approval', title, description, context, options);
        return this.waitForResponse(request, options?.timeout);
    }
    /**
     * Request human review
     */
    async requestReview(title, content, context, options) {
        const request = this.createRequest('review', title, 'Please review the following content', context, {
            content,
            ...options,
        });
        return this.waitForResponse(request, options?.timeout);
    }
    /**
     * Request user choice from options
     */
    async requestChoice(title, description, choices, context, options) {
        const request = this.createRequest('choice', title, description, context, {
            options: choices,
            ...options,
        });
        return this.waitForResponse(request, options?.timeout);
    }
    /**
     * Request user input/text
     */
    async requestInput(title, description, context, options) {
        const request = this.createRequest('input', title, description, context, options);
        return this.waitForResponse(request, options?.timeout);
    }
    /**
     * Request rating (1-5 stars)
     */
    async requestRating(title, description, context, content) {
        const request = this.createRequest('rating', title, description, context, { content });
        return this.waitForResponse(request);
    }
    /**
     * Request refinement iteration
     */
    async requestRefinement(title, currentContent, context, options) {
        const description = options?.suggestions
            ? `Suggestions for improvement:\n${options.suggestions.map(s => `• ${s}`).join('\n')}`
            : 'Please provide feedback for refinement';
        const request = this.createRequest('refinement', title, description, context, {
            content: currentContent,
            ...options,
        });
        return this.waitForResponse(request, options?.timeout);
    }
    /**
     * Submit response to a pending request
     */
    submitResponse(response) {
        const request = this.pendingRequests.get(response.requestId);
        if (!request) {
            throw new Error(`No pending request found with id: ${response.requestId}`);
        }
        // Update request status
        request.status = response.approved === false ? 'rejected' : 'approved';
        if (response.modifications) {
            request.status = 'revised';
        }
        // Store in history
        this.history.push({ request, response });
        // Trigger handler
        const handler = this.responseHandlers.get(response.requestId);
        if (handler) {
            handler(response);
            this.responseHandlers.delete(response.requestId);
        }
        // Remove from pending
        this.pendingRequests.delete(response.requestId);
        // Emit event
        this.emit('response', { request, response });
    }
    /**
     * Get pending requests
     */
    getPendingRequests() {
        return Array.from(this.pendingRequests.values());
    }
    /**
     * Get request by ID
     */
    getRequest(id) {
        return this.pendingRequests.get(id);
    }
    /**
     * Get feedback history
     */
    getHistory() {
        return [...this.history];
    }
    /**
     * Cancel a pending request
     */
    cancelRequest(id) {
        const request = this.pendingRequests.get(id);
        if (request) {
            request.status = 'timeout';
            this.pendingRequests.delete(id);
            this.responseHandlers.delete(id);
            this.emit('cancelled', { request });
        }
    }
    /**
     * Clear all pending requests
     */
    clearPending() {
        for (const [id] of this.pendingRequests) {
            this.cancelRequest(id);
        }
    }
    /**
     * Create a feedback request
     */
    createRequest(type, title, description, context, options) {
        const timeout = options?.timeout || this.config.defaultTimeout;
        const now = new Date();
        const request = {
            id: uuidv4(),
            type,
            title,
            description,
            context,
            content: options?.content,
            options: options?.options,
            createdAt: now,
            expiresAt: new Date(now.getTime() + timeout),
            status: 'pending',
        };
        this.pendingRequests.set(request.id, request);
        this.emit('request', request);
        // Send webhook if configured
        if (this.config.webhookUrl) {
            this.sendWebhook(request);
        }
        return request;
    }
    /**
     * Wait for response with timeout
     */
    waitForResponse(request, timeout) {
        const finalTimeout = timeout || this.config.defaultTimeout;
        // Auto-approve if configured
        if (this.config.autoApprove) {
            const autoResponse = {
                requestId: request.id,
                approved: true,
                comment: '[Auto-approved]',
                respondedAt: new Date(),
            };
            // Simulate async
            setTimeout(() => this.submitResponse(autoResponse), 100);
        }
        return new Promise((resolve, reject) => {
            // Set up response handler
            this.responseHandlers.set(request.id, resolve);
            // Set up timeout
            const timeoutId = setTimeout(() => {
                if (this.pendingRequests.has(request.id)) {
                    this.cancelRequest(request.id);
                    reject(new Error(`Feedback request timed out: ${request.title}`));
                }
            }, finalTimeout);
            // Clean up timeout when resolved
            const originalHandler = this.responseHandlers.get(request.id);
            this.responseHandlers.set(request.id, (response) => {
                clearTimeout(timeoutId);
                originalHandler(response);
            });
        });
    }
    /**
     * Send webhook notification
     */
    async sendWebhook(request) {
        if (!this.config.webhookUrl)
            return;
        try {
            await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'feedback_request',
                    data: request,
                }),
            });
        }
        catch (error) {
            console.error('Failed to send webhook:', error);
        }
    }
}
/**
 * Feedback decorator for agent methods
 */
export function requiresApproval(title) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const feedbackManager = this.feedbackManager;
            if (!feedbackManager) {
                console.warn('No feedback manager available, proceeding without approval');
                return originalMethod.apply(this, args);
            }
            const response = await feedbackManager.requestApproval(title, `Agent ${this.profile?.name || 'Unknown'} requests approval to proceed`, {
                agentId: this.profile?.id || 'unknown',
                agentName: this.profile?.name || 'Unknown',
            });
            if (response.approved === false) {
                throw new Error(`Action rejected: ${title}`);
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
/**
 * Create feedback manager instance
 */
export function createFeedbackManager(config) {
    return new HumanFeedbackManager(config);
}
//# sourceMappingURL=human-feedback.js.map