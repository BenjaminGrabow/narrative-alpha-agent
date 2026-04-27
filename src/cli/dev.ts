import { ReplayEngine } from "../backtest/ReplayEngine.js";
import { demoDataset, demoTimeline } from "../backtest/demoDataset.js";
import { formatReplay } from "../backtest/formatReplay.js";
import { createRuntime } from "../agents/createRuntime.js";

console.log("Narrative Alpha Agent dev run");
const runner = createRuntime({
  databasePath: ":memory:",
  enableConsoleAlerts: true
});
const snapshots = await new ReplayEngine(runner).replay(demoDataset, demoTimeline);
console.log(formatReplay(snapshots));
