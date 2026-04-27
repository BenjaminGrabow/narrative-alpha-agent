import type { Document } from "../types/domain.js";
import type { GraphState, GraphUpdate } from "../graph/state.js";

export class PreprocessingNode {
  async run(state: GraphState): Promise<GraphUpdate> {
    const documents = state.documents.map(
      (document): Document => ({
        ...document,
        text: document.text.replace(/\s+/g, " ").trim()
      })
    );

    return {
      documents,
      logs: [`PreprocessingNode normalized ${documents.length} documents`]
    };
  }
}
