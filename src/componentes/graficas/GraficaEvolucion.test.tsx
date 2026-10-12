import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GraficaEvolucion } from "./GraficaEvolucion";

// jsdom no tiene canvas: se reemplaza la librería por una que registra lo que se le pide.
const registro = vi.hoisted(() => ({
  datos: [] as unknown[],
  opciones: [] as Record<string, unknown>[],
  lineas: [] as number[],
}));
vi.mock("lightweight-charts", () => ({
  BaselineSeries: "Baseline",
  CrosshairMode: { Magnet: 1 },
  LineStyle: { Dashed: 2 },
  createChart: () => ({
    addSeries: () => ({
      setData: (d: unknown[]) => (registro.datos = d),
      applyOptions: (o: Record<string, unknown>) => registro.opciones.push(o),
      createPriceLine: ({ price }: { price: number }) => {
        registro.lineas.push(price);
        return price;
      },
      removePriceLine: vi.fn(),
    }),
    timeScale: () => ({ fitContent: vi.fn() }),
    subscribeCrosshairMove: vi.fn(),
    unsubscribeCrosshairMove: vi.fn(),
    applyOptions: vi.fn(),
    remove: vi.fn(),
  }),
}));

const PUNTOS = [
  { tiempo: 1_791_600_000_000, valor: 10_000 },
  { tiempo: 1_791_603_600_000, valor: 9_800 },
  { tiempo: 1_791_607_200_000, valor: 10_250 },
];

describe("GraficaEvolucion", () => {
  it("dibuja la línea con la base en el saldo inicial", () => {
    render(<GraficaEvolucion titulo="Valor de tu cartera" puntos={PUNTOS} base={10_000} />);
    expect(registro.datos).toHaveLength(3);
    expect(registro.lineas).toContain(10_000);
    expect(registro.opciones.at(-1)).toMatchObject({ baseValue: { type: "price", price: 10_000 } });
    expect(screen.getByRole("img", { name: "Valor de tu cartera" })).toBeInTheDocument();
  });

  it("la leyenda muestra el último valor y cuánto va frente al inicio, con ícono", () => {
    render(<GraficaEvolucion titulo="Valor" puntos={PUNTOS} base={10_000} />);
    expect(screen.getByText("10.250,00 USDT")).toBeInTheDocument();
    expect(screen.getByText("+250,00 (▲ +2,50 %)")).toBeInTheDocument();
  });

  it("tiene vista de tabla con lo más reciente primero", async () => {
    render(<GraficaEvolucion titulo="Valor" puntos={PUNTOS} base={10_000} />);
    await userEvent.click(screen.getByRole("button", { name: "Ver como tabla" }));
    const filas = within(screen.getByRole("table")).getAllByRole("row");
    expect(filas[1]).toHaveTextContent("10.250,00");
    expect(filas[2]).toHaveTextContent("▼ −2,00 %");
  });
});
