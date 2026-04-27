import type { ReplaySnapshot } from "./ReplayEngine.js";

export const formatReplay = (snapshots: ReplaySnapshot[]): string => {
  const lines: string[] = [];

  for (const snapshot of snapshots) {
    lines.push(`\n=== t=${snapshot.timestamp} ===`);
    for (const narrative of snapshot.state.narratives) {
      lines.push(
        `${narrative.name} | state=${narrative.state} | NIP=${narrative.nipScore.toFixed(3)} | docs=${narrative.documents.length}`
      );
    }
    for (const log of snapshot.state.logs.slice(-8)) {
      lines.push(`log: ${log}`);
    }
  }

  return lines.join("\n").trimStart();
};
