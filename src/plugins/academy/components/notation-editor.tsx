"use client";

import { useEffect, useRef, useState } from "react";
import { renderAbc, TimingCallbacks } from "abcjs";
import { Delete, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PianoKeyboard } from "./piano-keyboard";
import {
  compositionToAbcWithRanges,
  midiToNote,
  notePitchNamePt,
  noteToMidi,
  type Accidental,
  type KeySignature,
  type NotationComposition,
  type NotationToken,
  type NoteDuration,
  type PitchLetter,
  type TimeSignature,
} from "./notation-abc";

const DURATIONS: { value: NoteDuration; label: string }[] = [
  { value: "sixteenth", label: "𝅘𝅥𝅯" },
  { value: "eighth", label: "♪" },
  { value: "quarter", label: "♩" },
  { value: "half", label: "𝅗𝅥" },
  { value: "whole", label: "𝅝" },
];

const MIN_BPM = 40;
const MAX_BPM = 208;

const PIANO_OCTAVES = [2, 3, 4, 5, 6];

const TIME_SIGNATURES: TimeSignature[] = ["2/4", "3/4", "4/4", "6/8", "3/8", "9/8", "12/8"];

const KEY_LABELS: Record<KeySignature, string> = {
  C: "Dó maior",
  G: "Sol maior",
  D: "Ré maior",
  A: "Lá maior",
  E: "Mi maior",
  B: "Si maior",
  "F#": "Fá♯ maior",
  Db: "Ré♭ maior",
  Ab: "Lá♭ maior",
  Eb: "Mi♭ maior",
  Bb: "Si♭ maior",
  F: "Fá maior",
  Am: "Lá menor",
  Em: "Mi menor",
  Bm: "Si menor",
  "F#m": "Fá♯ menor",
  "C#m": "Dó♯ menor",
  "G#m": "Sol♯ menor",
  "D#m": "Ré♯ menor",
  Bbm: "Si♭ menor",
  Fm: "Fá menor",
  Cm: "Dó menor",
  Gm: "Sol menor",
  Dm: "Ré menor",
};
const KEY_SIGNATURES = Object.keys(KEY_LABELS) as KeySignature[];

function noteLabel(token: Extract<NotationToken, { type: "note" }>): string {
  return `${notePitchNamePt(token.pitch, token.accidental)}${token.octave}`;
}

// Editor de nota-a-nota (pedido desta sessão: "escrever partitura... que o aluno possa clicar na
// nota e ouvir ela") — sem digitar sintaxe ABC, o professor clica duração + acidente/expressão
// (opcionais) + tecla do teclado de piano, cada clique acrescenta um token à sequência, e o
// preview (abcjs) atualiza ao vivo. Uma nota já colocada pode ser clicada na partitura renderizada
// pra selecioná-la e ajustar a altura com as setas ↑/↓ (meio-tom por clique).
//
// Dois modos: não-controlado (`name`) serializa em ABC e envia via input escondido — mesmo padrão
// de MediaPickerField (campo controlado, mas o <form> em volta continua FormData), usado pelo form
// one-shot de "Adicionar exemplo" (lesson-examples-section.tsx). Controlado (`value`/`onChange`)
// nunca espelha `value` num state local — o bloco de partitura do page builder
// (notation-sheet-field-panel.tsx) reaproveita a mesma instância deste componente ao trocar de
// bloco selecionado; copiar `value` pra state só no mount deixaria a melodia "presa" no bloco
// anterior ao trocar de seleção. O painel que usa o modo controlado passa `key={block.id}` no
// componente pra garantir que a SELEÇÃO de nota (estado só deste componente, não faz parte de
// NotationComposition) também reseta ao trocar de bloco.
type NotationEditorProps =
  | { name: string; value?: undefined; onChange?: undefined }
  | { name?: undefined; value: NotationComposition; onChange: (next: NotationComposition) => void };

export function NotationEditor(props: NotationEditorProps) {
  const isControlled = props.onChange !== undefined;

  const [uncontrolledTokens, setUncontrolledTokens] = useState<NotationToken[]>([]);
  const [uncontrolledKey, setUncontrolledKey] = useState<KeySignature>("C");
  const [uncontrolledTimeSignature, setUncontrolledTimeSignature] = useState<TimeSignature>("4/4");
  const [uncontrolledBpm, setUncontrolledBpm] = useState(90);
  const [uncontrolledShowNoteNames, setUncontrolledShowNoteNames] = useState(false);

  const tokens = isControlled ? props.value.tokens : uncontrolledTokens;
  const key = isControlled ? props.value.key : uncontrolledKey;
  const timeSignature = isControlled ? props.value.timeSignature : uncontrolledTimeSignature;
  const bpm = isControlled ? props.value.bpm : uncontrolledBpm;
  const showNoteNames = isControlled ? props.value.showNoteNames : uncontrolledShowNoteNames;

  const [duration, setDuration] = useState<NoteDuration>("quarter");
  // Único acidente que sobrou como toggle: "Natural", pra cancelar acidente implícito da armadura
  // de clave numa tecla branca. Sustenido agora vem direto da tecla preta do PianoKeyboard.
  const [natural, setNatural] = useState(false);
  const [staccato, setStaccato] = useState(false);
  const [accent, setAccent] = useState(false);
  const [fermata, setFermata] = useState(false);
  const [tied, setTied] = useState(false);
  const [slurStart, setSlurStart] = useState(false);
  const [slurEnd, setSlurEnd] = useState(false);
  const [crescendoStart, setCrescendoStart] = useState(false);
  const [crescendoEnd, setCrescendoEnd] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const { abc, noteRanges } = compositionToAbcWithRanges({ key, timeSignature, tokens, bpm, showNoteNames });
  const selectedToken = selectedIndex !== null ? tokens[selectedIndex] : undefined;

  function commitTokens(next: NotationToken[]) {
    if (isControlled) props.onChange({ tokens: next, key, timeSignature, bpm, showNoteNames });
    else setUncontrolledTokens(next);
  }

  function commitKey(next: KeySignature) {
    if (isControlled) props.onChange({ tokens, key: next, timeSignature, bpm, showNoteNames });
    else setUncontrolledKey(next);
  }

  function commitTimeSignature(next: TimeSignature) {
    if (isControlled) props.onChange({ tokens, key, timeSignature: next, bpm, showNoteNames });
    else setUncontrolledTimeSignature(next);
  }

  function commitBpm(next: number) {
    const clamped = Math.min(MAX_BPM, Math.max(MIN_BPM, next));
    if (isControlled) props.onChange({ tokens, key, timeSignature, bpm: clamped, showNoteNames });
    else setUncontrolledBpm(clamped);
  }

  function commitShowNoteNames(next: boolean) {
    if (isControlled) props.onChange({ tokens, key, timeSignature, bpm, showNoteNames: next });
    else setUncontrolledShowNoteNames(next);
  }

  useEffect(() => {
    if (!previewRef.current) return;
    if (tokens.length === 0) {
      previewRef.current.innerHTML = "";
      return;
    }
    // Sem "responsive: resize": ver comentário em src/components/interactive-notation.tsx — esse
    // modo encolhia a partitura pra caber no container, ficando ilegível no mobile.
    const tunes = renderAbc(previewRef.current, abc, {
      selectTypes: ["note"],
      clickListener: (abcElem) => {
        if (abcElem.startChar === undefined) return;
        const startChar = abcElem.startChar;
        const range = noteRanges.find((r) => startChar >= r.start && startChar < r.end);
        if (range) setSelectedIndex(range.tokenIndex);
      },
    });

    const tune = tunes[0];
    if (!tune || selectedIndex === null) return;
    const position = noteRanges.findIndex((r) => r.tokenIndex === selectedIndex);
    if (position < 0) return;
    const timing = new TimingCallbacks(tune);
    const noteEvents = timing.noteTimings.filter((event) => event.type === "event" && event.midiPitches && event.midiPitches.length > 0);
    const elements = (noteEvents[position]?.elements ?? []).flat();
    elements.forEach((el) => el.classList.add("fill-primary"));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- noteRanges é derivado de abc a cada render, incluí-lo re-executaria o efeito sem motivo
  }, [abc, tokens.length, selectedIndex]);

  function addNote(pitch: PitchLetter, octave: number, accidental: Accidental | null) {
    commitTokens([
      ...tokens,
      {
        type: "note",
        pitch,
        octave,
        accidental,
        duration,
        staccato,
        accent,
        fermata,
        tied,
        crescendo: crescendoStart ? "start" : crescendoEnd ? "end" : null,
        slur: slurStart ? "start" : slurEnd ? "end" : null,
        chord: null,
      },
    ]);
    setNatural(false);
    setStaccato(false);
    setAccent(false);
    setFermata(false);
    setTied(false);
    setSlurStart(false);
    setSlurEnd(false);
    setCrescendoStart(false);
    setCrescendoEnd(false);
    setSelectedIndex(null);
  }

  function handlePianoKey(pitch: PitchLetter, octave: number, keyAccidental: "sharp" | null) {
    addNote(pitch, octave, keyAccidental ?? (natural ? "natural" : null));
  }

  function addRest() {
    commitTokens([...tokens, { type: "rest", duration }]);
  }

  function addBar() {
    commitTokens([...tokens, { type: "bar" }]);
  }

  function undo() {
    commitTokens(tokens.slice(0, -1));
    setSelectedIndex(null);
  }

  function clear() {
    commitTokens([]);
    setSelectedIndex(null);
  }

  function transposeSelected(semitones: number) {
    if (selectedIndex === null) return;
    const token = tokens[selectedIndex];
    if (!token || token.type !== "note") return;
    const midi = noteToMidi(token.pitch, token.octave, token.accidental) + semitones;
    const { pitch, octave, accidental } = midiToNote(midi);
    const next = tokens.slice();
    next[selectedIndex] = { ...token, pitch, octave, accidental };
    commitTokens(next);
  }

  function updateSelectedChord(chord: string) {
    if (selectedIndex === null) return;
    const token = tokens[selectedIndex];
    if (!token || token.type !== "note") return;
    const next = tokens.slice();
    next[selectedIndex] = { ...token, chord: chord.length > 0 ? chord : null };
    commitTokens(next);
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      {!isControlled && <input type="hidden" name={props.name} value={tokens.length > 0 ? abc : ""} />}

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-32">
          <label className="block text-[10px] font-medium text-muted-foreground/56 uppercase">Compasso</label>
          <Select value={timeSignature} onValueChange={(value) => commitTimeSignature(value as TimeSignature)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SIGNATURES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <label className="block text-[10px] font-medium text-muted-foreground/56 uppercase">Tonalidade</label>
          <Select value={key} onValueChange={(value) => commitKey(value as KeySignature)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEY_SIGNATURES.map((value) => (
                <SelectItem key={value} value={value}>
                  {KEY_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-24">
          <label className="block text-[10px] font-medium text-muted-foreground/56 uppercase">BPM</label>
          <input
            type="number"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(event) => commitBpm(Number(event.target.value) || bpm)}
            className="mt-1 w-full rounded-md border border-border px-2 py-1 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 self-end pb-1 text-xs font-medium text-muted-foreground">
          <input type="checkbox" checked={showNoteNames} onChange={(event) => commitShowNoteNames(event.target.checked)} />
          Nome das notas
        </label>
      </div>

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

        <button
          type="button"
          onClick={() => setNatural((prev) => !prev)}
          className={cn(
            "flex size-8 items-center justify-center rounded-md border text-base outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
            natural ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-ring",
          )}
          aria-pressed={natural}
          title="Natural (cancela acidente da armadura de clave)"
        >
          ♮
        </button>

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

      <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Expressão">
        {(
          [
            { active: staccato, toggle: () => setStaccato((prev) => !prev), label: ".", title: "Staccato" },
            { active: accent, toggle: () => setAccent((prev) => !prev), label: ">", title: "Acento" },
            { active: fermata, toggle: () => setFermata((prev) => !prev), label: "𝄐", title: "Fermata" },
            { active: tied, toggle: () => setTied((prev) => !prev), label: "⌢", title: "Ligar à próxima nota (tie)" },
          ] as const
        ).map((item) => (
          <button
            key={item.title}
            type="button"
            title={item.title}
            onClick={item.toggle}
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-md border px-1.5 text-base outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
              item.active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-ring",
            )}
            aria-pressed={item.active}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Ligaduras e dinâmica">
        {(
          [
            { active: slurStart, toggle: () => setSlurStart((prev) => !prev), label: "Iniciar frase" },
            { active: slurEnd, toggle: () => setSlurEnd((prev) => !prev), label: "Terminar frase" },
            { active: crescendoStart, toggle: () => setCrescendoStart((prev) => !prev), label: "Iniciar crescendo" },
            { active: crescendoEnd, toggle: () => setCrescendoEnd((prev) => !prev), label: "Terminar crescendo" },
          ] as const
        ).map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.toggle}
            className={cn(
              "flex h-8 items-center justify-center rounded-md border px-2 text-xs outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
              item.active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-ring",
            )}
            aria-pressed={item.active}
          >
            {item.label}
          </button>
        ))}
      </div>

      <PianoKeyboard octaves={PIANO_OCTAVES} onKeyClick={handlePianoKey} />

      {tokens.length === 0 ? (
        <p className="text-xs text-muted-foreground/56">Escolha a duração e clique no teclado acima pra montar a melodia.</p>
      ) : (
        <>
          <div ref={previewRef} className="overflow-x-auto rounded-md bg-card p-2" />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {selectedToken && selectedToken.type === "note" ? (
              <>
                <span>
                  Nota selecionada: <span className="font-medium text-foreground">{noteLabel(selectedToken)}</span>
                </span>
                <Button type="button" variant="outline" size="xs" onClick={() => transposeSelected(-1)}>
                  ↓ meio-tom
                </Button>
                <Button type="button" variant="outline" size="xs" onClick={() => transposeSelected(1)}>
                  ↑ meio-tom
                </Button>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-medium text-muted-foreground/56 uppercase">Cifra</label>
                  <input
                    type="text"
                    value={selectedToken.chord ?? ""}
                    onChange={(event) => updateSelectedChord(event.target.value)}
                    placeholder="Ex: C, G7, Am"
                    className="w-24 rounded-md border border-border px-2 py-1 text-xs"
                  />
                </div>
                <Button type="button" variant="ghost" size="xs" onClick={() => setSelectedIndex(null)}>
                  Cancelar seleção
                </Button>
              </>
            ) : (
              <span>Clique numa nota da partitura acima pra selecioná-la e ajustar a altura ou adicionar cifra.</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
