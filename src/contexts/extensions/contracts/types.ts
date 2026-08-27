// Contexto genérico do motor: guarda só o estado de habilitação (ligado/desligado) por chave,
// para os dois mecanismos de instalação em código que a plataforma tem hoje — plugin e tema
// (docs/venore-docks.md — "Sistema de plugins" / "Sobre temas"). Não conhece manifesto, não
// conhece dependência entre plugins, não conhece tema ativo: essas regras (quem pode ser
// desabilitado, com quais consequências) moram em platform/, que é quem lê PLUGIN_REGISTRY e
// THEME_REGISTRY (regra 12 do documento de arquitetura — um context não depende de src/plugins
// ou src/themes, só platform/ compõe os dois lados).
export type ExtensionKind = "plugin" | "theme";

export type ExtensionStateRecord = {
  kind: ExtensionKind;
  key: string;
  enabled: boolean;
  // Nulo == não instalado (ver database/schema/index.ts). Pra plugin, isso é o estado
  // "disponível"; pra tema é ignorado pelo theme-engine.
  installedAt: Date | null;
  updatedAt: Date;
  updatedByUserId: string | null;
};
