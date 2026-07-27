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
        { type: "component", pattern: "src/components", partialMatch: false },
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
            {
              from: { element: { type: "component" } },
              disallow: { to: { element: { type: "plugin" } } },
              message:
                "src/components não pode importar de src/plugins/* — um plugin contribui pro page-builder via platform/page-builder (block-registry.ts + block-renderers.tsx), nunca direto num componente do core.",
            },
          ],
        },
      ],
    },
  },
  {
    // Cor deve vir sempre dos tokens semânticos em globals.css (bg-surface-*, text-text-*,
    // border-border-*, text-destructive, text-success, text-warning, text-info, etc.) —
    // nunca de classes Tailwind de paleta cru. Ver docs/venore-docks.md.
    files: ["src/app/**/*.{js,jsx,ts,tsx}", "src/themes/**/*.{js,jsx,ts,tsx}", "src/components/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'JSXAttribute[name.name="className"] Literal[value=/\\b(bg-white|text-white|bg-gray-[0-9]+|text-gray-[0-9]+|border-gray-[0-9]+|text-red-[0-9]+|bg-red-[0-9]+|border-red-[0-9]+|text-blue-[0-9]+|bg-blue-[0-9]+|border-blue-[0-9]+|text-green-[0-9]+|bg-green-[0-9]+|border-green-[0-9]+|text-amber-[0-9]+|bg-amber-[0-9]+|border-amber-[0-9]+)\\b/]',
          message:
            "Não use cores Tailwind cruas (bg-white, text-gray-*, border-gray-*, text-red-*, text-blue-*, text-green-*, bg-amber-*, ...) em src/app ou src/themes — use os tokens semânticos do tema (bg-surface-panel, text-text-primary, text-text-secondary, text-text-tertiary, border-border-subtle, text-destructive, text-success, text-warning, text-info, bg-primary/text-primary-foreground, etc).",
        },
        {
          selector:
            'JSXAttribute[name.name="className"] TemplateElement[value.raw=/\\b(bg-white|text-white|bg-gray-[0-9]+|text-gray-[0-9]+|border-gray-[0-9]+|text-red-[0-9]+|bg-red-[0-9]+|border-red-[0-9]+|text-blue-[0-9]+|bg-blue-[0-9]+|border-blue-[0-9]+|text-green-[0-9]+|bg-green-[0-9]+|border-green-[0-9]+|text-amber-[0-9]+|bg-amber-[0-9]+|border-amber-[0-9]+)\\b/]',
          message:
            "Não use cores Tailwind cruas (bg-white, text-gray-*, border-gray-*, text-red-*, text-blue-*, text-green-*, bg-amber-*, ...) em src/app ou src/themes — use os tokens semânticos do tema (bg-surface-panel, text-text-primary, text-text-secondary, text-text-tertiary, border-border-subtle, text-destructive, text-success, text-warning, text-info, bg-primary/text-primary-foreground, etc).",
        },
      ],
    },
  },
]);

export default eslintConfig;
