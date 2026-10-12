import { describe, expect, it } from "vitest";

import { ESTRUCTURAS_DEMO } from "@/lib/api/estructuras";

import { FICHAS, MAXIMO_OPERACIONES } from "./catalogo";

describe("catálogo de estructuras", () => {
  it("hay una ficha por cada estructura de la demostración, en el mismo orden", () => {
    expect(FICHAS.map((f) => f.id)).toEqual([...ESTRUCTURAS_DEMO]);
  });

  it("cada ejemplo usa solo sus operaciones y cabe en el máximo", () => {
    for (const ficha of FICHAS) {
      const validas = new Set(ficha.botones.map((b) => b.operacion));
      expect(ficha.ejemplo.length).toBeLessThanOrEqual(MAXIMO_OPERACIONES);
      for (const op of ficha.ejemplo) expect(validas.has(op.operacion)).toBe(true);
      expect(ficha.enNexabit.length).toBeGreaterThan(20);
    }
  });
});
