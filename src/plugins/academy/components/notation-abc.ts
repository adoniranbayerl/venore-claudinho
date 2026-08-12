// Serialização de tokens do NotationEditor pra notação ABC (https://abcnotation.com), consumida
// pelo abcjs tanto aqui (preview) quanto no InteractiveNotation do aluno. L:1/8 fixo no header —
// os sufixos de duração abaixo são todos relativos a colcheia (DURATION_SUFFIX).

export type NoteDuration = "sixteenth" | "eighth" | "quarter" | "half" | "whole";
export type Accidental = "sharp" | "flat" | "natural";
export type PitchLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";

export type TimeSignature = "2/4" | "3/4" | "4/4" | "6/8" | "3/8" | "9/8" | "12/8";

// 12 maiores + relativas menores (mesma armadura de clave), cobrindo as 12 classes de nota com
// grafia idiomática — pares validados contra o círculo de quintas (ex: F# maior/Re#m não existe
// como par idiomático comum, usamos F#m como relativa de A maior etc.). Todo valor aqui é aceito
// direto pelo campo K: do ABC.
export type KeySignature =
  | "C"
  | "G"
  | "D"
  | "A"
  | "E"
  | "B"
  | "F#"
  | "Db"
  | "Ab"
  | "Eb"
  | "Bb"
  | "F"
  | "Am"
  | "Em"
  | "Bm"
  | "F#m"
  | "C#m"
  | "G#m"
  | "D#m"
  | "Bbm"
  | "Fm"
  | "Cm"
  | "Gm"
  | "Dm";

export type NotationToken =
  | {
      type: "note";
      pitch: PitchLetter;
      octave: number;
      accidental: Accidental | null;
      duration: NoteDuration;
      // Expressão — todas opcionais, aplicadas só a notas (não a pausa/barra, por escopo).
      staccato?: boolean;
      accent?: boolean;
      fermata?: boolean;
      tied?: boolean; // liga à PRÓXIMA nota — só faz sentido musicalmente se ela for a mesma altura
      crescendo?: "start" | "end" | null;
      slur?: "start" | "end" | null;
      chord?: string | null; // cifra/acorde (ex: "C", "G7", "Am") exibida acima desta nota
    }
  | { type: "rest"; duration: NoteDuration }
  | { type: "bar" };

// Composição completa: tokens sozinhos não bastam mais (tom/compasso/andamento deixaram de ser
// fixos). bpm é semínima por minuto — vira o campo Q: do header e o qpm passado pro abcjs tocar
// (synth e TimingCallbacks) em todo lugar que reproduz a melodia. showNoteNames é global (liga o
// nome da nota embaixo de TODA nota, não por nota individual) — diferente de `chord`, que é uma
// escolha por nota.
export type NotationComposition = {
  tokens: NotationToken[];
  key: KeySignature;
  timeSignature: TimeSignature;
  bpm: number;
  showNoteNames: boolean;
};

export const PITCH_LABELS_PT: Record<PitchLetter, string> = { C: "Dó", D: "Ré", E: "Mi", F: "Fá", G: "Sol", A: "Lá", B: "Si" };

export function notePitchNamePt(pitch: PitchLetter, accidental: Accidental | null): string {
  const accidentalSuffix = accidental === "sharp" ? "♯" : accidental === "flat" ? "♭" : "";
  return `${PITCH_LABELS_PT[pitch]}${accidentalSuffix}`;
}

// Aspas quebrariam a string ABC entre aspas de cifra/anotação — único caractere que precisa ser
// removido do texto livre que o professor digita.
function sanitizeAnnotationText(text: string): string {
  return text.replace(/"/g, "").trim();
}

const DURATION_SUFFIX: Record<NoteDuration, string> = { sixteenth: "/2", eighth: "", quarter: "2", half: "4", whole: "8" };
const ACCIDENTAL_PREFIX: Record<Accidental, string> = { sharp: "^", flat: "_", natural: "=" };

// ABC: sem modificador = oitava 4 (maiúscula), minúscula = oitava 5 — cada oitava abaixo/acima
// disso empilha mais uma vírgula/apóstrofo (C,, é oitava 2, c'' é oitava 7) — convenção padrão da
// notação, não uma escolha nossa. (Bug corrigido nesta sessão: a versão anterior só aplicava uma
// vírgula pra "oitava <= 3" inteira, então oitava 2 saía idêntica a oitava 3 no ABC gerado.)
function pitchToAbc(pitch: PitchLetter, octave: number): string {
  if (octave === 4) return pitch;
  if (octave < 4) return `${pitch}${",".repeat(4 - octave)}`;
  return `${pitch.toLowerCase()}${"'".repeat(octave - 5)}`;
}

// Ordem validada contra o parser real do abcjs (node_modules/abcjs/src/parse/abc_parse_music.js):
// cifra (`"Nome"`, sem prefixo = acorde de verdade, estilo/fonte de cifra) e anotação de nome de
// nota (`"_Nome"`, prefixo _ = texto livre abaixo) vêm primeiro, depois abre-slur, decorações
// (!nome!) logo antes da nota, acidente logo antes da nota/oitava/duração, tie (-) e fecha-slur
// depois da nota inteira.
export function tokenToAbc(token: NotationToken, opts?: { showNoteNames?: boolean }): string {
  if (token.type === "bar") return "|";
  if (token.type === "rest") return `z${DURATION_SUFFIX[token.duration]}`;

  const chordPrefix = token.chord ? `"${sanitizeAnnotationText(token.chord)}"` : "";
  const noteNamePrefix = opts?.showNoteNames ? `"_${notePitchNamePt(token.pitch, token.accidental)}"` : "";
  const slurOpen = token.slur === "start" ? "(" : "";
  const decorations = [
    token.crescendo === "start" ? "!crescendo(!" : token.crescendo === "end" ? "!crescendo)!" : "",
    token.accent ? "!accent!" : "",
    token.fermata ? "!fermata!" : "",
    token.staccato ? "!staccato!" : "",
  ].join("");
  const accidentalPrefix = token.accidental ? ACCIDENTAL_PREFIX[token.accidental] : "";
  const tieSuffix = token.tied ? "-" : "";
  const slurClose = token.slur === "end" ? ")" : "";

  return `${chordPrefix}${noteNamePrefix}${slurOpen}${decorations}${accidentalPrefix}${pitchToAbc(token.pitch, token.octave)}${DURATION_SUFFIX[token.duration]}${tieSuffix}${slurClose}`;
}

export type NoteTokenRange = { tokenIndex: number; start: number; end: number };

// Duração em unidades de L:1/8 — base pro agrupamento de colcheias/semicolcheias (ver
// BEAT_LENGTH_IN_EIGHTHS abaixo).
const DURATION_IN_EIGHTHS: Record<NoteDuration, number> = { sixteenth: 0.5, eighth: 1, quarter: 2, half: 4, whole: 8 };

// Tamanho de um "tempo" (unidade de agrupamento visual) em L:1/8, por fórmula de compasso — tempo
// simples (2/4, 3/4, 4/4) agrupa em semínimas (2 colcheias); tempo composto (3/8, 6/8, 9/8, 12/8)
// agrupa em semínimas pontuadas (3 colcheias). Convenção padrão de gravura musical, não é escolha
// nossa.
const BEAT_LENGTH_IN_EIGHTHS: Record<TimeSignature, number> = {
  "2/4": 2,
  "3/4": 2,
  "4/4": 2,
  "3/8": 3,
  "6/8": 3,
  "9/8": 3,
  "12/8": 3,
};

// K: por último de propósito — é o campo que sinaliza "fim do header" na gramática do ABC; o
// header antigo (fixo em Dó maior/4/4) tinha K: primeiro e o abcjs tolerava, mas isso deixa de ser
// prudente agora que K:/M: variam de verdade.
//
// Também devolve, pra cada token de nota, o intervalo de caracteres que ele ocupa na string final
// — é isso que permite ao NotationEditor mapear um clique numa nota renderizada (abcElem.startChar
// do clickListener do abcjs) de volta pro índice do token que a gerou, pra seleção/transposição.
//
// Notas dentro do mesmo tempo são concatenadas SEM espaço entre elas — é assim que o abcjs decide
// desenhar o travessão que liga colcheias/semicolcheias (um espaço força cada nota a ganhar sua
// própria bandeirola, mesmo dentro do mesmo tempo). Espaço só entra nas fronteiras de tempo, e
// sempre antes/depois de pausa e barra (que resetam o agrupamento).
export function compositionToAbcWithRanges({ key, timeSignature, tokens, bpm, showNoteNames }: NotationComposition): {
  abc: string;
  noteRanges: NoteTokenRange[];
} {
  const header = `X:1\nM:${timeSignature}\nL:1/8\nQ:1/4=${bpm}\nK:${key}\n`;
  const beatLength = BEAT_LENGTH_IN_EIGHTHS[timeSignature];
  const noteRanges: NoteTokenRange[] = [];

  let cursor = header.length;
  let body = "";
  let groupAccumulator = 0;

  tokens.forEach((token, tokenIndex) => {
    const str = tokenToAbc(token, { showNoteNames });
    let startsNewGroup: boolean;

    if (token.type === "note") {
      const durationInEighths = DURATION_IN_EIGHTHS[token.duration];
      startsNewGroup = groupAccumulator === 0 || groupAccumulator + durationInEighths > beatLength;
      groupAccumulator = startsNewGroup ? durationInEighths : groupAccumulator + durationInEighths;
    } else {
      startsNewGroup = true; // pausa/barra sempre isoladas por espaço, e resetam o agrupamento
      groupAccumulator = 0;
    }

    if (body.length > 0 && startsNewGroup) {
      body += " ";
      cursor += 1;
    }
    if (token.type === "note") noteRanges.push({ tokenIndex, start: cursor, end: cursor + str.length });
    body += str;
    cursor += str.length;
  });

  return { abc: `${header}${body}\n`, noteRanges };
}

export function compositionToAbc(composition: NotationComposition): string {
  return compositionToAbcWithRanges(composition).abc;
}

const NATURAL_SEMITONE: Record<PitchLetter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const ACCIDENTAL_SEMITONE_OFFSET: Record<Accidental, number> = { sharp: 1, flat: -1, natural: 0 };
// Índice = classe de nota (0-11); sempre grafado com sustenido — mesma convenção das teclas pretas
// do PianoKeyboard, não tenta escolher bemol/sustenido pela tonalidade corrente.
const SHARP_SPELLING_BY_PITCH_CLASS: { pitch: PitchLetter; accidental: Accidental | null }[] = [
  { pitch: "C", accidental: null },
  { pitch: "C", accidental: "sharp" },
  { pitch: "D", accidental: null },
  { pitch: "D", accidental: "sharp" },
  { pitch: "E", accidental: null },
  { pitch: "F", accidental: null },
  { pitch: "F", accidental: "sharp" },
  { pitch: "G", accidental: null },
  { pitch: "G", accidental: "sharp" },
  { pitch: "A", accidental: null },
  { pitch: "A", accidental: "sharp" },
  { pitch: "B", accidental: null },
];

// Mesma convenção de MIDI usada em todo o resto do app (src/lib/pitch-class.ts): oitava 4 = C4 =
// MIDI 60. Usado só pra transpor uma nota já colocada (setas ↑/↓ do NotationEditor).
export function noteToMidi(pitch: PitchLetter, octave: number, accidental: Accidental | null): number {
  return (octave + 1) * 12 + NATURAL_SEMITONE[pitch] + (accidental ? ACCIDENTAL_SEMITONE_OFFSET[accidental] : 0);
}

export function midiToNote(midi: number): { pitch: PitchLetter; octave: number; accidental: Accidental | null } {
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = ((midi % 12) + 12) % 12;
  const spelling = SHARP_SPELLING_BY_PITCH_CLASS[pitchClass];
  return { pitch: spelling.pitch, octave, accidental: spelling.accidental };
}
