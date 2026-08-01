// Compressão one-off dos assets fotográficos de src/assets/img.
// Rodar com: node scripts/optimize-images.mjs
import sharp from "sharp";
import { readdir, stat, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imgDir = path.join(__dirname, "..", "src", "assets", "img");
const MAX_DIMENSION = 1920;

const jpgFiles = ["svjBg.jpg", "huayraBg.jpg", "sennaBg.jpg", "gt3Bg.jpg"];
const pngToWebp = [
  { from: "wallpaper2.png", to: "wallpaper2.webp" },
  { from: "wallpaper3.png", to: "wallpaper3.webp" },
];

const fmt = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

async function optimizeJpg(file) {
  const filePath = path.join(imgDir, file);
  const tmpPath = `${filePath}.tmp`;
  const before = (await stat(filePath)).size;
  await sharp(filePath)
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(tmpPath);
  await rename(tmpPath, filePath);
  const after = (await stat(filePath)).size;
  console.log(`${file}: ${fmt(before)} -> ${fmt(after)}`);
}

async function convertPngToWebp({ from, to }) {
  const fromPath = path.join(imgDir, from);
  const toPath = path.join(imgDir, to);
  const before = (await stat(fromPath)).size;
  await sharp(fromPath)
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(toPath);
  const after = (await stat(toPath)).size;
  console.log(`${from} -> ${to}: ${fmt(before)} -> ${fmt(after)}`);
}

async function main() {
  const entries = await readdir(imgDir);

  for (const file of jpgFiles) {
    if (entries.includes(file)) await optimizeJpg(file);
  }

  for (const pair of pngToWebp) {
    if (entries.includes(pair.from)) await convertPngToWebp(pair);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
