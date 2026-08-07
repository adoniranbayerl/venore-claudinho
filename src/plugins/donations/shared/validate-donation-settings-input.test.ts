import { describe, expect, it } from "vitest";
import { validateDonationSettingsInput, type DonationSettingsFormInput } from "./validate-donation-settings-input";

const validInput: DonationSettingsFormInput = {
  pixKey: "doacoes@example.org",
  recipientName: "Instituto Exemplo",
  recipientCity: "Curitiba",
  suggestedAmounts: "20, 50, 100",
  title: "Faça uma doação",
  message: "Obrigado por doar.",
  academyCatalogTitle: "Este catálogo é gratuito",
  academyCourseTitle: "Gostando do curso?",
  academySidebarTitle: "Este material é gratuito",
  academyCtaLabel: "Apoiar com uma doação",
  academyLessonIntro: "Este material é gratuito para professores e autodidatas.",
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
    expect(result.error?.code).toBe("donations.invalid_academy_catalog_title");
  });

  it("trims Academy text fields", () => {
    const result = validateDonationSettingsInput({ ...validInput, academyCtaLabel: "  Apoiar agora  " });
    expect(result.error).toBeNull();
    if (result.error === null) {
      expect(result.data.academyCtaLabel).toBe("Apoiar agora");
    }
  });
});
