import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { PantallaBot } from "./PantallaBot";

afterEach(() => vi.unstubAllGlobals());

const ESTADO = {
  activo: false,
  estrategia: "combinada",
  configuracion: {
    segundosEntreCiclos: 60,
    intervalo: "1h",
    cantidadVelas: 200,
    riesgo: 0.2,
    stopLoss: 0.05,
    takeProfit: 0.1,
  },
  ciclos: 0,
  ultimoCiclo: null,
  ultimaDecision: null,
  ultimoError: null,
  encendidoDesde: null,
  enCiclo: false,
};

describe("PantallaBot", () => {
  it("enciende el bot con los ajustes elegidos", async () => {
    let activo = false;
    const cuerpos: unknown[] = [];
    servidorFalso({
      "GET /api/bot/estado": () => ({ estado: 200, cuerpo: { ...ESTADO, activo } }),
      "GET /api/historial": { estado: 200, cuerpo: { eventos: [] } },
      "POST /api/bot/iniciar": (cuerpo) => {
        cuerpos.push(cuerpo);
        activo = true;
        return { estado: 200, cuerpo: { ...ESTADO, activo: true } };
      },
    });
    renderizar(<PantallaBot />);
    expect(await screen.findByText(/También puede perder/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "▶ Encender el bot" }));
    expect(await screen.findByRole("button", { name: "■ Detener el bot" })).toBeInTheDocument();
    expect(screen.getByText("En marcha")).toBeInTheDocument();
    expect(cuerpos).toEqual([
      { segundosEntreCiclos: 60, intervalo: "1h", riesgo: 0.2, stopLoss: 0.05, takeProfit: 0.1 },
    ]);
  });

  it("si ya hay demasiados bots, muestra el mensaje del backend", async () => {
    servidorFalso({
      "GET /api/bot/estado": { estado: 200, cuerpo: ESTADO },
      "GET /api/historial": { estado: 200, cuerpo: { eventos: [] } },
      "POST /api/bot/iniciar": {
        estado: 409,
        cuerpo: { error: "Ya hay 20 bots en marcha; intenta más tarde" },
      },
    });
    renderizar(<PantallaBot />);
    await userEvent.click(await screen.findByRole("button", { name: "▶ Encender el bot" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Ya hay 20 bots en marcha");
  });
});
