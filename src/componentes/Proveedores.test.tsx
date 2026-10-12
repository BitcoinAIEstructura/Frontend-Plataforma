import { describe, expect, it } from "vitest";

import { ErrorApi } from "@/lib/api/cliente";

import { debeReintentar } from "./Proveedores";

describe("debeReintentar", () => {
  it("no reintenta errores del cliente (401, 400, 429…)", () => {
    for (const codigo of [400, 401, 404, 409, 429]) {
      expect(debeReintentar(0, new ErrorApi(codigo, "x"))).toBe(false);
    }
  });

  it("reintenta hasta 2 veces fallas de red o del servidor", () => {
    expect(debeReintentar(0, new ErrorApi(0, "sin conexión"))).toBe(true);
    expect(debeReintentar(1, new ErrorApi(502, "Binance"))).toBe(true);
    expect(debeReintentar(2, new ErrorApi(502, "Binance"))).toBe(false);
  });
});
