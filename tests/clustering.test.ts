import { describe, expect, it } from "vitest";
import { ClusteringService } from "../src/services/ClusteringService.js";
import { DeterministicEmbeddingProvider } from "../src/services/DeterministicEmbeddingProvider.js";
import { InMemoryVectorStore } from "../src/services/InMemoryVectorStore.js";
import type { Document } from "../src/types/domain.js";

describe("ClusteringService", () => {
  it("groups semantically similar documents and separates unrelated ones", async () => {
    const documents: Document[] = [
      {
        id: "a",
        source: "twitter",
        author: "alice",
        text: "AI agent wallet payments stablecoin adoption",
        timestamp: 1
      },
      {
        id: "b",
        source: "telegram",
        author: "bob",
        text: "stablecoin payments for AI agent wallets adoption surge",
        timestamp: 2
      },
      {
        id: "c",
        source: "news",
        author: "carol",
        text: "perpetual futures funding rates remain flat",
        timestamp: 3
      }
    ];

    const service = new ClusteringService(
      new DeterministicEmbeddingProvider(),
      new InMemoryVectorStore(),
      { similarityThreshold: 0.45 }
    );
    const clusters = await service.cluster(documents);

    expect(clusters).toHaveLength(2);
    expect(
      clusters.some(
        (cluster) => cluster.documentIds.includes("a") && cluster.documentIds.includes("b")
      )
    ).toBe(true);
    expect(
      clusters.some((cluster) => cluster.documentIds.length === 1 && cluster.documentIds[0] === "c")
    ).toBe(true);
  });
});
