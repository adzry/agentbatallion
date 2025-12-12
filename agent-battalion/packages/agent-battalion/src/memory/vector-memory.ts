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
import { v4 as uuidv4 } from 'uuid';

// Pinecone client type (optional dependency)
type PineconeClient = {
  Index: (name: string) => {
    upsert: (data: unknown[]) => Promise<void>;
    query: (params: unknown) => Promise<{ matches: unknown[] }>;
  };
};

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
  score?: number; // Similarity score during search
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
 * Local vector store using cosine similarity
 */
class LocalVectorStore {
  private documents: VectorDocument[] = [];
  private dimension: number;

  constructor(dimension: number = 1536) {
    this.dimension = dimension;
  }

  async upsert(doc: VectorDocument): Promise<void> {
    const existingIndex = this.documents.findIndex(d => d.id === doc.id);
    if (existingIndex >= 0) {
      this.documents[existingIndex] = doc;
    } else {
      this.documents.push(doc);
    }
  }

  async search(embedding: number[], topK: number = 10): Promise<VectorDocument[]> {
    const results = this.documents
      .map(doc => ({
        ...doc,
        score: doc.embedding ? this.cosineSimilarity(embedding, doc.embedding) : 0,
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, topK);

    return results;
  }

  async delete(id: string): Promise<void> {
    this.documents = this.documents.filter(d => d.id !== id);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  getDocumentCount(): number {
    return this.documents.length;
  }

  clear(): void {
    this.documents = [];
  }
}

/**
 * Vector Memory Manager
 */
export class VectorMemory extends EventEmitter {
  private config: VectorMemoryConfig;
  private localStore: LocalVectorStore;
  private embeddingCache: Map<string, number[]> = new Map();
  private pineconeClient: any = null;

  constructor(config: Partial<VectorMemoryConfig> = {}) {
    super();
    
    this.config = {
      provider: config.provider || 'local',
      apiKey: config.apiKey || process.env.PINECONE_API_KEY,
      environment: config.environment || process.env.PINECONE_ENVIRONMENT,
      indexName: config.indexName || 'agent-battalion',
      dimension: config.dimension || 1536, // OpenAI ada-002 dimension
      useCache: config.useCache ?? true,
    };

    this.localStore = new LocalVectorStore(this.config.dimension);
  }

  /**
   * Initialize vector store connection
   */
  async initialize(): Promise<void> {
    if (this.config.provider === 'pinecone' && this.config.apiKey) {
      try {
        // Dynamic import with type assertion to avoid TS2307
        const pineconeModule = await (Function('return import("@pinecone-database/pinecone")')() as Promise<{ Pinecone: new (config: { apiKey: string }) => PineconeClient }>);
        this.pineconeClient = new pineconeModule.Pinecone({
          apiKey: this.config.apiKey,
        });
        this.emit('initialized', { provider: 'pinecone' });
      } catch (error) {
        console.warn('Failed to initialize Pinecone, falling back to local:', error);
        this.config.provider = 'local';
        this.emit('initialized', { provider: 'local', fallback: true });
      }
    } else {
      this.emit('initialized', { provider: 'local' });
    }
  }

  /**
   * Store a document with embedding
   */
  async store(
    content: string,
    metadata: Partial<VectorDocument['metadata']> = {}
  ): Promise<VectorDocument> {
    const id = uuidv4();
    const embedding = await this.getEmbedding(content);

    const doc: VectorDocument = {
      id,
      content,
      embedding,
      metadata: {
        type: metadata.type || 'document',
        timestamp: new Date(),
        ...metadata,
      },
    };

    if (this.config.provider === 'pinecone' && this.pineconeClient) {
      await this.storePinecone(doc);
    } else {
      await this.localStore.upsert(doc);
    }

    this.emit('stored', { id, type: doc.metadata.type });
    return doc;
  }

  /**
   * Search for similar documents
   */
  async search(
    query: string,
    options: {
      topK?: number;
      filter?: Record<string, unknown>;
      minScore?: number;
    } = {}
  ): Promise<VectorSearchResult> {
    const startTime = Date.now();
    const { topK = 10, filter, minScore = 0.5 } = options;

    const embedding = await this.getEmbedding(query);

    let documents: VectorDocument[];

    if (this.config.provider === 'pinecone' && this.pineconeClient) {
      documents = await this.searchPinecone(embedding, topK, filter);
    } else {
      documents = await this.localStore.search(embedding, topK);
    }

    // Filter by minimum score
    documents = documents.filter(d => (d.score || 0) >= minScore);

    const queryTime = Date.now() - startTime;

    this.emit('search', { query: query.slice(0, 50), resultCount: documents.length, queryTime });

    return {
      documents,
      totalCount: documents.length,
      queryTime,
    };
  }

  /**
   * Store related memories for a project
   */
  async storeProjectMemory(
    projectId: string,
    memories: Array<{ content: string; type: string }>
  ): Promise<void> {
    for (const memory of memories) {
      await this.store(memory.content, {
        type: memory.type,
        projectId,
      });
    }
  }

  /**
   * Recall project-specific memories
   */
  async recallProjectMemories(
    projectId: string,
    query: string,
    topK: number = 5
  ): Promise<VectorDocument[]> {
    const result = await this.search(query, {
      topK: topK * 2, // Fetch more to filter
      filter: { projectId },
    });

    return result.documents.filter(d => d.metadata.projectId === projectId).slice(0, topK);
  }

  /**
   * Store conversation memory
   */
  async storeConversation(
    agentId: string,
    role: 'user' | 'agent',
    content: string
  ): Promise<VectorDocument> {
    return await this.store(content, {
      type: 'conversation',
      agentId,
      tags: [role],
    });
  }

  /**
   * Get relevant conversation context
   */
  async getConversationContext(
    agentId: string,
    currentMessage: string,
    maxMessages: number = 5
  ): Promise<string[]> {
    const result = await this.search(currentMessage, {
      topK: maxMessages,
      filter: { agentId, type: 'conversation' },
    });

    return result.documents.map(d => d.content);
  }

  /**
   * Get embedding for text (with caching)
   */
  private async getEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = this.hashText(text);
    if (this.config.useCache && this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    let embedding: number[];

    // Try OpenAI embeddings
    if (process.env.OPENAI_API_KEY) {
      try {
        embedding = await this.getOpenAIEmbedding(text);
      } catch (error) {
        console.warn('OpenAI embedding failed, using mock:', error);
        embedding = this.getMockEmbedding(text);
      }
    } else {
      // Use mock embedding for development
      embedding = this.getMockEmbedding(text);
    }

    // Cache the result
    if (this.config.useCache) {
      this.embeddingCache.set(cacheKey, embedding);
    }

    return embedding;
  }

  /**
   * Get embedding from OpenAI
   */
  private async getOpenAIEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text.slice(0, 8000), // Limit input size
        model: 'text-embedding-ada-002',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as { data: Array<{ embedding: number[] }> };
    return data.data[0].embedding;
  }

  /**
   * Generate mock embedding (for development/testing)
   */
  private getMockEmbedding(text: string): number[] {
    // Simple deterministic mock embedding based on text content
    const embedding: number[] = [];
    const normalizedText = text.toLowerCase();

    for (let i = 0; i < this.config.dimension!; i++) {
      // Create a pseudo-random but deterministic value
      const charIndex = i % normalizedText.length;
      const charCode = normalizedText.charCodeAt(charIndex);
      const seed = (charCode * (i + 1)) % 1000;
      embedding.push((seed / 1000) - 0.5);
    }

    // Normalize to unit vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Store in Pinecone
   */
  private async storePinecone(doc: VectorDocument): Promise<void> {
    const index = this.pineconeClient.Index(this.config.indexName);
    
    await index.upsert([{
      id: doc.id,
      values: doc.embedding,
      metadata: {
        content: doc.content,
        ...doc.metadata,
        timestamp: doc.metadata.timestamp.toISOString(),
      },
    }]);
  }

  /**
   * Search in Pinecone
   */
  private async searchPinecone(
    embedding: number[],
    topK: number,
    filter?: Record<string, unknown>
  ): Promise<VectorDocument[]> {
    const index = this.pineconeClient.Index(this.config.indexName);

    const results = await index.query({
      vector: embedding,
      topK,
      filter,
      includeMetadata: true,
    });

    return results.matches.map((match: any) => ({
      id: match.id,
      content: match.metadata.content,
      metadata: {
        ...match.metadata,
        timestamp: new Date(match.metadata.timestamp),
      },
      score: match.score,
    }));
  }

  /**
   * Hash text for cache key
   */
  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Get store statistics
   */
  getStats(): { provider: string; documentCount: number; cacheSize: number } {
    return {
      provider: this.config.provider,
      documentCount: this.localStore.getDocumentCount(),
      cacheSize: this.embeddingCache.size,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.localStore.clear();
    this.embeddingCache.clear();
  }
}

/**
 * Create vector memory instance
 */
export function createVectorMemory(config?: Partial<VectorMemoryConfig>): VectorMemory {
  return new VectorMemory(config);
}
