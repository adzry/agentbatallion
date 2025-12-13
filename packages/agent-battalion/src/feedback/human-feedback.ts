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

export type FeedbackType = 
  | 'approval'
  | 'review'
  | 'refinement'
  | 'choice'
  | 'input'
  | 'rating';

export type FeedbackStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'revised'
  | 'timeout';

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
  defaultTimeout: number; // milliseconds
  autoApprove: boolean;
  webhookUrl?: string;
}

/**
 * Human Feedback Manager
 */
export class HumanFeedbackManager extends EventEmitter {
  private config: FeedbackConfig;
  private pendingRequests: Map<string, FeedbackRequest> = new Map();
  private responseHandlers: Map<string, (response: FeedbackResponse) => void> = new Map();
  private history: Array<{ request: FeedbackRequest; response?: FeedbackResponse }> = [];

  constructor(config: Partial<FeedbackConfig> = {}) {
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
  async requestApproval(
    title: string,
    description: string,
    context: FeedbackRequest['context'],
    options?: {
      content?: string;
      timeout?: number;
    }
  ): Promise<FeedbackResponse> {
    const request = this.createRequest('approval', title, description, context, options);
    return this.waitForResponse(request, options?.timeout);
  }

  /**
   * Request human review
   */
  async requestReview(
    title: string,
    content: string,
    context: FeedbackRequest['context'],
    options?: {
      timeout?: number;
    }
  ): Promise<FeedbackResponse> {
    const request = this.createRequest('review', title, 'Please review the following content', context, {
      content,
      ...options,
    });
    return this.waitForResponse(request, options?.timeout);
  }

  /**
   * Request user choice from options
   */
  async requestChoice(
    title: string,
    description: string,
    choices: FeedbackOption[],
    context: FeedbackRequest['context'],
    options?: {
      timeout?: number;
    }
  ): Promise<FeedbackResponse> {
    const request = this.createRequest('choice', title, description, context, {
      options: choices,
      ...options,
    });
    return this.waitForResponse(request, options?.timeout);
  }

  /**
   * Request user input/text
   */
  async requestInput(
    title: string,
    description: string,
    context: FeedbackRequest['context'],
    options?: {
      placeholder?: string;
      timeout?: number;
    }
  ): Promise<FeedbackResponse> {
    const request = this.createRequest('input', title, description, context, options);
    return this.waitForResponse(request, options?.timeout);
  }

  /**
   * Request rating (1-5 stars)
   */
  async requestRating(
    title: string,
    description: string,
    context: FeedbackRequest['context'],
    content?: string
  ): Promise<FeedbackResponse> {
    const request = this.createRequest('rating', title, description, context, { content });
    return this.waitForResponse(request);
  }

  /**
   * Request refinement iteration
   */
  async requestRefinement(
    title: string,
    currentContent: string,
    context: FeedbackRequest['context'],
    options?: {
      suggestions?: string[];
      timeout?: number;
    }
  ): Promise<FeedbackResponse> {
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
  submitResponse(response: FeedbackResponse): void {
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
  getPendingRequests(): FeedbackRequest[] {
    return Array.from(this.pendingRequests.values());
  }

  /**
   * Get request by ID
   */
  getRequest(id: string): FeedbackRequest | undefined {
    return this.pendingRequests.get(id);
  }

  /**
   * Get feedback history
   */
  getHistory(): Array<{ request: FeedbackRequest; response?: FeedbackResponse }> {
    return [...this.history];
  }

  /**
   * Cancel a pending request
   */
  cancelRequest(id: string): void {
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
  clearPending(): void {
    for (const [id] of this.pendingRequests) {
      this.cancelRequest(id);
    }
  }

  /**
   * Create a feedback request
   */
  private createRequest(
    type: FeedbackType,
    title: string,
    description: string,
    context: FeedbackRequest['context'],
    options?: {
      content?: string;
      options?: FeedbackOption[];
      timeout?: number;
    }
  ): FeedbackRequest {
    const timeout = options?.timeout || this.config.defaultTimeout;
    const now = new Date();

    const request: FeedbackRequest = {
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
  private waitForResponse(request: FeedbackRequest, timeout?: number): Promise<FeedbackResponse> {
    const finalTimeout = timeout || this.config.defaultTimeout;

    // Auto-approve if configured
    if (this.config.autoApprove) {
      const autoResponse: FeedbackResponse = {
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
        originalHandler!(response);
      });
    });
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(request: FeedbackRequest): Promise<void> {
    if (!this.config.webhookUrl) return;

    try {
      await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback_request',
          data: request,
        }),
      });
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  }
}

/**
 * Feedback decorator for agent methods
 */
export function requiresApproval(title: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const feedbackManager = (this as any).feedbackManager as HumanFeedbackManager;
      
      if (!feedbackManager) {
        console.warn('No feedback manager available, proceeding without approval');
        return originalMethod.apply(this, args);
      }

      const response = await feedbackManager.requestApproval(
        title,
        `Agent ${(this as any).profile?.name || 'Unknown'} requests approval to proceed`,
        {
          agentId: (this as any).profile?.id || 'unknown',
          agentName: (this as any).profile?.name || 'Unknown',
        }
      );

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
export function createFeedbackManager(config?: Partial<FeedbackConfig>): HumanFeedbackManager {
  return new HumanFeedbackManager(config);
}
