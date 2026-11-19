import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AccionAsistente } from "@/lib/api/asistente";
import { abrirChat } from "@/lib/chat";
import { renderizar, servidorFalso } from "@/test/utilidades";

import { historialDe, ordenDe } from "./ChatBot";
import { BotonChat, LanzadorChat } from "./LanzadorChat";

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
    renderizar(
      <>
        <BotonChat />
        <LanzadorChat nombre="Ana" />
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: /pregúntale al bot/i }));
    const panel = screen.getByRole("dialog", { name: "Habla con tu bot" });
    expect(within(panel).getByRole("log")).toHaveTextContent("¡Hola, Ana!");
    const casilla = screen.getByLabelText("Escribe tu pregunta para el bot");
    expect(casilla).toHaveFocus();
    await userEvent.type(casilla, "¿cuánto he ganado?{Enter}");
    expect(await within(panel).findByText("Vas ganando 10,00 USDT.")).toBeInTheDocument();
    expect(within(panel).getByText("¿cuánto he ganado?")).toBeInTheDocument();
    const llamada = fetch.mock.calls.find(([ruta]) => ruta === "/api/asistente")!;
    // La bienvenida no va en el historial: es el primer mensaje.
    expect(JSON.parse(String(llamada[1]?.body))).toEqual({ mensaje: "¿cuánto he ganado?", historial: [] });
    // Sin IA (respuesta de reglas) no aparece la marca.
    expect(within(panel).queryByText(/Respondido por IA/)).toBeNull();
    // Las sugerencias de la última respuesta se pueden tocar.
    expect(within(panel).getByRole("button", { name: "¿Qué estás haciendo?" })).toBeInTheDocument();
  });

  it("con la IA, manda la conversación anterior y marca sus respuestas", async () => {
    const fetch = servidorFalso({
      "GET /api/bot/estado": { estado: 200, cuerpo: BOT },
      "POST /api/asistente": respuesta({ respuesta: "Con 10.000 USDT de práctica podrías…", fuente: "ia" }),
    });
    renderizar(
      <>
        <BotonChat />
        <LanzadorChat nombre="Ana" />
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: /pregúntale al bot/i }));
    const panel = screen.getByRole("dialog", { name: "Habla con tu bot" });
    const casilla = screen.getByLabelText("Escribe tu pregunta para el bot");
    await userEvent.type(casilla, "Quiero invertir{Enter}");
    expect(await within(panel).findAllByText(/Respondido por IA/)).toHaveLength(1);
    await userEvent.type(casilla, "¿y cuánto?{Enter}");
    await within(panel)
      .findAllByText("Con 10.000 USDT de práctica podrías…")
      .then((t) => expect(t).toHaveLength(2));
    const llamadas = fetch.mock.calls.filter(([ruta]) => ruta === "/api/asistente");
    expect(JSON.parse(String(llamadas[1]![1]?.body))).toEqual({
      mensaje: "¿y cuánto?",
      historial: [
        { rol: "usuario", texto: "Quiero invertir" },
        { rol: "bot", texto: "Con 10.000 USDT de práctica podrías…" },
      ],
    });
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
    renderizar(
      <>
        <BotonChat />
        <LanzadorChat nombre="Ana" />
      </>,
    );
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
    renderizar(
      <>
        <BotonChat />
        <LanzadorChat nombre="Ana" />
      </>,
    );
    // Como al tocar «Asistente»: el foco está en ese botón cuando se abre el chat.
    screen.getByRole("button", { name: /pregúntale al bot/i }).focus();
    act(() => abrirChat("mi saldo"));
    await userEvent.click(await screen.findByRole("button", { name: "Ver mi cartera →" }));
    expect(push).toHaveBeenCalledWith("/cartera");
    screen.getByLabelText("Escribe tu pregunta para el bot").focus();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    const lanzador = screen.getByRole("button", { name: /pregúntale al bot/i });
    expect(lanzador).toHaveFocus();
    await userEvent.click(lanzador);
    expect(screen.getByText("Vas ganando 10,00 USDT.")).toBeInTheDocument();
  });

  it("si el backend falla lo dice en la conversación", async () => {
    servidorFalso({ "POST /api/asistente": { estado: 500, cuerpo: { error: "Error interno" } } });
    renderizar(
      <>
        <BotonChat />
        <LanzadorChat nombre="Ana" />
      </>,
    );
    act(() => abrirChat("hola"));
    expect(await screen.findByText(/No pude responder/)).toBeInTheDocument();
  });

  describe("propuestas de la IA", () => {
    const ORDEN = {
      id: 7,
      tipo: "COMPRA",
      monto: 2000,
      todo: false,
      estado: "PENDIENTE",
      creadaEn: 1,
      ejecutadaEn: null,
      precioEjecucion: null,
      cantidadBtc: null,
      comision: null,
      motivo: "propuesta de la IA del chat",
      detalle: null,
    };
    const COMPRA: AccionAsistente = {
      tipo: "ORDEN",
      etiqueta: "Comprar 2.000,00 USDT de BTC",
      ruta: null,
      orden: { tipo: "COMPRA", monto: 2000, todo: false },
      alerta: null,
      modo: null,
    };
    const PROPUESTA = respuesta({
      respuesta: "La IA ve un 58 % de subida frente a una base del 51 %. ¿Pruebas con 2.000 USDT?",
      fuente: "ia",
      accion: COMPRA,
    });

    function abrir() {
      renderizar(
        <>
          <BotonChat />
          <LanzadorChat nombre="Ana" />
        </>,
      );
      act(() => abrirChat("¿qué me recomiendas?"));
    }

    it("la orden propuesta solo se hace al confirmar; con la cola vacía se ejecuta enseguida", async () => {
      const fetch = servidorFalso({
        "POST /api/asistente": PROPUESTA,
        "GET /api/ordenes": { estado: 200, cuerpo: { cantidad: 0, ordenes: [] } },
        "POST /api/ordenes": { estado: 201, cuerpo: ORDEN },
        "POST /api/ordenes/procesar": {
          estado: 200,
          cuerpo: { ...ORDEN, estado: "EJECUTADA", detalle: "Compró 0.03 BTC a 63000.00." },
        },
      });
      abrir();
      const boton = await screen.findByRole("button", { name: "Comprar 2.000,00 USDT de BTC" });
      expect(fetch.mock.calls.some(([ruta]) => ruta === "/api/ordenes")).toBe(false);
      await userEvent.click(boton);
      expect(await screen.findByText(/¡Hecho! Compró 0.03 BTC/)).toBeInTheDocument();
      const crear = fetch.mock.calls.find(([r, o]) => r === "/api/ordenes" && o?.method === "POST")!;
      expect(JSON.parse(String(crear[1]?.body))).toEqual({
        tipo: "COMPRA",
        monto: 2000,
        motivo: "propuesta de la IA del chat",
      });
      expect(fetch.mock.calls.some(([r]) => r === "/api/ordenes/procesar")).toBe(true);
      expect(boton).toBeDisabled();
    });

    it("si ya había órdenes en la cola, no ejecuta otra: la deja esperando su turno", async () => {
      const fetch = servidorFalso({
        "POST /api/asistente": PROPUESTA,
        "GET /api/ordenes": { estado: 200, cuerpo: { cantidad: 1, ordenes: [{ ...ORDEN, id: 3 }] } },
        "POST /api/ordenes": { estado: 201, cuerpo: ORDEN },
      });
      abrir();
      await userEvent.click(await screen.findByRole("button", { name: "Comprar 2.000,00 USDT de BTC" }));
      expect(await screen.findByText(/quedó en la cola/)).toBeInTheDocument();
      expect(fetch.mock.calls.some(([r]) => r === "/api/ordenes/procesar")).toBe(false);
      expect(screen.getByRole("button", { name: "Ir a Órdenes →" })).toBeInTheDocument();
    });

    it("una alerta propuesta se crea al confirmar", async () => {
      const fetch = servidorFalso({
        "POST /api/asistente": respuesta({
          fuente: "ia",
          accion: {
            tipo: "ALERTA",
            etiqueta: "Avisarme si baja a 60.000,00 USDT",
            ruta: null,
            orden: null,
            alerta: { tipo: "BAJA_A", precio: 60000 },
            modo: null,
          },
        }),
        "POST /api/alertas": {
          estado: 201,
          cuerpo: {
            id: 1,
            tipo: "BAJA_A",
            precio: 60000,
            estado: "ACTIVA",
            creadaEn: 1,
            disparadaEn: null,
            precioDisparo: null,
          },
        },
      });
      abrir();
      await userEvent.click(await screen.findByRole("button", { name: "Avisarme si baja a 60.000,00 USDT" }));
      expect(await screen.findByText(/te aviso cuando el precio llegue/)).toBeInTheDocument();
      const llamada = fetch.mock.calls.find(([r]) => r === "/api/alertas")!;
      expect(JSON.parse(String(llamada[1]?.body))).toEqual({ tipo: "BAJA_A", precio: 60000 });
    });

    it("encender con el piloto IA manda el modo", async () => {
      const fetch = servidorFalso({
        "GET /api/bot/estado": { estado: 200, cuerpo: BOT },
        "POST /api/asistente": respuesta({
          fuente: "ia",
          accion: { tipo: "INICIAR_BOT", etiqueta: "Encender el piloto IA", ruta: null, modo: "ia" },
        }),
        "POST /api/bot/iniciar": { estado: 200, cuerpo: { ...BOT, activo: true } },
      });
      abrir();
      await userEvent.click(await screen.findByRole("button", { name: "Encender el piloto IA" }));
      await screen.findByText(/ya estoy encendido/);
      const llamada = fetch.mock.calls.find(([r]) => r === "/api/bot/iniciar")!;
      expect(JSON.parse(String(llamada[1]?.body))).toMatchObject({ modo: "ia" });
    });

    it("el historial le recuerda a la IA lo que propuso y si se confirmó", () => {
      const accion = COMPRA;
      expect(
        historialDe([
          { id: 1, de: "tu", texto: "¿qué hago?" },
          { id: 2, de: "bot", texto: "¿Pruebas?", accion, accionUsada: true },
        ]),
      ).toEqual([
        { rol: "usuario", texto: "¿qué hago?" },
        { rol: "bot", texto: "¿Pruebas?\n[Propuse: Comprar 2.000,00 USDT de BTC (la persona lo confirmó)]" },
      ]);
      expect(ordenDe({ ...accion, orden: { tipo: "VENTA", monto: null, todo: true } })).toEqual({
        tipo: "VENTA",
        todo: true,
        motivo: "propuesta de la IA del chat",
      });
    });
  });
});
