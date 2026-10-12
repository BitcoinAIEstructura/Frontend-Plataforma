import { describe, expect, it } from "vitest";

import type { Cartera, Orden } from "@/lib/api/simulacion";

import { leerMonto, montoRapido, reservado, separarOrdenes, validarMonto, vistaPrevia } from "./calculos";

const CARTERA: Cartera = {
  precioActual: 80_000,
  saldoUsdt: 9_500.555,
  btc: 0.00625,
  costoPromedio: 80_000,
  valorBtc: 500,
  valorTotal: 10_000.555,
  gananciaNoRealizada: 0,
  gananciaRealizada: 0,
  gananciaTotal: 0,
  rentabilidad: 0,
  comisionesPagadas: 0.5,
  saldoInicial: 10_000,
};

describe("montos rápidos", () => {
  it("se calculan sobre lo disponible y redondean hacia abajo", () => {
    expect(montoRapido("COMPRA", 0.25, CARTERA)).toBe(2375.13);
    expect(montoRapido("COMPRA", 0.5, CARTERA)).toBe(4750.27);
    expect(montoRapido("VENTA", 0.5, CARTERA)).toBe(250);
  });
});

describe("vistaPrevia", () => {
  it("en la compra la comisión sale del monto (como el ejemplo de docs/API.md)", () => {
    const v = vistaPrevia("COMPRA", 500, 82937.59);
    expect(v.comision).toBeCloseTo(0.5);
    expect(v.btc).toBeCloseTo(0.00602260084962681, 12);
    expect(v.usdt).toBe(500);
  });

  it("en la venta se recibe el valor menos la comisión", () => {
    const v = vistaPrevia("VENTA", 200, 80_000);
    expect(v.btc).toBeCloseTo(0.0025);
    expect(v.usdt).toBeCloseTo(199.8);
  });
});

describe("validarMonto", () => {
  it("exige un monto positivo dentro de lo disponible", () => {
    expect(validarMonto("COMPRA", 0, CARTERA)).toBe("Escribe un monto mayor que 0.");
    expect(validarMonto("COMPRA", Number.NaN, CARTERA)).toBe("Escribe un monto mayor que 0.");
    expect(validarMonto("COMPRA", 9_600, CARTERA)).toBe("Solo tienes 9.500,56 USDT disponibles.");
    expect(validarMonto("VENTA", 600, CARTERA)).toBe("Tu BTC vale 500,00 USDT; no alcanza para ese monto.");
    expect(validarMonto("VENTA", 10, { ...CARTERA, valorBtc: 0, btc: 0 })).toBe(
      "Aún no tienes BTC para vender.",
    );
    expect(validarMonto("COMPRA", 9_500.555, CARTERA)).toBeNull();
  });
});

describe("leerMonto", () => {
  it("acepta coma decimal y puntos de miles, o punto decimal", () => {
    expect(leerMonto("1.250,50")).toBe(1250.5);
    expect(leerMonto("1250.5")).toBe(1250.5);
    expect(leerMonto("1.250")).toBe(1250);
    expect(leerMonto("2.5")).toBe(2.5);
    expect(leerMonto(" 300 ")).toBe(300);
    expect(leerMonto("")).toBeNaN();
    expect(leerMonto("-5")).toBeNaN();
    expect(leerMonto("12abc")).toBeNaN();
  });
});

describe("separarOrdenes", () => {
  const o = (id: number, estado: Orden["estado"]) => ({ id, estado }) as Orden;
  it("deja la cola en su orden y el registro con lo más reciente arriba", () => {
    const { cola, registro } = separarOrdenes([
      o(4, "PENDIENTE"),
      o(5, "PENDIENTE"),
      o(1, "EJECUTADA"),
      o(3, "CANCELADA"),
      o(2, "RECHAZADA"),
    ]);
    expect(cola.map((x) => x.id)).toEqual([4, 5]);
    expect(registro.map((x) => x.id)).toEqual([3, 2, 1]);
  });
});

describe("reservado", () => {
  it("suma los montos de ese tipo que siguen en la cola", () => {
    const o = (tipo: Orden["tipo"], estado: Orden["estado"], monto: number | null) =>
      ({ tipo, estado, monto }) as Orden;
    const ordenes = [
      o("COMPRA", "PENDIENTE", 100),
      o("COMPRA", "PROCESANDO", 50),
      o("COMPRA", "EJECUTADA", 999),
      o("VENTA", "PENDIENTE", 30),
      o("VENTA", "PENDIENTE", null),
    ];
    expect(reservado("COMPRA", ordenes)).toBe(150);
    expect(reservado("VENTA", ordenes)).toBe(30);
  });
});
