// Serialização de tokens do NotationEditor pra notação ABC (https://abcnotation.com), consumida
// pelo abcjs tanto aqui (preview) quanto no InteractiveNotation do aluno. L:1/8 fixo no header —
// os sufixos de duração abaixo são todos relativos a colcheia (DURATION_SUFFIX).

export type NoteDuration = "eighth" | "quarter" | "half" | "whole";
export type Accidental = "sharp" | "flat" | "natural";
export type PitchLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";

export type NotationToken =
  | { type: "note"; pitch: PitchLetter; octave: number; accidental: Accidental | null; duration: NoteDuration }
  | { type: "rest"; duration: NoteDuration }
  | { type: "bar" };

const DURATION_SUFFIX: Record<NoteDuration, string> = { eighth: "", quarter: "2", half: "4", whole: "8" };
const ACCIDENTAL_PREFIX: Record<Accidental, string> = { sharp: "^", flat: "_", natural: "=" };

// ABC: sem modificador = oitava 4 (maiúscula), minúscula = oitava 5, minúscula com ' = oitava 6,
// maiúscula com , = oitava 3 — convenção padrão da notação, não uma escolha nossa.
function pitchToAbc(pitch: PitchLetter, octave: number): string {
  if (octave <= 3) return `${pitch},`;
  if (octave === 4) return pitch;
  if (octave === 5) return pitch.toLowerCase();
  return `${pitch.toLowerCase()}'`;
}

export function tokenToAbc(token: NotationToken): string {
  if (token.type === "bar") return "|";
  if (token.type === "rest") return `z${DURATION_SUFFIX[token.duration]}`;
  const accidentalPrefix = token.accidental ? ACCIDENTAL_PREFIX[token.accidental] : "";
  return `${accidentalPrefix}${pitchToAbc(token.pitch, token.octave)}${DURATION_SUFFIX[token.duration]}`;
}

export function tokensToAbc(tokens: NotationToken[]): string {
  const body = tokens.map(tokenToAbc).join(" ");
  return `X:1\nK:C\nL:1/8\nM:4/4\n${body}\n`;
}
