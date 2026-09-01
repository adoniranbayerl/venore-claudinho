/**
 * Converte um curso escrito em Markdown (docs/cursos/<curso>.md) no pacote de importação
 * da Academy: `<slug>.manifest.json` + `<slug>.zip` (manifest.json na raiz do zip).
 *
 *   npx tsx scripts/build-course-bundle.ts docs/cursos/jesus-cristo-mudou-meu-viver.md
 *
 * Sem argumento, usa docs/cursos/jesus-cristo-mudou-meu-viver.md. Saída em docs/cursos/dist/.
 *
 * O formato do .md está documentado no cabeçalho de cada arquivo de curso e em
 * docs/academy-course-bundle-format.md. Blocos ```notation têm o ABC parseado aqui (via
 * parseAbcToComposition) para os tokens que o bloco academy.notation.sheet espera — o mesmo
 * caminho que o seed usava em seeds/shared/course-builder.ts.
 */
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { zipSync } from "fflate";
import { parseAbcToComposition } from "../src/plugins/academy/components/notation-abc-parse";

// ---------------------------------------------------------------------------------------------
// tipos do manifest (espelho de src/plugins/academy/shared/course-bundle-manifest.ts)
// ---------------------------------------------------------------------------------------------
type DeliverableFormat = "text" | "audio" | "image" | "pdf" | "none";
type ComposedBlock = { id: string; key: string; slot: string; data: Record<string, unknown>; areas: { key: string; blocks: ComposedBlock[] }[] };

type ExportedLessonSection = { title: string; textData: { blocks: ComposedBlock[] } | null; videoUrl: string | null };
type ExportedLessonExample = { title: string; audioMediaRef: null; sheetMediaRef: null; notationData: string | null; captionText: string };
type ExportedLessonActivity = { title: string; instructionsText: string; deliverableFormat: DeliverableFormat };
type ExportedQuizQuestion = {
  text: string;
  options: string[];
  correctOptionIndex: number;
  questionKind?: "text" | "audio";
  promptNotation?: string | null;
  optionNotations?: (string | null)[] | null;
};
type ExportedLessonRequirements = {
  readTextEnabled: boolean;
  watchVideoEnabled: boolean;
  quizEnabled: boolean;
  quizPassThresholdPercent: number | null;
  quizMaxAttempts: number | null;
  activityEnabled: boolean;
};
type ExportedLesson = {
  title: string;
  videoUrl: string | null;
  coverMediaRef: null;
  status: "draft" | "restricted" | "public";
  sections: ExportedLessonSection[];
  materials: [];
  examples: ExportedLessonExample[];
  activities: ExportedLessonActivity[];
  quizQuestions: ExportedQuizQuestion[];
  requirements: ExportedLessonRequirements | null;
};
type Manifest = {
  format: "venore-academy-course";
  formatVersion: 1;
  exportedAt: string;
  course: {
    title: string;
    description: string | null;
    slug: string;
    status: "draft" | "restricted" | "public";
    publiclyListed: boolean;
    coverMediaRef: null;
    lessons: ExportedLesson[];
  };
  mediaAssets: [];
};

// ---------------------------------------------------------------------------------------------
// helpers de composição (espelho de seeds/shared/course-builder.ts)
// ---------------------------------------------------------------------------------------------
function leaf(key: string, data: Record<string, unknown>): ComposedBlock {
  return { id: randomUUID(), key, slot: "", data, areas: [] };
}
function sectionWrapper(children: ComposedBlock[]): ComposedBlock {
  return {
    id: randomUUID(),
    key: "core.layout.section",
    slot: "",
    data: { background: "none", maxWidth: "full", paddingY: "sm", paddingX: "sm", title: "", icon: "", titleAlign: "start" },
    areas: [{ key: "content", blocks: children }],
  };
}
function notationBlockData(abc: string, caption: string, allowSingAlong: boolean): Record<string, unknown> {
  const parsed = parseAbcToComposition(abc);
  if ("error" in parsed) {
    throw new Error(`ABC inválido num bloco de partitura: ${parsed.error}\n---\n${abc}`);
  }
  const c = parsed.composition;
  return {
    tokens: c.tokens,
    key: c.key,
    timeSignature: c.timeSignature,
    bpm: c.bpm,
    showNoteNames: c.showNoteNames,
    lyrics: c.lyrics ?? [],
    voices: c.voices ?? [],
    caption,
    allowSingAlong,
  };
}

// ---------------------------------------------------------------------------------------------
// parser de markdown
// ---------------------------------------------------------------------------------------------
const FORMAT_MAP: Record<string, DeliverableFormat> = {
  texto: "text",
  "áudio": "audio",
  audio: "audio",
  imagem: "image",
  pdf: "pdf",
  "—": "none",
  nenhuma: "none",
  "": "none",
};

/** Remove a indentação comum de um bloco de linhas (fences aninhados em listas vêm indentados). */
function dedent(lines: string[]): string {
  const nonEmpty = lines.filter((l) => l.trim());
  const min = nonEmpty.reduce((m, l) => Math.min(m, l.match(/^ */)![0].length), Infinity);
  const pad = Number.isFinite(min) ? min : 0;
  return lines.map((l) => l.slice(pad)).join("\n");
}

/** Divide um corpo em segmentos de markdown e blocos cercados (```lang ... ```), preservando a ordem. */
type Segment = { kind: "md"; text: string } | { kind: "fence"; lang: string; body: string };
function splitSegments(lines: string[]): Segment[] {
  const out: Segment[] = [];
  let md: string[] = [];
  const flush = () => {
    const text = md.join("\n").trim();
    if (text) out.push({ kind: "md", text });
    md = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^(\s*)```([a-zA-Z-]*)\s*$/);
    if (open) {
      flush();
      const lang = open[2];
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      out.push({ kind: "fence", lang, body: dedent(body) });
      continue;
    }
    md.push(lines[i]);
  }
  flush();
  return out;
}

/** `#### Título` seguido de corpo → ExportedLessonSection. */
function parseSecoes(block: string): ExportedLessonSection[] {
  const parts = block.split(/^#### +/m).slice(1); // primeiro pedaço é lixo antes do 1º ####
  const sections: ExportedLessonSection[] = [];
  for (const part of parts) {
    const lines = part.split("\n");
    const title = lines[0].trim();
    const segments = splitSegments(lines.slice(1));

    const children: ComposedBlock[] = [];
    let mdAccum = "";
    const flushMd = () => {
      const t = mdAccum.trim();
      if (t) children.push(leaf("core.content.richtext", { content: t }));
      mdAccum = "";
    };

    for (const seg of segments) {
      if (seg.kind === "md") {
        mdAccum = mdAccum ? `${mdAccum}\n\n${seg.text}` : seg.text;
        continue;
      }
      if (seg.lang === "youtube") {
        // Vira um bloco academy.video (iframe embutido). O título, quando houver, vai como um
        // richtext em negrito logo antes; a descrição é a legenda do vídeo.
        const f = parseKvBlock(seg.body);
        if (f.title) {
          mdAccum = mdAccum ? `${mdAccum}\n\n**${f.title}**` : `**${f.title}**`;
        }
        flushMd();
        children.push(leaf("academy.video", { url: f.url ?? "", caption: f.description ?? "" }));
        continue;
      }
      flushMd();
      if (seg.lang === "drum-grid") {
        const f = parseKvBlock(seg.body);
        children.push(
          leaf("academy.drum-grid", {
            style: f.style ?? "backbeat",
            bpm: Number(f.bpm ?? 90),
            bars: Number(f.bars ?? 2),
            caption: f.caption ?? "",
          }),
        );
      } else if (seg.lang === "progression") {
        const f = parseKvBlock(seg.body);
        children.push(
          leaf("academy.progression", {
            chords: f.chords ?? "",
            key: f.key ?? "C",
            bpm: Number(f.bpm ?? 90),
            beatsPerChord: Number(f.beatsPerChord ?? 4),
            caption: f.caption ?? "",
          }),
        );
      } else if (seg.lang === "notation") {
        const [head, abc] = splitOnDashes(seg.body);
        const f = parseKvBlock(head);
        const allowSingAlong = /^(yes|sim|true)$/i.test((f.singalong ?? f.singAlong ?? "yes").trim());
        children.push(leaf("academy.notation.sheet", notationBlockData(abc.trim(), f.caption ?? "", allowSingAlong)));
      } else {
        throw new Error(`Bloco cercado desconhecido numa seção: \`\`\`${seg.lang}`);
      }
    }
    flushMd();

    sections.push({ title, textData: { blocks: [sectionWrapper(children)] }, videoUrl: null });
  }
  return sections;
}

function parseKvBlock(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([a-zA-Z]+)\s*:\s*(.*)$/);
    if (m) out[m[1].toLowerCase()] = m[2].trim();
  }
  return out;
}
function splitOnDashes(body: string): [string, string] {
  const lines = body.split("\n");
  const idx = lines.findIndex((l) => l.trim() === "---");
  if (idx === -1) return ["", body];
  return [lines.slice(0, idx).join("\n"), lines.slice(idx + 1).join("\n")];
}

function parseExemplos(block: string): ExportedLessonExample[] {
  const parts = block.split(/^#### +/m).slice(1);
  const out: ExportedLessonExample[] = [];
  for (const part of parts) {
    const lines = part.split("\n");
    const title = lines[0].trim();
    const rest = lines.slice(1);
    const legendaLine = rest.find((l) => /^\s*Legenda:\s*/i.test(l));
    const captionText = legendaLine ? legendaLine.replace(/^\s*Legenda:\s*/i, "").trim() : "";
    const seg = splitSegments(rest).find((s): s is Extract<Segment, { kind: "fence" }> => s.kind === "fence" && (s.lang === "abc" || s.lang === ""));
    if (!seg) throw new Error(`Exemplo "${title}" sem bloco \`\`\`abc.`);
    out.push({ title, audioMediaRef: null, sheetMediaRef: null, notationData: seg.body.trim(), captionText });
  }
  return out;
}

function parseAtividades(block: string): ExportedLessonActivity[] {
  const out: ExportedLessonActivity[] = [];
  const lines = block.split("\n");
  let current: { title: string; format: DeliverableFormat; instr: string[] } | null = null;
  const commit = () => {
    if (current) out.push({ title: current.title, instructionsText: current.instr.join(" ").trim(), deliverableFormat: current.format });
    current = null;
  };
  for (const line of lines) {
    const head = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*(?:[—-]\s*entrega:\s*(.+?))?\s*$/i);
    if (head) {
      commit();
      const fmtRaw = (head[2] ?? "").trim().toLowerCase().replace(/\.$/, "");
      current = { title: head[1].trim(), format: FORMAT_MAP[fmtRaw] ?? "none", instr: [] };
      continue;
    }
    if (current && line.trim()) current.instr.push(line.trim());
  }
  commit();
  return out;
}

function parseQuiz(block: string): ExportedQuizQuestion[] {
  const out: ExportedQuizQuestion[] = [];
  const lines = block.split("\n");
  let q: { text: string; options: string[]; correct: number; prompt: string | null; inFence: boolean; fence: string[] } | null = null;
  const commit = () => {
    if (!q) return;
    if (q.correct < 0) throw new Error(`Pergunta sem alternativa correta ([x]): "${q.text}"`);
    const question: ExportedQuizQuestion = { text: q.text, options: q.options, correctOptionIndex: q.correct };
    if (q.prompt) {
      question.questionKind = "audio";
      question.promptNotation = q.prompt.trim();
    }
    out.push(question);
    q = null;
  };
  for (const line of lines) {
    if (q?.inFence) {
      if (/^\s*```\s*$/.test(line)) {
        q.prompt = dedent(q.fence);
        q.inFence = false;
      } else {
        q.fence.push(line);
      }
      continue;
    }
    const head = line.match(/^\d+\.\s+(.*\S)\s*$/);
    if (head && !/^\s*-\s*\[/.test(line)) {
      commit();
      q = { text: head[1].trim(), options: [], correct: -1, prompt: null, inFence: false, fence: [] };
      continue;
    }
    if (!q) continue;
    const opt = line.match(/^\s*-\s*\[([ xX])\]\s+(.*\S)\s*$/);
    if (opt) {
      if (opt[1].toLowerCase() === "x") q.correct = q.options.length;
      q.options.push(opt[2].trim());
      continue;
    }
    const fenceOpen = line.match(/^\s*```(abc-prompt|abc)\s*$/);
    if (fenceOpen) {
      q.inFence = true;
      q.fence = [];
      continue;
    }
  }
  commit();
  return out;
}

// ---------------------------------------------------------------------------------------------
// pipeline
// ---------------------------------------------------------------------------------------------
function build(mdPath: string): Manifest {
  let raw = readFileSync(mdPath, "utf8").replace(/\r\n/g, "\n").replace(/^﻿/, "");
  raw = raw.replace(/^<!--[\s\S]*?-->\s*/, ""); // comentário de formato no topo

  const fm = raw.match(/^\s*---\n([\s\S]*?)\n---\n/);
  if (!fm) throw new Error("Frontmatter YAML (--- ... ---) não encontrado.");
  const meta = parseKvBlock(fm[1]);
  const body = raw.slice(fm.index! + fm[0].length);

  const status = (meta.status ?? "draft") as Manifest["course"]["status"];
  const lessons: ExportedLesson[] = [];

  const chunks = body.split(/^## +Aula /m).slice(1);
  for (const chunk of chunks) {
    const firstNl = chunk.indexOf("\n");
    const title = `Aula ${chunk.slice(0, firstNl).trim()}`;
    const lessonBody = chunk.slice(firstNl + 1);

    const parts = lessonBody.split(/^### +/m);
    const byName: Record<string, string> = {};
    for (const p of parts) {
      const nl = p.indexOf("\n");
      if (nl === -1) continue;
      const name = p.slice(0, nl).trim().toLowerCase();
      byName[name] = p.slice(nl + 1);
    }

    const sections = byName["seções"] ? parseSecoes(byName["seções"]) : [];
    const examples = byName["exemplos"] ? parseExemplos(byName["exemplos"]) : [];
    const activities = byName["atividades"] ? parseAtividades(byName["atividades"]) : [];
    const quizQuestions = byName["quiz"] ? parseQuiz(byName["quiz"]) : [];

    const hasQuiz = quizQuestions.length > 0;
    lessons.push({
      title,
      videoUrl: null,
      coverMediaRef: null,
      status: "restricted",
      sections,
      materials: [],
      examples,
      activities,
      quizQuestions,
      requirements: {
        readTextEnabled: sections.length > 0,
        watchVideoEnabled: false,
        quizEnabled: hasQuiz,
        quizPassThresholdPercent: hasQuiz ? 70 : null,
        quizMaxAttempts: hasQuiz ? 3 : null,
        activityEnabled: activities.length > 0,
      },
    });
  }

  return {
    format: "venore-academy-course",
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    course: {
      title: meta.title ?? basename(mdPath),
      description: meta.description ?? null,
      slug: meta.slug ?? basename(mdPath).replace(/\.md$/, ""),
      status,
      publiclyListed: /^(true|yes|sim)$/i.test(meta.publiclylisted ?? "false"),
      coverMediaRef: null,
      lessons,
    },
    mediaAssets: [],
  };
}

// ---------------------------------------------------------------------------------------------
const mdArg = process.argv[2] ?? "docs/cursos/jesus-cristo-mudou-meu-viver.md";
const mdPath = resolve(process.cwd(), mdArg);
const manifest = build(mdPath);

const outDir = resolve(process.cwd(), "docs/cursos/dist");
mkdirSync(outDir, { recursive: true });
const slug = manifest.course.slug;

const manifestJson = JSON.stringify(manifest, null, 2);
writeFileSync(join(outDir, `${slug}.manifest.json`), manifestJson);

const zip = zipSync({ "manifest.json": new TextEncoder().encode(manifestJson) }, { level: 6 });
writeFileSync(join(outDir, `${slug}.zip`), zip);

// resumo
const L = manifest.course.lessons;
console.log(`curso: ${manifest.course.title}  [slug: ${slug}, status: ${manifest.course.status}]`);
console.log(`aulas: ${L.length}`);
for (const l of L) {
  const notation = l.sections.reduce(
    (n, s) => n + (s.textData?.blocks[0].areas[0].blocks.filter((b) => b.key === "academy.notation.sheet").length ?? 0),
    0,
  );
  const drum = l.sections.reduce(
    (n, s) => n + (s.textData?.blocks[0].areas[0].blocks.filter((b) => b.key === "academy.drum-grid").length ?? 0),
    0,
  );
  const audioQ = l.quizQuestions.filter((q) => q.questionKind === "audio").length;
  console.log(
    `  ${l.title.padEnd(46)} seções ${l.sections.length}, exemplos ${l.examples.length}, quiz ${l.quizQuestions.length} (áudio ${audioQ}), ativ ${l.activities.length}` +
      (notation ? `, partituras ${notation}` : "") +
      (drum ? `, bateria ${drum}` : ""),
  );
}
console.log(`\nescrito: docs/cursos/dist/${slug}.manifest.json`);
console.log(`escrito: docs/cursos/dist/${slug}.zip`);
