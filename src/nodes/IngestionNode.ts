import type { GraphState, GraphUpdate } from "../graph/state.js";

export class IngestionNode {
  async run(state: GraphState): Promise<GraphUpdate> {
    const documents = [...state.documents].sort(
      (left, right) => left.timestamp - right.timestamp || left.id.localeCompare(right.id)
    );
    const seen = new Set<string>();
    const deduped = documents.filter((document) => {
      if (seen.has(document.id)) {
        return false;
      }
      seen.add(document.id);
      return document.timestamp <= state.timestamp;
    });

    return {
      documents: deduped,
      logs: [`IngestionNode accepted ${deduped.length} visible documents at ${state.timestamp}`]
    };
  }
}
