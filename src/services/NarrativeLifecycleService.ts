import type { Cluster, Document, Narrative, NarrativeState } from "../types/domain.js";
import { stableId } from "../utils/id.js";
import { topTerms } from "../utils/text.js";
import type { SentimentService } from "./SentimentService.js";

export type NarrativeLifecycleOptions = {
  replayWindowMs: number;
};

export class NarrativeLifecycleService {
  constructor(
    private readonly sentiment: SentimentService,
    private readonly options: NarrativeLifecycleOptions
  ) {}

  updateNarratives(params: {
    timestamp: number;
    documents: Document[];
    clusters: Cluster[];
    existingNarratives: Narrative[];
  }): Narrative[] {
    const documentById = new Map(params.documents.map((document) => [document.id, document]));
    const existingByFingerprint = new Map(
      params.existingNarratives.map((narrative) => [
        this.fingerprint(narrative.documents),
        narrative
      ])
    );

    return params.clusters.map((cluster) => {
      const previous = existingByFingerprint.get(this.fingerprint(cluster.documentIds));
      const clusterDocuments = cluster.documentIds
        .map((id) => documentById.get(id))
        .filter((document): document is Document => document !== undefined);
      const texts = clusterDocuments.map((document) => document.text);
      const metrics = {
        velocity: this.velocity(clusterDocuments, params.timestamp),
        sourceDiversity: new Set(clusterDocuments.map((document) => document.source)).size / 3,
        sentiment: this.sentiment.score(texts)
      };

      const state = this.transition(
        previous?.state ?? "emerging",
        metrics.velocity,
        clusterDocuments.length
      );
      const terms = topTerms(texts, 4);
      const createdAt = previous?.createdAt ?? cluster.createdAt;

      return {
        id: previous?.id ?? stableId("narrative", cluster.id),
        name: terms.length > 0 ? terms.map((term) => this.titleCase(term)).join(" ") : cluster.name,
        description: `Narrative around ${terms.join(", ") || cluster.name}`,
        createdAt,
        updatedAt: params.timestamp,
        state,
        documents: cluster.documentIds,
        metrics,
        nipScore: previous?.nipScore ?? 0
      };
    });
  }

  private fingerprint(documentIds: string[]): string {
    return [...documentIds].sort().slice(0, 2).join("|");
  }

  private velocity(documents: Document[], timestamp: number): number {
    const windowStart = timestamp - this.options.replayWindowMs;
    const recent = documents.filter((document) => document.timestamp >= windowStart);
    return Math.min(1, recent.length / 5);
  }

  private transition(
    previous: NarrativeState,
    velocity: number,
    documentCount: number
  ): NarrativeState {
    if (velocity >= 0.8 && documentCount >= 5) {
      return "peaking";
    }
    if (velocity >= 0.45 && documentCount >= 3) {
      return "accelerating";
    }
    if (previous === "peaking" && velocity < 0.3) {
      return "fading";
    }
    if (previous === "accelerating" && velocity < 0.25) {
      return "fading";
    }
    return documentCount <= 2 ? "emerging" : previous;
  }

  private titleCase(term: string): string {
    return term.charAt(0).toUpperCase() + term.slice(1);
  }
}
