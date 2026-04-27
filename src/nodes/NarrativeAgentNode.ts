import type { NarrativeLifecycleService } from "../services/NarrativeLifecycleService.js";
import type { GraphState, GraphUpdate } from "../graph/state.js";
import type { NarrativeRepository } from "../types/ports.js";

export class NarrativeAgentNode {
  constructor(
    private readonly lifecycle: NarrativeLifecycleService,
    private readonly repository: NarrativeRepository
  ) {}

  async run(state: GraphState): Promise<GraphUpdate> {
    const persisted = this.repository.loadNarratives(state.timestamp);
    const existingNarratives = state.narratives.length > 0 ? state.narratives : persisted;
    const narratives = this.lifecycle.updateNarratives({
      timestamp: state.timestamp,
      documents: state.documents,
      clusters: state.clusters,
      existingNarratives
    });

    this.repository.saveNarratives(narratives);

    return {
      narratives,
      logs: [`NarrativeAgentNode updated ${narratives.length} narratives`]
    };
  }
}
