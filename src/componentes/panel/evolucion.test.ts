import { describe, expect, it } from "vitest";

import type { Vela } from "@/lib/api/mercado";
import type { Orden } from "@/lib/api/simulacion";

import { aplicarOrden, conValorActual, evolucionCartera, tieneMovimientos } from "./evolucion";

function orden(parcial: Partial<Orden>): Orden {
  return {
    id: 1,
    tipo: "COMPRA",
    monto: 1000,
    todo: false,
    estado: "EJECUTADA",
    creadaEn: 0,
    ejecutadaEn: 0,
    precioEjecucion: 50_000,
    cantidadBtc: 0.0198,
    comision: 10,
    motivo: "manual",
    detalle: null,
    ...parcial,
  };
}

function vela(tiempo: number, cierre: number): Vela {
  return {
    tiempoApertura: tiempo,
    apertura: cierre,
    maximo: cierre,
    minimo: cierre,
    cierre,
    volumen: 1,
    tiempoCierre: tiempo + 99,
  };
}

describe("aplicarOrden", () => {
  it("comprar gasta el bruto más la comisión (igual que el backend)", () => {
    // 1000 USDT con 1 % de comisión a 50 000: 0,0198 BTC y 10 USDT de comisión.
    expect(aplicarOrden({ usdt: 10_000, btc: 0 }, orden({}))).toEqual({ usdt: 9000, btc: 0.0198 });
  });

  it("vender cobra el bruto menos la comisión", () => {
    const venta = orden({ tipo: "VENTA", cantidadBtc: 0.01, precioEjecucion: 60_000, comision: 6 });
    const p = aplicarOrden({ usdt: 9000, btc: 0.0198 }, venta);
    expect(p.usdt).toBeCloseTo(9594);
    expect(p.btc).toBeCloseTo(0.0098);
  });
});

describe("evolucionCartera", () => {
  it("sin órdenes la cartera vale siempre el saldo inicial", () => {
    const puntos = evolucionCartera(10_000, [], [vela(0, 50_000), vela(100, 70_000)]);
    expect(puntos.map((p) => p.valor)).toEqual([10_000, 10_000]);
  });

  it("valora USDT + BTC con el cierre de cada vela, desde que se ejecuta la orden", () => {
    const compra = orden({ ejecutadaEn: 150 }); // en la segunda vela
    const puntos = evolucionCartera(
      10_000,
      [compra],
      [vela(0, 50_000), vela(100, 50_000), vela(200, 60_000)],
    );
    expect(puntos[0]!.valor).toBe(10_000);
    expect(puntos[1]!.valor).toBeCloseTo(9000 + 0.0198 * 50_000); // 9990: la comisión ya se pagó
    expect(puntos[2]!.valor).toBeCloseTo(9000 + 0.0198 * 60_000);
    expect(puntos.map((p) => p.tiempo)).toEqual([0, 100, 200]);
  });

  it("las órdenes anteriores a la primera vela ya cuentan; las no ejecutadas no", () => {
    const vieja = orden({ id: 1, ejecutadaEn: -5000 });
    const pendiente = orden({ id: 2, estado: "PENDIENTE", ejecutadaEn: null });
    const cancelada = orden({ id: 3, estado: "CANCELADA", ejecutadaEn: null });
    const [primero] = evolucionCartera(10_000, [pendiente, vieja, cancelada], [vela(0, 50_000)]);
    expect(primero!.valor).toBeCloseTo(9990);
  });

  it("ordena por momento de ejecución aunque la API las traiga en otro orden", () => {
    const compra = orden({ id: 1, ejecutadaEn: 10 });
    const venta = orden({ id: 2, tipo: "VENTA", ejecutadaEn: 20, cantidadBtc: 0.0198, comision: 0 });
    const [p] = evolucionCartera(10_000, [venta, compra], [vela(0, 50_000)]);
    // Compra y venta al mismo precio: se pierde solo la comisión de la compra.
    expect(p!.valor).toBeCloseTo(9990);
  });
});

describe("tieneMovimientos", () => {
  it("solo cuentan las órdenes ejecutadas", () => {
    expect(tieneMovimientos([orden({ estado: "PENDIENTE" })])).toBe(false);
    expect(tieneMovimientos([orden({})])).toBe(true);
  });
});

describe("conValorActual", () => {
  it("cambia solo el último punto", () => {
    const puntos = [
      { tiempo: 0, valor: 1 },
      { tiempo: 1, valor: 2 },
    ];
    expect(conValorActual(puntos, 5)).toEqual([
      { tiempo: 0, valor: 1 },
      { tiempo: 1, valor: 5 },
    ]);
    expect(conValorActual(puntos, undefined)).toBe(puntos);
    expect(conValorActual([], 5)).toEqual([]);
  });
});
