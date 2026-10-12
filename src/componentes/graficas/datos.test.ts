import { describe, expect, it } from "vitest";

import { aLineaGrafica, aTiempoGrafica, aVelasGrafica, aVolumenGrafica, conAlfa } from "./datos";

const VELA = {
  tiempoApertura: Date.UTC(2026, 9, 12, 15, 0), // 10:00 en Bogotá
  apertura: 100,
  maximo: 110,
  minimo: 95,
  cierre: 105,
  volumen: 12.5,
  tiempoCierre: Date.UTC(2026, 9, 12, 15, 59, 59),
};

describe("datos para la gráfica", () => {
  it("los tiempos quedan en segundos y en hora de Bogotá", () => {
    const t = aTiempoGrafica(VELA.tiempoApertura);
    expect(new Date(t * 1000).getUTCHours()).toBe(10);
  });

  it("velas y volumen", () => {
    expect(aVelasGrafica([VELA])[0]).toMatchObject({ open: 100, high: 110, low: 95, close: 105 });
    const [sube, baja] = aVolumenGrafica([VELA, { ...VELA, cierre: 90 }], "#00ff00", "#ff0000");
    expect(sube).toMatchObject({ value: 12.5, color: "#00ff00" });
    expect(baja?.color).toBe("#ff0000");
  });

  it("líneas de indicadores", () => {
    expect(aLineaGrafica([{ tiempo: VELA.tiempoApertura, valor: 42 }])[0]?.value).toBe(42);
  });

  it("transparencia", () => {
    expect(conAlfa("#139c8e", 0.5)).toBe("#139c8e80");
    expect(conAlfa("rgb(1,2,3)", 0.5)).toBe("rgb(1,2,3)");
  });
});
