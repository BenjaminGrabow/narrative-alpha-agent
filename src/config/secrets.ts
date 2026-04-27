export type AiProvider =
  | "local"
  | "openai"
  | "anthropic"
  | "deepseek"
  | "openrouter"
  | "google"
  | "cohere"
  | "mistral"
  | "groq"
  | "together"
  | "xai"
  | "azure-openai"
  | "custom-openai-compatible";

export type ProviderSecretConfig = {
  provider: AiProvider;
  apiKey?: string | undefined;
  baseUrl?: string | undefined;
  model?: string | undefined;
  azureDeployment?: string | undefined;
  azureApiVersion?: string | undefined;
  appUrl?: string | undefined;
  appName?: string | undefined;
};

const providerValues = new Set<AiProvider>([
  "local",
  "openai",
  "anthropic",
  "deepseek",
  "openrouter",
  "google",
  "cohere",
  "mistral",
  "groq",
  "together",
  "xai",
  "azure-openai",
  "custom-openai-compatible"
]);

export const readProviderConfigFromEnv = (
  env: NodeJS.ProcessEnv = process.env
): ProviderSecretConfig => {
  const provider = parseProvider(env.NAA_LLM_PROVIDER);

  return {
    provider,
    apiKey: readApiKey(provider, env),
    baseUrl: readBaseUrl(provider, env),
    model: readModel(provider, env),
    azureDeployment: env.AZURE_OPENAI_DEPLOYMENT,
    azureApiVersion: env.AZURE_OPENAI_API_VERSION,
    appUrl: env.OPENROUTER_APP_URL,
    appName: env.OPENROUTER_APP_NAME
  };
};

const parseProvider = (value: string | undefined): AiProvider => {
  if (!value) {
    return "local";
  }

  const normalized = value.toLowerCase();
  if (providerValues.has(normalized as AiProvider)) {
    return normalized as AiProvider;
  }

  throw new Error(`Unsupported NAA_LLM_PROVIDER: ${value}`);
};

const readApiKey = (provider: AiProvider, env: NodeJS.ProcessEnv): string | undefined => {
  switch (provider) {
    case "openai":
      return env.OPENAI_API_KEY;
    case "anthropic":
      return env.ANTHROPIC_API_KEY;
    case "deepseek":
      return env.DEEPSEEK_API_KEY;
    case "openrouter":
      return env.OPENROUTER_API_KEY;
    case "google":
      return env.GOOGLE_API_KEY;
    case "cohere":
      return env.COHERE_API_KEY;
    case "mistral":
      return env.MISTRAL_API_KEY;
    case "groq":
      return env.GROQ_API_KEY;
    case "together":
      return env.TOGETHER_API_KEY;
    case "xai":
      return env.XAI_API_KEY;
    case "azure-openai":
      return env.AZURE_OPENAI_API_KEY;
    case "custom-openai-compatible":
      return env.CUSTOM_OPENAI_API_KEY;
    case "local":
      return undefined;
  }
};

const readBaseUrl = (provider: AiProvider, env: NodeJS.ProcessEnv): string | undefined => {
  switch (provider) {
    case "openai":
      return env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
    case "deepseek":
      return env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
    case "openrouter":
      return env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
    case "mistral":
      return env.MISTRAL_BASE_URL ?? "https://api.mistral.ai/v1";
    case "groq":
      return env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1";
    case "together":
      return env.TOGETHER_BASE_URL ?? "https://api.together.xyz/v1";
    case "xai":
      return env.XAI_BASE_URL ?? "https://api.x.ai/v1";
    case "azure-openai":
      return env.AZURE_OPENAI_ENDPOINT;
    case "custom-openai-compatible":
      return env.CUSTOM_OPENAI_BASE_URL;
    case "anthropic":
    case "google":
    case "cohere":
    case "local":
      return undefined;
  }
};

const readModel = (provider: AiProvider, env: NodeJS.ProcessEnv): string | undefined => {
  switch (provider) {
    case "openai":
      return env.OPENAI_MODEL ?? "gpt-4o-mini";
    case "anthropic":
      return env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest";
    case "deepseek":
      return env.DEEPSEEK_MODEL ?? "deepseek-chat";
    case "openrouter":
      return env.OPENROUTER_MODEL ?? "anthropic/claude-3.5-haiku";
    case "google":
      return env.GOOGLE_MODEL ?? "gemini-1.5-flash";
    case "cohere":
      return env.COHERE_MODEL ?? "command-r";
    case "mistral":
      return env.MISTRAL_MODEL ?? "mistral-small-latest";
    case "groq":
      return env.GROQ_MODEL ?? "llama-3.1-8b-instant";
    case "together":
      return env.TOGETHER_MODEL ?? "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo";
    case "xai":
      return env.XAI_MODEL ?? "grok-2-latest";
    case "azure-openai":
      return env.AZURE_OPENAI_MODEL;
    case "custom-openai-compatible":
      return env.CUSTOM_OPENAI_MODEL;
    case "local":
      return "local-deterministic";
  }
};
