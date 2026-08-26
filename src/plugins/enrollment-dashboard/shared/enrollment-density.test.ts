import { describe, expect, it } from "vitest";
import { resolveEnrollmentRowDensity } from "./enrollment-density";

describe("resolveEnrollmentRowDensity", () => {
  it("mantém comfortable até 6 linhas na maior coluna", () => {
    expect(resolveEnrollmentRowDensity(0)).toBe("comfortable");
    expect(resolveEnrollmentRowDensity(6)).toBe("comfortable");
  });

  it("passa pra compact entre 7 e 9 linhas", () => {
    expect(resolveEnrollmentRowDensity(7)).toBe("compact");
    expect(resolveEnrollmentRowDensity(9)).toBe("compact");
  });

  it("passa pra dense a partir de 10 linhas", () => {
    expect(resolveEnrollmentRowDensity(10)).toBe("dense");
    expect(resolveEnrollmentRowDensity(40)).toBe("dense");
  });
});
