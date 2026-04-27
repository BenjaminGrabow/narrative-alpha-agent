import type { Cluster, Document } from "../types/domain.js";
import type { EmbeddingProvider, VectorStore } from "../types/ports.js";
import { averageVectors, cosineSimilarity } from "../utils/math.js";
import { stableId } from "../utils/id.js";
import { topTerms } from "../utils/text.js";

export type ClusteringOptions = {
  similarityThreshold: number;
};

type EmbeddedDocument = {
  document: Document;
  vector: number[];
};

export class ClusteringService {
  constructor(
    private readonly embeddings: EmbeddingProvider,
    private readonly vectorStore: VectorStore,
    private readonly options: ClusteringOptions
  ) {}

  async cluster(documents: Document[]): Promise<Cluster[]> {
    const embedded = await Promise.all(
      [...documents]
        .sort((left, right) => left.timestamp - right.timestamp || left.id.localeCompare(right.id))
        .map(async (document) => ({
          document,
          vector: await this.embeddings.embed(document.text)
        }))
    );

    const groups: EmbeddedDocument[][] = [];

    for (const item of embedded) {
      const best = this.findBestGroup(item, groups);
      if (best.index >= 0 && best.similarity >= this.options.similarityThreshold) {
        groups[best.index]?.push(item);
      } else {
        groups.push([item]);
      }
    }

    await this.vectorStore.upsert(
      embedded.map((item) => ({
        id: item.document.id,
        vector: item.vector,
        metadata: {
          source: item.document.source,
          timestamp: item.document.timestamp
        }
      }))
    );

    return groups.map((group) => this.toCluster(group));
  }

  private findBestGroup(
    item: EmbeddedDocument,
    groups: EmbeddedDocument[][]
  ): { index: number; similarity: number } {
    let best = { index: -1, similarity: -1 };

    for (let index = 0; index < groups.length; index += 1) {
      const group = groups[index] ?? [];
      const centroid = averageVectors(group.map((member) => member.vector));
      const similarity = cosineSimilarity(item.vector, centroid);
      if (similarity > best.similarity) {
        best = { index, similarity };
      }
    }

    return best;
  }

  private toCluster(group: EmbeddedDocument[]): Cluster {
    const documents = group.map((item) => item.document);
    const documentIds = documents.map((document) => document.id).sort();
    const sources = [...new Set(documents.map((document) => document.source))].sort();
    const terms = topTerms(
      documents.map((document) => document.text),
      3
    );
    const createdAt = Math.min(...documents.map((document) => document.timestamp));
    const updatedAt = Math.max(...documents.map((document) => document.timestamp));

    return {
      id: stableId("cluster", documentIds.join("|")),
      name: terms.length > 0 ? terms.join(" ") : "untitled narrative",
      centroid: averageVectors(group.map((item) => item.vector)),
      documentIds,
      sources,
      createdAt,
      updatedAt
    };
  }
}
