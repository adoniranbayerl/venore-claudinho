import { describe, expect, it } from "vitest";
import { buildBoardFeed } from "./board-feed";
import type { TicketListItem } from "../contracts/types";

function ticket(overrides: Partial<TicketListItem>): TicketListItem {
  return {
    id: "t",
    reference: "ti-1",
    queueId: "q1",
    queueName: "TI",
    seq: 1,
    title: "Algo",
    status: "open",
    priority: "normal",
    categoryLabel: null,
    location: null,
    assigneeUserId: null,
    requesterUserId: null,
    slaDueAt: null,
    slaState: "none",
    createdAt: new Date("2026-09-01T12:00:00Z"),
    updatedAt: new Date("2026-09-01T12:00:00Z"),
    ...overrides,
  };
}

const NOW = new Date("2026-09-01T14:00:00Z");

describe("buildBoardFeed", () => {
  it("kanban: uma coluna por status na ordem fixa, contadores sobre todo o escopo", () => {
    const feed = buildBoardFeed({
      label: "TV",
      layout: "kanban",
      queueName: null,
      showAssignee: true,
      refreshSeconds: 20,
      assigneeNameById: {},
      now: NOW,
      tickets: [
        ticket({ id: "a", status: "open" }),
        ticket({ id: "b", status: "in_progress" }),
        ticket({ id: "c", status: "waiting" }),
        ticket({ id: "d", status: "resolved" }),
        ticket({ id: "e", status: "open" }),
      ],
    });

    expect(feed.columns.map((c) => c.key)).toEqual(["open", "in_progress", "waiting", "resolved"]);
    expect(feed.columns[0].tickets).toHaveLength(2);
    expect(feed.counts).toEqual({ open: 2, inProgress: 1, waiting: 1, resolved: 1, total: 5 });
  });

  it("open_list: só os pendentes (sem resolvido), ordenados por prioridade e depois idade", () => {
    const feed = buildBoardFeed({
      label: "Oficina",
      layout: "open_list",
      queueName: "Manutenção",
      showAssignee: false,
      refreshSeconds: 30,
      assigneeNameById: {},
      now: NOW,
      tickets: [
        ticket({ id: "old-normal", status: "open", priority: "normal", createdAt: new Date("2026-09-01T08:00:00Z") }),
        ticket({ id: "new-urgent", status: "in_progress", priority: "urgent", createdAt: new Date("2026-09-01T13:30:00Z") }),
        ticket({ id: "old-urgent", status: "open", priority: "urgent", createdAt: new Date("2026-09-01T09:00:00Z") }),
        ticket({ id: "resolved", status: "resolved", priority: "high" }),
      ],
    });

    expect(feed.columns).toHaveLength(1);
    expect(feed.columns[0].key).toBe("pending");
    expect(feed.columns[0].tickets.map((t) => t.id)).toEqual(["old-urgent", "new-urgent", "old-normal"]);
  });

  it("resolve o nome do responsável só quando showAssignee e o mapa tem a entrada", () => {
    const base = {
      label: "TV",
      layout: "kanban" as const,
      queueName: null,
      refreshSeconds: 20,
      now: NOW,
      tickets: [ticket({ id: "a", assigneeUserId: "u1" }), ticket({ id: "b", assigneeUserId: "ghost" })],
    };

    const shown = buildBoardFeed({ ...base, showAssignee: true, assigneeNameById: { u1: "Ana" } });
    const cards = shown.columns[0].tickets;
    expect(cards.find((c) => c.id === "a")?.assigneeName).toBe("Ana");
    expect(cards.find((c) => c.id === "b")?.assigneeName).toBeNull();

    const hidden = buildBoardFeed({ ...base, showAssignee: false, assigneeNameById: {} });
    expect(hidden.columns[0].tickets.every((c) => c.assigneeName === null)).toBe(true);
  });

  it("calcula ageMinutes a partir de createdAt e now", () => {
    const feed = buildBoardFeed({
      label: "TV",
      layout: "kanban",
      queueName: null,
      showAssignee: true,
      refreshSeconds: 20,
      assigneeNameById: {},
      now: NOW,
      tickets: [ticket({ id: "a", createdAt: new Date("2026-09-01T13:00:00Z") })],
    });
    expect(feed.columns[0].tickets[0].ageMinutes).toBe(60);
    expect(feed.generatedAt).toBe(NOW.toISOString());
  });
});
