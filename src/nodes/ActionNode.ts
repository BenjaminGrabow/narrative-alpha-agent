import type { AppConfig } from "../config/defaults.js";
import type { AlertService } from "../services/AlertService.js";
import type { GraphState, GraphUpdate } from "../graph/state.js";

export class ActionNode {
  constructor(
    private readonly alerts: AlertService,
    private readonly config: AppConfig
  ) {}

  async run(state: GraphState): Promise<GraphUpdate> {
    const triggered = state.narratives.filter(
      (narrative) =>
        narrative.nipScore > this.config.actionThreshold && narrative.state === "accelerating"
    );

    await Promise.all(triggered.map((narrative) => this.alerts.emitAlert(narrative)));

    return {
      logs: [
        triggered.length > 0
          ? `ActionNode emitted ${triggered.length} alerts`
          : "ActionNode emitted no alerts"
      ]
    };
  }
}
