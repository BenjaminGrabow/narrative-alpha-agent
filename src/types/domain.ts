export type DocumentSource = "twitter" | "telegram" | "news";

export type Document = {
  id: string;
  source: DocumentSource;
  author: string;
  text: string;
  timestamp: number;
  engagement?: {
    likes?: number;
    shares?: number;
  };
};

export type Cluster = {
  id: string;
  name: string;
  centroid: number[];
  documentIds: string[];
  sources: DocumentSource[];
  createdAt: number;
  updatedAt: number;
};

export type NarrativeState = "emerging" | "accelerating" | "peaking" | "fading";

export type Narrative = {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  state: NarrativeState;
  documents: string[];
  metrics: {
    velocity: number;
    sourceDiversity: number;
    sentiment: number;
  };
  nipScore: number;
};

export type SystemState = {
  timestamp: number;
  documents: Document[];
  clusters: Cluster[];
  narratives: Narrative[];
  logs: string[];
};

export type ScoredNarrative = Narrative & {
  scoringReasons: string[];
};
