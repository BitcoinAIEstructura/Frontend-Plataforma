import { describe, expect, it } from "vitest";

import { marcasEnVelas } from "./datos";

const H = 3_600_000;
const vela = (i: number) => ({
  tiempoApertura: i * H,
  tiempoCierre: (i + 1) * H - 1,
  apertura: 1,
  maximo: 1,
  minimo: 1,
  cierre: 1,
  volumen: 1,
});

describe("marcasEnVelas", () => {
  it("pone cada orden en su vela, agrupa las del mismo tipo y omite las de fuera", () => {
    const velas = [vela(10), vela(11), vela(12)];
    const marcas = marcasEnVelas(velas, [
      { tiempo: 11 * H + 60_000, tipo: "VENTA" },
      { tiempo: 10 * H + 5, tipo: "COMPRA" },
      { tiempo: 10 * H + 900_000, tipo: "COMPRA" },
      { tiempo: 2 * H, tipo: "COMPRA" }, // antes de las velas visibles
      { tiempo: 40 * H, tipo: "VENTA" }, // después
    ]);
    expect(marcas).toEqual([
      { tiempoVela: 10 * H, tipo: "COMPRA", cantidad: 2 },
      { tiempoVela: 11 * H, tipo: "VENTA", cantidad: 1 },
    ]);
  });
});
