import { END, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import type { AppConfig } from "../config/defaults.js";
import type { AlertService } from "../services/AlertService.js";
import type { ClusteringService } from "../services/ClusteringService.js";
import type { NarrativeLifecycleService } from "../services/NarrativeLifecycleService.js";
import type { ScoringService } from "../services/ScoringService.js";
import type { SystemState } from "../types/domain.js";
import type { NarrativeRepository } from "../types/ports.js";
import { ActionNode } from "../nodes/ActionNode.js";
import { ClusteringNode } from "../nodes/ClusteringNode.js";
import { IngestionNode } from "../nodes/IngestionNode.js";
import { NarrativeAgentNode } from "../nodes/NarrativeAgentNode.js";
import { PreprocessingNode } from "../nodes/PreprocessingNode.js";
import { ScoringNode } from "../nodes/ScoringNode.js";
import { SystemStateAnnotation } from "./state.js";

export type GraphDependencies = {
  config: AppConfig;
  clustering: ClusteringService;
  lifecycle: NarrativeLifecycleService;
  scoring: ScoringService;
  repository: NarrativeRepository;
  alerts: AlertService;
};

export const createNarrativeGraph = (dependencies: GraphDependencies) => {
  const ingestion = new IngestionNode();
  const preprocessing = new PreprocessingNode();
  const clustering = new ClusteringNode(dependencies.clustering);
  const narrativeAgent = new NarrativeAgentNode(dependencies.lifecycle, dependencies.repository);
  const scoring = new ScoringNode(dependencies.scoring);
  const action = new ActionNode(dependencies.alerts, dependencies.config);

  return new StateGraph(SystemStateAnnotation)
    .addNode("IngestionNode", (state) => ingestion.run(state))
    .addNode("PreprocessingNode", (state) => preprocessing.run(state))
    .addNode("ClusteringNode", (state) => clustering.run(state))
    .addNode("NarrativeAgentNode", (state) => narrativeAgent.run(state))
    .addNode("ScoringNode", (state) => scoring.run(state))
    .addNode("ActionNode", (state) => action.run(state))
    .addEdge(START, "IngestionNode")
    .addEdge("IngestionNode", "PreprocessingNode")
    .addEdge("PreprocessingNode", "ClusteringNode")
    .addEdge("ClusteringNode", "NarrativeAgentNode")
    .addEdge("NarrativeAgentNode", "ScoringNode")
    .addEdge("ScoringNode", "ActionNode")
    .addEdge("ActionNode", END)
    .compile({
      checkpointer: new MemorySaver()
    });
};

export class NarrativeGraphRunner {
  private readonly graph: ReturnType<typeof createNarrativeGraph>;

  constructor(dependencies: GraphDependencies) {
    this.graph = createNarrativeGraph(dependencies);
  }

  async run(input: SystemState, threadId = "default"): Promise<SystemState> {
    const result = await this.graph.invoke(input, {
      configurable: {
        thread_id: threadId
      }
    });

    return {
      timestamp: result.timestamp,
      documents: result.documents,
      clusters: result.clusters,
      narratives: result.narratives,
      logs: result.logs
    };
  }
}
