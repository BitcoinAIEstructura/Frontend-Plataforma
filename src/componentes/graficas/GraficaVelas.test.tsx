import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GraficaVelas } from "./GraficaVelas";

// jsdom no tiene canvas: se reemplaza la librería por una que registra lo que se le pide.
const registro = vi.hoisted(() => ({ series: [] as { tipo: string; datos: unknown[] }[], removida: false }));
vi.mock("lightweight-charts", () => {
  const serie = (tipo: string) => {
    const s = { tipo, datos: [] as unknown[] };
    registro.series.push(s);
    return { setData: (d: unknown[]) => (s.datos = d), applyOptions: vi.fn() };
  };
  return {
    CandlestickSeries: "Candlestick",
    HistogramSeries: "Histogram",
    LineSeries: "Line",
    CrosshairMode: { Normal: 0 },
    createChart: () => ({
      addSeries: (tipo: string) => serie(tipo),
      removeSeries: vi.fn(),
      panes: () => [{ setHeight: vi.fn() }, { setHeight: vi.fn() }],
      subscribeCrosshairMove: vi.fn(),
      unsubscribeCrosshairMove: vi.fn(),
      applyOptions: vi.fn(),
      remove: () => (registro.removida = true),
    }),
  };
});

const VELAS = [
  { tiempoApertura: 1, apertura: 100, maximo: 110, minimo: 95, cierre: 105, volumen: 1, tiempoCierre: 2 },
  {
    tiempoApertura: 3_600_000,
    apertura: 105,
    maximo: 106,
    minimo: 90,
    cierre: 94.5,
    volumen: 2,
    tiempoCierre: 4,
  },
];

describe("GraficaVelas", () => {
  it("dibuja velas, volumen y una línea por capa", () => {
    registro.series = [];
    render(
      <GraficaVelas
        titulo="Velas de BTCUSDT"
        velas={VELAS}
        capas={[{ id: "sma", nombre: "SMA 20", color: "serie1", puntos: [{ tiempo: 1, valor: 101 }] }]}
      />,
    );
    expect(registro.series.map((s) => s.tipo)).toEqual(["Candlestick", "Histogram", "Line"]);
    expect(registro.series[0]?.datos).toHaveLength(2);
    expect(screen.getByRole("img", { name: "Velas de BTCUSDT" })).toBeInTheDocument();
    expect(screen.getByText("SMA 20")).toBeInTheDocument();
  });

  it("la leyenda muestra la última vela con su variación e ícono", () => {
    render(<GraficaVelas titulo="g" velas={VELAS} />);
    expect(screen.getByText("C 94,50")).toBeInTheDocument();
    expect(screen.getByText("▼ −10,00 %")).toBeInTheDocument();
  });

  it("tiene una vista de tabla, de la vela más reciente a la más vieja", async () => {
    render(<GraficaVelas titulo="Velas de prueba" velas={VELAS} />);
    await userEvent.click(screen.getByRole("button", { name: "Ver como tabla" }));
    const tabla = screen.getByRole("table", { name: "Velas de prueba" });
    const filas = within(tabla).getAllByRole("row");
    expect(filas).toHaveLength(3); // encabezado + 2 velas
    expect(filas[1]).toHaveTextContent("94,50");
  });

  it("libera la gráfica al desmontarse", () => {
    registro.removida = false;
    const { unmount } = render(<GraficaVelas titulo="g" velas={VELAS} />);
    unmount();
    expect(registro.removida).toBe(true);
  });
});
