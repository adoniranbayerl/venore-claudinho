import type { PluginManifest } from "@/platform/plugin-engine/manifest-schema";

// Faixa escrita à mão, não importada de platform/plugin-engine/core-version.ts: se importasse o
// CORE_VERSION corrente, a checagem de compatibilidade seria sempre trivialmente satisfeita e
// perderia o sentido (docs/venore-docks.md — "Sistema de plugins" / compatibility.coreVersion).
export const academyManifest: PluginManifest = {
  manifestVersion: "1.0.0",
  key: "academy",
  name: "Academy",
  version: "1.0.0",
  description: "Cursos com aulas sequenciais, requisitos configuráveis e progresso do aluno.",
  compatibility: { coreVersion: ">=2.0.0 <3.0.0" },
  permissions: [{ key: "academy.courses.manage", label: "Gerenciar cursos, aulas e perguntas da Academy" }],
  navigation: [
    {
      key: "academy.courses",
      label: "Academy",
      href: "/admin/academy",
      icon: "graduation-cap",
      groupKey: "plugins",
      groupLabel: "Plugins",
      groupOrder: 30,
      order: 10,
      requiredPermission: "academy.courses.manage",
    },
  ],
  blocks: [
    { key: "academy.course.list", label: "Academy — Lista de cursos" },
    { key: "academy.course.card", label: "Academy — Curso" },
    { key: "academy.enroll.cta", label: "Academy — Botão de matrícula" },
    { key: "academy.course.progress", label: "Academy — Progresso do curso" },
    { key: "academy.course.lesson-trail", label: "Academy — Trilha de lições" },
    { key: "academy.course.dashboard-chart", label: "Academy — Gráfico de progresso do curso" },
  ],
};
