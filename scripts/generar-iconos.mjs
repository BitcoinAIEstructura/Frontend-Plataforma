// Genera los íconos PNG de la app instalable (PWA) a partir de src/app/icon.svg.
// Uso: node scripts/generar-iconos.mjs  (usa sharp, que ya viene con Next.js)
import { readFile } from "node:fs/promises";

import sharp from "sharp";

const svg = await readFile(new URL("../src/app/icon.svg", import.meta.url));
const ONIX = "#07060b";

for (const tamano of [192, 512]) {
  await sharp(svg, { density: 512 })
    .resize(tamano, tamano)
    .png()
    .toFile(`public/iconos/nexabit-${tamano}.png`);
}

// "maskable": el teléfono puede recortarlo en círculo o gota, así que el logo va al 70 % con fondo ónix.
const logo = await sharp(svg, { density: 512 }).resize(358, 358).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: ONIX } })
  .composite([{ input: logo, gravity: "center" }])
  .png()
  .toFile("public/iconos/nexabit-maskable-512.png");

console.log("Íconos listos en public/iconos/");
