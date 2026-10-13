import { describe, expect, it } from "vitest";

import { config } from "./proxy";

/** El matcher de Next.js es una ruta con una expresión regular adentro: se prueba igual. */
function pasaPorElProxy(ruta: string): boolean {
  const patron = config.matcher[0]!.replace(/^\/\(/, "^/(").concat("$");
  return new RegExp(patron).test(ruta);
}

describe("qué rutas revisa el proxy", () => {
  it("las páginas sí", () => {
    for (const ruta of ["/panel", "/ordenes", "/iniciar-sesion", "/"])
      expect(pasaPorElProxy(ruta)).toBe(true);
  });

  it("la API, los archivos de Next y lo de la PWA no (deben cargarse sin sesión)", () => {
    for (const ruta of [
      "/api/precio",
      "/_next/static/chunk.js",
      "/manifest.webmanifest",
      "/sw.js",
      "/sin-conexion.html",
      "/iconos/nexabit-192.png",
      "/icon.svg",
    ]) {
      expect(pasaPorElProxy(ruta)).toBe(false);
    }
  });
});
