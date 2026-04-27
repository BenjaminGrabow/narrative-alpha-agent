import type { ScoringWeights } from "../config/defaults.js";
import type { Document, Narrative, ScoredNarrative } from "../types/domain.js";
import { clamp01 } from "../utils/math.js";

export class ScoringService {
  constructor(private readonly weights: ScoringWeights) {}

  score(narratives: Narrative[], documents: Document[]): ScoredNarrative[] {
    const documentById = new Map(documents.map((document) => [document.id, document]));

    return narratives.map((narrative) => {
      const narrativeDocuments = narrative.documents
        .map((id) => documentById.get(id))
        .filter((document): document is Document => document !== undefined);
      const crossPlatformPresence =
        new Set(narrativeDocuments.map((document) => document.source)).size / 3;
      const sentimentShift = Math.abs(narrative.metrics.sentiment - 0.5) * 2;
      const nipScore = clamp01(
        this.weights.velocity * narrative.metrics.velocity +
          this.weights.sourceDiversity * narrative.metrics.sourceDiversity +
          this.weights.crossPlatformPresence * crossPlatformPresence +
          this.weights.sentimentShift * sentimentShift
      );
      const scoringReasons = this.reasons(
        narrative,
        crossPlatformPresence,
        sentimentShift,
        nipScore
      );

      return {
        ...narrative,
        nipScore,
        scoringReasons
      };
    });
  }

  private reasons(
    narrative: Narrative,
    crossPlatformPresence: number,
    sentimentShift: number,
    nipScore: number
  ): string[] {
    const reasons: string[] = [];

    if (narrative.metrics.velocity >= 0.6) {
      reasons.push("High NIP due to velocity spike");
    }
    if (crossPlatformPresence >= 0.66) {
      reasons.push("High NIP due to cross-platform presence");
    }
    if (narrative.metrics.sourceDiversity >= 0.66) {
      reasons.push("High NIP due to diverse sources");
    }
    if (sentimentShift >= 0.4) {
      reasons.push("High NIP due to sentiment shift");
    }
    if (reasons.length === 0) {
      reasons.push(`NIP ${nipScore.toFixed(3)} remains below major trigger drivers`);
    }

    return reasons;
  }
}
