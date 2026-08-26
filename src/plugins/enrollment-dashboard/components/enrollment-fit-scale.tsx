"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Rede de segurança final pro slide caber em qualquer largura/altura de canvas, mesmo depois dos
// tiers de densidade (shared/enrollment-density.ts, decididos pela quantidade de turmas/cursos)
// já terem escolhido o tamanho "certo" pros dados — o problema recorrente era o canvas REAL
// disponível ser menor que a referência 16:9 que o design assume (achado real e repetido: este
// slide embutido como camada "webpage" do Broadcast Studio, com agenda+footer abertos, roda numa
// caixa mais estreita/mais baixa que 16:9, com dimensão exata que varia por configuração — não dá
// pra prever de antemão nem cravar um breakpoint fixo). Em vez de continuar truncando texto pra
// caber (cortava palavra no meio quando ficava curto demais), o conteúdo renderiza no tamanho
// NATURAL (sem quebra/corte, ver enrollment-columns-slide.tsx e enrollment-programs-table.tsx) e
// este componente mede esse tamanho contra a caixa disponível, aplicando um único transform:
// scale() de correção pra baixo (nunca amplia) — tudo encolhe junto (fonte, espaçamento, ícone),
// nunca corta/sobrepõe. Mesmo mecanismo de presentation-canvas.tsx, só que medindo o conteúdo real
// via ResizeObserver em vez de depender de window.innerHeight/innerWidth.
export function EnrollmentFitScale({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    function measure() {
      if (!outer || !inner) return;
      const availableWidth = outer.clientWidth;
      const availableHeight = outer.clientHeight;
      // scrollWidth/scrollHeight são o tamanho de LAYOUT do inner, não afetado pelo transform
      // (transform só muda pintura, não layout) — não precisa desfazer a escala pra medir de novo.
      const naturalWidth = inner.scrollWidth;
      const naturalHeight = inner.scrollHeight;
      if (availableWidth <= 0 || availableHeight <= 0 || naturalWidth <= 0 || naturalHeight <= 0) return;
      setScale(Math.min(1, availableWidth / naturalWidth, availableHeight / naturalHeight));
    }

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(outer);
    resizeObserver.observe(inner);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="flex h-full w-full min-h-0 items-center justify-center overflow-hidden">
      <div ref={innerRef} className="w-max shrink-0" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
