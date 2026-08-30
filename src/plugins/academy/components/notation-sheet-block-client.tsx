"use client";

import { useState } from "react";
import { InteractiveNotation } from "@/components/interactive-notation";
import { Button } from "@/components/ui/button";
import { NotationPlayButton } from "./notation-play-button";
import { SingAlongPractice } from "./sing-along-practice";
import type { NotationToken } from "./notation-abc";

// Mesmo toggle que já existe em lesson-examples-list.tsx (openPracticeId), na granularidade de um
// único bloco — sem precisar de id pra distinguir "qual exemplo", um boolean local basta.
export function NotationSheetBlockClient({
  abc,
  singAlongAbc,
  playback,
  caption,
  allowSingAlong,
  tokens,
}: {
  abc: string;
  // ABC só da voz 1 (melodia) — o "Cantar junto" compara com uma linha só; passar o ABC multi-voz
  // desalinha a extração de notas esperadas. Sem vozes extras, é igual a `abc`.
  singAlongAbc: string;
  // Uma entrada = um botão "Ouvir <label>". Um item só (sem vozes extras) vira um botão simples.
  playback: { label: string; abc: string }[];
  caption: string;
  allowSingAlong: boolean;
  tokens: NotationToken[];
}) {
  const [isPracticing, setIsPracticing] = useState(false);

  return (
    <div className="space-y-2">
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      {!isPracticing && <InteractiveNotation abc={abc} className="overflow-x-auto rounded-md bg-card p-2" />}

      {!isPracticing && (
        <div className="flex flex-wrap items-center gap-1.5">
          {playback.map((option) => (
            <NotationPlayButton key={option.label} abc={option.abc} label={option.label} />
          ))}
        </div>
      )}

      {allowSingAlong && (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => setIsPracticing((prev) => !prev)}>
            {isPracticing ? "Fechar" : "Cantar junto"}
          </Button>
          {isPracticing && <SingAlongPractice abc={singAlongAbc} tokens={tokens} />}
        </>
      )}
    </div>
  );
}
