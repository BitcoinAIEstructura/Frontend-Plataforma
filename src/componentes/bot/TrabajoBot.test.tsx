import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { EstadoBot } from "@/lib/api/simulacion";
import { esperaBot } from "@/lib/hooks/useDatos";

import { falta, reloj, TrabajoBot } from "./TrabajoBot";

const AHORA = 1_700_000_000_000;

function estado(cambios: Partial<EstadoBot> = {}): EstadoBot {
  return {
    activo: true,
    estrategia: "combinada",
    configuracion: {
      segundosEntreCiclos: 60,
      intervalo: "1h",
      cantidadVelas: 200,
      riesgo: 0.2,
      stopLoss: 0.05,
      takeProfit: 0.1,
    },
    ciclos: 2,
    ultimoCiclo: AHORA - 15_000,
    ultimaDecision: null,
    ultimoError: null,
    encendidoDesde: AHORA - 135_000,
    enCiclo: false,
    ...cambios,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(AHORA);
});
afterEach(() => vi.useRealTimers());

describe("TrabajoBot", () => {
  it("muestra que trabaja: reloj, barra y cuenta regresiva que avanzan", () => {
    render(<TrabajoBot estado={estado()} />);
    expect(screen.getByText("Trabajando")).toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveTextContent("02:15");
    expect(screen.getByText("45 s")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole("timer")).toHaveTextContent("02:20");
    expect(screen.getByText("40 s")).toBeInTheDocument();
  });

  it("mientras revisa (o si ya le tocaba) lo dice en vez de quedarse en 0 s", () => {
    const { rerender } = render(<TrabajoBot estado={estado({ enCiclo: true })} />);
    expect(screen.getByText("Revisando el mercado…")).toBeInTheDocument();
    rerender(<TrabajoBot estado={estado({ ultimoCiclo: AHORA - 61_000 })} />);
    expect(screen.getByText("Revisando el mercado…")).toBeInTheDocument();
    rerender(<TrabajoBot estado={estado({ ultimoCiclo: null })} />);
    expect(screen.getByText("Revisando el mercado…")).toBeInTheDocument();
  });

  it("apagado no muestra nada", () => {
    const { container } = render(<TrabajoBot estado={estado({ activo: false })} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("formatos y sondeo", () => {
  it("reloj y falta", () => {
    expect([reloj(75_000), reloj(3_725_000), reloj(-1)]).toEqual(["01:15", "1:02:05", "00:00"]);
    expect([falta(42_000), falta(185_000), falta(120_000)]).toEqual(["42 s", "3 min 5 s", "2 min"]);
  });

  it("pregunta más seguido mientras revisa o cuando ya le toca", () => {
    expect(esperaBot(undefined)).toBe(15_000);
    expect(esperaBot(estado(), AHORA)).toBe(15_000);
    expect(esperaBot(estado({ enCiclo: true }), AHORA)).toBe(2_000);
    expect(esperaBot(estado(), AHORA + 50_000)).toBe(2_000);
    expect(esperaBot(estado({ activo: false }), AHORA + 50_000)).toBe(15_000);
  });
});
