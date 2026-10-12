import { describe, expect, it } from "vitest";

import { esRutaPublica, redireccionSinSesion } from "./acceso";
import { destinoSeguro } from "./navegacion";

describe("rutas públicas", () => {
  it.each(["/iniciar-sesion", "/registro"])("%s es pública", (ruta) =>
    expect(esRutaPublica(ruta)).toBe(true),
  );
  it.each(["/", "/panel", "/registros", "/seguridad"])("%s es privada", (ruta) =>
    expect(esRutaPublica(ruta)).toBe(false),
  );
});

describe("redireccionSinSesion", () => {
  it("con cookie, o en una página pública, sigue", () => {
    expect(redireccionSinSesion("/panel", "", true)).toBeNull();
    expect(redireccionSinSesion("/registro", "", false)).toBeNull();
  });

  it("sin cookie manda a iniciar sesión recordando a dónde iba", () => {
    const destino = redireccionSinSesion("/seguridad", "?pestana=sesiones", false);
    expect(destino).toBe("/iniciar-sesion?siguiente=%2Fseguridad%3Fpestana%3Dsesiones");
    const siguiente = new URL(destino!, "http://x").searchParams.get("siguiente");
    expect(destinoSeguro(siguiente)).toBe("/seguridad?pestana=sesiones");
  });

  it("la raíz va al inicio de sesión sin parámetro", () => {
    expect(redireccionSinSesion("/", "", false)).toBe("/iniciar-sesion");
  });
});
