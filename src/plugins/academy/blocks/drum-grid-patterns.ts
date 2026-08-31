// Grade de bateria (docs/academy-recursos-musicais.md — "Percussão") — presets de levada em 4/4,
// 16 passos (semicolcheias). O bloco toca via Web Audio (sons sintetizados) e mostra a grade;
// autoria por preset, não editor de célula (fica pra depois se precisar).

export type DrumVoice = "kick" | "snare" | "hihat";
export type DrumRow = { voice: DrumVoice; label: string; steps: boolean[] };
export type DrumPattern = { label: string; rows: DrumRow[] };

const STEPS = 16;

function row(voice: DrumVoice, label: string, on: number[]): DrumRow {
  const steps = Array.from({ length: STEPS }, (_, i) => on.includes(i));
  return { voice, label, steps };
}

// Passos: 0,4,8,12 = tempos 1,2,3,4. Ímpares/entre = subdivisões.
export const DRUM_PATTERNS: Record<string, DrumPattern> = {
  backbeat: {
    label: "Backbeat (2 e 4)",
    rows: [
      row("hihat", "Chimbal", [0, 2, 4, 6, 8, 10, 12, 14]),
      row("snare", "Caixa", [4, 12]),
      row("kick", "Bumbo", [0, 8, 10]),
    ],
  },
  marcha: {
    label: "Marcha (1 e 3)",
    rows: [
      row("hihat", "Chimbal", [0, 2, 4, 6, 8, 10, 12, 14]),
      row("snare", "Caixa", [0, 8]),
      row("kick", "Bumbo", [4, 12]),
    ],
  },
  "meio-tempo": {
    label: "Meio-tempo (caixa só no 3)",
    rows: [
      row("hihat", "Chimbal", [0, 2, 4, 6, 8, 10, 12, 14]),
      row("snare", "Caixa", [8]),
      row("kick", "Bumbo", [0, 6]),
    ],
  },
  "levada-cheia": {
    label: "Levada cheia (refrão)",
    rows: [
      row("hihat", "Chimbal", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
      row("snare", "Caixa", [4, 12, 14]),
      row("kick", "Bumbo", [0, 3, 8, 10, 11]),
    ],
  },
  // Levada groovada/funk (gospel) para "Jesus Cristo mudou meu viver" a ~85 BPM: chimbal em
  // semicolcheias contínuas, caixa no contratempo (2 e 4) com fantasmas na "a" de cada tempo forte,
  // e bumbo sincopado (1, "a" de 1, "e" de 2, "e" de 3) empurrando a frente do tempo.
  "groove-funk": {
    label: "Groove funk (gospel)",
    rows: [
      row("hihat", "Chimbal", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
      row("snare", "Caixa", [4, 7, 12, 15]),
      row("kick", "Bumbo", [0, 3, 6, 10]),
    ],
  },
};

export const DRUM_STEPS_PER_BAR = STEPS;
