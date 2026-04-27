import { defaultConfig, type AppConfig } from "../config/defaults.js";
import { readProviderConfigFromEnv, type ProviderSecretConfig } from "../config/secrets.js";
import { SqliteNarrativeRepository } from "../db/SqliteNarrativeRepository.js";
import { NarrativeGraphRunner } from "../graph/agentGraph.js";
import { AlertService, ConsoleNotifier, TelegramNotifierStub } from "../services/AlertService.js";
import { ClusteringService } from "../services/ClusteringService.js";
import { DeterministicEmbeddingProvider } from "../services/DeterministicEmbeddingProvider.js";
import { InMemoryVectorStore } from "../services/InMemoryVectorStore.js";
import { createLlmClient } from "../services/MultiProviderLlmClient.js";
import { NarrativeLifecycleService } from "../services/NarrativeLifecycleService.js";
import { ScoringService } from "../services/ScoringService.js";
import { SentimentService } from "../services/SentimentService.js";
import type { NarrativeRepository } from "../types/ports.js";

export type RuntimeOptions = {
  config?: Partial<AppConfig>;
  repository?: NarrativeRepository;
  databasePath?: string;
  enableConsoleAlerts?: boolean;
  llmProvider?: ProviderSecretConfig;
};

export const createRuntime = (options: RuntimeOptions = {}): NarrativeGraphRunner => {
  const config: AppConfig = {
    ...defaultConfig,
    ...options.config,
    scoringWeights: {
      ...defaultConfig.scoringWeights,
      ...options.config?.scoringWeights
    }
  };
  const repository =
    options.repository ?? new SqliteNarrativeRepository(options.databasePath ?? "naa.sqlite");
  repository.initialize();

  const embeddings = new DeterministicEmbeddingProvider();
  const llm = createLlmClient(options.llmProvider ?? readProviderConfigFromEnv());
  const vectorStore = new InMemoryVectorStore();
  const clustering = new ClusteringService(embeddings, vectorStore, {
    similarityThreshold: config.clusterSimilarityThreshold
  });
  const lifecycle = new NarrativeLifecycleService(new SentimentService(), {
    replayWindowMs: config.replayWindowMs
  });
  void llm;
  const scoring = new ScoringService(config.scoringWeights);
  const notifiers =
    options.enableConsoleAlerts === false
      ? [new TelegramNotifierStub()]
      : [new ConsoleNotifier(), new TelegramNotifierStub()];
  const alerts = new AlertService(notifiers);

  return new NarrativeGraphRunner({
    config,
    clustering,
    lifecycle,
    scoring,
    repository,
    alerts
  });
};
