// Gera app/apple-icon.png e app/favicon.ico a partir de app/icon.svg.
// Uso: node scripts/generate-icons.mjs  (rode de novo se o icon.svg mudar)
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile(new URL("../app/icon.svg", import.meta.url));

const png = (size) =>
  sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// iOS arredonda o ícone sozinho; cantos transparentes ficariam pretos. Usa quadrado cheio.
const squareSvg = Buffer.from(svg.toString().replace('rx="56"', 'rx="0"'));
await writeFile(
  new URL("../app/apple-icon.png", import.meta.url),
  await sharp(squareSvg, { density: 384 }).resize(180, 180).png({ compressionLevel: 9 }).toBuffer(),
);

// ICO com PNGs embutidos (16, 32 e 48 px).
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);

let offset = 6 + 16 * images.length;
const entries = images.map((data, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(sizes[i], 0);
  entry.writeUInt8(sizes[i], 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(data.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += data.length;
  return entry;
});

await writeFile(
  new URL("../app/favicon.ico", import.meta.url),
  Buffer.concat([header, ...entries, ...images]),
);
console.log("ok: apple-icon.png (180) e favicon.ico (16/32/48)");
