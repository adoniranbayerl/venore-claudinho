import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCache, setCache } from "../../../../../infrastructure/cache/memory-cache";
import type { BlockDefinition } from "../../../contracts/block-definition";

const buttonDefinition: BlockDefinition = {
  key: "core.content.button",
  label: "Botão",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { label: "Saiba mais", href: "", variant: "default" },
  editorFields: [],
  requiredDataFields: ["href"],
  missingConfigMessage: "Sem link definido",
};

function resolveDefinition(key: string): BlockDefinition | null {
  return key === "core.content.button" ? buttonDefinition : null;
}

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findEntryById = vi.fn();
const markEntryPublished = vi.fn();

vi.mock("./store", () => ({
  findEntryById: (...args: unknown[]) => findEntryById(...args),
  markEntryPublished: (...args: unknown[]) => markEntryPublished(...args),
}));

describe("publishEntry", () => {
  beforeEach(() => {
    findEntryById.mockReset();
    markEntryPublished.mockReset();
  });

  it("publishes an existing entry and invalidates the published-entries cache", async () => {
    findEntryById.mockResolvedValue({ id: "entry-1", status: "draft" });
    markEntryPublished.mockResolvedValue({ id: "entry-1", status: "published" });
    setCache("cms:entries:published:*:*", [{ id: "stale" }], 60);

    const { publishEntry } = await import("./service");
    const result = await publishEntry({ id: "entry-1", resolveDefinition, actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "entry-1", status: "published" } });
    expect(getCache("cms:entries:published:*:*")).toBeNull();
  });

  it("fails when the entry does not exist", async () => {
    findEntryById.mockResolvedValue(null);

    const { publishEntry } = await import("./service");
    const result = await publishEntry({ id: "missing", resolveDefinition, actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.entries.not_found", message: expect.any(String) },
    });
    expect(markEntryPublished).not.toHaveBeenCalled();
  });

  it("fails and lists every unconfigured block instead of publishing", async () => {
    findEntryById.mockResolvedValue({
      id: "entry-1",
      status: "draft",
      data: {
        blocks: [
          { id: "b1", key: "core.content.button", slot: "", data: { href: "" }, areas: [] },
          { id: "b2", key: "core.content.button", slot: "", data: { href: "/ok" }, areas: [] },
        ],
      },
    });

    const { publishEntry } = await import("./service");
    const result = await publishEntry({ id: "entry-1", resolveDefinition, actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("cms.entries.publish_validation_failed");
      expect(result.error.message).toContain("Sem link definido");
    }
    expect(markEntryPublished).not.toHaveBeenCalled();
  });

  it("qualifies the problem with row/column when the unconfigured block sits in a hidden column", async () => {
    findEntryById.mockResolvedValue({
      id: "entry-1",
      status: "draft",
      data: {
        blocks: [
          {
            id: "row-1",
            key: "core.layout.row",
            slot: "",
            data: { columns: 2 },
            areas: [
              { key: "col-1", blocks: [] },
              { key: "col-2", blocks: [] },
              {
                key: "col-3",
                blocks: [{ id: "b1", key: "core.content.button", slot: "", data: { href: "" }, areas: [] }],
              },
            ],
          },
        ],
      },
    });

    const { publishEntry } = await import("./service");
    const result = await publishEntry({ id: "entry-1", resolveDefinition, actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe("Linha 1, coluna 3 (oculta): Botão: Sem link definido");
    }
    expect(markEntryPublished).not.toHaveBeenCalled();
  });
});
