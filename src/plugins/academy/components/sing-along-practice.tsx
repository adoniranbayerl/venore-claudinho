"use client";

import { useEffect, useRef, useState } from "react";
import { renderAbc, synth, TimingCallbacks, type TuneObject, type MidiBuffer } from "abcjs";
import { Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePitchListener } from "@/hooks/use-pitch-listener";
import { extractExpectedNotes, type ExpectedNote } from "./abc-expected-notes";
import { frequencyToMidi, midiToOctave, pitchClassNamePt, describeOctaveOffset } from "@/lib/pitch-class";
import type { NotationToken } from "./notation-abc";

// Modo "Cantar junto": o aluno canta no microfone e o app compara com a sequência de notas
// esperada da partitura (afinação por classe de nota, ignorando oitava — vozes diferentes cantam
// naturalmente em oitavas diferentes da escrita — mais tempo/ritmo do início de cada nota). Nunca
// toca áudio E escuta o microfone ao mesmo tempo pra scoring: só a contagem de entrada e (se o
// aluno ligar) o metrônomo tocam durante o canto, e o cancelamento de eco do microfone
// (pitch-listener.ts) tira o que a caixa do PC devolve.
//
// Feedback = afinador estilo violão: o nome da nota-alvo fica no centro e a AGULHA balança pros
// lados (♭ grave / ♯ agudo). Tolerância generosa: a voz oscila muito.

const DEFAULT_QPM = 90;
const MIN_QPM = 40;
const MAX_QPM = 160;
const ONSET_TOLERANCE_MS = 340;
const METRONOME_CLICK_HZ = 1000;
const METRONOME_CLICK_SECONDS = 0.05;

// ~1 semitom de folga, e basta a MEDIANA do canto (ou 1/4 dos quadros) cair nessa faixa.
const PITCH_TOLERANCE_CENTS = 100;
const ON_PITCH_RATIO = 0.25;
// Quadros com desvio absurdo (> um tom) são glitch do detector / clique que vazou — descartados.
const GLITCH_CENTS = 220;

const COUNT_IN_BEATS = 4;

// Agulha do afinador: ±60 cents mapeiam pra ±38° de rotação.
const NEEDLE_RANGE_CENTS = 60;
const NEEDLE_MAX_DEG = 38;
const RECENT_SAMPLE_MS = 200;

type NoteVerdict = "correct" | "wrong-timing" | "wrong-pitch" | "missed";
type NoteResult = { note: ExpectedNote; verdict: NoteVerdict; octaveNote: string | null };
type Phase = "idle" | "playing-model" | "counting-in" | "singing" | "results";
type SungFrame = { centsOff: number; elapsedMs: number; midi: number };

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

// Clique da CONTAGEM de entrada — agendado com precisão de amostra no relógio do AudioContext (não
// setTimeout, que arrastava). Beat 1 acentuado; beats 2–4 mais curtos e agudos.
function scheduleCountInClick(audioContext: AudioContext, atTime: number, accented: boolean) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = accented ? 1200 : 850;
  const peak = accented ? 0.32 : 0.2;
  gain.gain.setValueAtTime(0.0001, atTime);
  gain.gain.exponentialRampToValueAtTime(peak, atTime + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, atTime + 0.055);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(atTime);
  oscillator.stop(atTime + 0.07);
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

// Cents (com sinal) entre a frequência cantada e a ocorrência MAIS PRÓXIMA da classe de nota
// esperada (em qualquer oitava). 0 = afinado; ±100 = um semitom; + = agudo, − = grave.
function centsFromPitchClass(frequencyHz: number, pitchClass: number): number {
  const midi = frequencyToMidi(frequencyHz);
  const nearest = pitchClass + 12 * Math.round((midi - pitchClass) / 12);
  return (midi - nearest) * 100;
}

function noteLabel(frequencyHz: number): string {
  const midi = Math.round(frequencyToMidi(frequencyHz));
  return `${pitchClassNamePt(((midi % 12) + 12) % 12)}${midiToOctave(midi)}`;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function computeVerdict(note: ExpectedNote, frames: SungFrame[]): NoteResult {
  const clean = frames.filter((frame) => Math.abs(frame.centsOff) <= GLITCH_CENTS);
  const pool = clean.length >= 3 ? clean : frames;
  if (pool.length === 0) return { note, verdict: "missed", octaveNote: null };

  const withinRatio = pool.filter((frame) => Math.abs(frame.centsOff) <= PITCH_TOLERANCE_CENTS).length / pool.length;
  const onPitch = Math.abs(median(pool.map((frame) => frame.centsOff))) <= PITCH_TOLERANCE_CENTS || withinRatio >= ON_PITCH_RATIO;
  if (!onPitch) return { note, verdict: "wrong-pitch", octaveNote: null };

  const good = pool.filter((frame) => Math.abs(frame.centsOff) <= PITCH_TOLERANCE_CENTS);
  const reference = good.length > 0 ? good : pool;
  const earliestElapsedMs = Math.min(...reference.map((frame) => frame.elapsedMs));
  const onTime = Math.abs(earliestElapsedMs - note.startMs) <= ONSET_TOLERANCE_MS;

  const sungMidi = Math.round(reference.reduce((sum, frame) => sum + frame.midi, 0) / reference.length);
  const octaveDescription = describeOctaveOffset(sungMidi, note.midiPitch);
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
  const qpmRef = useRef(DEFAULT_QPM);
  const runIdRef = useRef(0);

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
  const loopModelRef = useRef(false);
  const metronomeOnRef = useRef(false);

  const singingTimingRef = useRef<TimingCallbacks | null>(null);
  const singingActiveRef = useRef(false);
  const phaseStartRef = useRef(0);
  const currentNoteIndexRef = useRef(-1);
  const framesByNoteRef = useRef<SungFrame[][]>([]);
  const resultsAccumulatorRef = useRef<NoteResult[]>([]);
  const countInTimeoutsRef = useRef<number[]>([]);

  // Afinador
  const lastVoicedRef = useRef<{ t: number; freqHz: number } | null>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const needleDegRef = useRef(0);
  const tunerNoteRef = useRef<HTMLSpanElement>(null);
  const tunerHzRef = useRef<HTMLSpanElement>(null);
  const tunerRafRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [results, setResults] = useState<NoteResult[] | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [bpm, setBpm] = useState<number | null>(null);
  const [originalQpm, setOriginalQpm] = useState<number | null>(null);
  const [loopModel, setLoopModel] = useState(false);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [countInForSinging, setCountInForSinging] = useState(false);

  const pitchListener = usePitchListener();

  // ---- Render da partitura -----------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const width = Math.max(240, container.clientWidth - 24);
    const perLine = Math.max(1, Math.floor(width / 150));
    const tunes = renderAbc(container, abc, {
      staffwidth: width,
      wrap: { minSpacing: 1.6, maxSpacing: 2.7, preferredMeasuresPerLine: perLine },
    });
    const tune = tunes[0] ?? null;
    tuneRef.current = tune;
    tune?.setUpAudio({});
    if (tune) {
      const detected = Math.round(tune.getBpm() || DEFAULT_QPM);
      setOriginalQpm(detected);
      setBpm((current) => current ?? detected);
    } else {
      setSetupError("Não consegui carregar esta partitura.");
    }
  }, [abc]);

  // Re-deriva as notas esperadas quando o BPM muda — start/duração dependem do andamento.
  useEffect(() => {
    const tune = tuneRef.current;
    if (!tune || bpm === null) return;
    qpmRef.current = bpm;
    const { notes, totalMs, rawIndexToNoteIndex } = extractExpectedNotes(tune, { qpm: bpm, tokens });
    expectedNotesRef.current = notes;
    rawIndexToNoteIndexRef.current = rawIndexToNoteIndex;
    totalMsRef.current = totalMs;
    setSetupError(notes.length === 0 ? "Não consegui ler as notas desta partitura para comparar com o canto." : null);
  }, [bpm, abc, tokens]);

  // ---- Microfone -> balde da nota corrente + última frequência ouvida ---------------------
  useEffect(() => {
    return pitchListener.subscribe((frame) => {
      if (frame.frequencyHz === null) return;
      lastVoicedRef.current = { t: frame.timestampMs, freqHz: frame.frequencyHz };

      const note = expectedNotesRef.current[currentNoteIndexRef.current];
      if (singingActiveRef.current && note) {
        framesByNoteRef.current[currentNoteIndexRef.current]?.push({
          centsOff: centsFromPitchClass(frame.frequencyHz, note.pitchClass),
          elapsedMs: frame.timestampMs - phaseStartRef.current,
          midi: frequencyToMidi(frame.frequencyHz),
        });
      }
    });
  }, [pitchListener]);

  // ---- Afinador (agulha) — roda na contagem-pra-cantar e no canto -------------------------
  useEffect(() => {
    const forSinging = phase === "singing" || (phase === "counting-in" && countInForSinging);
    if (!forSinging) return;
    const needle = needleRef.current;
    if (!needle) return;

    function frame() {
      const note = expectedNotesRef.current[currentNoteIndexRef.current] ?? expectedNotesRef.current[0];
      if (tunerNoteRef.current) tunerNoteRef.current.textContent = note ? pitchClassNamePt(note.pitchClass) : "—";

      const last = lastVoicedRef.current;
      const fresh = last !== null && performance.now() - last.t < RECENT_SAMPLE_MS;
      let targetDeg = 0;
      let inTune = false;

      if (fresh && note && last) {
        const cents = centsFromPitchClass(last.freqHz, note.pitchClass);
        inTune = Math.abs(cents) <= PITCH_TOLERANCE_CENTS;
        const clamped = Math.max(-NEEDLE_RANGE_CENTS, Math.min(NEEDLE_RANGE_CENTS, cents));
        targetDeg = (clamped / NEEDLE_RANGE_CENTS) * NEEDLE_MAX_DEG;
        const dir = cents > 12 ? "♯ um pouco agudo" : cents < -12 ? "♭ um pouco grave" : "no ponto";
        if (tunerHzRef.current) tunerHzRef.current.textContent = `${noteLabel(last.freqHz)} · ${Math.round(last.freqHz)} Hz · ${dir}`;
      } else if (tunerHzRef.current) {
        tunerHzRef.current.textContent = "cante uma nota…";
      }

      needleDegRef.current += (targetDeg - needleDegRef.current) * 0.18;
      needle!.style.transform = `rotate(${needleDegRef.current.toFixed(2)}deg)`;
      if (inTune) {
        needle!.classList.add("bg-success");
        needle!.classList.remove("bg-primary");
      } else {
        needle!.classList.add("bg-primary");
        needle!.classList.remove("bg-success");
      }

      tunerRafRef.current = window.requestAnimationFrame(frame);
    }
    tunerRafRef.current = window.requestAnimationFrame(frame);
    return () => {
      if (tunerRafRef.current !== null) window.cancelAnimationFrame(tunerRafRef.current);
      tunerRafRef.current = null;
    };
  }, [phase, countInForSinging]);

  useEffect(() => {
    return () => {
      runIdRef.current += 1;
      modelSynthRef.current?.stop();
      modelTimingRef.current?.stop();
      if (modelTimeoutRef.current !== null) window.clearTimeout(modelTimeoutRef.current);
      singingTimingRef.current?.stop();
      singingActiveRef.current = false;
      countInTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
      if (metronomeAudioContextRef.current && metronomeAudioContextRef.current.state !== "closed") {
        void metronomeAudioContextRef.current.close();
      }
    };
  }, []);

  // ---- Contagem de entrada — um compasso de cliques no andamento, resolve no "1" seguinte -----
  function playCountIn(): Promise<void> {
    countInTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    countInTimeoutsRef.current = [];
    const audioContext = getMetronomeAudioContext();
    if (audioContext.state === "suspended") void audioContext.resume();
    const beatSec = 60 / qpmRef.current;
    const leadSec = 0.12;
    const start = audioContext.currentTime + leadSec;
    for (let beat = 0; beat < COUNT_IN_BEATS; beat += 1) {
      scheduleCountInClick(audioContext, start + beat * beatSec, beat === 0);
    }
    return new Promise((resolve) => {
      countInTimeoutsRef.current.push(window.setTimeout(resolve, (leadSec + COUNT_IN_BEATS * beatSec) * 1000));
    });
  }

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

  function cancelAll() {
    runIdRef.current += 1;
    countInTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    modelSynthRef.current?.stop();
    modelTimingRef.current?.stop();
    modelTimingRef.current = null;
    if (modelTimeoutRef.current !== null) window.clearTimeout(modelTimeoutRef.current);
    singingTimingRef.current?.stop();
    singingTimingRef.current = null;
    singingActiveRef.current = false;
    pitchListener.stop();
    setPhase("idle");
  }

  async function startSinging() {
    const tune = tuneRef.current;
    const notes = expectedNotesRef.current;
    if (!tune || notes.length === 0) {
      setSetupError("Não consegui ler as notas desta partitura para comparar com o canto.");
      return;
    }
    setSetupError(null);

    const permission = await pitchListener.start();
    if (!permission.ok) return;

    clearHighlights(notes);
    framesByNoteRef.current = notes.map(() => []);
    resultsAccumulatorRef.current = [];
    lastVoicedRef.current = null;
    needleDegRef.current = 0;
    currentNoteIndexRef.current = 0; // já mira a 1ª nota durante a contagem (alimenta o afinador)
    singingActiveRef.current = false;

    runIdRef.current += 1;
    const myRun = runIdRef.current;
    setCountInForSinging(true);
    setPhase("counting-in");
    await playCountIn();
    if (runIdRef.current !== myRun) return;

    currentNoteIndexRef.current = -1;
    singingActiveRef.current = true;
    phaseStartRef.current = performance.now();
    setPhase("singing");

    const metronomeAudioContext = getMetronomeAudioContext();
    let rawEventIndex = -1;
    let currentMergedIndex = -1;
    const timing = new TimingCallbacks(tune, {
      qpm: qpmRef.current,
      beatCallback: () => {
        if (metronomeOnRef.current) playMetronomeClick(metronomeAudioContext);
      },
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
    runIdRef.current += 1;
    countInTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    endSinging();
  }

  async function playModel() {
    const tune = tuneRef.current;
    if (!tune || !synth.supportsAudio()) return;
    runIdRef.current += 1;
    const myRun = runIdRef.current;
    setCountInForSinging(false);
    setPhase("counting-in");
    await playCountIn();
    if (runIdRef.current !== myRun) return;
    void runModelOnce(myRun);
  }

  async function runModelOnce(myRun: number) {
    const tune = tuneRef.current;
    if (!tune || runIdRef.current !== myRun) return;
    setPhase("playing-model");
    try {
      const midiBuffer = new synth.CreateSynth();
      modelSynthRef.current = midiBuffer;
      await midiBuffer.init({ visualObj: tune, options: { qpm: qpmRef.current } });
      await midiBuffer.prime();
      if (runIdRef.current !== myRun) return;
      midiBuffer.start();

      const metronomeAudioContext = getMetronomeAudioContext();
      const timing = new TimingCallbacks(tune, {
        qpm: qpmRef.current,
        beatCallback: () => {
          if (metronomeOnRef.current) playMetronomeClick(metronomeAudioContext);
        },
      });
      modelTimingRef.current = timing;
      timing.start();

      modelTimeoutRef.current = window.setTimeout(() => {
        modelTimingRef.current?.stop();
        modelTimingRef.current = null;
        modelSynthRef.current?.stop();
        if (runIdRef.current !== myRun) return;
        if (loopModelRef.current) void runModelOnce(myRun);
        else setPhase("idle");
      }, totalMsRef.current + 300);
    } catch {
      setPhase("idle");
    }
  }

  function toggleLoop() {
    setLoopModel((prev) => {
      loopModelRef.current = !prev;
      return !prev;
    });
  }

  function toggleMetronome() {
    setMetronomeOn((prev) => {
      metronomeOnRef.current = !prev;
      return !prev;
    });
  }

  function resetPractice() {
    clearHighlights(expectedNotesRef.current);
    resultsAccumulatorRef.current = [];
    framesByNoteRef.current = [];
    currentNoteIndexRef.current = -1;
    lastVoicedRef.current = null;
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
  const canAdjust = phase === "idle" || phase === "results";
  const showTuner = phase === "singing" || (phase === "counting-in" && countInForSinging);

  return (
    <div className="mt-2 space-y-3 rounded-md border border-border bg-card p-3">
      <div ref={containerRef} className="overflow-x-auto" />

      {showTuner && (
        <div className="rounded-md border border-border bg-muted/30 p-3 text-center">
          <span ref={tunerNoteRef} className="block text-3xl font-semibold leading-none text-foreground">
            —
          </span>
          <span ref={tunerHzRef} className="mt-1 block text-[11px] text-muted-foreground/56">
            {phase === "counting-in" ? "prepare — comece no “1”" : "cante uma nota…"}
          </span>
          <div className="relative mx-auto mt-3 h-16 w-56">
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[10px] text-muted-foreground/56">
              <span>♭ grave</span>
              <span>afinado</span>
              <span>♯ agudo</span>
            </div>
            <div className="absolute bottom-2 left-1/2 h-9 w-24 -translate-x-1/2 rounded-t-full bg-success/10" />
            <div className="absolute bottom-1.5 left-1/2 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-border" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <div ref={needleRef} className="h-12 w-1 origin-bottom rounded-full bg-primary" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={canAdjust ? playModel : cancelAll}
          disabled={phase === "singing"}
        >
          {phase === "playing-model" ? "Parar modelo" : phase === "counting-in" ? "Cancelar" : "Ouvir modelo"}
        </Button>
        <Button
          type="button"
          variant={loopModel ? "default" : "outline"}
          size="sm"
          onClick={toggleLoop}
          aria-pressed={loopModel}
          title="Repetir o modelo em loop"
        >
          <Repeat className="size-3.5" aria-hidden="true" /> Loop
        </Button>
        {phase === "results" ? (
          <Button type="button" variant="outline" size="sm" onClick={resetPractice}>
            Tentar de novo
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={phase === "singing" ? stopSinging : phase === "counting-in" ? cancelAll : startSinging}
            disabled={phase === "playing-model"}
          >
            {phase === "singing" ? "Parar" : phase === "counting-in" ? "Cancelar" : "Cantar junto"}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2">
          <label htmlFor="sing-bpm" className="text-[11px] font-medium tracking-caps text-muted-foreground/56 uppercase">
            Andamento
          </label>
          <input
            id="sing-bpm"
            type="range"
            min={MIN_QPM}
            max={MAX_QPM}
            step={1}
            value={bpm ?? DEFAULT_QPM}
            disabled={!canAdjust}
            onChange={(event) => setBpm(Number(event.target.value))}
            className="h-1.5 flex-1 accent-primary disabled:opacity-40"
          />
          <span className="w-16 text-right text-xs tabular-nums text-foreground">{bpm ?? "—"} BPM</span>
          {canAdjust && bpm !== null && originalQpm !== null && bpm !== originalQpm && (
            <Button type="button" variant="ghost" size="xs" onClick={() => setBpm(originalQpm)}>
              partitura ({originalQpm})
            </Button>
          )}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input type="checkbox" checked={metronomeOn} onChange={toggleMetronome} className="accent-primary" />
          Metrônomo
        </label>
      </div>

      {phase === "idle" && (
        <p className="text-xs text-muted-foreground/56">
          Ao tocar em “Cantar junto”, o navegador pede acesso ao microfone. Tem uma contagem de
          entrada (1-2-3-4) antes de começar. Deixe o metrônomo desligado se estiver sem fone (a
          caixa do PC atrapalha a leitura da voz). O áudio é analisado só no seu aparelho — nada é
          gravado nem enviado.
        </p>
      )}

      {(setupError || micMessage) && <p className="text-xs text-destructive">{setupError ?? micMessage}</p>}

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
