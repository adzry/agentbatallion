/**
 * Memory Manager
 *
 * Provides memory capabilities for agents:
 * - Short-term memory (current session)
 * - Long-term memory (persistent)
 * - Semantic search and recall
 * - Context management
 */
import { v4 as uuidv4 } from 'uuid';
export class MemoryManager {
    shortTermMemory = new Map();
    longTermMemory = new Map();
    context = new Map();
    config;
    constructor(config = {}) {
        this.config = {
            maxShortTermEntries: config.maxShortTermEntries || 100,
            maxLongTermEntries: config.maxLongTermEntries || 1000,
            enableEmbeddings: config.enableEmbeddings || false,
        };
    }
    /**
     * Store an item in memory
     */
    async store(type, key, value, options = {}) {
        const entry = {
            id: uuidv4(),
            type,
            key,
            value,
            createdAt: new Date(),
            accessedAt: new Date(),
            accessCount: 0,
            metadata: options.metadata,
        };
        const fullKey = `${type}:${key}`;
        if (options.longTerm) {
            this.longTermMemory.set(fullKey, entry);
            await this.pruneLongTermMemory();
        }
        else {
            this.shortTermMemory.set(fullKey, entry);
            this.pruneShortTermMemory();
        }
        return entry.id;
    }
    /**
     * Retrieve an item from memory
     */
    async retrieve(type, key) {
        const fullKey = `${type}:${key}`;
        // Check short-term first
        let entry = this.shortTermMemory.get(fullKey);
        // Fall back to long-term
        if (!entry) {
            entry = this.longTermMemory.get(fullKey);
        }
        if (entry) {
            entry.accessedAt = new Date();
            entry.accessCount++;
            return entry.value;
        }
        return null;
    }
    /**
     * Recall items based on type/query
     */
    async recall(type, limit = 10) {
        const results = [];
        // Search short-term memory
        for (const [key, entry] of this.shortTermMemory) {
            if (entry.type === type) {
                results.push(entry);
            }
        }
        // Search long-term memory
        for (const [key, entry] of this.longTermMemory) {
            if (entry.type === type) {
                results.push(entry);
            }
        }
        // Sort by access time and return values
        return results
            .sort((a, b) => b.accessedAt.getTime() - a.accessedAt.getTime())
            .slice(0, limit)
            .map(e => e.value);
    }
    /**
     * Search memory using semantic similarity (simplified without embeddings)
     */
    async search(query, limit = 5) {
        const queryLower = query.toLowerCase();
        const results = [];
        const searchIn = (memory) => {
            for (const [key, entry] of memory) {
                const content = JSON.stringify(entry.value).toLowerCase();
                const keyWords = queryLower.split(' ');
                const matchCount = keyWords.filter(w => content.includes(w)).length;
                const score = matchCount / keyWords.length;
                if (score > 0) {
                    results.push({ entry, score });
                }
            }
        };
        searchIn(this.shortTermMemory);
        searchIn(this.longTermMemory);
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(r => r.entry.value);
    }
    /**
     * Set context value
     */
    setContext(key, value) {
        this.context.set(key, value);
    }
    /**
     * Get context value
     */
    getContext(key) {
        return this.context.get(key);
    }
    /**
     * Get all context
     */
    getAllContext() {
        const result = {};
        for (const [key, value] of this.context) {
            result[key] = value;
        }
        return result;
    }
    /**
     * Clear short-term memory
     */
    clearShortTerm() {
        this.shortTermMemory.clear();
    }
    /**
     * Clear all memory
     */
    clearAll() {
        this.shortTermMemory.clear();
        this.longTermMemory.clear();
        this.context.clear();
    }
    /**
     * Get memory stats
     */
    getStats() {
        return {
            shortTermCount: this.shortTermMemory.size,
            longTermCount: this.longTermMemory.size,
            contextKeys: Array.from(this.context.keys()),
        };
    }
    /**
     * Promote frequently accessed short-term memories to long-term
     */
    promoteToLongTerm(threshold = 5) {
        for (const [key, entry] of this.shortTermMemory) {
            if (entry.accessCount >= threshold) {
                this.longTermMemory.set(key, entry);
                this.shortTermMemory.delete(key);
            }
        }
    }
    /**
     * Prune short-term memory when limit exceeded
     */
    pruneShortTermMemory() {
        if (this.shortTermMemory.size <= this.config.maxShortTermEntries)
            return;
        // Remove least recently accessed entries
        const entries = Array.from(this.shortTermMemory.entries())
            .sort(([, a], [, b]) => a.accessedAt.getTime() - b.accessedAt.getTime());
        const toRemove = entries.slice(0, this.shortTermMemory.size - this.config.maxShortTermEntries);
        for (const [key] of toRemove) {
            this.shortTermMemory.delete(key);
        }
    }
    /**
     * Prune long-term memory when limit exceeded
     */
    async pruneLongTermMemory() {
        if (this.longTermMemory.size <= this.config.maxLongTermEntries)
            return;
        // Remove least frequently accessed entries
        const entries = Array.from(this.longTermMemory.entries())
            .sort(([, a], [, b]) => a.accessCount - b.accessCount);
        const toRemove = entries.slice(0, this.longTermMemory.size - this.config.maxLongTermEntries);
        for (const [key] of toRemove) {
            this.longTermMemory.delete(key);
        }
    }
    /**
     * Export memory for persistence
     */
    export() {
        return {
            shortTerm: Array.from(this.shortTermMemory.entries()),
            longTerm: Array.from(this.longTermMemory.entries()),
            context: Array.from(this.context.entries()),
        };
    }
    /**
     * Import memory from export
     */
    import(data) {
        this.shortTermMemory = new Map(data.shortTerm);
        this.longTermMemory = new Map(data.longTerm);
        this.context = new Map(data.context);
    }
}
/**
 * Create a shared memory manager instance
 */
export function createMemoryManager(config) {
    return new MemoryManager(config);
}
//# sourceMappingURL=memory-manager.js.map