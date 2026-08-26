export type EnrollmentRowDensity = "comfortable" | "compact" | "dense";

// O canvas de apresentação (presentation-canvas.tsx) já escala o slide inteiro pra caber em
// qualquer resolução de tela — mas isso não resolve o outro eixo de "não cabe": uma coluna com
// mais turmas/cursos do que o layout foi desenhado pra mostrar (row comfortable) simplesmente
// estoura a altura fixa (1080 de referência) e é cortada por overflow-hidden. resolveRowDensity
// decide, a partir da MAIOR coluna do slide, um tamanho de linha que sempre cabe — determinístico
// a partir da contagem de programs (conhecida no server, sem medir DOM no client).
export function resolveEnrollmentRowDensity(maxProgramsInAnyGroup: number): EnrollmentRowDensity {
  if (maxProgramsInAnyGroup > 9) {
    return "dense";
  }
  if (maxProgramsInAnyGroup > 6) {
    return "compact";
  }
  return "comfortable";
}
