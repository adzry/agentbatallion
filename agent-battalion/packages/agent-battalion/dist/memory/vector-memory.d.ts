/**
 * Vector Memory - Semantic Memory with Embeddings
 *
 * Provides:
 * - Semantic search using embeddings
 * - Integration with Pinecone/Weaviate
 * - Local fallback with cosine similarity
 * - Long-term persistent memory
 */
import { EventEmitter } from 'events';
export interface VectorDocument {
    id: string;
    content: string;
    embedding?: number[];
    metadata: {
        type: string;
        timestamp: Date;
        source?: string;
        projectId?: string;
        agentId?: string;
        tags?: string[];
        [key: string]: unknown;
    };
    score?: number;
}
export interface VectorSearchResult {
    documents: VectorDocument[];
    totalCount: number;
    queryTime: number;
}
export type VectorProvider = 'pinecone' | 'weaviate' | 'local';
export interface VectorMemoryConfig {
    provider: VectorProvider;
    apiKey?: string;
    environment?: string;
    indexName?: string;
    dimension?: number;
    useCache?: boolean;
}
/**
 * Vector Memory Manager
 */
export declare class VectorMemory extends EventEmitter {
    private config;
    private localStore;
    private embeddingCache;
    private pineconeClient;
    constructor(config?: Partial<VectorMemoryConfig>);
    /**
     * Initialize vector store connection
     */
    initialize(): Promise<void>;
    /**
     * Store a document with embedding
     */
    store(content: string, metadata?: Partial<VectorDocument['metadata']>): Promise<VectorDocument>;
    /**
     * Store a solution pattern in the global knowledge base (Phase 6: Overmind)
     * This is shared across all missions for collective learning
     */
    storeSolutionPattern(problem: string, solution: string, tags?: string[]): Promise<VectorDocument>;
    /**
     * Find similar solution patterns from the global knowledge base (Phase 6: Overmind)
     */
    findSimilarSolutions(problem: string, topK?: number): Promise<string[]>;
    /**
     * Search for similar documents
     */
    search(query: string, options?: {
        topK?: number;
        filter?: Record<string, unknown>;
        minScore?: number;
    }): Promise<VectorSearchResult>;
    /**
     * Store related memories for a project
     */
    storeProjectMemory(projectId: string, memories: Array<{
        content: string;
        type: string;
    }>): Promise<void>;
    /**
     * Recall project-specific memories
     */
    recallProjectMemories(projectId: string, query: string, topK?: number): Promise<VectorDocument[]>;
    /**
     * Store conversation memory
     */
    storeConversation(agentId: string, role: 'user' | 'agent', content: string): Promise<VectorDocument>;
    /**
     * Get relevant conversation context
     */
    getConversationContext(agentId: string, currentMessage: string, maxMessages?: number): Promise<string[]>;
    /**
     * Get embedding for text (with caching)
     */
    private getEmbedding;
    /**
     * Get embedding from OpenAI
     */
    private getOpenAIEmbedding;
    /**
     * Generate mock embedding (for development/testing)
     */
    private getMockEmbedding;
    /**
     * Store in Pinecone
     */
    private storePinecone;
    /**
     * Search in Pinecone
     */
    private searchPinecone;
    /**
     * Hash text for cache key
     */
    private hashText;
    /**
     * Get store statistics
     */
    getStats(): {
        provider: string;
        documentCount: number;
        cacheSize: number;
    };
    /**
     * Clear all data
     */
    clear(): void;
}
/**
 * Create vector memory instance
 */
export declare function createVectorMemory(config?: Partial<VectorMemoryConfig>): VectorMemory;
//# sourceMappingURL=vector-memory.d.ts.map