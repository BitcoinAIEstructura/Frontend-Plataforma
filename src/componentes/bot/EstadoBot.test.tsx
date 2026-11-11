import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { EstadoBot as Estado } from "@/lib/api/simulacion";

import { ActividadBot, EstadoBot, eventosDelBot } from "./EstadoBot";

const BASE: Estado = {
  activo: false,
  estrategia: "combinada",
  configuracion: {
    segundosEntreCiclos: 60,
    intervalo: "1h",
    cantidadVelas: 200,
    riesgo: 0.2,
    stopLoss: 0.05,
    takeProfit: 0.1,
    modo: "reglas" as const,
  },
  ciclos: 0,
  ultimoCiclo: null,
  ultimaDecision: null,
  ultimoError: null,
  encendidoDesde: null,
  enCiclo: false,
  piloto: null,
  pilotoDisponible: true,
};

describe("EstadoBot", () => {
  it("detenido y sin decisiones lo dice", () => {
    render(<EstadoBot estado={BASE} />);
    expect(screen.getByText("Detenido")).toBeInTheDocument();
    expect(screen.getByText(/Aún no ha decidido nada/)).toBeInTheDocument();
  });

  it("en marcha muestra ciclos y la última decisión con ícono", () => {
    render(
      <EstadoBot
        estado={{
          ...BASE,
          activo: true,
          ciclos: 3,
          ultimoCiclo: Date.now(),
          ultimaDecision: {
            tiempo: 1,
            senal: "COMPRAR",
            precio: 83_000,
            confianza: 0.67,
            motivo: "Votación ponderada: gana COMPRAR.",
          },
        }}
      />,
    );
    expect(screen.getByText("En marcha")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("▲ Comprar")).toHaveClass("text-sube");
    expect(screen.getByText(/67 % de confianza · a 83\.000,00 USDT/)).toBeInTheDocument();
  });

  it("el último error se muestra como alerta", () => {
    render(<EstadoBot estado={{ ...BASE, ultimoError: "Binance no respondió" }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Binance no respondió");
  });
});

describe("EstadoBot con el piloto IA", () => {
  it("muestra los ajustes que eligió la IA en su último ciclo", () => {
    const piloto = {
      senal: "COMPRAR" as const,
      probabilidad: 0.62,
      confianza: 0.24,
      exactitud: 0.55,
      base: 0.51,
      riesgo: 0.12,
      stopLoss: 0.015,
      takeProfit: 0.03,
      volatilidad: 0.005,
      intervalo: "1h",
      tiempoVela: 1,
      precio: 84000,
      motivo: "El comité da 62 %.",
    };
    render(<EstadoBot estado={{ ...BASE, configuracion: { ...BASE.configuracion, modo: "ia" }, piloto }} />);
    expect(screen.getByRole("region", { name: "Estado del piloto IA" })).toBeInTheDocument();
    expect(screen.getByText("Ajustes que eligió la IA")).toBeInTheDocument();
    expect(screen.getByText("12 %")).toBeInTheDocument();
    expect(screen.getByText("1,5 %")).toBeInTheDocument();
  });
});

describe("ActividadBot", () => {
  const ev = (tipo: string, momento: number) => ({ momento, tipo, idOrden: null, descripcion: tipo });
  it("solo muestra eventos del bot", () => {
    const eventos = [ev("ORDEN_CREADA", 3), ev("DECISION_BOT", 2), ev("BOT_INICIADO", 1)];
    expect(eventosDelBot(eventos).map((e) => e.tipo)).toEqual(["DECISION_BOT", "BOT_INICIADO"]);
    render(<ActividadBot eventos={eventos} />);
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(2);
  });
});
