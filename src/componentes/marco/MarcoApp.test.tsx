import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso, USUARIO_PRUEBA } from "@/test/utilidades";

import { MarcoApp } from "./MarcoApp";

const replace = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/seguridad",
}));

beforeEach(() => replace.mockReset());
afterEach(() => vi.unstubAllGlobals());

describe("MarcoApp", () => {
  it("con sesión muestra la sección, el usuario y el aviso", async () => {
    servidorFalso({ "GET /api/cuentas/yo": { estado: 200, cuerpo: { usuario: USUARIO_PRUEBA } } });
    renderizar(
      <MarcoApp>
        <p>contenido privado</p>
      </MarcoApp>,
    );
    expect(await screen.findByText("contenido privado")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Seguridad" })).toBeInTheDocument();
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent("no se usa dinero real");
  });

  it("sesión vencida: no muestra nada privado y manda a iniciar sesión", async () => {
    servidorFalso({ "GET /api/cuentas/yo": { estado: 401, cuerpo: { error: "Tu sesión terminó" } } });
    renderizar(
      <MarcoApp>
        <p>contenido privado</p>
      </MarcoApp>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/iniciar-sesion?siguiente=%2Fseguridad"));
    expect(screen.queryByText("contenido privado")).toBeNull();
  });

  it("si el backend no responde, lo explica con opción de reintentar", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new TypeError("sin red"))),
    );
    renderizar(<MarcoApp>x</MarcoApp>);
    expect(
      await screen.findByRole("heading", { name: "No pudimos conectar con Nexabit" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
