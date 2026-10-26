import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso, USUARIO_PRUEBA } from "@/test/utilidades";

import { PasoCorreo } from "./PasoCorreo";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const escribir = (codigo: string) =>
  fireEvent.change(screen.getByLabelText("Código del correo"), { target: { value: codigo } });

/** Deja que respondan las promesas del fetch falso con los relojes falsos puestos. */
const esperar = () => act(async () => vi.advanceTimersByTimeAsync(50));

describe("PasoCorreo", () => {
  it("solo acepta 6 números y con el código correcto entra", async () => {
    servidorFalso({
      "POST /api/cuentas/verificar-correo": { estado: 200, cuerpo: { usuario: USUARIO_PRUEBA } },
    });
    const alEntrar = vi.fn();
    renderizar(<PasoCorreo correo="a***@correo.co" alEntrar={alEntrar} />);
    escribir("04a2-137 9");
    expect(screen.getByLabelText("Código del correo")).toHaveValue("042137");
    fireEvent.click(screen.getByRole("button", { name: "Activar mi cuenta" }));
    await vi.waitFor(() => expect(alEntrar).toHaveBeenCalled());
  });

  it("código equivocado: lo dice y borra la casilla; vencido: apaga el botón hasta pedir otro", async () => {
    servidorFalso({
      "POST /api/cuentas/verificar-correo": {
        estado: 410,
        cuerpo: { error: "El código venció; pide uno nuevo" },
      },
    });
    renderizar(<PasoCorreo correo="a***@correo.co" alEntrar={vi.fn()} />);
    escribir("123");
    fireEvent.click(screen.getByRole("button", { name: "Activar mi cuenta" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Escribe los 6 números");
    escribir("123456");
    fireEvent.click(screen.getByRole("button", { name: "Activar mi cuenta" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("pide uno nuevo");
    expect(screen.getByLabelText("Código del correo")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Activar mi cuenta" })).toBeDisabled();
  });

  it("deja pedir otro código después de 60 s", async () => {
    vi.useFakeTimers();
    const fetch = servidorFalso({
      "POST /api/cuentas/reenviar-codigo": { estado: 200, cuerpo: { correo: "a***@correo.co" } },
    });
    renderizar(<PasoCorreo correo="a***@correo.co" alEntrar={vi.fn()} />);
    expect(screen.getByText(/pedir otro en/)).toHaveTextContent("60 s");
    for (let i = 0; i < 60; i++) await act(async () => vi.advanceTimersByTimeAsync(1000));
    fireEvent.click(screen.getByRole("button", { name: "Enviarme otro código" }));
    await esperar();
    expect(screen.getByRole("status")).toHaveTextContent("Te enviamos un código nuevo a a***@correo.co");
    expect(fetch).toHaveBeenCalledWith(
      "/api/cuentas/reenviar-codigo",
      expect.objectContaining({ method: "POST" }),
    );
    expect(screen.getByText(/pedir otro en/)).toHaveTextContent("60 s");
  });
});
