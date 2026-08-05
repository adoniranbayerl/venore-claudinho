"use client";

import { useEffect, useRef, useState } from "react";
import { renderAbc } from "abcjs";
import { Delete, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tokensToAbc, type Accidental, type NotationToken, type NoteDuration, type PitchLetter } from "./notation-abc";

const DURATIONS: { value: NoteDuration; label: string }[] = [
  { value: "eighth", label: "♪" },
  { value: "quarter", label: "♩" },
  { value: "half", label: "𝅗𝅥" },
  { value: "whole", label: "𝅝" },
];

const ACCIDENTALS: { value: Accidental; label: string }[] = [
  { value: "sharp", label: "♯" },
  { value: "flat", label: "♭" },
  { value: "natural", label: "♮" },
];

const PITCHES: PitchLetter[] = ["C", "D", "E", "F", "G", "A", "B"];
const OCTAVES = [4, 5];

// Editor de nota-a-nota (pedido desta sessão: "escrever partitura... que o aluno possa clicar na
// nota e ouvir ela") — sem digitar sintaxe ABC, o professor clica duração + acidente (opcional) +
// tecla, cada clique acrescenta um token à sequência, e o preview (abcjs) atualiza ao vivo. O
// resultado final é serializado em notationData (notation-abc.ts) e enviado via input escondido —
// mesmo padrão de MediaPickerField (campo controlado, mas o <form> em volta continua FormData).
export function NotationEditor({ name }: { name: string }) {
  const [tokens, setTokens] = useState<NotationToken[]>([]);
  const [duration, setDuration] = useState<NoteDuration>("quarter");
  const [accidental, setAccidental] = useState<Accidental | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const abc = tokensToAbc(tokens);

  useEffect(() => {
    if (!previewRef.current) return;
    if (tokens.length === 0) {
      previewRef.current.innerHTML = "";
      return;
    }
    renderAbc(previewRef.current, abc, { responsive: "resize" });
  }, [abc, tokens.length]);

  function addNote(pitch: PitchLetter, octave: number) {
    setTokens((prev) => [...prev, { type: "note", pitch, octave, accidental, duration }]);
    setAccidental(null);
  }

  function addRest() {
    setTokens((prev) => [...prev, { type: "rest", duration }]);
  }

  function addBar() {
    setTokens((prev) => [...prev, { type: "bar" }]);
  }

  function undo() {
    setTokens((prev) => prev.slice(0, -1));
  }

  function clear() {
    setTokens([]);
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <input type="hidden" name={name} value={tokens.length > 0 ? abc : ""} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1" role="group" aria-label="Duração da nota">
          {DURATIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setDuration(item.value)}
              className={cn(
                "flex size-8 items-center justify-center rounded-md border text-base outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
                duration === item.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-ring",
              )}
              aria-pressed={duration === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Acidente">
          {ACCIDENTALS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setAccidental((prev) => (prev === item.value ? null : item.value))}
              className={cn(
                "flex size-8 items-center justify-center rounded-md border text-base outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
                accidental === item.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-ring",
              )}
              aria-pressed={accidental === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addRest}>
          Pausa
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addBar}>
          Barra |
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={undo} disabled={tokens.length === 0} aria-label="Desfazer última nota">
          <Delete className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={clear} disabled={tokens.length === 0} aria-label="Limpar tudo">
          <RotateCcw className="size-4" />
        </Button>
      </div>

      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {OCTAVES.map((octave) =>
          PITCHES.map((pitch) => (
            <button
              key={`${pitch}${octave}`}
              type="button"
              onClick={() => addNote(pitch, octave)}
              className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border text-sm font-medium text-foreground outline-none ui-motion-base hover:border-ring hover:bg-accent/14 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {pitch}
              <span className="text-[10px] text-muted-foreground/56">{octave}</span>
            </button>
          )),
        )}
      </div>

      {tokens.length === 0 ? (
        <p className="text-xs text-muted-foreground/56">Escolha a duração e clique nas teclas acima pra montar a melodia.</p>
      ) : (
        <div ref={previewRef} className="overflow-x-auto rounded-md bg-card p-2" />
      )}
    </div>
  );
}
