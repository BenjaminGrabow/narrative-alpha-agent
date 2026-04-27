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

export class AlertService {
  constructor(private readonly notifiers: Notifier[]) {}

  async emitAlert(narrative: Narrative): Promise<void> {
    const message = `Narrative crossed threshold in ${narrative.state} state`;
    await Promise.all(this.notifiers.map((notifier) => notifier.notify(narrative, message)));
  }
}
