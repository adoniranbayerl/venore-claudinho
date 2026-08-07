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
    if (!containerRef.current) return;

    const tunes = renderAbc(containerRef.current, abc, {
      // Sem "responsive: resize" de propósito: esse modo desenha a partitura assumindo ~740px de
      // largura e depois encolhe o SVG inteiro (viewBox) pra caber no container via CSS — em tela
      // de celular (~320-380px) isso reduzia a notação a menos da metade do tamanho, ilegível
      // (bug reportado nesta sessão: "partituras muito pequenas no mobile"). Sem essa opção o
      // abcjs desenha em tamanho fixo/legível e o `overflow-x-auto` do className (já aplicado
      // pelos dois callers) rola horizontalmente quando a partitura não cabe.
      // Sem isso, abcjs cai no "old behavior" (selectTypes undefined): a nota entra na lista de
      // selecionáveis internamente, mas o elemento SVG nasce com selectable=false e nunca dispara
      // clickListener de verdade — bug reportado nesta sessão ("não toca áudio quando clica").
      // ["note"]: só a cabeça da nota é clicável, não pausas/barras/clave.
      selectTypes: ["note"],
      clickListener: (abcElem: AbcElem) => {
        if (!abcElem.midiPitches || abcElem.midiPitches.length === 0) return;
        // 500ms por "compasso" é só a janela de decaimento do som — suficiente pra uma nota
        // isolada, não afeta o tempo/andamento (não há sequência tocando).
        void synth.playEvent(abcElem.midiPitches, undefined, 500);
      },
    });

    // renderAbc sozinho NUNCA popula abcElem.midiPitches (fica undefined) — só a passagem de
    // "flatten" que setUpAudio() dispara internamente calcula isso em cada elemento. Sem chamar
    // isto, clickListener sempre recebia midiPitches undefined e o guard acima virava um no-op
    // silencioso — a segunda metade do bug reportado nesta sessão (a primeira foi o selectTypes).
    tunes[0]?.setUpAudio({});
  }, [abc]);

  return <div ref={containerRef} className={className} />;
}
