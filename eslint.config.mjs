import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: { boundaries },
    settings: {
      // Elements classify by folder ("context" / "plugin" / "theme"); files classify
      // by category within a context. "context-public" (exclusive) covers
      // index.ts and contracts/**; everything else under a context falls
      // through to the "context-internal" catch-all. The dependency rule
      // below disallows plugins/themes reaching "context-internal" files.
      "boundaries/elements": [
        { type: "context", pattern: "src/contexts/*", partialMatch: false },
        { type: "plugin", pattern: "src/plugins/*", partialMatch: false },
        { type: "theme", pattern: "src/themes/*", partialMatch: false },
        { type: "observability", pattern: "src/observability", partialMatch: false },
        { type: "platform", pattern: "src/platform/*", partialMatch: false },
      ],
      "boundaries/files": [
        { pattern: "src/contexts/*/index.ts", category: "context-public", exclusive: true },
        { pattern: "src/contexts/*/contracts/**", category: "context-public", exclusive: true },
        { pattern: "src/contexts/*/**", category: "context-internal" },
        { pattern: "src/observability/index.ts", category: "observability-public", exclusive: true },
        { pattern: "src/observability/contracts/**", category: "observability-public", exclusive: true },
        { pattern: "src/observability/**", category: "observability-internal" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "allow",
          policies: [
            {
              from: { element: { type: ["plugin", "theme"] } },
              disallow: {
                to: {
                  element: { type: "context" },
                  file: { categories: "context-internal" },
                },
              },
              message:
                "Um plugin/tema só pode importar de contexts/<nome>/index.ts (barrel público) ou contexts/<nome>/contracts/** — nunca de arquivos internos do context (store, service fora do barrel, schema, etc).",
            },
            {
              from: { element: { type: ["context", "plugin"] } },
              disallow: {
                to: {
                  element: { type: "observability" },
                  file: { categories: "observability-internal" },
                },
              },
              message:
                "Observability é consumida via porta/adapter — importe só de observability/index.ts (barrel público), nunca de buffer, flush, config ou do schema do banco internos.",
            },
            {
              from: { element: { type: "platform" } },
              disallow: {
                to: {
                  element: { type: "context" },
                  file: { categories: "context-internal" },
                },
              },
              message:
                "platform/ só pode importar de contexts/<nome>/index.ts (barrel público) ou contexts/<nome>/contracts/** — nunca de arquivos internos do context (store, service fora do barrel, schema, etc), mesma regra que já vale pra plugin/tema.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
