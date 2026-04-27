import { describe, expect, it } from "vitest";
import { readLangSmithConfigFromEnv } from "../src/config/observability.js";

describe("LangSmith observability configuration", () => {
  it("defaults tracing off with stable project metadata", () => {
    const config = readLangSmithConfigFromEnv({});

    expect(config.tracingEnabled).toBe(false);
    expect(config.project).toBe("narrative-alpha-agent");
    expect(config.tags).toContain("langgraph");
  });

  it("reads LangSmith tracing settings from env", () => {
    const config = readLangSmithConfigFromEnv({
      LANGSMITH_TRACING: "true",
      LANGSMITH_API_KEY: "lsv2_test",
      LANGSMITH_PROJECT: "naa-prod",
      LANGSMITH_RUN_NAME: "naa-live",
      LANGSMITH_TAGS: "prod,alpha"
    });

    expect(config.tracingEnabled).toBe(true);
    expect(config.apiKey).toBe("lsv2_test");
    expect(config.project).toBe("naa-prod");
    expect(config.runName).toBe("naa-live");
    expect(config.tags).toEqual(["prod", "alpha"]);
  });
});
