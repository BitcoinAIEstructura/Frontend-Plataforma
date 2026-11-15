import { describe, expect, it } from "vitest";

import { porcentaje, puntos, valorCaracteristica } from "./formato";

describe("porcentaje", () => {
  it("pasa la fracción a porcentaje con coma decimal", () => {
    expect(porcentaje(0.5263)).toBe("52,6 %");
    expect(porcentaje(1)).toBe("100 %");
    expect(porcentaje(0)).toBe("0 %");
  });

  it("redondea a un decimal", () => {
    expect(porcentaje(0.12345)).toBe("12,3 %");
  });

  it("admite negativos", () => {
    expect(porcentaje(-0.05)).toBe("-5 %");
  });
});

describe("puntos", () => {
  it("marca la ventaja con triángulo hacia arriba", () => {
    expect(puntos(0.021)).toBe("▲ 2,1 puntos");
  });

  it("marca la desventaja con triángulo hacia abajo", () => {
    expect(puntos(-0.05)).toBe("▼ 5 puntos");
  });

  it("usa el singular cuando vale uno", () => {
    expect(puntos(0.01)).toBe("▲ 1 punto");
    expect(puntos(-0.01)).toBe("▼ 1 punto");
  });

  it("trata las diferencias despreciables como cero", () => {
    expect(puntos(0)).toBe("● 0 puntos");
    expect(puntos(0.0004)).toBe("● 0 puntos");
    expect(puntos(-0.0004)).toBe("● 0 puntos");
  });
});

describe("valorCaracteristica", () => {
  it("deja el RSI tal cual, sin signo ni escala", () => {
    expect(valorCaracteristica("RSI14", 55.55)).toBe("55,6");
    expect(valorCaracteristica("RSI", 0)).toBe("0");
  });

  it("expresa el resto en porcentaje con signo", () => {
    expect(valorCaracteristica("retorno1", 0.0123)).toBe("+1,23 %");
    expect(valorCaracteristica("retorno1", -0.0123)).toBe("−1,23 %");
    expect(valorCaracteristica("distanciaMaximo", 12.345)).toBe("+1.234,5 %");
  });

  it("no pone signo cuando el valor es cero", () => {
    expect(valorCaracteristica("distanciaMedia", 0)).toBe("0 %");
  });
});
