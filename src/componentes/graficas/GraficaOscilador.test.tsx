import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GraficaOscilador } from "./GraficaOscilador";

const registro = vi.hoisted(() => ({ tipos: [] as string[], lineasPrecio: [] as number[] }));
vi.mock("lightweight-charts", () => ({
  HistogramSeries: "Histogram",
  LineSeries: "Line",
  CrosshairMode: { Normal: 0 },
  LineStyle: { Solid: 0 },
  createChart: () => ({
    addSeries: (tipo: string) => {
      registro.tipos.push(tipo);
      return {
        setData: vi.fn(),
        applyOptions: vi.fn(),
        createPriceLine: ({ price }: { price: number }) => registro.lineasPrecio.push(price),
      };
    },
    removeSeries: vi.fn(),
    applyOptions: vi.fn(),
    remove: vi.fn(),
  }),
}));

describe("GraficaOscilador", () => {
  it("RSI: una línea con referencias en 30 y 70, y su último valor", () => {
    registro.tipos = [];
    registro.lineasPrecio = [];
    render(
      <GraficaOscilador
        titulo="RSI 14"
        referencias={[30, 70]}
        series={[
          { id: "rsi", nombre: "RSI", color: "serie2", tipo: "linea", puntos: [{ tiempo: 1, valor: 52.94 }] },
        ]}
      />,
    );
    expect(registro.tipos).toEqual(["Line"]);
    expect(registro.lineasPrecio).toEqual([30, 70]);
    expect(screen.getByText("RSI: 52,94")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "RSI 14" })).toBeInTheDocument();
  });

  it("MACD: dos líneas e histograma, con leyenda", () => {
    registro.tipos = [];
    render(
      <GraficaOscilador
        titulo="MACD"
        series={[
          { id: "macd", nombre: "MACD", color: "serie1", tipo: "linea", puntos: [] },
          { id: "senal", nombre: "Señal", color: "serie2", tipo: "linea", puntos: [] },
          {
            id: "hist",
            nombre: "Histograma",
            color: "neutra",
            tipo: "histograma",
            puntos: [{ tiempo: 1, valor: -3 }],
          },
        ]}
      />,
    );
    expect(registro.tipos).toEqual(["Line", "Line", "Histogram"]);
    for (const nombre of ["MACD", "Señal", "Histograma"])
      expect(screen.getAllByText(nombre).length).toBeGreaterThan(0);
  });
});
