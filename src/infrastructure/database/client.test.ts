import { describe, expect, it } from "vitest";
import { db } from "./client";

describe("database client", () => {
  it("connects and executes a trivial query", async () => {
    const result = await db.execute("select 1");
    expect(result).toBeTruthy();
  });
});
