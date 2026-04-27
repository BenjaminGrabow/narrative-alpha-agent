export type ScoringWeights = {
  velocity: number;
  sourceDiversity: number;
  crossPlatformPresence: number;
  sentimentShift: number;
};

export type AppConfig = {
  clusterSimilarityThreshold: number;
  actionThreshold: number;
  replayWindowMs: number;
  deterministicReplay: boolean;
  scoringWeights: ScoringWeights;
};

export const defaultConfig: AppConfig = {
  clusterSimilarityThreshold: 0.35,
  actionThreshold: 0.68,
  replayWindowMs: 6 * 60 * 60 * 1000,
  deterministicReplay: true,
  scoringWeights: {
    velocity: 0.35,
    sourceDiversity: 0.2,
    crossPlatformPresence: 0.25,
    sentimentShift: 0.2
  }
};
