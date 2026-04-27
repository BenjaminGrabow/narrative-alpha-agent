import { ReplayEngine } from "../backtest/ReplayEngine.js";
import { demoDataset, demoTimeline } from "../backtest/demoDataset.js";
import { formatReplay } from "../backtest/formatReplay.js";
import { createRuntime } from "../agents/createRuntime.js";

const runner = createRuntime({
  databasePath: ":memory:",
  enableConsoleAlerts: true
});
const replay = new ReplayEngine(runner);
const snapshots = await replay.replay(demoDataset, demoTimeline);

console.log(formatReplay(snapshots));
