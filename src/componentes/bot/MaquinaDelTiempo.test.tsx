import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { MaquinaDelTiempo } from "./MaquinaDelTiempo";

vi.mock("@/componentes/graficas/GraficaEvolucion", () => ({
  GraficaEvolucion: ({ puntos }: { puntos: unknown[] }) => (
    <div data-testid="curva">{puntos.length} puntos</div>
  ),
}));

afterEach(() => vi.unstubAllGlobals());

const resultado = (bot: number, mantener: number) => ({
  capitalInicial: 10_000,
  capitalFinal: 10_000 * (1 + bot),
  rentabilidadTotal: bot,
  rentabilidadComprarYMantener: mantener,
  numeroOperaciones: 12,
  tasaGanadoras: 0.5,
  caidaMaxima: 0.231,
  comisionesPagadas: 80,
  velasAnalizadas: 1000,
  tiempoInicio: 1735689600000,
  tiempoFin: 1791676800000,
  operaciones: [],
  curvaCapital: [
    { tiempo: 1, valor: 10_000 },
    { tiempo: 2, valor: 11_000 },
  ],
});

function backtest(bot: number, mantener: number) {
  return {
    estrategia: "combinada",
    intervalo: "4h",
    resultado: resultado(bot, mantener),
    validacion: {
      velasEntrenamiento: 700,
      velasPrueba: 300,
      entrenamiento: resultado(0.2, 0.1),
      prueba: resultado(0.05, -0.1),
    },
    aviso: "Resultado de pruebas con datos históricos; no es asesoría financiera.",
  };
}

describe("MaquinaDelTiempo", () => {
  it("simula con la estrategia y el periodo elegidos y lo compara con no hacer nada", async () => {
    const fetch = servidorFalso({ "GET /api/backtest": { estado: 200, cuerpo: backtest(0.1, 0.25) } });
    renderizar(<MaquinaDelTiempo />);
    await userEvent.click(screen.getByRole("radio", { name: "RSI" }));
    await userEvent.click(screen.getByRole("radio", { name: "2 años (1 día)" }));
    await userEvent.click(screen.getByRole("button", { name: "⟲ Viajar y simular" }));
    expect(
      await screen.findByText(/Comprar al inicio y no hacer nada habría rendido más/),
    ).toBeInTheDocument();
    expect(screen.getByText("▲ +10,00 %")).toBeInTheDocument();
    expect(screen.getByText("12 · 50 % ganadoras")).toBeInTheDocument();
    expect(screen.getByText("▼ 23,1 %")).toBeInTheDocument();
    expect(screen.getByTestId("curva")).toHaveTextContent("2 puntos");
    expect(String(fetch.mock.calls[0]![0])).toBe(
      "/api/backtest?estrategia=rsi&intervalo=1d&cantidad=730&capital=10000",
    );
  });

  it("si le ganó a mantener lo dice, y muestra la prueba sin trampa", async () => {
    servidorFalso({ "GET /api/backtest": { estado: 200, cuerpo: backtest(0.3, 0.1) } });
    renderizar(<MaquinaDelTiempo />);
    await userEvent.click(screen.getByRole("button", { name: "⟲ Viajar y simular" }));
    expect(await screen.findByText(/Le ganó a comprar al inicio/)).toBeInTheDocument();
    expect(screen.getByText(/en las 300 siguientes/)).toBeInTheDocument();
  });

  it("muestra el error del backend (por ejemplo, el límite de peticiones)", async () => {
    servidorFalso({
      "GET /api/backtest": { estado: 429, cuerpo: { error: "Demasiadas peticiones. Espera 20 s" } },
    });
    renderizar(<MaquinaDelTiempo />);
    await userEvent.click(screen.getByRole("button", { name: "⟲ Viajar y simular" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Demasiadas peticiones");
  });
});
