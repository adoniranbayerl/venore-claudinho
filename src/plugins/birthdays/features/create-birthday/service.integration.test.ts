import { describe, expect, it } from "vitest";
import { deleteUser, seedUser } from "@/test-support/integration/birthdays-seed";
import { createBirthday } from "./service";
import { listBirthdays } from "../list-birthdays/service";
import { updateBirthday } from "../update-birthday/service";
import { deleteBirthday } from "../delete-birthday/service";

// Fluxo principal do plugin, cruzando domínios (birthdays + contexts/auth para resolver o nome
// de quem criou) — por isso é teste de integração, não só unitário (AGENTS.md, "Definition of
// Done", item 6).
describe("birthdays — fluxo principal (integração)", () => {
  it("cria, aparece na listagem admin com o nome de quem criou, é editado e removido", async () => {
    const actor = await seedUser({ name: "Ana Recursos Humanos" });

    const created = await createBirthday({
      fullName: "Maria Silva",
      role: "Analista",
      month: 3,
      day: 15,
      actorId: actor.id,
    });
    expect(created.success).toBe(true);
    if (!created.success) return;

    const afterCreate = await listBirthdays();
    expect(afterCreate.success).toBe(true);
    if (!afterCreate.success) return;
    const listedAfterCreate = afterCreate.data.find((item) => item.id === created.data.id);
    expect(listedAfterCreate).toMatchObject({
      fullName: "Maria Silva",
      role: "Analista",
      locality: "Matriz",
      month: 3,
      day: 15,
      createdByUserId: actor.id,
      createdByName: "Ana Recursos Humanos",
    });

    const updated = await updateBirthday({
      birthdayId: created.data.id,
      fullName: "Maria Silva Santos",
      role: "Gerente",
      month: 4,
      day: 20,
      actorId: actor.id,
    });
    expect(updated.success).toBe(true);
    if (updated.success) {
      expect(updated.data).toMatchObject({ fullName: "Maria Silva Santos", role: "Gerente", month: 4, day: 20 });
    }

    const deleted = await deleteBirthday({ birthdayId: created.data.id, actorId: actor.id });
    expect(deleted.success).toBe(true);

    const afterDelete = await listBirthdays();
    expect(afterDelete.success).toBe(true);
    if (afterDelete.success) {
      expect(afterDelete.data.find((item) => item.id === created.data.id)).toBeUndefined();
    }
  });

  it("tolera createdByUserId órfão (usuário apagado) na listagem admin sem quebrar", async () => {
    const actor = await seedUser();
    const created = await createBirthday({ fullName: "João Souza", month: 5, day: 10, actorId: actor.id });
    expect(created.success).toBe(true);
    if (!created.success) return;

    // Simula o usuário sendo apagado depois do registro criado — sem FK, o id fica órfão
    // (schema/index.ts documenta essa decisão).
    await deleteUser(actor.id);

    const afterDelete = await listBirthdays();
    expect(afterDelete.success).toBe(true);
    if (afterDelete.success) {
      const listed = afterDelete.data.find((item) => item.id === created.data.id);
      expect(listed).toMatchObject({ createdByUserId: actor.id, createdByName: null });
    }
  });
});
