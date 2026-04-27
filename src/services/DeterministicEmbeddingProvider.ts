import type { EmbeddingProvider } from "../types/ports.js";
import { tokenize } from "../utils/text.js";

const DIMENSIONS = 64;

export class DeterministicEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    const vector = new Array<number>(DIMENSIONS).fill(0);

    for (const token of tokenize(text)) {
      const index = this.hashToken(token) % DIMENSIONS;
      vector[index] = (vector[index] ?? 0) + 1;
    }

    const norm = Math.sqrt(vector.reduce((total, value) => total + value * value, 0));
    return norm === 0 ? vector : vector.map((value) => value / norm);
  }

  private hashToken(token: string): number {
    let hash = 2166136261;
    for (const char of token) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
}
