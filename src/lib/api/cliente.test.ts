import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { ErrorApi, pedir } from "./cliente";

function responder(estado: number, cuerpo?: unknown, encabezados: Record<string, string> = {}) {
  const fetchFalso = vi.fn(async () =>
    new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
      status: estado,
      headers: { "Content-Type": "application/json", ...encabezados },
    }),
  );
  vi.stubGlobal("fetch", fetchFalso);
  return fetchFalso;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const esquema = z.object({ precio: z.number() });

describe("pedir", () => {
  it("valida la respuesta y manda la cookie del mismo sitio", async () => {
    const fetchFalso = responder(200, { precio: 82_000.5 });
    await expect(pedir("/api/precio", esquema)).resolves.toEqual({ precio: 82_000.5 });
    const [ruta, opciones] = fetchFalso.mock.calls[0] as unknown as [string, RequestInit];
    expect(ruta).toBe("/api/precio");
    expect(opciones.credentials).toBe("same-origin");
    expect(opciones.cache).toBe("no-store");
    expect(opciones.body).toBeUndefined();
  });

  it("envía el cuerpo como JSON", async () => {
    const fetchFalso = responder(201, { precio: 1 });
    await pedir("/api/ordenes", esquema, { metodo: "POST", cuerpo: { tipo: "COMPRA", monto: 500 } });
    const [, opciones] = fetchFalso.mock.calls[0] as unknown as [string, RequestInit];
    expect(opciones.method).toBe("POST");
    expect(opciones.body).toBe('{"tipo":"COMPRA","monto":500}');
    expect(new Headers(opciones.headers).get("Content-Type")).toBe("application/json");
  });

  it("convierte los errores del backend en ErrorApi con su campo", async () => {
    responder(400, { error: "El correo no es válido", campo: "correo" });
    const error = await pedir("/api/cuentas/registro", esquema).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ErrorApi);
    expect(error).toMatchObject({ codigo: 400, message: "El correo no es válido", campo: "correo" });
  });

  it("lee Retry-After en el 429 y reconoce el 401", async () => {
    responder(429, { error: "Demasiados intentos." }, { "Retry-After": "900" });
    await expect(pedir("/api/sesion", esquema)).rejects.toMatchObject({ codigo: 429, esperaSegundos: 900 });
    responder(401, { error: "Tu sesión terminó" });
    const error = (await pedir("/api/cuentas/yo", esquema).catch((e: unknown) => e)) as ErrorApi;
    expect(error.sinSesion).toBe(true);
  });

  it("rechaza respuestas con otro formato", async () => {
    responder(200, { precio: "mucho" });
    await expect(pedir("/api/precio", esquema)).rejects.toThrow("no tiene el formato esperado");
  });

  it("204 sin cuerpo y sin conexión", async () => {
    responder(204);
    await expect(pedir("/api/sesion", null, { metodo: "DELETE" })).resolves.toBeUndefined();
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))));
    await expect(pedir("/api/precio", esquema)).rejects.toMatchObject({ codigo: 0 });
  });
});
