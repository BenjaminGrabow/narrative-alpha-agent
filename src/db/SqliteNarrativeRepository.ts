import Database from "better-sqlite3";
import type { Narrative } from "../types/domain.js";
import type { NarrativeRepository } from "../types/ports.js";

type NarrativeRow = {
  id: string;
  name: string;
  description: string;
  created_at: number;
  updated_at: number;
  state: Narrative["state"];
  documents_json: string;
  metrics_json: string;
  nip_score: number;
};

export class SqliteNarrativeRepository implements NarrativeRepository {
  private readonly db: Database.Database;

  constructor(path = "naa.sqlite") {
    this.db = new Database(path);
  }

  initialize(): void {
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS narratives (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          state TEXT NOT NULL,
          documents_json TEXT NOT NULL,
          metrics_json TEXT NOT NULL,
          nip_score REAL NOT NULL
        )`
      )
      .run();
  }

  saveNarratives(narratives: Narrative[]): void {
    const statement = this.db.prepare(
      `INSERT INTO narratives (
        id, name, description, created_at, updated_at, state, documents_json, metrics_json, nip_score
      ) VALUES (
        @id, @name, @description, @createdAt, @updatedAt, @state, @documentsJson, @metricsJson, @nipScore
      )
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        updated_at = excluded.updated_at,
        state = excluded.state,
        documents_json = excluded.documents_json,
        metrics_json = excluded.metrics_json,
        nip_score = excluded.nip_score`
    );

    const transaction = this.db.transaction((items: Narrative[]) => {
      for (const narrative of items) {
        statement.run({
          id: narrative.id,
          name: narrative.name,
          description: narrative.description,
          createdAt: narrative.createdAt,
          updatedAt: narrative.updatedAt,
          state: narrative.state,
          documentsJson: JSON.stringify(narrative.documents),
          metricsJson: JSON.stringify(narrative.metrics),
          nipScore: narrative.nipScore
        });
      }
    });

    transaction(narratives);
  }

  loadNarratives(upToTimestamp?: number): Narrative[] {
    const rows =
      upToTimestamp === undefined
        ? this.db.prepare("SELECT * FROM narratives ORDER BY created_at ASC").all()
        : this.db
            .prepare("SELECT * FROM narratives WHERE created_at <= ? ORDER BY created_at ASC")
            .all(upToTimestamp);

    return (rows as NarrativeRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      state: row.state,
      documents: JSON.parse(row.documents_json) as string[],
      metrics: JSON.parse(row.metrics_json) as Narrative["metrics"],
      nipScore: row.nip_score
    }));
  }

  clear(): void {
    this.initialize();
    this.db.prepare("DELETE FROM narratives").run();
  }
}
