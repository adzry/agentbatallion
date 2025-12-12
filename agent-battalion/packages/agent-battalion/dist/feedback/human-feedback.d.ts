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
export type FeedbackType = 'approval' | 'review' | 'refinement' | 'choice' | 'input' | 'rating';
export type FeedbackStatus = 'pending' | 'approved' | 'rejected' | 'revised' | 'timeout';
export interface FeedbackRequest {
    id: string;
    type: FeedbackType;
    title: string;
    description: string;
    context: {
        agentId: string;
        agentName: string;
        projectId?: string;
        artifactType?: string;
        [key: string]: unknown;
    };
    options?: FeedbackOption[];
    content?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    expiresAt?: Date;
    status: FeedbackStatus;
}
export interface FeedbackOption {
    id: string;
    label: string;
    description?: string;
    recommended?: boolean;
}
export interface FeedbackResponse {
    requestId: string;
    approved?: boolean;
    selectedOption?: string;
    rating?: number;
    comment?: string;
    modifications?: string;
    respondedAt: Date;
}
export interface FeedbackConfig {
    defaultTimeout: number;
    autoApprove: boolean;
    webhookUrl?: string;
}
/**
 * Human Feedback Manager
 */
export declare class HumanFeedbackManager extends EventEmitter {
    private config;
    private pendingRequests;
    private responseHandlers;
    private history;
    constructor(config?: Partial<FeedbackConfig>);
    /**
     * Request approval from human
     */
    requestApproval(title: string, description: string, context: FeedbackRequest['context'], options?: {
        content?: string;
        timeout?: number;
    }): Promise<FeedbackResponse>;
    /**
     * Request human review
     */
    requestReview(title: string, content: string, context: FeedbackRequest['context'], options?: {
        timeout?: number;
    }): Promise<FeedbackResponse>;
    /**
     * Request user choice from options
     */
    requestChoice(title: string, description: string, choices: FeedbackOption[], context: FeedbackRequest['context'], options?: {
        timeout?: number;
    }): Promise<FeedbackResponse>;
    /**
     * Request user input/text
     */
    requestInput(title: string, description: string, context: FeedbackRequest['context'], options?: {
        placeholder?: string;
        timeout?: number;
    }): Promise<FeedbackResponse>;
    /**
     * Request rating (1-5 stars)
     */
    requestRating(title: string, description: string, context: FeedbackRequest['context'], content?: string): Promise<FeedbackResponse>;
    /**
     * Request refinement iteration
     */
    requestRefinement(title: string, currentContent: string, context: FeedbackRequest['context'], options?: {
        suggestions?: string[];
        timeout?: number;
    }): Promise<FeedbackResponse>;
    /**
     * Submit response to a pending request
     */
    submitResponse(response: FeedbackResponse): void;
    /**
     * Get pending requests
     */
    getPendingRequests(): FeedbackRequest[];
    /**
     * Get request by ID
     */
    getRequest(id: string): FeedbackRequest | undefined;
    /**
     * Get feedback history
     */
    getHistory(): Array<{
        request: FeedbackRequest;
        response?: FeedbackResponse;
    }>;
    /**
     * Cancel a pending request
     */
    cancelRequest(id: string): void;
    /**
     * Clear all pending requests
     */
    clearPending(): void;
    /**
     * Create a feedback request
     */
    private createRequest;
    /**
     * Wait for response with timeout
     */
    private waitForResponse;
    /**
     * Send webhook notification
     */
    private sendWebhook;
}
/**
 * Feedback decorator for agent methods
 */
export declare function requiresApproval(title: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Create feedback manager instance
 */
export declare function createFeedbackManager(config?: Partial<FeedbackConfig>): HumanFeedbackManager;
//# sourceMappingURL=human-feedback.d.ts.map