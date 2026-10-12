import { afterEach, describe, expect, it } from "vitest";

import { coloresDeLaPaleta, dibujarCara } from "./textura";

afterEach(() => {
  document.documentElement.style.cssText = "";
});

describe("textura de la moneda", () => {
  it("lee los colores de la paleta", () => {
    document.documentElement.style.setProperty("--oro", "#123456");
    expect(coloresDeLaPaleta().oro).toBe("#123456");
  });

  it("si una variable falta, usa la del tema oscuro", () => {
    expect(coloresDeLaPaleta().bitcoin).toBe("#f7931a");
  });

  it("sin canvas 2D (como en las pruebas) devuelve null en vez de fallar", () => {
    expect(dibujarCara(coloresDeLaPaleta())).toBeNull();
  });
});
