import type { Narrative } from "../types/domain.js";
import type { NarrativeRepository } from "../types/ports.js";

export class InMemoryNarrativeRepository implements NarrativeRepository {
  private narratives = new Map<string, Narrative>();

  initialize(): void {
    return;
  }

  saveNarratives(narratives: Narrative[]): void {
    for (const narrative of narratives) {
      this.narratives.set(narrative.id, narrative);
    }
  }

  loadNarratives(upToTimestamp?: number): Narrative[] {
    return [...this.narratives.values()]
      .filter((narrative) => upToTimestamp === undefined || narrative.createdAt <= upToTimestamp)
      .sort((left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id));
  }

  clear(): void {
    this.narratives.clear();
  }
}
