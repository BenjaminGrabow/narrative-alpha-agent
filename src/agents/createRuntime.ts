import { defaultConfig, type AppConfig } from "../config/defaults.js";
import { readNotificationConfigFromEnv, type NotificationConfig } from "../config/notifications.js";
import { readLangSmithConfigFromEnv, type LangSmithConfig } from "../config/observability.js";
import { readProviderConfigFromEnv, type ProviderSecretConfig } from "../config/secrets.js";
import { SqliteNarrativeRepository } from "../db/SqliteNarrativeRepository.js";
import { NarrativeGraphRunner } from "../graph/agentGraph.js";
import {
  AlertService,
  ConsoleNotifier,
  DiscordNotifier,
  TelegramNotifierStub
} from "../services/AlertService.js";
import { ClusteringService } from "../services/ClusteringService.js";
import { DeterministicEmbeddingProvider } from "../services/DeterministicEmbeddingProvider.js";
import { InMemoryVectorStore } from "../services/InMemoryVectorStore.js";
import { createLlmClient } from "../services/MultiProviderLlmClient.js";
import { NarrativeLifecycleService } from "../services/NarrativeLifecycleService.js";
import { ScoringService } from "../services/ScoringService.js";
import { SentimentService } from "../services/SentimentService.js";
import type { NarrativeRepository } from "../types/ports.js";
import type { Notifier } from "../types/ports.js";

export type RuntimeOptions = {
  config?: Partial<AppConfig>;
  repository?: NarrativeRepository;
  databasePath?: string;
  enableConsoleAlerts?: boolean;
  llmProvider?: ProviderSecretConfig;
  notifications?: NotificationConfig;
  langSmith?: LangSmithConfig;
  notifiers?: Notifier[];
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
  const langSmith = options.langSmith ?? readLangSmithConfigFromEnv();
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
  const notifications = options.notifications ?? readNotificationConfigFromEnv();
  const notifiers =
    options.notifiers ??
    buildNotifiers({
      enableConsoleAlerts: options.enableConsoleAlerts,
      notifications
    });
  const alerts = new AlertService(notifiers);

  return new NarrativeGraphRunner(
    {
      config,
      clustering,
      lifecycle,
      scoring,
      repository,
      alerts
    },
    langSmith
  );
};

const buildNotifiers = (options: {
  enableConsoleAlerts?: boolean | undefined;
  notifications: NotificationConfig;
}): Notifier[] => {
  const notifiers: Notifier[] = [];
  if (options.enableConsoleAlerts !== false) {
    notifiers.push(new ConsoleNotifier());
  }
  notifiers.push(new TelegramNotifierStub());
  if (options.notifications.discordWebhookUrl) {
    notifiers.push(
      new DiscordNotifier({
        webhookUrl: options.notifications.discordWebhookUrl,
        username: options.notifications.discordUsername,
        avatarUrl: options.notifications.discordAvatarUrl
      })
    );
  }
  return notifiers;
};
