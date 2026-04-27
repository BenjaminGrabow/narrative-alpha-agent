import type { NarrativeGraphRunner } from "../graph/agentGraph.js";
import type { Document, SystemState } from "../types/domain.js";

export type ReplaySnapshot = {
  timestamp: number;
  state: SystemState;
};

export class ReplayEngine {
  constructor(private readonly runner: NarrativeGraphRunner) {}

  async replay(documents: Document[], timeline?: number[]): Promise<ReplaySnapshot[]> {
    const orderedDocuments = [...documents].sort(
      (left, right) => left.timestamp - right.timestamp || left.id.localeCompare(right.id)
    );
    const checkpoints = timeline ?? [
      ...new Set(orderedDocuments.map((document) => document.timestamp))
    ];
    const snapshots: ReplaySnapshot[] = [];
    let previousState: SystemState = {
      timestamp: 0,
      documents: [],
      clusters: [],
      narratives: [],
      logs: []
    };

    for (const timestamp of checkpoints) {
      const visibleData = orderedDocuments.filter((document) => document.timestamp <= timestamp);
      const state = await this.runner.run(
        {
          timestamp,
          documents: visibleData,
          clusters: previousState.clusters,
          narratives: previousState.narratives,
          logs: []
        },
        `replay-${timestamp}`
      );
      this.assertNoFutureLeakage(state, timestamp);
      snapshots.push({ timestamp, state });
      previousState = state;
    }

    return snapshots;
  }

  private assertNoFutureLeakage(state: SystemState, timestamp: number): void {
    const leaked = state.documents.find((document) => document.timestamp > timestamp);
    if (leaked) {
      throw new Error(
        `Future data leakage detected: ${leaked.id} at ${leaked.timestamp} > ${timestamp}`
      );
    }
  }
}
