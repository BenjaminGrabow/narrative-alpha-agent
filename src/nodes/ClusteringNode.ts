import type { ClusteringService } from "../services/ClusteringService.js";
import type { GraphState, GraphUpdate } from "../graph/state.js";

export class ClusteringNode {
  constructor(private readonly clustering: ClusteringService) {}

  async run(state: GraphState): Promise<GraphUpdate> {
    const clusters = await this.clustering.cluster(state.documents);

    return {
      clusters,
      logs: [`ClusteringNode produced ${clusters.length} clusters`]
    };
  }
}
