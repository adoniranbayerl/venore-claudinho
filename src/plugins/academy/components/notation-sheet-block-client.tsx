"use client";

import { useState } from "react";
import { InteractiveNotation } from "@/components/interactive-notation";
import { Button } from "@/components/ui/button";
import { SingAlongPractice } from "./sing-along-practice";
import type { NotationToken } from "./notation-abc";

// Mesmo toggle que já existe em lesson-examples-list.tsx (openPracticeId), na granularidade de um
// único bloco — sem precisar de id pra distinguir "qual exemplo", um boolean local basta.
export function NotationSheetBlockClient({
  abc,
  caption,
  allowSingAlong,
  tokens,
}: {
  abc: string;
  caption: string;
  allowSingAlong: boolean;
  tokens: NotationToken[];
}) {
  const [isPracticing, setIsPracticing] = useState(false);

  return (
    <div className="space-y-2">
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      {!isPracticing && <InteractiveNotation abc={abc} className="overflow-x-auto rounded-md bg-card p-2" />}
      {allowSingAlong && (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => setIsPracticing((prev) => !prev)}>
            {isPracticing ? "Fechar" : "Cantar junto"}
          </Button>
          {isPracticing && <SingAlongPractice abc={abc} tokens={tokens} />}
        </>
      )}
    </div>
  );
}
