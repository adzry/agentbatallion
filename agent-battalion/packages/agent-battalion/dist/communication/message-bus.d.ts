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
export declare class MessageBus extends EventEmitter {
    private subscriptions;
    private messageQueue;
    private messageHistory;
    private config;
    constructor(config?: Partial<MessageBusConfig>);
    /**
     * Subscribe an agent to receive messages
     */
    subscribe(agentId: string, handler: (message: any) => void): string;
    /**
     * Unsubscribe an agent
     */
    unsubscribe(agentId: string, subscriptionId?: string): void;
    /**
     * Send a message to a specific agent
     */
    send(to: string, data: any, options?: {
        from?: string;
        priority?: Message['priority'];
    }): string;
    /**
     * Broadcast a message to all subscribed agents
     */
    broadcast(data: any, options?: {
        from?: string;
        exclude?: string[];
    }): void;
    /**
     * Request-response pattern
     */
    request(to: string, data: any, options?: {
        from?: string;
        timeout?: number;
    }): Promise<any>;
    /**
     * Reply to a request
     */
    reply(originalMessage: Message, response: any): void;
    /**
     * Get message history
     */
    getHistory(filter?: {
        from?: string;
        to?: string;
        type?: string;
    }): Message[];
    /**
     * Get pending messages for an agent
     */
    getPendingMessages(agentId: string): Message[];
    /**
     * Clear all queues and history
     */
    clear(): void;
    /**
     * Get bus statistics
     */
    getStats(): {
        subscriberCount: number;
        queuedMessages: number;
        historySize: number;
    };
    /**
     * Deliver a message to its recipient
     */
    private deliverMessage;
    /**
     * Queue a message for later delivery
     */
    private queueMessage;
    /**
     * Deliver queued messages to an agent
     */
    private deliverQueuedMessages;
    /**
     * Prune old messages from history
     */
    private pruneHistory;
}
/**
 * Create a shared message bus instance
 */
export declare function createMessageBus(config?: Partial<MessageBusConfig>): MessageBus;
//# sourceMappingURL=message-bus.d.ts.map