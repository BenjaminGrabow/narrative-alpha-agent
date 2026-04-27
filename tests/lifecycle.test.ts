import { describe, expect, it } from "vitest";
import { ReplayEngine } from "../src/backtest/ReplayEngine.js";
import { demoDataset, demoTimeline } from "../src/backtest/demoDataset.js";
import { createRuntime } from "../src/agents/createRuntime.js";
import { InMemoryNarrativeRepository } from "../src/db/InMemoryNarrativeRepository.js";

describe("Narrative lifecycle", () => {
  it("moves through emerging, accelerating, and peaking states", async () => {
    const snapshots = await new ReplayEngine(
      createRuntime({
        repository: new InMemoryNarrativeRepository(),
        enableConsoleAlerts: false
      })
    ).replay(demoDataset, demoTimeline);

    const observedStates = new Set(
      snapshots.flatMap((snapshot) =>
        snapshot.state.narratives
          .filter((narrative) => narrative.name.toLowerCase().includes("agent"))
          .map((narrative) => narrative.state)
      )
    );

    expect(observedStates.has("emerging")).toBe(true);
    expect(observedStates.has("accelerating")).toBe(true);
    expect(observedStates.has("peaking")).toBe(true);
  });
});
