import { describe, expect, it } from "vitest";
import { decodeCsvBytes } from "./decode-csv-bytes";

describe("decodeCsvBytes", () => {
  it("decodifica arquivo em ISO-8859-1 preservando acentuação", () => {
    const latin1Bytes = Buffer.from("Nome completo,Mês,Dia\nJoão Antônio,3,15\n", "latin1");

    const result = decodeCsvBytes(latin1Bytes);

    expect(result.encoding).toBe("iso-8859-1");
    expect(result.text).toContain("João Antônio");
    expect(result.text).toContain("Mês");
  });

  it("decodifica arquivo em UTF-8 normalmente", () => {
    const utf8Bytes = Buffer.from("Nome completo,Mês,Dia\nJoão Antônio,3,15\n", "utf-8");

    const result = decodeCsvBytes(utf8Bytes);

    expect(result.encoding).toBe("utf-8");
    expect(result.text).toContain("João Antônio");
  });

  it("remove BOM de arquivo UTF-8 com marca de ordem de bytes", () => {
    const withBom = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from("Nome completo,Mês,Dia\n", "utf-8")]);

    const result = decodeCsvBytes(withBom);

    expect(result.encoding).toBe("utf-8");
    expect(result.text.startsWith("Nome completo")).toBe(true);
  });
});
