export type LangSmithConfig = {
  tracingEnabled: boolean;
  apiKey?: string | undefined;
  endpoint?: string | undefined;
  project?: string | undefined;
  workspaceId?: string | undefined;
  runName: string;
  tags: string[];
};

export const readLangSmithConfigFromEnv = (
  env: NodeJS.ProcessEnv = process.env
): LangSmithConfig => ({
  tracingEnabled: env.LANGSMITH_TRACING === "true" || env.LANGCHAIN_TRACING_V2 === "true",
  apiKey: env.LANGSMITH_API_KEY,
  endpoint: env.LANGSMITH_ENDPOINT ?? "https://api.smith.langchain.com",
  project: env.LANGSMITH_PROJECT ?? "narrative-alpha-agent",
  workspaceId: env.LANGSMITH_WORKSPACE_ID,
  runName: env.LANGSMITH_RUN_NAME ?? "narrative-alpha-agent",
  tags: parseTags(env.LANGSMITH_TAGS ?? "naa,langgraph,narrative-replay")
});

const parseTags = (value: string): string[] =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
