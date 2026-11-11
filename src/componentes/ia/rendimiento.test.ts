import { describe, expect, it } from "vitest";

import { COMISION, curvasRendimiento } from "./rendimiento";

const punto = (tiempo: number, probabilidad: number, rendimiento: number) => ({
  tiempo,
  probabilidad,
  subio: rendimiento > 0,
  rendimiento,
});

describe("curvasRendimiento", () => {
  it("la IA solo tiene BTC cuando dice que sube y paga comisión al cambiar", () => {
    const { ia, guardar, operaciones } = curvasRendimiento([
      punto(1, 0.7, 0.1), // dentro: +10 %
      punto(2, 0.3, -0.2), // fuera: no pierde
      punto(3, 0.6, 0.05), // dentro otra vez
    ]);
    const c = 1 - COMISION;
    expect(operaciones).toBe(3);
    expect(ia.at(-1)!.valor).toBeCloseTo(100 * c * 1.1 * c * c * 1.05, 6);
    expect(guardar.at(-1)!.valor).toBeCloseTo(100 * c * 1.1 * 0.8 * 1.05, 6);
    expect(ia.map((p) => p.tiempo)).toEqual([1, 2, 3]);
  });

  it("sin velas no hay curvas", () => {
    expect(curvasRendimiento([])).toEqual({ ia: [], guardar: [], operaciones: 0 });
  });
});
