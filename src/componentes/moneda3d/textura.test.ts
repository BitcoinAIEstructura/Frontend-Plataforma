import { afterEach, describe, expect, it } from "vitest";

import { coloresDeLaPaleta, dibujarCanto, dibujarCara } from "./textura";

afterEach(() => {
  document.documentElement.style.cssText = "";
});

describe("textura de la moneda", () => {
  it("lee el metal de la paleta (--moneda-*)", () => {
    document.documentElement.style.setProperty("--moneda", "#123456");
    document.documentElement.style.setProperty("--moneda-canto", "#654321");
    const colores = coloresDeLaPaleta();
    expect(colores.medio).toBe("#123456");
    expect(colores.canto).toBe("#654321");
  });

  it("si una variable falta, usa la del tema oscuro", () => {
    expect(coloresDeLaPaleta().claro).toBe("#f7e4ae");
  });

  it("sin canvas 2D (como en las pruebas) devuelve null en vez de fallar", () => {
    expect(dibujarCara(coloresDeLaPaleta())).toBeNull();
    expect(dibujarCanto(coloresDeLaPaleta())).toBeNull();
  });
});
