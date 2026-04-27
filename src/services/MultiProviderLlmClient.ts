import type { ProviderSecretConfig } from "../config/secrets.js";
import type { LlmClient, LlmMessage } from "../types/ports.js";
import { OpenAICompatibleLlmClient } from "./OpenAICompatibleLlmClient.js";

type FetchLike = typeof fetch;

export class LocalEchoLlmClient implements LlmClient {
  async complete(messages: LlmMessage[]): Promise<string> {
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
    return latestUserMessage?.content.slice(0, 240) ?? "";
  }
}

export class AnthropicLlmClient implements LlmClient {
  constructor(
    private readonly options: {
      apiKey?: string | undefined;
      model?: string | undefined;
      fetchFn?: FetchLike | undefined;
    }
  ) {}

  async complete(messages: LlmMessage[]): Promise<string> {
    if (!this.options.apiKey) {
      return new LocalEchoLlmClient().complete(messages);
    }

    const system = messages.find((message) => message.role === "system")?.content;
    const anthropicMessages = messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content
      }));
    const fetchFn = this.options.fetchFn ?? fetch;
    const response = await fetchFn("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.options.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.options.model ?? "claude-3-5-haiku-latest",
        max_tokens: 1024,
        system,
        messages: anthropicMessages
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic LLM request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    return payload.content?.find((item) => item.type === "text")?.text ?? "";
  }
}

export class GeminiLlmClient implements LlmClient {
  constructor(
    private readonly options: {
      apiKey?: string | undefined;
      model?: string | undefined;
      fetchFn?: FetchLike | undefined;
    }
  ) {}

  async complete(messages: LlmMessage[]): Promise<string> {
    if (!this.options.apiKey) {
      return new LocalEchoLlmClient().complete(messages);
    }

    const model = this.options.model ?? "gemini-1.5-flash";
    const fetchFn = this.options.fetchFn ?? fetch;
    const response = await fetchFn(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(this.options.apiKey)}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          contents: messages
            .filter((message) => message.role !== "system")
            .map((message) => ({
              role: message.role === "assistant" ? "model" : "user",
              parts: [{ text: message.content }]
            })),
          systemInstruction: {
            parts: messages
              .filter((message) => message.role === "system")
              .map((message) => ({ text: message.content }))
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Google Gemini LLM request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
}

export class CohereLlmClient implements LlmClient {
  constructor(
    private readonly options: {
      apiKey?: string | undefined;
      model?: string | undefined;
      fetchFn?: FetchLike | undefined;
    }
  ) {}

  async complete(messages: LlmMessage[]): Promise<string> {
    if (!this.options.apiKey) {
      return new LocalEchoLlmClient().complete(messages);
    }

    const fetchFn = this.options.fetchFn ?? fetch;
    const response = await fetchFn("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.options.apiKey}`
      },
      body: JSON.stringify({
        model: this.options.model ?? "command-r",
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`Cohere LLM request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      message?: { content?: Array<{ text?: string }> };
      text?: string;
    };
    return payload.message?.content?.[0]?.text ?? payload.text ?? "";
  }
}

export class AzureOpenAILlmClient implements LlmClient {
  constructor(
    private readonly options: {
      endpoint?: string | undefined;
      apiKey?: string | undefined;
      deployment?: string | undefined;
      apiVersion?: string | undefined;
      fetchFn?: FetchLike | undefined;
    }
  ) {}

  async complete(messages: LlmMessage[]): Promise<string> {
    if (!this.options.apiKey || !this.options.endpoint || !this.options.deployment) {
      return new LocalEchoLlmClient().complete(messages);
    }

    const endpoint = this.options.endpoint.replace(/\/$/, "");
    const apiVersion = this.options.apiVersion ?? "2024-10-21";
    const fetchFn = this.options.fetchFn ?? fetch;
    const response = await fetchFn(
      `${endpoint}/openai/deployments/${encodeURIComponent(this.options.deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "api-key": this.options.apiKey
        },
        body: JSON.stringify({
          messages,
          temperature: 0.1
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Azure OpenAI LLM request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return payload.choices?.[0]?.message?.content ?? "";
  }
}

export const createLlmClient = (
  config: ProviderSecretConfig,
  options: { fetchFn?: FetchLike | undefined } = {}
): LlmClient => {
  switch (config.provider) {
    case "local":
      return new LocalEchoLlmClient();
    case "anthropic":
      return new AnthropicLlmClient({
        apiKey: config.apiKey,
        model: config.model,
        fetchFn: options.fetchFn
      });
    case "google":
      return new GeminiLlmClient({
        apiKey: config.apiKey,
        model: config.model,
        fetchFn: options.fetchFn
      });
    case "cohere":
      return new CohereLlmClient({
        apiKey: config.apiKey,
        model: config.model,
        fetchFn: options.fetchFn
      });
    case "azure-openai":
      return new AzureOpenAILlmClient({
        endpoint: config.baseUrl,
        apiKey: config.apiKey,
        deployment: config.azureDeployment,
        apiVersion: config.azureApiVersion,
        fetchFn: options.fetchFn
      });
    case "openrouter":
      return new OpenAICompatibleLlmClient({
        providerName: "OpenRouter",
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model,
        fetchFn: options.fetchFn,
        defaultHeaders: openRouterHeaders(config)
      });
    case "openai":
    case "deepseek":
    case "mistral":
    case "groq":
    case "together":
    case "xai":
    case "custom-openai-compatible":
      return new OpenAICompatibleLlmClient({
        providerName: config.provider,
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model,
        fetchFn: options.fetchFn
      });
  }
};

const openRouterHeaders = (config: ProviderSecretConfig): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (config.appUrl) {
    headers["HTTP-Referer"] = config.appUrl;
  }
  if (config.appName) {
    headers["X-Title"] = config.appName;
  }
  return headers;
};
