/** Cálculos del formulario de órdenes (los mismos del backend; él tiene la última palabra). */
import type { Cartera, Orden } from "@/lib/api/simulacion";
import { usdt } from "@/lib/formato";

/** Comisión de cada compra y cada venta (docs/API.md: 0,1 %). */
export const COMISION = 0.001;

export type Tipo = Orden["tipo"];

/** Lo máximo que se puede poner en el monto: USDT disponibles al comprar, valor del BTC al vender. */
export function disponible(tipo: Tipo, cartera: Cartera): number {
  return tipo === "COMPRA" ? cartera.saldoUsdt : cartera.valorBtc;
}

/** Monto para un botón rápido (25 %, 50 %), redondeado hacia abajo al centavo. */
export function montoRapido(tipo: Tipo, fraccion: number, cartera: Cartera): number {
  return Math.floor(disponible(tipo, cartera) * fraccion * 100) / 100;
}

export interface VistaPrevia {
  btc: number;
  comision: number;
  /** USDT que salen (compra) o que entran (venta). */
  usdt: number;
}

/**
 * Qué pasaría al precio de ahora. En la compra el monto incluye la comisión; en la venta
 * el monto es el valor del BTC y la comisión se descuenta de lo que se recibe.
 */
export function vistaPrevia(tipo: Tipo, monto: number, precio: number): VistaPrevia {
  const comision = monto * COMISION;
  return tipo === "COMPRA"
    ? { btc: (monto - comision) / precio, comision, usdt: monto }
    : { btc: monto / precio, comision, usdt: monto - comision };
}

/** Mensaje si el monto no sirve (null si sí). */
export function validarMonto(tipo: Tipo, monto: number, cartera: Cartera): string | null {
  if (!Number.isFinite(monto) || monto <= 0) return "Escribe un monto mayor que 0.";
  const tope = disponible(tipo, cartera);
  if (monto > tope + 1e-9) {
    return tipo === "COMPRA"
      ? `Solo tienes ${usdt(tope)} USDT disponibles.`
      : tope === 0
        ? "Aún no tienes BTC para vender."
        : `Tu BTC vale ${usdt(tope)} USDT; no alcanza para ese monto.`;
  }
  return null;
}

/** Lee un monto escrito a la colombiana ("1.250,50") o con punto decimal ("1250.5"). */
export function leerMonto(texto: string): number {
  const limpio = texto.trim().replace(/\s/g, "");
  if (limpio === "") return Number.NaN;
  // Con coma, los puntos son de miles. Sin coma, "1.250" (grupos de 3) también es de miles.
  const normal =
    limpio.includes(",") || /^\d{1,3}(\.\d{3})+$/.test(limpio)
      ? limpio.replace(/\./g, "").replace(",", ".")
      : limpio;
  return /^\d+(\.\d+)?$/.test(normal) ? Number(normal) : Number.NaN;
}

/**
 * La API entrega primero la cola (en orden de llegada) y luego el registro.
 * Aquí se separan: la cola tal cual y el registro con lo más reciente arriba.
 */
export function separarOrdenes(ordenes: readonly Orden[]): { cola: Orden[]; registro: Orden[] } {
  const enCola = (o: Orden) => o.estado === "PENDIENTE" || o.estado === "PROCESANDO";
  return {
    cola: ordenes.filter(enCola),
    registro: ordenes.filter((o) => !enCola(o)).sort((a, b) => b.id - a.id),
  };
}

/**
 * USDT ya comprometidos en órdenes de ese tipo que esperan en la cola (las de "todo"
 * no suman: se calculan al ejecutarse). El backend revisa el saldo al ejecutar, no al crear.
 */
export function reservado(tipo: Tipo, ordenes: readonly Orden[]): number {
  return ordenes
    .filter((o) => o.tipo === tipo && (o.estado === "PENDIENTE" || o.estado === "PROCESANDO"))
    .reduce((suma, o) => suma + (o.monto ?? 0), 0);
}
