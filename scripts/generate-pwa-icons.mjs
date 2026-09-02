/**
 * Gera os ícones da PWA a partir do logo da marca (public/brand/brand-logo.png — o wordmark
 * "VENORE" em branco). Saída em public/icons/.
 *
 *   node scripts/generate-pwa-icons.mjs
 *
 * O logo é um wordmark largo e branco: fica bem sobre fundo escuro, some sobre claro. Por isso o
 * ícone é o wordmark centrado sobre BG (cinza quase-preto, neutro de tema). Rode de novo se trocar
 * a arte da marca. Não é bonito num ícone quadrado (wordmark largo, sobra margem em cima/baixo) —
 * decisão consciente de "gerar do que existe"; trocar depois por um monograma quadrado é só
 * substituir os PNGs.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = resolve(ROOT, "public/brand/brand-logo.png");
const OUT_DIR = resolve(ROOT, "public/icons");
const BG = { r: 0x17, g: 0x17, b: 0x17, alpha: 1 }; // #171717 — fundo escuro neutro

/** Wordmark redimensionado por LARGURA (é ele o eixo limitante), centrado sobre um quadrado BG. */
async function make(size, widthRatio, { flatten = false } = {}) {
  const logoW = Math.round(size * widthRatio);
  const logo = await sharp(await readFile(SRC))
    .resize({ width: logoW, fit: "inside" })
    .toBuffer();
  const { height: logoH } = await sharp(logo).metadata();

  let img = sharp({ create: { width: size, height: size, channels: 4, background: BG } }).composite([
    { input: logo, top: Math.round((size - logoH) / 2), left: Math.round((size - logoW) / 2) },
  ]);
  if (flatten) img = img.flatten({ background: BG });
  return img.png().toBuffer();
}

await mkdir(OUT_DIR, { recursive: true });

const jobs = [
  ["icon-192.png", await make(192, 0.82)],
  ["icon-512.png", await make(512, 0.82)],
  // maskable: o SO pode cortar até ~20% de cada borda — mantém o wordmark dentro da zona segura.
  ["icon-maskable-512.png", await make(512, 0.62)],
  // apple-touch-icon: iOS não gosta de alpha e arredonda o canto ele mesmo.
  ["apple-touch-icon.png", await make(180, 0.82, { flatten: true })],
];

for (const [name, buf] of jobs) {
  await writeFile(resolve(OUT_DIR, name), buf);
  console.log(`public/icons/${name}  (${buf.length} bytes)`);
}
