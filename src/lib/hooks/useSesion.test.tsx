import { act, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizarGancho, servidorFalso, USUARIO_PRUEBA } from "@/test/utilidades";

import { CLAVE_USUARIO, useCerrarSesion, useIniciarSesion, useUsuarioActual } from "./useSesion";

afterEach(() => vi.unstubAllGlobals());

describe("useUsuarioActual", () => {
  it("con sesión devuelve el usuario", async () => {
    servidorFalso({ "GET /api/cuentas/yo": { estado: 200, cuerpo: { usuario: USUARIO_PRUEBA } } });
    const { result } = renderizarGancho(useUsuarioActual);
    await waitFor(() => expect(result.current.usuario?.nombre).toBe("Ana"));
    expect(result.current.sinSesion).toBe(false);
  });

  it("sin sesión (401) no es un error: usuario null", async () => {
    servidorFalso({ "GET /api/cuentas/yo": { estado: 401, cuerpo: { error: "Tu sesión terminó" } } });
    const { result } = renderizarGancho(useUsuarioActual);
    await waitFor(() => expect(result.current.sinSesion).toBe(true));
    expect(result.current.error).toBeNull();
  });
});

describe("iniciar y cerrar sesión", () => {
  it("un inicio en un paso guarda al usuario; en dos pasos todavía no", async () => {
    servidorFalso({
      "POST /api/sesion": (cuerpo) =>
        (cuerpo as { correo: string }).correo === "dos@pasos.co"
          ? { estado: 200, cuerpo: { segundoPaso: true } }
          : { estado: 200, cuerpo: { segundoPaso: false, usuario: USUARIO_PRUEBA } },
    });
    const { result, cliente } = renderizarGancho(useIniciarSesion);
    await act(() => result.current.mutateAsync({ correo: "dos@pasos.co", contrasena: "x" }));
    expect(cliente.getQueryData(CLAVE_USUARIO)).toBeUndefined();
    await act(() => result.current.mutateAsync({ correo: "ana@correo.co", contrasena: "x" }));
    expect(cliente.getQueryData(CLAVE_USUARIO)).toMatchObject({ id: 1 });
  });

  it("cerrar sesión borra todo lo guardado, aunque falle la red", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new TypeError("sin red"))),
    );
    const { result, cliente } = renderizarGancho(useCerrarSesion);
    cliente.setQueryData(CLAVE_USUARIO, USUARIO_PRUEBA);
    cliente.setQueryData(["cartera"], { saldo: 1 });
    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined);
    });
    expect(cliente.getQueryData(CLAVE_USUARIO)).toBeNull();
    expect(cliente.getQueryData(["cartera"])).toBeUndefined();
  });
});
