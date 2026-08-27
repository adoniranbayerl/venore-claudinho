// Fixture (não é um plugin de verdade — fora do PLUGIN_REGISTRY, do tsconfig e do `npm run lint`).
// Serve só pra src/platform/page-builder/cross-plugin-boundary.eslint.test.ts checar a regra
// plugin -> plugin do boundaries/dependencies. Este é o barrel público: importar DAQUI é OK.
export const fixtureCrossAPublic = "public-surface";
