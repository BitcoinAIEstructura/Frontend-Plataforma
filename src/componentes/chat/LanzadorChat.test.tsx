import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { abrirChat } from "@/lib/chat";
import { renderizar, servidorFalso } from "@/test/utilidades";

import { LanzadorChat } from "./LanzadorChat";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));

afterEach(() => {
  vi.unstubAllGlobals();
  push.mockReset();
});

const BOT = {
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

function respuesta(cambios: object = {}) {
  return {
    estado: 200,
    cuerpo: {
      intencion: "ganancia",
      respuesta: "Vas ganando 10,00 USDT.",
      accion: null,
      sugerencias: ["¿Qué estás haciendo?"],
      ...cambios,
    },
  };
}

describe("LanzadorChat", () => {
  it("se abre con el botón, saluda por el nombre y responde lo que se escribe", async () => {
    const fetch = servidorFalso({
      "GET /api/bot/estado": { estado: 200, cuerpo: BOT },
      "POST /api/asistente": respuesta(),
    });
    renderizar(<LanzadorChat nombre="Ana" />);
    await userEvent.click(screen.getByRole("button", { name: /Pregúntale al bot/ }));
    const panel = screen.getByRole("dialog", { name: "Habla con tu bot" });
    expect(within(panel).getByRole("log")).toHaveTextContent("¡Hola, Ana!");
    const casilla = screen.getByLabelText("Escribe tu pregunta para el bot");
    expect(casilla).toHaveFocus();
    await userEvent.type(casilla, "¿cuánto he ganado?{Enter}");
    expect(await within(panel).findByText("Vas ganando 10,00 USDT.")).toBeInTheDocument();
    expect(within(panel).getByText("¿cuánto he ganado?")).toBeInTheDocument();
    const llamada = fetch.mock.calls.find(([ruta]) => ruta === "/api/asistente")!;
    expect(JSON.parse(String(llamada[1]?.body))).toEqual({ mensaje: "¿cuánto he ganado?" });
    // Las sugerencias de la última respuesta se pueden tocar.
    expect(within(panel).getByRole("button", { name: "¿Qué estás haciendo?" })).toBeInTheDocument();
  });

  it("encender el bot solo pasa al tocar el botón de la respuesta", async () => {
    const fetch = servidorFalso({
      "GET /api/bot/estado": { estado: 200, cuerpo: BOT },
      "POST /api/asistente": respuesta({
        intencion: "iniciar-bot",
        respuesta: "¿Me enciendo?",
        accion: { tipo: "INICIAR_BOT", etiqueta: "Sí, enciéndete", ruta: null },
      }),
      "POST /api/bot/iniciar": { estado: 200, cuerpo: { ...BOT, activo: true } },
    });
    renderizar(<LanzadorChat nombre="Ana" />);
    act(() => abrirChat("enciéndete"));
    const boton = await screen.findByRole("button", { name: "Sí, enciéndete" });
    expect(fetch.mock.calls.some(([ruta]) => ruta === "/api/bot/iniciar")).toBe(false);
    await userEvent.click(boton);
    expect(await screen.findByText(/ya estoy encendido/)).toBeInTheDocument();
    const llamada = fetch.mock.calls.find(([ruta]) => ruta === "/api/bot/iniciar")!;
    expect(JSON.parse(String(llamada[1]?.body))).toMatchObject({ segundosEntreCiclos: 60, riesgo: 0.2 });
    expect(boton).toBeDisabled(); // no se puede usar dos veces
  });

  it("una acción de ir lleva a la página; Escape cierra y conserva la conversación", async () => {
    servidorFalso({
      "POST /api/asistente": respuesta({
        accion: { tipo: "IR", etiqueta: "Ver mi cartera", ruta: "/cartera" },
      }),
    });
    renderizar(<LanzadorChat nombre="Ana" />);
    act(() => abrirChat("mi saldo"));
    await userEvent.click(await screen.findByRole("button", { name: "Ver mi cartera →" }));
    expect(push).toHaveBeenCalledWith("/cartera");
    screen.getByLabelText("Escribe tu pregunta para el bot").focus();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    const lanzador = screen.getByRole("button", { name: /Pregúntale al bot/ });
    expect(lanzador).toHaveFocus();
    await userEvent.click(lanzador);
    expect(screen.getByText("Vas ganando 10,00 USDT.")).toBeInTheDocument();
  });

  it("si el backend falla lo dice en la conversación", async () => {
    servidorFalso({ "POST /api/asistente": { estado: 500, cuerpo: { error: "Error interno" } } });
    renderizar(<LanzadorChat nombre="Ana" />);
    act(() => abrirChat("hola"));
    expect(await screen.findByText(/No pude responder/)).toBeInTheDocument();
  });
});
