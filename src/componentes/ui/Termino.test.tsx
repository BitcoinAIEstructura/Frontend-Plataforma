import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EVENTO_ABRIR_CHAT } from "@/lib/chat";

import { Termino } from "./Termino";

describe("Termino", () => {
  it("el «?» abre una explicación sencilla que se cierra con Escape o tocando afuera", async () => {
    render(
      <p>
        <Termino concepto="stop-loss">Stop-loss</Termino> y más texto
      </p>,
    );
    const boton = screen.getByRole("button", { name: "¿Qué significa stop-loss?" });
    expect(boton).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(boton);
    expect(screen.getByRole("note")).toHaveTextContent("freno de emergencia");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("note")).toBeNull();
    await userEvent.click(boton);
    await userEvent.click(screen.getByText(/y más texto/));
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("«Pregúntale al bot» abre el chat con la pregunta", async () => {
    const oir = vi.fn();
    window.addEventListener(EVENTO_ABRIR_CHAT, oir);
    render(<Termino concepto="rsi" />);
    await userEvent.click(screen.getByRole("button", { name: "¿Qué significa RSI?" }));
    await userEvent.click(screen.getByRole("button", { name: "Pregúntale al bot →" }));
    expect((oir.mock.calls[0]?.[0] as CustomEvent).detail).toBe("¿Qué es el RSI?");
    window.removeEventListener(EVENTO_ABRIR_CHAT, oir);
  });
});
