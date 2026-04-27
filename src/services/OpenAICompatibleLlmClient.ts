import type { LlmClient, LlmMessage } from "../types/ports.js";

export type OpenAICompatibleOptions = {
  baseUrl?: string | undefined;
  apiKey?: string | undefined;
  model?: string | undefined;
  providerName?: string | undefined;
  defaultHeaders?: Record<string, string> | undefined;
  fetchFn?: typeof fetch | undefined;
};

export class OpenAICompatibleLlmClient implements LlmClient {
  constructor(private readonly options: OpenAICompatibleOptions = {}) {}

  async complete(messages: LlmMessage[]): Promise<string> {
    if (!this.options.apiKey || !this.options.baseUrl) {
      const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
      return latestUserMessage?.content.slice(0, 240) ?? "";
    }

    const fetchFn = this.options.fetchFn ?? fetch;
    const response = await fetchFn(`${this.options.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        ...this.options.defaultHeaders,
        "content-type": "application/json",
        authorization: `Bearer ${this.options.apiKey}`
      },
      body: JSON.stringify({
        model: this.options.model ?? "gpt-4o-mini",
        messages,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(
        `${this.options.providerName ?? "OpenAI-compatible"} LLM request failed with status ${response.status}`
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return payload.choices?.[0]?.message?.content ?? "";
  }
}
