import type { VectorStore, VectorStoreItem } from "../types/ports.js";
import { cosineSimilarity } from "../utils/math.js";

export class InMemoryVectorStore implements VectorStore {
  private readonly items = new Map<string, VectorStoreItem>();

  async upsert(items: VectorStoreItem[]): Promise<void> {
    for (const item of items) {
      this.items.set(item.id, item);
    }
  }

  async query(vector: number[], limit: number): Promise<VectorStoreItem[]> {
    return [...this.items.values()]
      .map((item) => ({ item, score: cosineSimilarity(vector, item.vector) }))
      .sort((left, right) => right.score - left.score)
      .slice(0, limit)
      .map(({ item }) => item);
  }

  async clear(): Promise<void> {
    this.items.clear();
  }
}
