import { demoDataset } from "../backtest/demoDataset.js";
import { createRuntime } from "../agents/createRuntime.js";

const timestamp = Math.max(...demoDataset.map((document) => document.timestamp));
const runner = createRuntime({
  databasePath: "naa.sqlite",
  enableConsoleAlerts: true
});
const state = await runner.run({
  timestamp,
  documents: demoDataset,
  clusters: [],
  narratives: [],
  logs: []
});

console.log(`Ingested ${state.documents.length} documents`);
for (const narrative of state.narratives) {
  console.log(`${narrative.name}: ${narrative.state}, NIP=${narrative.nipScore.toFixed(3)}`);
}
