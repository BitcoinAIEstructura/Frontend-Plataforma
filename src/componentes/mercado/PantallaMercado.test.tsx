import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { PantallaMercado } from "./PantallaMercado";

vi.mock("@/componentes/graficas/GraficaVelas", () => ({
  GraficaVelas: ({ titulo, velas, capas }: { titulo: string; velas: unknown[]; capas: { id: string }[] }) => (
    <div data-testid="velas">
      {titulo} · {velas.length} velas · capas: {capas.map((c) => c.id).join(",")}
    </div>
  ),
}));
vi.mock("@/componentes/graficas/GraficaOscilador", () => ({
  GraficaOscilador: ({ titulo, series }: { titulo: string; series: { id: string }[] }) => (
    <div data-testid="oscilador">
      {titulo} · {series.map((s) => s.id).join(",")}
    </div>
  ),
}));

afterEach(() => vi.unstubAllGlobals());

const VELA = {
  tiempoApertura: 1,
  apertura: 80000,
  maximo: 1,
  minimo: 1,
  cierre: 1,
  volumen: 1,
  tiempoCierre: 2,
};

function servidor() {
  return servidorFalso({
    "GET /api/precio": { estado: 200, cuerpo: { simbolo: "BTCUSDT", precio: 84000, momento: 1 } },
    "GET /api/velas": {
      estado: 200,
      cuerpo: { simbolo: "BTCUSDT", intervalo: "1h", cantidad: 2, velas: [VELA, VELA] },
    },
    "GET /api/indicadores": {
      estado: 200,
      cuerpo: { indicador: "x", parametros: {}, series: { valor: [{ tiempo: 1, valor: 50 }] } },
    },
  });
}

describe("PantallaMercado", () => {
  it("muestra velas de 1 h con la SMA y el RSI por defecto", async () => {
    servidor();
    renderizar(<PantallaMercado />);
    expect(await screen.findByTestId("velas")).toHaveTextContent("cada 1 h · 2 velas · capas: sma");
    expect(screen.getByTestId("oscilador")).toHaveTextContent("RSI 14");
    expect(await screen.findByText("▲ +5,00 %")).toBeInTheDocument();
  });

  it("cambiar el intervalo y las capas pide los datos correctos", async () => {
    const fetch = servidor();
    renderizar(<PantallaMercado />);
    await screen.findByTestId("velas");
    await userEvent.click(screen.getByRole("radio", { name: "1 día" }));
    await userEvent.click(screen.getByRole("checkbox", { name: /Bollinger 20/ }));
    await waitFor(() =>
      expect(screen.getByTestId("velas")).toHaveTextContent("capas: sma,boll-sup,boll-inf"),
    );
    const rutas = fetch.mock.calls.map((c) => String(c[0]));
    expect(rutas).toContain("/api/velas?intervalo=1d&cantidad=300");
    expect(rutas.some((r) => r.startsWith("/api/indicadores?indicador=bollinger&intervalo=1d"))).toBe(true);
  });

  it("el oscilador puede ser el MACD con sus tres series", async () => {
    servidor();
    renderizar(<PantallaMercado />);
    await userEvent.click(await screen.findByRole("radio", { name: "MACD 12·26·9" }));
    expect(screen.getByTestId("oscilador")).toHaveTextContent("macd,senal,histograma");
  });
});
