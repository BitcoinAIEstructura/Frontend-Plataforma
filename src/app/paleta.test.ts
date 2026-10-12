// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/** Contraste WCAG 2.1 entre dos colores hex (#rrggbb). */
function contraste(a: string, b: string): number {
  const luminancia = (hex: string) => {
    const [r, g, v] = [1, 3, 5].map((i) => {
      const canal = parseInt(hex.slice(i, i + 2), 16) / 255;
      return canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * v;
  };
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number];
  return (claro + 0.05) / (oscuro + 0.05);
}

const css = readFileSync(join(__dirname, "globals.css"), "utf8");

function colores(tema: "oscuro" | "claro"): Record<string, string> {
  const partes = css.split('[data-theme="claro"]');
  const bloque = tema === "oscuro" ? partes[0]! : partes[1]!.split("@theme")[0]!;
  const resultado: Record<string, string> = {};
  for (const [, nombre, valor] of bloque.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/g)) {
    resultado[nombre!] = valor!;
  }
  return resultado;
}

const TEXTOS = ["texto", "texto-secundario", "texto-atenuado", "oro", "bitcoin", "violeta", "sube", "baja", "error"];
const FONDOS = ["fondo", "superficie", "superficie-alta"];

describe.each(["oscuro", "claro"] as const)("tema %s", (tema) => {
  const c = colores(tema);

  it.each(TEXTOS.flatMap((t) => FONDOS.map((f) => [t, f] as const)))(
    "%s sobre %s se lee (≥ 4,5:1)",
    (texto, fondo) => {
      expect(contraste(c[texto]!, c[fondo]!)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("el texto de los botones dorados se lee (≥ 4,5:1)", () => {
    expect(contraste(c["sobre-oro"]!, c["oro"]!)).toBeGreaterThanOrEqual(4.5);
  });
});

it("cálculo de contraste: negro sobre blanco es 21:1", () => {
  expect(contraste("#000000", "#ffffff")).toBeCloseTo(21, 5);
});
