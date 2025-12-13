/**
 * Message Bus
 * 
 * Provides communication infrastructure for agent-to-agent messaging:
 * - Direct messaging between agents
 * - Broadcast messages to all agents
 * - Event subscription and publishing
 * - Message queuing and delivery
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  from: string;
  to: string;
  type: string;
  data: any;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high';
  acknowledged: boolean;
}

export interface Subscription {
  id: string;
  agentId: string;
  handler: (message: any) => void;
}

export interface MessageBusConfig {
  enableLogging: boolean;
  maxQueueSize: number;
  messageTimeout: number;
}

export class MessageBus extends EventEmitter {
  private subscriptions: Map<string, Subscription[]> = new Map();
  private messageQueue: Map<string, Message[]> = new Map();
  private messageHistory: Message[] = [];
  private config: MessageBusConfig;

  constructor(config: Partial<MessageBusConfig> = {}) {
    super();
    this.config = {
      enableLogging: config.enableLogging || false,
      maxQueueSize: config.maxQueueSize || 100,
      messageTimeout: config.messageTimeout || 30000,
    };
  }

  /**
   * Subscribe an agent to receive messages
   */
  subscribe(agentId: string, handler: (message: any) => void): string {
    const subscription: Subscription = {
      id: uuidv4(),
      agentId,
      handler,
    };

    const existing = this.subscriptions.get(agentId) || [];
    existing.push(subscription);
    this.subscriptions.set(agentId, existing);

    // Deliver any queued messages
    this.deliverQueuedMessages(agentId);

    return subscription.id;
  }

  /**
   * Unsubscribe an agent
   */
  unsubscribe(agentId: string, subscriptionId?: string): void {
    if (subscriptionId) {
      const subs = this.subscriptions.get(agentId) || [];
      this.subscriptions.set(
        agentId,
        subs.filter(s => s.id !== subscriptionId)
      );
    } else {
      this.subscriptions.delete(agentId);
    }
  }

  /**
   * Send a message to a specific agent
   */
  send(
    to: string,
    data: any,
    options: { from?: string; priority?: Message['priority'] } = {}
  ): string {
    const message: Message = {
      id: uuidv4(),
      from: options.from || 'system',
      to,
      type: data.type || 'message',
      data,
      timestamp: new Date(),
      priority: options.priority || 'normal',
      acknowledged: false,
    };

    if (this.config.enableLogging) {
      console.log(`[MessageBus] ${message.from} -> ${to}: ${message.type}`);
    }

    // Store in history
    this.messageHistory.push(message);
    this.pruneHistory();

    // Try to deliver immediately
    const delivered = this.deliverMessage(message);

    // If not delivered, queue the message
    if (!delivered) {
      this.queueMessage(to, message);
    }

    // Emit event
    this.emit('message', message);

    return message.id;
  }

  /**
   * Broadcast a message to all subscribed agents
   */
  broadcast(data: any, options: { from?: string; exclude?: string[] } = {}): void {
    const exclude = options.exclude || [];

    for (const agentId of this.subscriptions.keys()) {
      if (!exclude.includes(agentId)) {
        this.send(agentId, data, { from: options.from });
      }
    }

    this.emit('broadcast', data);
  }

  /**
   * Request-response pattern
   */
  async request(
    to: string,
    data: any,
    options: { from?: string; timeout?: number } = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = uuidv4();
      const timeout = options.timeout || this.config.messageTimeout;

      // Set up response handler
      const responseHandler = (message: any) => {
        if (message.data?.requestId === requestId) {
          this.off('message', responseHandler);
          resolve(message.data.response);
        }
      };

      this.on('message', responseHandler);

      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.off('message', responseHandler);
        reject(new Error(`Request to ${to} timed out after ${timeout}ms`));
      }, timeout);

      // Send the request
      this.send(to, { ...data, requestId }, options);
    });
  }

  /**
   * Reply to a request
   */
  reply(originalMessage: Message, response: any): void {
    this.send(originalMessage.from, {
      type: 'response',
      requestId: originalMessage.data.requestId,
      response,
    });
  }

  /**
   * Get message history
   */
  getHistory(filter?: { from?: string; to?: string; type?: string }): Message[] {
    let messages = [...this.messageHistory];

    if (filter) {
      if (filter.from) {
        messages = messages.filter(m => m.from === filter.from);
      }
      if (filter.to) {
        messages = messages.filter(m => m.to === filter.to);
      }
      if (filter.type) {
        messages = messages.filter(m => m.type === filter.type);
      }
    }

    return messages;
  }

  /**
   * Get pending messages for an agent
   */
  getPendingMessages(agentId: string): Message[] {
    return this.messageQueue.get(agentId) || [];
  }

  /**
   * Clear all queues and history
   */
  clear(): void {
    this.messageQueue.clear();
    this.messageHistory = [];
  }

  /**
   * Get bus statistics
   */
  getStats(): {
    subscriberCount: number;
    queuedMessages: number;
    historySize: number;
  } {
    let queuedMessages = 0;
    for (const queue of this.messageQueue.values()) {
      queuedMessages += queue.length;
    }

    return {
      subscriberCount: this.subscriptions.size,
      queuedMessages,
      historySize: this.messageHistory.length,
    };
  }

  /**
   * Deliver a message to its recipient
   */
  private deliverMessage(message: Message): boolean {
    const subscriptions = this.subscriptions.get(message.to);
    
    if (!subscriptions || subscriptions.length === 0) {
      return false;
    }

    for (const sub of subscriptions) {
      try {
        sub.handler(message);
      } catch (error) {
        console.error(`Error delivering message to ${message.to}:`, error);
      }
    }

    message.acknowledged = true;
    return true;
  }

  /**
   * Queue a message for later delivery
   */
  private queueMessage(agentId: string, message: Message): void {
    const queue = this.messageQueue.get(agentId) || [];
    
    // Priority ordering
    if (message.priority === 'high') {
      queue.unshift(message);
    } else {
      queue.push(message);
    }

    // Limit queue size
    while (queue.length > this.config.maxQueueSize) {
      queue.shift();
    }

    this.messageQueue.set(agentId, queue);
  }

  /**
   * Deliver queued messages to an agent
   */
  private deliverQueuedMessages(agentId: string): void {
    const queue = this.messageQueue.get(agentId);
    
    if (!queue || queue.length === 0) return;

    for (const message of queue) {
      this.deliverMessage(message);
    }

    this.messageQueue.delete(agentId);
  }

  /**
   * Prune old messages from history
   */
  private pruneHistory(): void {
    const maxHistory = 1000;
    if (this.messageHistory.length > maxHistory) {
      this.messageHistory = this.messageHistory.slice(-maxHistory);
    }
  }
}

/**
 * Create a shared message bus instance
 */
export function createMessageBus(config?: Partial<MessageBusConfig>): MessageBus {
  return new MessageBus(config);
}
