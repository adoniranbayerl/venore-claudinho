// Convenção do projeto (AGENTS.md seção 1): useCase é sempre "<nome>.<feature>...", onde <nome>
// é o context ou plugin que originou a chamada (ex: "rbac.role-assignment.grant-superadmin" →
// "rbac"). Essas listas espelham os diretórios reais de src/contexts e src/plugins — não há
// como descobrir isso em runtime de forma barata (sem tocar o filesystem em serverless), então
// mantemos a lista curada aqui. Ao adicionar um context/plugin novo, adicione o nome aqui também.
const CONTEXT_NAMES = ["auth", "cms", "extensions", "media", "rbac", "settings", "themes"];
const PLUGIN_NAMES = ["academy", "birthdays"];

export function inferOriginFromUseCase(useCase: string): string {
  const prefix = useCase.split(".")[0];
  if (CONTEXT_NAMES.includes(prefix)) return `context:${prefix}`;
  if (PLUGIN_NAMES.includes(prefix)) return `plugin:${prefix}`;
  return `context:${prefix}`;
}
