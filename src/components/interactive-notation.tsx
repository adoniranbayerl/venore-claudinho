"use client";

import { useEffect, useRef } from "react";
import { renderAbc, synth, type AbcElem } from "abcjs";

// Renderiza notação ABC (abcjs) e toca só a nota clicada via synth.playEvent — sem sequenciador,
// sem "tocar tudo": o pedido era "clicar na nota e ouvir ela", não um player de música completo.
// Usado tanto no preview do professor (lesson-examples-section.tsx) quanto na aula do aluno
// (lesson-examples-list.tsx) — mesmo componente, mesma lib dos dois lados, garantindo que o que o
// professor viu ao montar é exatamente o que o aluno vê/ouve.
export function InteractiveNotation({ abc, className }: { abc: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastWidth = 0;

    function draw() {
      if (!container) return;
      // `staffwidth` = largura REAL do container (menos um respiro). Isso faz o abcjs QUEBRAR os
      // compassos em várias linhas pra caber, em vez de desenhar uma linha só que estoura no
      // mobile (bug reportado: "os compassos não quebram linha"). Diferente de
      // `responsive: "resize"` (rejeitado antes) — aquele encolhe o SVG inteiro até ficar
      // ilegível; `staffwidth` reflui sem diminuir o tamanho das notas.
      const width = Math.max(280, Math.min(container.clientWidth - 8, 1200));
      lastWidth = container.clientWidth;
      const tunes = renderAbc(container, abc, {
        staffwidth: width,
        // Sem isso, abcjs cai no "old behavior" (selectTypes undefined): a nota entra na lista de
        // selecionáveis internamente, mas o elemento SVG nasce com selectable=false e nunca dispara
        // clickListener de verdade. ["note"]: só a cabeça da nota é clicável, não pausas/barras.
        selectTypes: ["note"],
        clickListener: (abcElem: AbcElem) => {
          if (!abcElem.midiPitches || abcElem.midiPitches.length === 0) return;
          // 500ms é só a janela de decaimento do som — suficiente pra uma nota isolada.
          void synth.playEvent(abcElem.midiPitches, undefined, 500);
        },
      });

      // renderAbc sozinho NUNCA popula abcElem.midiPitches (fica undefined) — só a passagem de
      // "flatten" que setUpAudio() dispara internamente calcula isso em cada elemento.
      tunes[0]?.setUpAudio({});
    }

    draw();

    // Redesenha quando a largura do container muda (rotação de tela, layout que assenta depois do
    // primeiro paint). Só quando MUDA de verdade — evita re-render em loop.
    const observer = new ResizeObserver(() => {
      if (container && Math.abs(container.clientWidth - lastWidth) > 4) draw();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [abc]);

  return <div ref={containerRef} className={className} />;
}
