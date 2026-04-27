import type { ScoringService } from "../services/ScoringService.js";
import type { GraphState, GraphUpdate } from "../graph/state.js";

export class ScoringNode {
  constructor(private readonly scoring: ScoringService) {}

  async run(state: GraphState): Promise<GraphUpdate> {
    const scored = this.scoring.score(state.narratives, state.documents);
    const logs = scored.flatMap((narrative) =>
      narrative.scoringReasons.map((reason) => `${reason}: ${narrative.name}`)
    );

    return {
      narratives: scored,
      logs
    };
  }
}
