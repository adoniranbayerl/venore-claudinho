import path from "node:path";
import { describe, expect, it } from "vitest";
import { ESLint } from "eslint";

// Roda o ESLint real (mesma eslint.config.mjs do `npm run lint`) sobre os fixtures em
// src/plugins/_fixture-cross-*/ — que ficam em globalIgnores, por isso `ignore: false`. Prova
// executável de que a regra plugin -> plugin do boundaries/dependencies pega um import de
// arquivo interno de outro plugin (P11 da revisão), e só esse caso.
const root = process.cwd();
const eslint = new ESLint({ cwd: root, ignore: false });

async function boundaryMessages(relativePath: string) {
  const [result] = await eslint.lintFiles([path.join(root, relativePath)]);
  return result.messages.filter((message) => message.ruleId === "boundaries/dependencies");
}

describe("boundaries/dependencies — regra plugin -> plugin", () => {
  it("reporta um import de arquivo INTERNO de outro plugin", async () => {
    const messages = await boundaryMessages("src/plugins/_fixture-cross-b/imports-internal.ts");

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].message).toMatch(/interno/i);
  }, 60_000);

  it("não reporta um import do barrel público (index.ts) de outro plugin", async () => {
    const messages = await boundaryMessages("src/plugins/_fixture-cross-b/imports-barrel.ts");

    expect(messages).toEqual([]);
  }, 60_000);
});
