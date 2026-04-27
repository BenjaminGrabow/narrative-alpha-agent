import { describe, expect, it } from "vitest";
import { ReplayEngine } from "../src/backtest/ReplayEngine.js";
import { demoDataset, demoTimeline } from "../src/backtest/demoDataset.js";
import { createRuntime } from "../src/agents/createRuntime.js";
import { InMemoryNarrativeRepository } from "../src/db/InMemoryNarrativeRepository.js";

describe("ReplayEngine", () => {
  it("does not expose future documents at each checkpoint", async () => {
    const replay = new ReplayEngine(
      createRuntime({
        repository: new InMemoryNarrativeRepository(),
        enableConsoleAlerts: false
      })
    );

    const snapshots = await replay.replay(demoDataset, demoTimeline);

    for (const snapshot of snapshots) {
      expect(
        snapshot.state.documents.every((document) => document.timestamp <= snapshot.timestamp)
      ).toBe(true);
    }
  });

  it("is deterministic for identical data and timeline", async () => {
    const first = await new ReplayEngine(
      createRuntime({ repository: new InMemoryNarrativeRepository(), enableConsoleAlerts: false })
    ).replay(demoDataset, demoTimeline);
    const second = await new ReplayEngine(
      createRuntime({ repository: new InMemoryNarrativeRepository(), enableConsoleAlerts: false })
    ).replay(demoDataset, demoTimeline);

    expect(
      first.map((snapshot) =>
        snapshot.state.narratives.map((narrative) => ({
          name: narrative.name,
          state: narrative.state,
          nipScore: Number(narrative.nipScore.toFixed(4))
        }))
      )
    ).toEqual(
      second.map((snapshot) =>
        snapshot.state.narratives.map((narrative) => ({
          name: narrative.name,
          state: narrative.state,
          nipScore: Number(narrative.nipScore.toFixed(4))
        }))
      )
    );
  });
});
