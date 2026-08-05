import { describe, expect, it } from "vitest";
import { buildPixBrCodePayload, computeCrc16, normalizeMerchantText } from "./pix-br-code";

// Parser mínimo só pro teste — evita asserção por substring "54" (poderia falsear se o CRC hex
// calculado tivesse "54" por coincidência, já que CRC usa dígitos 0-9A-F).
function parseTlvFields(payload: string): Map<string, string> {
  const fields = new Map<string, string>();
  let cursor = 0;
  while (cursor < payload.length - 4) {
    const id = payload.slice(cursor, cursor + 2);
    const length = Number(payload.slice(cursor + 2, cursor + 4));
    const value = payload.slice(cursor + 4, cursor + 4 + length);
    fields.set(id, value);
    cursor += 4 + length;
  }
  return fields;
}

describe("computeCrc16", () => {
  it("matches the official CRC-16/CCITT-FALSE check value for the ASCII test vector", () => {
    // Valor de conferência do catálogo CRC (reveng): poly 0x1021, init 0xFFFF, sem reflect,
    // xorout 0x0000, entrada "123456789" -> 0x29B1. Independente do formato PIX — garante que o
    // algoritmo em si está certo antes de testar o payload completo.
    expect(computeCrc16("123456789")).toBe("29B1");
  });
});

describe("normalizeMerchantText", () => {
  it("removes diacritics", () => {
    expect(normalizeMerchantText("São Paulo", 20)).toBe("Sao Paulo");
  });

  it("truncates after normalizing, never mid-character", () => {
    expect(normalizeMerchantText("Associação Beneficente", 10)).toBe("Associacao");
  });

  it("strips non-ASCII characters that survive NFD normalization", () => {
    expect(normalizeMerchantText("Curitiba™", 20)).toBe("Curitiba");
  });
});

describe("buildPixBrCodePayload", () => {
  const baseInput = { pixKey: "doacoes@example.org", merchantName: "Instituto Exemplo", merchantCity: "Curitiba" };

  it("produces a payload with the required EMV fields in order", () => {
    const payload = buildPixBrCodePayload(baseInput);

    expect(payload.startsWith("000201")).toBe(true); // Payload Format Indicator
    expect(payload).toContain("010211"); // Point of Initiation Method: estático
    expect(payload).toContain("br.gov.bcb.pix");
    expect(payload).toContain(baseInput.pixKey);
    expect(payload).toContain("52040000"); // Merchant Category Code
    expect(payload).toContain("5303986"); // Currency: BRL
    expect(payload).toContain("5802BR");
    expect(payload).toContain("6304"); // CRC field id + length
  });

  it("ends with a 4-char uppercase hex CRC matching the rest of the payload", () => {
    const payload = buildPixBrCodePayload(baseInput);
    const withoutCrc = payload.slice(0, -4);
    const crc = payload.slice(-4);

    expect(crc).toMatch(/^[0-9A-F]{4}$/);
    expect(computeCrc16(withoutCrc)).toBe(crc);
  });

  it("omits the amount field when no amount is given", () => {
    const fields = parseTlvFields(buildPixBrCodePayload(baseInput));
    expect(fields.has("54")).toBe(false);
  });

  it("includes a formatted amount field when an amount is given", () => {
    const fields = parseTlvFields(buildPixBrCodePayload({ ...baseInput, amount: 25 }));
    expect(fields.get("54")).toBe("25.00");
  });

  it("truncates merchant name/city to the EMV field limits", () => {
    const payload = buildPixBrCodePayload({
      ...baseInput,
      merchantName: "Instituto Beneficente Comunitário de Apoio Social",
      merchantCity: "São José dos Pinhais Metropolitana",
    });

    expect(payload).toContain(`59${(25).toString().padStart(2, "0")}`);
    expect(payload).toContain(`60${(15).toString().padStart(2, "0")}`);
  });
});
