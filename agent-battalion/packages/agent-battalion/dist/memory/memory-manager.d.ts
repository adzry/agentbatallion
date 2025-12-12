/**
 * Memory Manager
 *
 * Provides memory capabilities for agents:
 * - Short-term memory (current session)
 * - Long-term memory (persistent)
 * - Semantic search and recall
 * - Context management
 */
export interface MemoryEntry {
    id: string;
    type: string;
    key: string;
    value: any;
    embedding?: number[];
    createdAt: Date;
    accessedAt: Date;
    accessCount: number;
    metadata?: Record<string, unknown>;
}
export interface MemoryConfig {
    maxShortTermEntries: number;
    maxLongTermEntries: number;
    enableEmbeddings: boolean;
}
export declare class MemoryManager {
    private shortTermMemory;
    private longTermMemory;
    private context;
    private config;
    constructor(config?: Partial<MemoryConfig>);
    /**
     * Store an item in memory
     */
    store(type: string, key: string, value: any, options?: {
        longTerm?: boolean;
        metadata?: Record<string, unknown>;
    }): Promise<string>;
    /**
     * Retrieve an item from memory
     */
    retrieve(type: string, key: string): Promise<any | null>;
    /**
     * Recall items based on type/query
     */
    recall(type: string, limit?: number): Promise<any[]>;
    /**
     * Search memory using semantic similarity (simplified without embeddings)
     */
    search(query: string, limit?: number): Promise<any[]>;
    /**
     * Set context value
     */
    setContext(key: string, value: any): void;
    /**
     * Get context value
     */
    getContext(key: string): any;
    /**
     * Get all context
     */
    getAllContext(): Record<string, any>;
    /**
     * Clear short-term memory
     */
    clearShortTerm(): void;
    /**
     * Clear all memory
     */
    clearAll(): void;
    /**
     * Get memory stats
     */
    getStats(): {
        shortTermCount: number;
        longTermCount: number;
        contextKeys: string[];
    };
    /**
     * Promote frequently accessed short-term memories to long-term
     */
    promoteToLongTerm(threshold?: number): void;
    /**
     * Prune short-term memory when limit exceeded
     */
    private pruneShortTermMemory;
    /**
     * Prune long-term memory when limit exceeded
     */
    private pruneLongTermMemory;
    /**
     * Export memory for persistence
     */
    export(): {
        shortTerm: [string, MemoryEntry][];
        longTerm: [string, MemoryEntry][];
        context: [string, any][];
    };
    /**
     * Import memory from export
     */
    import(data: ReturnType<typeof this.export>): void;
}
/**
 * Create a shared memory manager instance
 */
export declare function createMemoryManager(config?: Partial<MemoryConfig>): MemoryManager;
//# sourceMappingURL=memory-manager.d.ts.map