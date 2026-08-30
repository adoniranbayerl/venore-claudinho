"use client";

import { useEffect, useRef, useState } from "react";
import { renderAbc, synth, TimingCallbacks, type TuneObject, type MidiBuffer } from "abcjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePitchListener } from "@/hooks/use-pitch-listener";
import { extractExpectedNotes, type ExpectedNote } from "./abc-expected-notes";
import { frequencyToMidi, midiToPitchClass, pitchClassNamePt, describeOctaveOffset } from "@/lib/pitch-class";
import type { NotationToken } from "./notation-abc";

// Modo "Cantar junto": o aluno canta no microfone e o app compara com a sequência de notas
// esperada da partitura (afinação por classe de nota, ignorando oitava — vozes diferentes cantam
// naturalmente em oitavas diferentes da escrita — mais tempo/ritmo do início de cada nota). Nunca
// toca áudio e escuta o microfone ao mesmo tempo: o áudio do modelo vazaria pro microfone via
// AnalyserNode e contaminaria toda leitura de pitch (não há como detectar fone de ouvido no
// browser) — por isso "Ouvir modelo" e "Cantar" são duas fases separadas.
//
// Componente novo em vez de estender InteractiveNotation (src/components/interactive-notation.tsx)
// de propósito: aquele componente garante, por contrato comentado no próprio arquivo, que
// professor e aluno veem exatamente o mesmo comportamento — e os elementos SVG usados aqui pra
// destacar nota certa/errada só existem presos a este render próprio (renderAbc), não dá pra
// reaproveitar o de um InteractiveNotation irmão.

const DEFAULT_QPM = 90;
const ONSET_TOLERANCE_MS = 250;
const METRONOME_CLICK_HZ = 1000;
const METRONOME_CLICK_SECONDS = 0.05;

type NoteVerdict = "correct" | "wrong-timing" | "wrong-pitch" | "missed";

type NoteResult = { note: ExpectedNote; verdict: NoteVerdict; octaveNote: string | null };

type Phase = "idle" | "playing-model" | "singing" | "results";

const VERDICT_CLASS: Record<NoteVerdict, string> = {
  correct: "fill-success",
  "wrong-timing": "fill-warning",
  "wrong-pitch": "fill-destructive",
  missed: "fill-muted-foreground",
};

const VERDICT_LABEL: Record<NoteVerdict, string> = {
  correct: "certa",
  "wrong-timing": "certa, mas fora do tempo",
  "wrong-pitch": "nota errada",
  missed: "não cantada",
};

const HIGHLIGHT_CLASSES = ["fill-success", "fill-warning", "fill-destructive", "fill-muted-foreground", "fill-primary"];

// Clique de metrônomo — só um beep curto sintetizado (osc + envelope de ganho), sem depender de
// arquivo de áudio. Toca em "Ouvir modelo" e em "Cantar junto" (pedido desta sessão: manter o
// tempo perceptível nas duas fases, já que "Cantar junto" não tem melodia audível guiando).
function playMetronomeClick(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = METRONOME_CLICK_HZ;
  gain.gain.setValueAtTime(0.2, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + METRONOME_CLICK_SECONDS);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + METRONOME_CLICK_SECONDS);
}

function clearHighlights(notes: ExpectedNote[]) {
  notes.forEach((note) => note.elements.forEach((el) => el.classList.remove(...HIGHLIGHT_CLASSES)));
}

function highlightNote(note: ExpectedNote, className: string) {
  note.elements.forEach((el) => {
    el.classList.remove(...HIGHLIGHT_CLASSES);
    el.classList.add(className);
  });
}

function modalMidi(values: number[]): number {
  const counts = new Map<number, number>();
  let best = values[0];
  let bestCount = 0;
  for (const value of values) {
    const count = (counts.get(value) ?? 0) + 1;
    counts.set(value, count);
    if (count > bestCount) {
      bestCount = count;
      best = value;
    }
  }
  return best;
}

function computeVerdict(note: ExpectedNote, frames: { midi: number; elapsedMs: number }[]): NoteResult {
  if (frames.length === 0) return { note, verdict: "missed", octaveNote: null };

  const midi = modalMidi(frames.map((frame) => frame.midi));
  if (midiToPitchClass(midi) !== note.pitchClass) return { note, verdict: "wrong-pitch", octaveNote: null };

  const earliestElapsedMs = Math.min(...frames.map((frame) => frame.elapsedMs));
  const onTime = Math.abs(earliestElapsedMs - note.startMs) <= ONSET_TOLERANCE_MS;
  const octaveDescription = describeOctaveOffset(midi, note.midiPitch);
  return {
    note,
    verdict: onTime ? "correct" : "wrong-timing",
    octaveNote: octaveDescription === "mesma oitava do escrito" ? null : octaveDescription,
  };
}

export function SingAlongPractice({ abc, tokens }: { abc: string; tokens?: NotationToken[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tuneRef = useRef<TuneObject | null>(null);
  const expectedNotesRef = useRef<ExpectedNote[]>([]);
  const rawIndexToNoteIndexRef = useRef<number[]>([]);
  const totalMsRef = useRef(0);
  // Lido do próprio ABC (campo Q:, via tune.getBpm()) em vez de receber como prop — o header já
  // carrega o andamento que o professor escolheu no NotationEditor, então essa é a única fonte da
  // verdade, funciona tanto pro bloco novo (tokens estruturados) quanto pro fluxo antigo de
  // Exemplos (só string ABC, sem tokens) sem precisar de mais um prop repassado em cascata.
  const qpmRef = useRef(DEFAULT_QPM);

  const metronomeAudioContextRef = useRef<AudioContext | null>(null);
  function getMetronomeAudioContext(): AudioContext {
    if (!metronomeAudioContextRef.current) {
      const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      metronomeAudioContextRef.current = new AudioContextCtor!();
    }
    return metronomeAudioContextRef.current;
  }

  const modelSynthRef = useRef<MidiBuffer | null>(null);
  const modelTimingRef = useRef<TimingCallbacks | null>(null);
  const modelTimeoutRef = useRef<number | null>(null);

  const singingTimingRef = useRef<TimingCallbacks | null>(null);
  const singingActiveRef = useRef(false);
  const phaseStartRef = useRef(0);
  const currentNoteIndexRef = useRef(-1);
  const framesByNoteRef = useRef<{ midi: number; elapsedMs: number }[][]>([]);
  const resultsAccumulatorRef = useRef<NoteResult[]>([]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [results, setResults] = useState<NoteResult[] | null>(null);

  const pitchListener = usePitchListener();

  useEffect(() => {
    if (!containerRef.current) return;
    const tunes = renderAbc(containerRef.current, abc, {});
    const tune = tunes[0] ?? null;
    tuneRef.current = tune;
    if (tune) {
      const qpm = tune.getBpm() || DEFAULT_QPM;
      qpmRef.current = qpm;
      const { notes, totalMs, rawIndexToNoteIndex } = extractExpectedNotes(tune, { qpm, tokens });
      expectedNotesRef.current = notes;
      rawIndexToNoteIndexRef.current = rawIndexToNoteIndex;
      totalMsRef.current = totalMs;
    }
  }, [abc, tokens]);

  useEffect(() => {
    return pitchListener.subscribe((frame) => {
      if (!singingActiveRef.current || frame.frequencyHz === null) return;
      const midi = Math.round(frequencyToMidi(frame.frequencyHz));
      const elapsedMs = frame.timestampMs - phaseStartRef.current;
      const bucket = framesByNoteRef.current[currentNoteIndexRef.current];
      bucket?.push({ midi, elapsedMs });
    });
  }, [pitchListener]);

  useEffect(() => {
    return () => {
      modelSynthRef.current?.stop();
      modelTimingRef.current?.stop();
      if (modelTimeoutRef.current !== null) window.clearTimeout(modelTimeoutRef.current);
      singingTimingRef.current?.stop();
      singingActiveRef.current = false;
      if (metronomeAudioContextRef.current && metronomeAudioContextRef.current.state !== "closed") {
        void metronomeAudioContextRef.current.close();
      }
    };
  }, []);

  function finalizeNote(index: number) {
    const note = expectedNotesRef.current[index];
    if (!note) return;
    const result = computeVerdict(note, framesByNoteRef.current[index] ?? []);
    resultsAccumulatorRef.current[index] = result;
    highlightNote(note, VERDICT_CLASS[result.verdict]);
  }

  function endSinging() {
    singingActiveRef.current = false;
    singingTimingRef.current?.stop();
    singingTimingRef.current = null;
    pitchListener.stop();
    setResults(resultsAccumulatorRef.current.slice());
    setPhase("results");
  }

  async function startSinging() {
    const tune = tuneRef.current;
    const notes = expectedNotesRef.current;
    if (!tune || notes.length === 0) return;

    const result = await pitchListener.start();
    if (!result.ok) return;

    clearHighlights(notes);
    framesByNoteRef.current = notes.map(() => []);
    resultsAccumulatorRef.current = [];
    currentNoteIndexRef.current = -1;
    singingActiveRef.current = true;
    phaseStartRef.current = performance.now();
    setPhase("singing");

    // rawEventIndex conta eventos BRUTOS do abcjs (um por cabeça de nota, inclusive as duas de um
    // par ligado por tie); mergedIndex é o índice na lista já fundida (expectedNotesRef). Só
    // finaliza/destaca quando o índice mesclado muda — dois eventos brutos da mesma nota ligada
    // caem no mesmo mergedIndex, então só acumulam frames de microfone no mesmo balde, sem
    // re-destacar nem pedir reataque. Sem isso (indexando `notes` direto pelo contador bruto), a
    // partir da primeira nota ligada toda nota seguinte seria avaliada contra a nota errada.
    const metronomeAudioContext = getMetronomeAudioContext();
    let rawEventIndex = -1;
    let currentMergedIndex = -1;
    const timing = new TimingCallbacks(tune, {
      qpm: qpmRef.current,
      beatCallback: () => playMetronomeClick(metronomeAudioContext),
      eventCallback: (event) => {
        if (event === null) {
          if (currentMergedIndex >= 0) finalizeNote(currentMergedIndex);
          endSinging();
          return undefined;
        }
        if (!event.midiPitches || event.midiPitches.length === 0) return undefined;
        rawEventIndex += 1;
        const mergedIndex = rawIndexToNoteIndexRef.current[rawEventIndex] ?? rawEventIndex;
        if (mergedIndex !== currentMergedIndex) {
          if (currentMergedIndex >= 0) finalizeNote(currentMergedIndex);
          currentMergedIndex = mergedIndex;
          currentNoteIndexRef.current = currentMergedIndex;
          const current = notes[currentMergedIndex];
          if (current) highlightNote(current, "fill-primary");
        }
        return undefined;
      },
    });
    singingTimingRef.current = timing;
    timing.start();
  }

  function stopSinging() {
    if (currentNoteIndexRef.current >= 0) finalizeNote(currentNoteIndexRef.current);
    endSinging();
  }

  async function playModel() {
    const tune = tuneRef.current;
    if (!tune || !synth.supportsAudio()) return;
    setPhase("playing-model");
    try {
      const midiBuffer = new synth.CreateSynth();
      modelSynthRef.current = midiBuffer;
      // options: { qpm } aqui é o que faltava pro andamento do MIDI bater com o qpm usado em todo
      // o resto (TimingCallbacks/extractExpectedNotes) — sem isso o synth tocava no andamento
      // padrão do abcjs, dessincronizado do que o app assumia pra tudo mais.
      await midiBuffer.init({ visualObj: tune, options: { qpm: qpmRef.current } });
      await midiBuffer.prime();
      midiBuffer.start();

      const metronomeAudioContext = getMetronomeAudioContext();
      const timing = new TimingCallbacks(tune, {
        qpm: qpmRef.current,
        beatCallback: () => playMetronomeClick(metronomeAudioContext),
      });
      modelTimingRef.current = timing;
      timing.start();

      modelTimeoutRef.current = window.setTimeout(() => {
        modelTimingRef.current?.stop();
        modelTimingRef.current = null;
        setPhase((current) => (current === "playing-model" ? "idle" : current));
      }, totalMsRef.current + 300);
    } catch {
      setPhase("idle");
    }
  }

  function stopModel() {
    modelSynthRef.current?.stop();
    modelTimingRef.current?.stop();
    modelTimingRef.current = null;
    if (modelTimeoutRef.current !== null) window.clearTimeout(modelTimeoutRef.current);
    setPhase("idle");
  }

  function resetPractice() {
    clearHighlights(expectedNotesRef.current);
    resultsAccumulatorRef.current = [];
    framesByNoteRef.current = [];
    currentNoteIndexRef.current = -1;
    setResults(null);
    setPhase("idle");
  }

  const micMessage =
    pitchListener.status !== "idle" && pitchListener.status !== "listening" ? pitchListener.errorMessage : null;

  const counts = results?.reduce(
    (acc, result) => {
      if (result.verdict === "correct") acc.correct += 1;
      else if (result.verdict === "wrong-timing") acc.wrongTiming += 1;
      else if (result.verdict === "wrong-pitch") acc.wrongPitch += 1;
      else acc.missed += 1;
      return acc;
    },
    { correct: 0, wrongTiming: 0, wrongPitch: 0, missed: 0 },
  );
  const notableResults = results?.filter((result) => result.verdict !== "correct") ?? [];

  return (
    <div className="mt-2 space-y-3 rounded-md border border-border bg-card p-3">
      <div ref={containerRef} className="overflow-x-auto" />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={phase === "playing-model" ? stopModel : playModel}
          disabled={phase === "singing"}
        >
          {phase === "playing-model" ? "Parar modelo" : "Ouvir modelo"}
        </Button>
        {phase === "results" ? (
          <Button type="button" variant="outline" size="sm" onClick={resetPractice}>
            Tentar de novo
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={phase === "singing" ? stopSinging : startSinging}
            disabled={phase === "playing-model"}
          >
            {phase === "singing" ? "Parar" : "Cantar junto"}
          </Button>
        )}
      </div>

      {phase === "idle" && (
        <p className="text-xs text-muted-foreground/56">
          Ao tocar em “Cantar junto”, o navegador vai pedir acesso ao microfone. O áudio é analisado só no seu aparelho, em
          tempo real — nada é gravado nem enviado.
        </p>
      )}

      {micMessage && <p className="text-xs text-destructive">{micMessage}</p>}

      {phase === "results" && results && counts && (
        <div className="space-y-2 rounded-md border border-border bg-muted/40 p-2.5">
          <p className="text-xs font-medium text-foreground">Resultado</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge className="border-success-border bg-success-soft text-success">Certas: {counts.correct}</Badge>
            <Badge className="border-warning-border bg-warning-soft text-warning">Fora do tempo: {counts.wrongTiming}</Badge>
            <Badge variant="destructive">Nota errada: {counts.wrongPitch}</Badge>
            <Badge variant="outline" className="text-muted-foreground">
              Não cantadas: {counts.missed}
            </Badge>
          </div>
          {notableResults.length > 0 && (
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              {notableResults.map((result) => (
                <li key={result.note.index}>
                  Nota {result.note.index + 1} ({pitchClassNamePt(result.note.pitchClass)}):{" "}
                  {VERDICT_LABEL[result.verdict]}
                  {result.octaveNote ? ` — ${result.octaveNote}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
