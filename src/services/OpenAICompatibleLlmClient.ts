import type { LlmClient, LlmMessage } from "../types/ports.js";

export type OpenAICompatibleOptions = {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
};

export class OpenAICompatibleLlmClient implements LlmClient {
  constructor(private readonly options: OpenAICompatibleOptions = {}) {}

  async complete(messages: LlmMessage[]): Promise<string> {
    if (!this.options.apiKey || !this.options.baseUrl) {
      const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
      return latestUserMessage?.content.slice(0, 240) ?? "";
    }

    const response = await fetch(`${this.options.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
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
      throw new Error(`LLM request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return payload.choices?.[0]?.message?.content ?? "";
  }
}
