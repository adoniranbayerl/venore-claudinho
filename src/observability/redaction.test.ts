import { describe, expect, it } from "vitest";
import { redactDetail, redactText } from "./redaction";

describe("redactText", () => {
  it("redacts email addresses", () => {
    expect(redactText('Usuário "joao.silva@example.com" não encontrado.')).toBe(
      'Usuário "[REDACTED_EMAIL]" não encontrado.',
    );
  });

  it("redacts bearer tokens", () => {
    expect(redactText("Authorization: Bearer abc123.def456-ghi")).toBe("Authorization: Bearer [REDACTED]");
  });

  it("redacts jwt-shaped strings", () => {
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
    expect(redactText(`token=${jwt}`)).not.toContain(jwt);
  });

  it("redacts key=value pairs for common secret keys", () => {
    expect(redactText("password=hunter2 falhou")).toBe("password=[REDACTED] falhou");
    expect(redactText("token: abcdef123")).toBe("token=[REDACTED]");
  });

  it("leaves ordinary text untouched", () => {
    expect(redactText('Papel "admin" não encontrado.')).toBe('Papel "admin" não encontrado.');
  });
});

describe("redactDetail", () => {
  it("replaces sensitive keys entirely, regardless of value type", () => {
    expect(redactDetail({ password: "hunter2", userId: "u1" })).toEqual({
      password: "[REDACTED]",
      userId: "u1",
    });
  });

  it("redacts email/tokens embedded in string values of non-sensitive keys", () => {
    expect(redactDetail({ message: "contato: joao@example.com" })).toEqual({
      message: "contato: [REDACTED_EMAIL]",
    });
  });

  it("recurses into nested objects", () => {
    expect(redactDetail({ user: { email: "joao@example.com", token: "abc" } })).toEqual({
      user: { email: "[REDACTED_EMAIL]", token: "[REDACTED]" },
    });
  });

  it("leaves arrays and primitives that are not sensitive untouched", () => {
    expect(redactDetail({ ids: ["a", "b"], count: 2, active: true })).toEqual({
      ids: ["a", "b"],
      count: 2,
      active: true,
    });
  });
});
