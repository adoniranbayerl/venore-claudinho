// Lista fixa de ícones lucide oferecidos na criação/edição de fila. Módulo folha (sem dependência
// de banco) — pode ser importado por client component com segurança, diferente do barrel do
// plugin. O valor guardado em queues.icon é a chave; a resolução para o componente de ícone fica
// na camada de UI (routes/admin/queue-icon.tsx). Mesmo padrão de
// company-metrics/shared/sector-icons.ts.
export const QUEUE_ICON_OPTIONS = [
  { value: "wrench", label: "Chave inglesa" },
  { value: "hammer", label: "Martelo" },
  { value: "monitor", label: "Monitor" },
  { value: "cpu", label: "Computador" },
  { value: "printer", label: "Impressora" },
  { value: "network", label: "Rede" },
  { value: "plug", label: "Tomada" },
  { value: "droplets", label: "Hidráulica" },
  { value: "wind", label: "Ar-condicionado" },
  { value: "life-buoy", label: "Suporte" },
] as const;

export type QueueIconValue = (typeof QUEUE_ICON_OPTIONS)[number]["value"];

export const DEFAULT_QUEUE_ICON: QueueIconValue = "life-buoy";
