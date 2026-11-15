import { describe, expect, it, vi } from "vitest";

import { EVENTO_ABRIR_CHAT, abrirChat, esRutaDelChat } from "./chat";

describe("abrirChat", () => {
  it("avisa a quien escucha con la pregunta incluida", () => {
    const escucha = vi.fn();
    window.addEventListener(EVENTO_ABRIR_CHAT, escucha);

    abrirChat("¿cómo va el bot?");

    expect(escucha).toHaveBeenCalledTimes(1);
    const evento = escucha.mock.calls[0]![0] as CustomEvent<string | undefined>;
    expect(evento.detail).toBe("¿cómo va el bot?");
    window.removeEventListener(EVENTO_ABRIR_CHAT, escucha);
  });

  it("también abre el chat sin pregunta", () => {
    const escucha = vi.fn();
    window.addEventListener(EVENTO_ABRIR_CHAT, escucha);

    abrirChat();

    const evento = escucha.mock.calls[0]![0] as CustomEvent<string | null>;
    // El DOM convierte detail: undefined en null; quien escucha comprueba `if (detalle)`.
    expect(evento.detail).toBeNull();
    window.removeEventListener(EVENTO_ABRIR_CHAT, escucha);
  });

  it("usa el nombre de evento que escucha el lanzador del chat", () => {
    expect(EVENTO_ABRIR_CHAT).toBe("nexabit:abrir-chat");
  });
});

describe("esRutaDelChat", () => {
  it("reconoce las rutas que terminan en #chat", () => {
    expect(esRutaDelChat("/panel#chat")).toBe(true);
    expect(esRutaDelChat("#chat")).toBe(true);
  });

  it("no confunde las demás rutas", () => {
    expect(esRutaDelChat("/panel")).toBe(false);
    expect(esRutaDelChat("/chat")).toBe(false);
    expect(esRutaDelChat("/panel#chat-abierto")).toBe(false);
  });
});
