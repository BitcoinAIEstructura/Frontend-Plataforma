import { afterEach, describe, expect, it, vi } from "vitest";

import { cerrarSesionPorId, iniciarSesion, obtenerUsuarioActual, registrar } from "./cuentas";

const USUARIO = {
  id: 1,
  nombre: "Ana",
  apellido: "Pérez",
  correo: "ana@correo.co",
  tipoDocumento: "CC",
  documento: "******6789",
  telefono: "+57******4567",
  verificacionDosPasos: false,
  creadoEn: 1791604997952,
};

function responder(estado: number, cuerpo: unknown) {
  const fetchFalso = vi.fn(async () => new Response(JSON.stringify(cuerpo), { status: estado }));
  vi.stubGlobal("fetch", fetchFalso);
  return fetchFalso;
}

afterEach(() => vi.unstubAllGlobals());

describe("cuentas", () => {
  it("registrar devuelve el usuario (con datos enmascarados)", async () => {
    responder(201, { usuario: USUARIO });
    const usuario = await registrar({
      nombre: "Ana",
      apellido: "Pérez",
      correo: "ana@correo.co",
      tipoDocumento: "CC",
      numeroDocumento: "1023456789",
      telefono: "3001234567",
      contrasena: "Luna-Roja-2026",
    });
    expect(usuario.documento).toBe("******6789");
  });

  it("inicio de sesión en uno o en dos pasos", async () => {
    responder(200, { segundoPaso: true });
    await expect(iniciarSesion("ana@correo.co", "x")).resolves.toEqual({ segundoPaso: true });
    responder(200, { segundoPaso: false, usuario: USUARIO });
    const r = await iniciarSesion("ana@correo.co", "x");
    expect(r.segundoPaso === false && r.usuario.id).toBe(1);
  });

  it("usuario actual y rutas con id escapado", async () => {
    responder(200, { usuario: USUARIO });
    await expect(obtenerUsuarioActual()).resolves.toMatchObject({ nombre: "Ana" });
    const fetchFalso = vi.fn(async (_ruta: string) => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchFalso);
    await cerrarSesionPorId(7);
    expect(fetchFalso.mock.calls[0]?.[0]).toBe("/api/cuentas/sesiones/7");
  });

  it("rechaza un usuario con tipo de documento desconocido", async () => {
    responder(200, { usuario: { ...USUARIO, tipoDocumento: "PASAPORTE" } });
    await expect(obtenerUsuarioActual()).rejects.toThrow("formato esperado");
  });
});
