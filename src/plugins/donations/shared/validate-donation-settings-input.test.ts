import { describe, expect, it } from "vitest";
import { validateDonationSettingsInput, type DonationSettingsFormInput } from "./validate-donation-settings-input";
import { DONATIONS_SETTINGS } from "./settings";

// Deriva o input válido a partir dos próprios defaults de DONATIONS_SETTINGS (mesma fonte que o
// código de produção usa) — qualquer campo novo entra automaticamente, sem precisar lembrar de
// atualizar este objeto a cada settings novo. pixKey/recipientName/recipientCity não têm default
// real (ficam "" até o admin configurar), então são sobrescritos aqui pra passar na validação.
const validInput: DonationSettingsFormInput = {
  ...(Object.fromEntries(
    Object.entries(DONATIONS_SETTINGS).map(([field, def]) => [
      field,
      field === "suggestedAmounts" ? (def.defaultValue as unknown as number[]).join(", ") : (def.defaultValue as string),
    ]),
  ) as DonationSettingsFormInput),
  pixKey: "doacoes@example.org",
  recipientName: "Instituto Exemplo",
  recipientCity: "Curitiba",
};

describe("validateDonationSettingsInput", () => {
  it("accepts a valid input and trims/parses fields", () => {
    const result = validateDonationSettingsInput(validInput);
    expect(result.error).toBeNull();
    if (result.error === null) {
      expect(result.data.suggestedAmounts).toEqual([20, 50, 100]);
    }
  });

  it("rejects an empty PIX key", () => {
    const result = validateDonationSettingsInput({ ...validInput, pixKey: "  " });
    expect(result.error?.code).toBe("donations.invalid_pix_key");
  });

  it("rejects a PIX key over the EMV field limit", () => {
    const result = validateDonationSettingsInput({ ...validInput, pixKey: "a".repeat(78) });
    expect(result.error?.code).toBe("donations.invalid_pix_key");
  });

  it("rejects a recipient name over 25 chars", () => {
    const result = validateDonationSettingsInput({ ...validInput, recipientName: "a".repeat(26) });
    expect(result.error?.code).toBe("donations.invalid_recipient_name");
  });

  it("rejects a recipient city over 15 chars", () => {
    const result = validateDonationSettingsInput({ ...validInput, recipientCity: "a".repeat(16) });
    expect(result.error?.code).toBe("donations.invalid_recipient_city");
  });

  it("rejects suggested amounts with a non-positive value", () => {
    const result = validateDonationSettingsInput({ ...validInput, suggestedAmounts: "20, -5, 100" });
    expect(result.error?.code).toBe("donations.invalid_suggested_amounts");
  });

  it("rejects suggested amounts with garbage text", () => {
    const result = validateDonationSettingsInput({ ...validInput, suggestedAmounts: "20, abc" });
    expect(result.error?.code).toBe("donations.invalid_suggested_amounts");
  });

  it("accepts an empty suggested amounts list", () => {
    const result = validateDonationSettingsInput({ ...validInput, suggestedAmounts: "" });
    expect(result.error).toBeNull();
    if (result.error === null) {
      expect(result.data.suggestedAmounts).toEqual([]);
    }
  });

  it("rejects an empty title", () => {
    const result = validateDonationSettingsInput({ ...validInput, title: "  " });
    expect(result.error?.code).toBe("donations.invalid_title");
  });

  it("rejects an empty Academy text field", () => {
    const result = validateDonationSettingsInput({ ...validInput, academyCatalogTitle: "  " });
    expect(result.error?.code).toBe("donations.invalid_academyCatalogTitle");
  });

  it("rejects an empty widget copy field", () => {
    const result = validateDonationSettingsInput({ ...validInput, copyLabelFull: "  " });
    expect(result.error?.code).toBe("donations.invalid_copyLabelFull");
  });

  it("trims text fields", () => {
    const result = validateDonationSettingsInput({ ...validInput, academyCtaLabel: "  Apoiar agora  " });
    expect(result.error).toBeNull();
    if (result.error === null) {
      expect(result.data.academyCtaLabel).toBe("Apoiar agora");
    }
  });
});
