// Tokens de cor DO DOMÍNIO DO PLUGIN (§ pedido do dono: "se sentir falta de cores no tema, crie
// tokens DENTRO do domínio do plugin e faça o tema consumir como acréscimo"). O vocabulário
// shadcn do tema só tem ~1 cor de destaque + semânticas (met/warning/destructive) — insuficiente
// pra categorizar séries de gráfico. Estes `--cm-*` NÃO sobrescrevem nenhum token do tema; são
// adicionados por cima, e só existem onde a UI do plugin renderiza (a área admin, /metricas e o
// telão incluem <ChartTokens/> no topo). Valores em oklch, tema-aware pela classe `.dark` que o
// next-themes coloca no <html> (mesmo mecanismo dos theme.css).
//
// Não vai em globals.css nem em theme.css de propósito — é escopo do plugin, sai junto com ele
// numa desinstalação.

const CSS = `
:root {
  --cm-chart-1: oklch(0.64 0.13 195);
  --cm-chart-2: oklch(0.58 0.15 255);
  --cm-chart-3: oklch(0.56 0.17 300);
  --cm-chart-4: oklch(0.60 0.19 350);
  --cm-chart-5: oklch(0.62 0.20 25);
  --cm-chart-6: oklch(0.72 0.15 65);
  --cm-chart-7: oklch(0.60 0.14 150);
  --cm-chart-8: oklch(0.68 0.14 120);
  --cm-chart-1-soft: oklch(0.95 0.03 195);
  --cm-chart-2-soft: oklch(0.95 0.03 255);
  --cm-chart-3-soft: oklch(0.95 0.03 300);
  --cm-chart-4-soft: oklch(0.95 0.03 350);
  --cm-chart-5-soft: oklch(0.95 0.03 25);
  --cm-chart-6-soft: oklch(0.96 0.04 65);
  --cm-chart-7-soft: oklch(0.95 0.03 150);
  --cm-chart-8-soft: oklch(0.96 0.04 120);
}
.dark {
  --cm-chart-1: oklch(0.74 0.12 195);
  --cm-chart-2: oklch(0.72 0.13 255);
  --cm-chart-3: oklch(0.72 0.15 300);
  --cm-chart-4: oklch(0.74 0.16 350);
  --cm-chart-5: oklch(0.72 0.17 25);
  --cm-chart-6: oklch(0.82 0.14 65);
  --cm-chart-7: oklch(0.76 0.13 150);
  --cm-chart-8: oklch(0.80 0.13 120);
  --cm-chart-1-soft: oklch(0.32 0.04 195);
  --cm-chart-2-soft: oklch(0.32 0.04 255);
  --cm-chart-3-soft: oklch(0.32 0.05 300);
  --cm-chart-4-soft: oklch(0.32 0.05 350);
  --cm-chart-5-soft: oklch(0.32 0.05 25);
  --cm-chart-6-soft: oklch(0.34 0.05 65);
  --cm-chart-7-soft: oklch(0.32 0.04 150);
  --cm-chart-8-soft: oklch(0.34 0.04 120);
}
`;

// <style> simples com filho string — mesmo padrão de birthdays/routes/public/
// birthdays-public-board.tsx e broadcast/components/output/standby-screen.tsx. Um <style> em
// qualquer posição do documento aplica as custom properties globalmente (elas cascateiam de
// qualquer lugar); renderizar em 3 rotas distintas é inofensivo (as rotas nunca montam juntas, e
// `:root{}` duplicado idêntico não custa nada).
export function ChartTokens() {
  return <style>{CSS}</style>;
}

// Cor de série por índice (0-based), cíclica em 8. Usada via style inline (não via className, que
// o no-restricted-syntax de cor bloquearia).
export function chartColor(index: number): string {
  return `var(--cm-chart-${(((index % 8) + 8) % 8) + 1})`;
}

export function chartColorSoft(index: number): string {
  return `var(--cm-chart-${(((index % 8) + 8) % 8) + 1}-soft)`;
}
