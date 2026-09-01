import { describe, expect, it } from "vitest";
import { resolveNotificationRecipients } from "./notify-recipients";

// Parte pura de shared/notify.ts (§2.3): destinatários = união de queue_members da fila + assignee
// + requester_user_id, deduplicado, nunca o autor da ação.
describe("resolveNotificationRecipients", () => {
  const base = {
    queueMemberUserIds: ["manager-1", "agent-1", "agent-2"],
    assigneeUserId: "agent-1",
    requesterUserId: "requester-1",
  };

  it("une as três fontes quando todas as audiências são pedidas", () => {
    const recipients = resolveNotificationRecipients({
      ...base,
      audiences: ["queue", "assignee", "requester"],
      actorUserId: "outsider",
    });
    expect(recipients.sort()).toEqual(["agent-1", "agent-2", "manager-1", "requester-1"]);
  });

  it("deduplica quem aparece em mais de uma fonte (assignee também é membro da fila)", () => {
    const recipients = resolveNotificationRecipients({
      ...base,
      audiences: ["queue", "assignee"],
      actorUserId: null,
    });
    // agent-1 é assignee E membro da fila — aparece uma vez só.
    expect(recipients.filter((id) => id === "agent-1")).toHaveLength(1);
    expect(recipients).toHaveLength(3);
  });

  it("nunca inclui o autor da ação, mesmo que ele seja membro/assignee/requester", () => {
    const recipients = resolveNotificationRecipients({
      ...base,
      audiences: ["queue", "assignee", "requester"],
      actorUserId: "agent-1",
    });
    expect(recipients).not.toContain("agent-1");
    expect(recipients.sort()).toEqual(["agent-2", "manager-1", "requester-1"]);
  });

  it("respeita a audiência pedida — só a fila", () => {
    const recipients = resolveNotificationRecipients({
      ...base,
      audiences: ["queue"],
      actorUserId: "requester-1",
    });
    expect(recipients.sort()).toEqual(["agent-1", "agent-2", "manager-1"]);
  });

  it("só o assignee", () => {
    const recipients = resolveNotificationRecipients({
      ...base,
      audiences: ["assignee"],
      actorUserId: "manager-1",
    });
    expect(recipients).toEqual(["agent-1"]);
  });

  it("só o solicitante, e vazio quando o solicitante é o próprio autor", () => {
    expect(
      resolveNotificationRecipients({ ...base, audiences: ["requester"], actorUserId: "manager-1" }),
    ).toEqual(["requester-1"]);
    expect(
      resolveNotificationRecipients({ ...base, audiences: ["requester"], actorUserId: "requester-1" }),
    ).toEqual([]);
  });

  it("ignora assignee/requester nulos", () => {
    const recipients = resolveNotificationRecipients({
      queueMemberUserIds: ["manager-1"],
      assigneeUserId: null,
      requesterUserId: null,
      audiences: ["queue", "assignee", "requester"],
      actorUserId: null,
    });
    expect(recipients).toEqual(["manager-1"]);
  });

  it("chamado anônimo sem membros na fila e sem requester → nenhum destinatário", () => {
    const recipients = resolveNotificationRecipients({
      queueMemberUserIds: [],
      assigneeUserId: null,
      requesterUserId: null,
      audiences: ["queue", "assignee", "requester"],
      actorUserId: null,
    });
    expect(recipients).toEqual([]);
  });
});
