import { describe, it, expect } from "vitest";
import { runSpl, validateExercise } from "@/academy/engine/splEngine";
import { BRUTE_FORCE } from "@/academy/data/scenarios";
import type { SplExercise } from "@/academy/types";

describe("SPL Engine - Educational Splunk Search Mimic", () => {
  const events = BRUTE_FORCE.events;

  it("filters events using targeted base search", () => {
    const res = runSpl("index=auth EventCode=4625", events);
    expect(res.error).toBeUndefined();
    expect(res.rows.length).toBeGreaterThanOrEqual(42);
    expect(res.rows.every((r) => r.EventCode === 4625 || r.fields?.EventCode === 4625)).toBe(true);
  });

  it("aggregates failure counts grouped by user", () => {
    const res = runSpl("index=auth EventCode=4625 | stats count by user", events);
    expect(res.error).toBeUndefined();
    expect(res.columns).toContain("user");
    expect(res.columns).toContain("count");
    const jdoe = res.rows.find((r) => r.user === "j.doe");
    expect(jdoe).toBeDefined();
    expect(Number(jdoe?.count)).toBeGreaterThanOrEqual(40);
  });

  it("sorts rows in descending order with sort - count", () => {
    const res = runSpl("index=auth EventCode=4625 | stats count by user, src_ip | sort - count", events);
    expect(res.error).toBeUndefined();
    expect(res.rows.length).toBeGreaterThanOrEqual(2);
    const firstCount = Number(res.rows[0].count);
    const secondCount = Number(res.rows[1].count);
    expect(firstCount).toBeGreaterThanOrEqual(secondCount);
  });

  it("filters calculated aggregations using where count > 20", () => {
    const res = runSpl("index=auth EventCode=4625 | stats count by user, src_ip | where count > 20", events);
    expect(res.error).toBeUndefined();
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].user).toBe("j.doe");
    expect(Number(res.rows[0].count)).toBeGreaterThan(20);
  });

  it("validates progressive exercise correctly", () => {
    const ex: SplExercise = {
      id: "test-ex",
      title: "Test Exercise",
      task: "Test",
      solution: "index=auth EventCode=4625 | stats count by user | where count > 20",
      hints: ["h1", "h2", "h3", "h4", "h5"],
      explanation: "Exp",
      validate: {
        mustContain: ["stats", "count", "where"],
        mustProduceCols: ["user", "count"],
        minRows: 1
      }
    };

    const run = runSpl("index=auth EventCode=4625 | stats count by user | where count > 20", events);
    const validation = validateExercise(ex, "index=auth EventCode=4625 | stats count by user | where count > 20", run);
    expect(validation.ok).toBe(true);
    expect(validation.reasons.length).toBe(0);
  });
});
