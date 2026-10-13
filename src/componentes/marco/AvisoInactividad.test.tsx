import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { AvisoInactividad } from "./AvisoInactividad";

const navegacion = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navegacion }));

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  navegacion.replace.mockClear();
});

const pasar = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("AvisoInactividad", () => {
  it("sin actividad avisa, cuenta hacia atrás y cierra la sesión", async () => {
    const fetch = servidorFalso({ "DELETE /api/sesion": { estado: 204 } });
    renderizar(<AvisoInactividad inactivoMs={5000} segundosAviso={3} />);
    pasar(4000);
    expect(screen.queryByRole("alertdialog")).toBeNull();
    pasar(2000);
    const dialogo = screen.getByRole("alertdialog", { name: "¿Sigues ahí?" });
    expect(dialogo).toHaveTextContent("se cerrará en 3 s");
    expect(screen.getByRole("button", { name: "Sí, sigo aquí" })).toHaveFocus();
    pasar(1000);
    expect(dialogo).toHaveTextContent("2 s");
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });
    await vi.waitFor(() =>
      expect(navegacion.replace).toHaveBeenCalledWith("/iniciar-sesion?motivo=inactividad"),
    );
    expect(fetch).toHaveBeenCalledWith("/api/sesion", expect.objectContaining({ method: "DELETE" }));
  });

  it("tocar algo reinicia la espera", () => {
    renderizar(<AvisoInactividad inactivoMs={5000} />);
    pasar(4000);
    fireEvent.keyDown(window, { key: "a" });
    pasar(4000);
    expect(screen.queryByRole("alertdialog")).toBeNull();
    pasar(2000);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("«Sí, sigo aquí» cierra el aviso y no cierra la sesión", () => {
    renderizar(<AvisoInactividad inactivoMs={1000} segundosAviso={5} />);
    pasar(2000);
    fireEvent.click(screen.getByRole("button", { name: "Sí, sigo aquí" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    pasar(500);
    expect(navegacion.replace).not.toHaveBeenCalled();
  });
});
