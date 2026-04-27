import { Annotation } from "@langchain/langgraph";
import type { Cluster, Document, Narrative, SystemState } from "../types/domain.js";

export const SystemStateAnnotation = Annotation.Root({
  timestamp: Annotation<number>({
    reducer: (_previous, next) => next,
    default: () => 0
  }),
  documents: Annotation<Document[]>({
    reducer: (_previous, next) => next,
    default: () => []
  }),
  clusters: Annotation<Cluster[]>({
    reducer: (_previous, next) => next,
    default: () => []
  }),
  narratives: Annotation<Narrative[]>({
    reducer: (_previous, next) => next,
    default: () => []
  }),
  logs: Annotation<string[]>({
    reducer: (previous, next) => [...previous, ...next],
    default: () => []
  })
});

export type GraphState = typeof SystemStateAnnotation.State;
export type GraphUpdate = Partial<SystemState>;
