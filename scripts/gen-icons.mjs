// Gera os PNGs do PWA a partir dos SVGs (raio + coroa).
// Uso: node scripts/gen-icons.mjs
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "icons");

async function render(svgPath, size, outName) {
  const svg = await readFile(join(here, svgPath));
  const png = await sharp(svg).resize(size, size).png().toBuffer();
  await writeFile(join(outDir, outName), png);
  console.log(`ok: ${outName} (${size}px)`);
}

await mkdir(outDir, { recursive: true });
await render("icon.svg", 192, "icon-192.png");
await render("icon.svg", 512, "icon-512.png");
await render("maskable.svg", 512, "icon-maskable-512.png");
await render("icon.svg", 180, "apple-touch-icon.png");
await render("icon.svg", 32, "favicon-32.png");
console.log("Ícones gerados em public/icons");
