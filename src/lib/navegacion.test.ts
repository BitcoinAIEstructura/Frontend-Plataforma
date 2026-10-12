import { describe, expect, it } from "vitest";

import { destinoSeguro, INICIO_APP } from "./navegacion";

describe("destinoSeguro", () => {
  it.each(["/cartera", "/seguridad?pestana=sesiones", "/panel#grafica"])(
    "acepta la ruta interna %s",
    (ruta) => {
      expect(destinoSeguro(ruta)).toBe(ruta);
    },
  );

  it.each([
    null,
    "",
    "https://phishing.example/login",
    "//phishing.example",
    "/\\phishing.example",
    "javascript:alert(1)",
    "cartera",
    "/iniciar-sesion",
    "/registro?x=1",
  ])("rechaza %s y lleva al panel", (malo) => {
    expect(destinoSeguro(malo)).toBe(INICIO_APP);
  });
});
