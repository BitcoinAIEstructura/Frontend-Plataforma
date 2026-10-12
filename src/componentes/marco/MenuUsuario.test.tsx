import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso, USUARIO_PRUEBA } from "@/test/utilidades";

import { iniciales, MenuUsuario } from "./MenuUsuario";

const replace = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));

afterEach(() => vi.unstubAllGlobals());

describe("MenuUsuario", () => {
  it("iniciales con tildes y espacios", () => {
    expect(iniciales({ nombre: " ángela ", apellido: "Ñúñez" })).toBe("ÁÑ");
  });

  it("abre y cierra con el botón y con Escape", async () => {
    renderizar(<MenuUsuario usuario={USUARIO_PRUEBA} />);
    const boton = screen.getByRole("button", { name: /Menú de la cuenta/ });
    await userEvent.click(boton);
    expect(boton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toHaveTextContent("ana@correo.co");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("cerrar sesión avisa al backend y vuelve al inicio de sesión", async () => {
    const servidor = servidorFalso({ "DELETE /api/sesion": { estado: 204 } });
    renderizar(<MenuUsuario usuario={USUARIO_PRUEBA} />);
    await userEvent.click(screen.getByRole("button", { name: /Menú de la cuenta/ }));
    await userEvent.click(screen.getByRole("menuitem", { name: /Cerrar sesión/ }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/iniciar-sesion"));
    expect(servidor.mock.calls[0]?.[0]).toBe("/api/sesion");
  });
});
