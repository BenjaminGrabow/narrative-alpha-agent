import type { Narrative } from "../types/domain.js";
import type { Notifier } from "../types/ports.js";

export class ConsoleNotifier implements Notifier {
  async notify(narrative: Narrative, message: string): Promise<void> {
    console.log(`[NAA ALERT] ${narrative.name} (${narrative.nipScore.toFixed(3)}): ${message}`);
  }
}

export class TelegramNotifierStub implements Notifier {
  readonly sent: Array<{ narrativeId: string; message: string }> = [];

  async notify(narrative: Narrative, message: string): Promise<void> {
    this.sent.push({ narrativeId: narrative.id, message });
  }
}

export type DiscordNotifierOptions = {
  webhookUrl?: string | undefined;
  username?: string | undefined;
  avatarUrl?: string | undefined;
  fetchFn?: typeof fetch | undefined;
};

export class DiscordNotifier implements Notifier {
  constructor(private readonly options: DiscordNotifierOptions) {}

  async notify(narrative: Narrative, message: string): Promise<void> {
    if (!this.options.webhookUrl) {
      return;
    }

    const fetchFn = this.options.fetchFn ?? fetch;
    const response = await fetchFn(this.options.webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        username: this.options.username ?? "Narrative Alpha Agent",
        avatar_url: this.options.avatarUrl,
        embeds: [
          {
            title: narrative.name,
            description: message,
            color: colorForNarrative(narrative.nipScore),
            fields: [
              {
                name: "NIP",
                value: narrative.nipScore.toFixed(3),
                inline: true
              },
              {
                name: "State",
                value: narrative.state,
                inline: true
              },
              {
                name: "Documents",
                value: String(narrative.documents.length),
                inline: true
              }
            ],
            timestamp: new Date(narrative.updatedAt).toISOString()
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Discord webhook request failed with status ${response.status}`);
    }
  }
}

export class AlertService {
  constructor(private readonly notifiers: Notifier[]) {}

  async emitAlert(narrative: Narrative): Promise<void> {
    const message = `Narrative crossed threshold in ${narrative.state} state`;
    await Promise.all(this.notifiers.map((notifier) => notifier.notify(narrative, message)));
  }
}

const colorForNarrative = (nipScore: number): number => {
  if (nipScore >= 0.85) {
    return 0xff4d4f;
  }
  if (nipScore >= 0.7) {
    return 0xfaad14;
  }
  return 0x52c41a;
};
