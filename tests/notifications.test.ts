import { describe, expect, it } from "vitest";
import { readNotificationConfigFromEnv } from "../src/config/notifications.js";
import { DiscordNotifier } from "../src/services/AlertService.js";
import type { Narrative } from "../src/types/domain.js";

const narrative: Narrative = {
  id: "narrative_1",
  name: "Agent Payments",
  description: "test",
  createdAt: 1_735_689_600_000,
  updatedAt: 1_735_696_800_000,
  state: "accelerating",
  documents: ["doc_1", "doc_2", "doc_3"],
  metrics: {
    velocity: 0.8,
    sourceDiversity: 1,
    sentiment: 0.75
  },
  nipScore: 0.86
};

describe("notification configuration", () => {
  it("reads Discord webhook settings from env", () => {
    const config = readNotificationConfigFromEnv({
      DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/test",
      DISCORD_USERNAME: "NAA",
      DISCORD_AVATAR_URL: "https://example.com/avatar.png"
    });

    expect(config.discordWebhookUrl).toBe("https://discord.com/api/webhooks/test");
    expect(config.discordUsername).toBe("NAA");
    expect(config.discordAvatarUrl).toBe("https://example.com/avatar.png");
  });

  it("posts a Discord embed when configured", async () => {
    const requests: Array<{ url: string; body: unknown }> = [];
    const notifier = new DiscordNotifier({
      webhookUrl: "https://discord.com/api/webhooks/test",
      username: "NAA",
      fetchFn: async (input, init) => {
        const body = typeof init?.body === "string" ? init.body : "";
        requests.push({
          url: input instanceof Request ? input.url : input.toString(),
          body: JSON.parse(body) as unknown
        });
        return new Response(null, { status: 204 });
      }
    });

    await notifier.notify(narrative, "Narrative crossed threshold");

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("https://discord.com/api/webhooks/test");
    expect(requests[0]?.body).toMatchObject({
      username: "NAA",
      embeds: [
        {
          title: "Agent Payments",
          description: "Narrative crossed threshold"
        }
      ]
    });
  });

  it("does nothing when Discord is not configured", async () => {
    let calls = 0;
    const notifier = new DiscordNotifier({
      fetchFn: async () => {
        calls += 1;
        return new Response(null, { status: 204 });
      }
    });

    await notifier.notify(narrative, "Narrative crossed threshold");

    expect(calls).toBe(0);
  });
});
