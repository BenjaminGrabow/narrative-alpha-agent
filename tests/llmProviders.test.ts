import { describe, expect, it } from "vitest";
import { readProviderConfigFromEnv } from "../src/config/secrets.js";
import { createLlmClient, LocalEchoLlmClient } from "../src/services/MultiProviderLlmClient.js";
import { OpenAICompatibleLlmClient } from "../src/services/OpenAICompatibleLlmClient.js";

describe("LLM provider configuration", () => {
  it("defaults to the local deterministic provider", () => {
    const config = readProviderConfigFromEnv({});
    const client = createLlmClient(config);

    expect(config.provider).toBe("local");
    expect(client).toBeInstanceOf(LocalEchoLlmClient);
  });

  it("configures DeepSeek as an OpenAI-compatible provider", () => {
    const config = readProviderConfigFromEnv({
      NAA_LLM_PROVIDER: "deepseek",
      DEEPSEEK_API_KEY: "test-key",
      DEEPSEEK_MODEL: "deepseek-chat"
    });
    const client = createLlmClient(config);

    expect(config.baseUrl).toBe("https://api.deepseek.com");
    expect(config.model).toBe("deepseek-chat");
    expect(client).toBeInstanceOf(OpenAICompatibleLlmClient);
  });

  it("rejects unsupported providers", () => {
    expect(() => readProviderConfigFromEnv({ NAA_LLM_PROVIDER: "unknown-ai" })).toThrow(
      "Unsupported NAA_LLM_PROVIDER"
    );
  });
});
