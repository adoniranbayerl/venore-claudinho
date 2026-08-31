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
// toca áudio e escuta o microfone ao mesmo tempo: o áudio do modelo vazaria pro microfone via
// AnalyserNode e contaminaria toda leitura de pitch — por isso "Ouvir modelo" e "Cantar" são
// fases separadas.
//
// Pedidos do dono (2026-08): tolerância de afinação (a voz oscila, nunca é exata), gráfico ao vivo
// de pitch (com frequência, nome da nota e o alvo subindo/descendo pra mostrar o contorno),
// contagem de entrada em tempo antes de tocar/cantar, escolha do BPM, e loop no "Ouvir modelo".

const DEFAULT_QPM = 90;
const MIN_QPM = 40;
const MAX_QPM = 160;
const ONSET_TOLERANCE_MS = 320;
const METRONOME_CLICK_HZ = 1000;
const METRONOME_CLICK_SECONDS = 0.05;

// Uma voz cantada oscila muito: aceitar até ~3/4 de semitom de desvio como "na nota", e exigir só
// que uma fração dos quadros de microfone da nota esteja dentro dessa faixa.
const PITCH_TOLERANCE_CENTS = 75;
const PITCH_TOLERANCE_SEMITONES = PITCH_TOLERANCE_CENTS / 100;
const ON_PITCH_RATIO = 0.34;

const COUNT_IN_BEATS = 4;

const GRAPH_WINDOW_MS = 2800;
// Meia-altura do gráfico em semitons — janela de ~1.5 oitava centrada na mediana da melodia.
const GRAPH_HALF_RANGE_SEMITONES = 9;

type NoteVerdict = "correct" | "wrong-timing" | "wrong-pitch" | "missed";
type NoteResult = { note: ExpectedNote; verdict: NoteVerdict; octaveNote: string | null };
type Phase = "idle" | "playing-model" | "counting-in" | "singing" | "results";
type SungFrame = { centsOff: number; elapsedMs: number; midi: number };
type GraphSample = { t: number; freqHz: number };

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
// setTimeout, que arrastava e saía fora do tempo). Beat 1 acentuado (mais grave e mais forte),
// beats 2–4 num tom mais alto e curto — dá pra ouvir claramente "1 · 2 3 4" no andamento.
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
// esperada (em qualquer oitava). 0 = afinado; ±100 = um semitom.
function centsFromPitchClass(frequencyHz: number, pitchClass: number): number {
  const midi = frequencyToMidi(frequencyHz);
  const nearest = pitchClass + 12 * Math.round((midi - pitchClass) / 12);
  return (midi - nearest) * 100;
}

// MIDI cantado "dobrado" pra oitava mais próxima do alvo — o gráfico mostra o contorno (sobe/desce)
// sem a linha voar pra fora quando o aluno canta a classe certa numa oitava diferente da escrita.
function foldToNearestOctave(sungMidi: number, referenceMidi: number): number {
  return sungMidi + 12 * Math.round((referenceMidi - sungMidi) / 12);
}

function noteLabel(frequencyHz: number): string {
  const midi = Math.round(frequencyToMidi(frequencyHz));
  return `${pitchClassNamePt(((midi % 12) + 12) % 12)}${midiToOctave(midi)}`;
}

function computeVerdict(note: ExpectedNote, frames: SungFrame[]): NoteResult {
  if (frames.length === 0) return { note, verdict: "missed", octaveNote: null };

  const onPitch = frames.filter((frame) => Math.abs(frame.centsOff) <= PITCH_TOLERANCE_CENTS);
  const ratio = onPitch.length / frames.length;
  if (ratio < ON_PITCH_RATIO) return { note, verdict: "wrong-pitch", octaveNote: null };

  const earliestElapsedMs = Math.min(...onPitch.map((frame) => frame.elapsedMs));
  const onTime = Math.abs(earliestElapsedMs - note.startMs) <= ONSET_TOLERANCE_MS;

  const sungMidi = Math.round(onPitch.reduce((sum, frame) => sum + frame.midi, 0) / onPitch.length);
  const octaveDescription = describeOctaveOffset(sungMidi, note.midiPitch);
  return {
    note,
    verdict: onTime ? "correct" : "wrong-timing",
    octaveNote: octaveDescription === "mesma oitava do escrito" ? null : octaveDescription,
  };
}

function cssColor(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value.length > 0 ? value : fallback;
}

export function SingAlongPractice({ abc, tokens }: { abc: string; tokens?: NotationToken[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tuneRef = useRef<TuneObject | null>(null);
  const expectedNotesRef = useRef<ExpectedNote[]>([]);
  const rawIndexToNoteIndexRef = useRef<number[]>([]);
  const totalMsRef = useRef(0);
  const qpmRef = useRef(DEFAULT_QPM);
  // Geração: cada início de "Ouvir modelo"/"Cantar junto" incrementa; qualquer callback assíncrono
  // (fim da contagem, timeout do loop) checa se ainda é a geração dele antes de agir. Sem isso,
  // cancelar e reiniciar rápido dispara playback duplicado.
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

  const singingTimingRef = useRef<TimingCallbacks | null>(null);
  const singingActiveRef = useRef(false);
  const phaseStartRef = useRef(0);
  const currentNoteIndexRef = useRef(-1);
  const framesByNoteRef = useRef<SungFrame[][]>([]);
  const resultsAccumulatorRef = useRef<NoteResult[]>([]);
  const countInTimeoutsRef = useRef<number[]>([]);

  const graphBufferRef = useRef<GraphSample[]>([]);
  const graphCanvasRef = useRef<HTMLCanvasElement>(null);
  const graphRafRef = useRef<number | null>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const anchorMidiRef = useRef(69);
  const distinctMidisRef = useRef<number[]>([]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [results, setResults] = useState<NoteResult[] | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [bpm, setBpm] = useState<number | null>(null);
  const [originalQpm, setOriginalQpm] = useState<number | null>(null);
  const [loopModel, setLoopModel] = useState(false);
  // A contagem de entrada serve tanto pro "Ouvir modelo" quanto pro "Cantar junto"; o gráfico só
  // aparece quando é pra cantar.
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

  // Re-deriva as notas esperadas quando o BPM muda — o start/duração de cada nota depende do
  // andamento. Não precisa re-renderizar a pauta, só recontar o tempo sobre o mesmo tune.
  useEffect(() => {
    const tune = tuneRef.current;
    if (!tune || bpm === null) return;
    qpmRef.current = bpm;
    const { notes, totalMs, rawIndexToNoteIndex } = extractExpectedNotes(tune, { qpm: bpm, tokens });
    expectedNotesRef.current = notes;
    rawIndexToNoteIndexRef.current = rawIndexToNoteIndex;
    totalMsRef.current = totalMs;
    // Âncora do gráfico = mediana das alturas escritas; linhas-guia = alturas distintas.
    const midis = notes.map((note) => note.midiPitch).sort((a, b) => a - b);
    anchorMidiRef.current = midis.length > 0 ? midis[Math.floor(midis.length / 2)] : 69;
    distinctMidisRef.current = [...new Set(midis)];
    setSetupError(notes.length === 0 ? "Não consegui ler as notas desta partitura para comparar com o canto." : null);
  }, [bpm, abc, tokens]);

  // ---- Microfone -> balde da nota corrente + buffer do gráfico -----------------------------
  useEffect(() => {
    return pitchListener.subscribe((frame) => {
      if (frame.frequencyHz === null) return;

      graphBufferRef.current.push({ t: frame.timestampMs, freqHz: frame.frequencyHz });
      if (graphBufferRef.current.length > 260) {
        const cutoff = frame.timestampMs - GRAPH_WINDOW_MS - 500;
        graphBufferRef.current = graphBufferRef.current.filter((sample) => sample.t >= cutoff);
      }

      const noteIndex = currentNoteIndexRef.current;
      const note = expectedNotesRef.current[noteIndex];
      if (singingActiveRef.current && note) {
        const midi = frequencyToMidi(frame.frequencyHz);
        const centsOff = centsFromPitchClass(frame.frequencyHz, note.pitchClass);
        const elapsedMs = frame.timestampMs - phaseStartRef.current;
        framesByNoteRef.current[noteIndex]?.push({ centsOff, elapsedMs, midi });
      }
    });
  }, [pitchListener]);

  // ---- Loop de desenho do gráfico (enquanto conta / canta) --------------------------------
  // Eixo Y = altura em semitons (não "cents fora do alvo"): a linha VERDE do alvo sobe e desce a
  // cada nota, mostrando o contorno da melodia; a linha da voz segue em altura absoluta (dobrada
  // pra oitava do alvo). Readout mostra nome da nota + frequência cantada.
  useEffect(() => {
    if (phase !== "singing" && phase !== "counting-in") return;
    const canvas = graphCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const targetColor = cssColor("--color-success", "green");
    const voiceColor = cssColor("--color-primary", "royalblue");
    const offColor = cssColor("--color-destructive", "crimson");
    const gridColor = cssColor("--color-border", "gray");

    function draw() {
      const width = canvas!.clientWidth || 300;
      const height = canvas!.clientHeight || 110;
      if (canvas!.width !== width) canvas!.width = width;
      if (canvas!.height !== height) canvas!.height = height;
      ctx!.clearRect(0, 0, width, height);

      const anchor = anchorMidiRef.current;
      const mid = height / 2;
      const usable = mid - 8;
      const midiToY = (midi: number) => {
        const rel = Math.max(-GRAPH_HALF_RANGE_SEMITONES, Math.min(GRAPH_HALF_RANGE_SEMITONES, midi - anchor));
        return mid - (rel / GRAPH_HALF_RANGE_SEMITONES) * usable;
      };

      // linhas-guia nas alturas escritas da melodia
      ctx!.strokeStyle = gridColor;
      ctx!.lineWidth = 1;
      ctx!.globalAlpha = 0.5;
      for (const midi of distinctMidisRef.current) {
        const y = midiToY(midi);
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;

      const note = expectedNotesRef.current[currentNoteIndexRef.current];
      const targetMidi = note ? note.midiPitch : anchor;

      // faixa de tolerância + linha do alvo (na altura da nota corrente — pula a cada nota)
      const bandTop = midiToY(targetMidi + PITCH_TOLERANCE_SEMITONES);
      const bandBottom = midiToY(targetMidi - PITCH_TOLERANCE_SEMITONES);
      ctx!.globalAlpha = 0.16;
      ctx!.fillStyle = targetColor;
      ctx!.fillRect(0, bandTop, width, bandBottom - bandTop);
      ctx!.globalAlpha = 1;
      ctx!.strokeStyle = targetColor;
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(0, midiToY(targetMidi));
      ctx!.lineTo(width, midiToY(targetMidi));
      ctx!.stroke();

      const now = performance.now();
      const samples = graphBufferRef.current.filter((sample) => sample.t >= now - GRAPH_WINDOW_MS);
      ctx!.strokeStyle = voiceColor;
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      samples.forEach((sample, index) => {
        const x = width - ((now - sample.t) / GRAPH_WINDOW_MS) * width;
        const folded = foldToNearestOctave(frequencyToMidi(sample.freqHz), targetMidi);
        const y = midiToY(folded);
        if (index === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      });
      ctx!.stroke();

      const last = samples.at(-1);
      if (last) {
        const foldedLast = foldToNearestOctave(frequencyToMidi(last.freqHz), targetMidi);
        const onPitch = Math.abs(foldedLast - targetMidi) <= PITCH_TOLERANCE_SEMITONES;
        ctx!.fillStyle = onPitch ? targetColor : offColor;
        ctx!.beginPath();
        ctx!.arc(width - 5, midiToY(foldedLast), 4.5, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (readoutRef.current) {
        const alvo = note ? pitchClassNamePt(note.pitchClass) : "—";
        const voz = last ? `${noteLabel(last.freqHz)} · ${Math.round(last.freqHz)} Hz` : "—";
        readoutRef.current.textContent = `alvo ${alvo}  ·  você ${voz}`;
      }

      graphRafRef.current = window.requestAnimationFrame(draw);
    }
    graphRafRef.current = window.requestAnimationFrame(draw);
    return () => {
      if (graphRafRef.current !== null) window.cancelAnimationFrame(graphRafRef.current);
      graphRafRef.current = null;
    };
  }, [phase]);

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
  // Os cliques são agendados no relógio do AudioContext (precisão de amostra); só o resolve da
  // promise usa setTimeout, e um erro de poucos ms aí é imperceptível.
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

  // Cancela qualquer fase ativa (contagem, modelo ou canto) e volta pro estado ocioso.
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
    graphBufferRef.current = [];
    currentNoteIndexRef.current = 0; // já mira a 1ª nota durante a contagem (alimenta o gráfico)
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
        beatCallback: () => playMetronomeClick(metronomeAudioContext),
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

  function resetPractice() {
    clearHighlights(expectedNotesRef.current);
    resultsAccumulatorRef.current = [];
    framesByNoteRef.current = [];
    currentNoteIndexRef.current = -1;
    graphBufferRef.current = [];
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
  const showGraph = phase === "singing" || (phase === "counting-in" && countInForSinging);

  return (
    <div className="mt-2 space-y-3 rounded-md border border-border bg-card p-3">
      <div ref={containerRef} className="overflow-x-auto" />

      {showGraph && (
        <div className="space-y-1">
          <canvas ref={graphCanvasRef} className="h-28 w-full rounded-md border border-border bg-muted/30" />
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground/56">
            <span>
              A linha verde é a nota certa (sobe e desce com a melodia); a faixa é a margem aceita; a
              linha clara é a sua voz.
              {phase === "counting-in" ? " Comece a cantar no “1”." : ""}
            </span>
            <span ref={readoutRef} className="shrink-0 font-medium tabular-nums text-foreground">
              —
            </span>
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

      <div className="flex items-center gap-2">
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

      {phase === "idle" && (
        <p className="text-xs text-muted-foreground/56">
          Ao tocar em “Cantar junto”, o navegador vai pedir acesso ao microfone. Tem uma contagem de
          entrada (1-2-3-4) antes de começar. O áudio é analisado só no seu aparelho, em tempo real —
          nada é gravado nem enviado.
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
