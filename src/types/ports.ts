import type { Document, Narrative } from "./domain.js";

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface LlmClient {
  complete(messages: LlmMessage[]): Promise<string>;
}

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export interface VectorStoreItem {
  id: string;
  vector: number[];
  metadata: Record<string, string | number | boolean>;
}

export interface VectorStore {
  upsert(items: VectorStoreItem[]): Promise<void>;
  query(vector: number[], limit: number): Promise<VectorStoreItem[]>;
  clear(): Promise<void>;
}

export interface NarrativeRepository {
  initialize(): void;
  saveNarratives(narratives: Narrative[]): void;
  loadNarratives(upToTimestamp?: number): Narrative[];
  clear(): void;
}

export interface Notifier {
  notify(narrative: Narrative, message: string): Promise<void>;
}

export interface Queue<T> {
  enqueue(item: T): void;
  drain(): T[];
  size(): number;
}

export interface DocumentSourceConnector {
  load(): Promise<Document[]>;
}
