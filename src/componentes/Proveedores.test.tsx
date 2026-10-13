import { describe, expect, it, vi } from "vitest";

import { ErrorApi } from "@/lib/api/cliente";
import { CLAVE_USUARIO } from "@/lib/hooks/useSesion";

import { crearClienteDeConsultas, debeReintentar } from "./Proveedores";

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

describe("sesión vencida a mitad de uso", () => {
  it("un 401 en una consulta vuelve a preguntar quién está conectado", async () => {
    const cliente = crearClienteDeConsultas();
    const invalidar = vi.spyOn(cliente, "invalidateQueries");
    await cliente
      .fetchQuery({
        queryKey: ["simulacion", "cartera"],
        queryFn: () => Promise.reject(new ErrorApi(401, "Tu sesión terminó")),
      })
      .catch(() => undefined);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_USUARIO });
  });

  it("otros errores, o el 401 de la propia consulta del usuario, no", async () => {
    const cliente = crearClienteDeConsultas();
    const invalidar = vi.spyOn(cliente, "invalidateQueries");
    await cliente
      .fetchQuery({ queryKey: ["mercado", "precio"], queryFn: () => Promise.reject(new ErrorApi(429, "x")) })
      .catch(() => undefined);
    await cliente
      .fetchQuery({ queryKey: CLAVE_USUARIO, queryFn: () => Promise.reject(new ErrorApi(401, "x")) })
      .catch(() => undefined);
    expect(invalidar).not.toHaveBeenCalled();
  });
});
