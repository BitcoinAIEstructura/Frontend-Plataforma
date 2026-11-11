import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Estadisticas } from "@/lib/api/simulacion";
import { renderizar, servidorFalso } from "@/test/utilidades";

import { barrasActividad, barrasGanancia, TarjetaEstadisticas } from "./TarjetaEstadisticas";

afterEach(() => vi.unstubAllGlobals());

const DIA = 86_400_000;
const ESTADISTICAS: Estadisticas = {
  operaciones: [
    { idOrden: 2, tiempo: 1_762_000_000_000, ganancia: 45.2, rentabilidad: 0.021, origen: "ia" },
    { idOrden: 4, tiempo: 1_762_100_000_000, ganancia: -12.5, rentabilidad: -0.012, origen: "manual" },
  ],
  actividad: [
    { dia: 1_762_000_000_000, compras: 1, ventas: 1, volumen: 2100 },
    { dia: 1_762_000_000_000 + DIA, compras: 0, ventas: 0, volumen: 0 },
  ],
  resumen: {
    cerradas: 2,
    ganadoras: 1,
    perdedoras: 1,
    tasaAcierto: 0.5,
    gananciaPromedio: 16.35,
    mejor: 45.2,
    peor: -12.5,
    volumenTotal: 2100,
  },
  porOrigen: [
    { origen: "manual", ordenes: 2, ganancia: -12.5 },
    { origen: "bot", ordenes: 0, ganancia: 0 },
    { origen: "ia", ordenes: 2, ganancia: 45.2 },
  ],
  reparto: { usdt: 7500, btc: 2500 },
};

describe("TarjetaEstadisticas", () => {
  it("convierte las operaciones y la actividad en barras con su ayuda", () => {
    const [gano, perdio] = barrasGanancia(ESTADISTICAS);
    expect(gano!.segmentos[0]!.color).toBe("var(--grafica-sube)");
    expect(gano!.detalle).toContain("▲ +45,20 USDT");
    expect(gano!.detalle).toContain("Piloto IA");
    expect(perdio!.detalle).toContain("▼ −12,50 USDT");
    const [dia] = barrasActividad(ESTADISTICAS);
    expect(dia!.segmentos.map((s) => s.valor)).toEqual([1, 1]);
    expect(dia!.detalle).toContain("1 compra y 1 venta");
  });

  it("muestra aciertos, reparto y quién operó", async () => {
    servidorFalso({ "GET /api/estadisticas": { estado: 200, cuerpo: ESTADISTICAS } });
    renderizar(<TarjetaEstadisticas />);
    expect(await screen.findByText("✓ 50 %")).toBeInTheDocument();
    expect(screen.getAllByText("▲ +45,20")).toHaveLength(2); // mejor operación y ganancia del piloto IA
    expect(screen.getByRole("img", { name: "En BTC: 25 %, En USDT: 75 %" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: /según quién operó/ })).toHaveTextContent("Piloto IA");
  });
});
