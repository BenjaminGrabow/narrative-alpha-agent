import { describe, expect, it } from "vitest";
import { ScoringService } from "../src/services/ScoringService.js";
import type { Document, Narrative } from "../src/types/domain.js";

describe("ScoringService", () => {
  it("calculates weighted NIP and logs driver reasons", () => {
    const documents: Document[] = [
      { id: "a", source: "twitter", author: "alice", text: "bullish", timestamp: 1 },
      { id: "b", source: "telegram", author: "bob", text: "surge", timestamp: 2 },
      { id: "c", source: "news", author: "carol", text: "record", timestamp: 3 }
    ];
    const narrative: Narrative = {
      id: "n",
      name: "Agent Payments",
      description: "test",
      createdAt: 1,
      updatedAt: 3,
      state: "accelerating",
      documents: ["a", "b", "c"],
      metrics: {
        velocity: 0.8,
        sourceDiversity: 1,
        sentiment: 0.8
      },
      nipScore: 0
    };
    const service = new ScoringService({
      velocity: 0.35,
      sourceDiversity: 0.2,
      crossPlatformPresence: 0.25,
      sentimentShift: 0.2
    });

    const [scored] = service.score([narrative], documents);

    expect(scored?.nipScore).toBeCloseTo(0.85);
    expect(scored?.scoringReasons).toContain("High NIP due to velocity spike");
    expect(scored?.scoringReasons).toContain("High NIP due to cross-platform presence");
  });
});
