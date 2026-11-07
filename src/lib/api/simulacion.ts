/** La simulación del usuario (exige sesión): órdenes, cartera, historial y bot. */
import { z } from "zod";

import { pedir } from "./cliente";
import { esquemaDecision } from "./mercado";

export const esquemaOrden = z.object({
  id: z.number().int(),
  tipo: z.enum(["COMPRA", "VENTA"]),
  monto: z.number().nullable(),
  todo: z.boolean(),
  estado: z.enum(["PENDIENTE", "PROCESANDO", "EJECUTADA", "CANCELADA", "RECHAZADA"]),
  creadaEn: z.number(),
  ejecutadaEn: z.number().nullable(),
  precioEjecucion: z.number().nullable(),
  cantidadBtc: z.number().nullable(),
  comision: z.number().nullable(),
  motivo: z.string(),
  detalle: z.string().nullable(),
});
/** Orden simulada de compra o venta, con su estado y datos de ejecución. */
export type Orden = z.infer<typeof esquemaOrden>;

export const esquemaCartera = z.object({
  precioActual: z.number(),
  saldoUsdt: z.number(),
  btc: z.number(),
  costoPromedio: z.number(),
  valorBtc: z.number(),
  valorTotal: z.number(),
  gananciaNoRealizada: z.number(),
  gananciaRealizada: z.number(),
  gananciaTotal: z.number(),
  rentabilidad: z.number(),
  comisionesPagadas: z.number(),
  saldoInicial: z.number(),
});
/** Saldos, posiciones y rendimiento de la cartera ficticia del usuario. */
export type Cartera = z.infer<typeof esquemaCartera>;

export const esquemaEvento = z.object({
  momento: z.number(),
  tipo: z.string(),
  idOrden: z.number().nullable(),
  descripcion: z.string(),
});
/** Evento del historial de la simulación (órdenes, cartera y bot). */
export type EventoSimulacion = z.infer<typeof esquemaEvento>;

export const esquemaConfiguracionBot = z.object({
  segundosEntreCiclos: z.number(),
  intervalo: z.string(),
  cantidadVelas: z.number(),
  riesgo: z.number(),
  stopLoss: z.number(),
  takeProfit: z.number(),
});
/** Parámetros con los que se configura el bot simulado. */
export type ConfiguracionBot = z.infer<typeof esquemaConfiguracionBot>;

export const esquemaBot = z.object({
  activo: z.boolean(),
  estrategia: z.string(),
  configuracion: esquemaConfiguracionBot,
  ciclos: z.number(),
  ultimoCiclo: z.number().nullable(),
  ultimaDecision: esquemaDecision.nullable(),
  ultimoError: z.string().nullable(),
  /** Cuándo se encendió (ms) y si está revisando el mercado en este momento. */
  encendidoDesde: z.number().nullable().default(null),
  enCiclo: z.boolean().default(false),
});
/** Estado actual del bot y su última decisión de mercado. */
export type EstadoBot = z.infer<typeof esquemaBot>;

/** Datos necesarios para crear una orden: por monto o vendiendo todo el BTC. */
export type NuevaOrden =
  | { tipo: "COMPRA" | "VENTA"; monto: number; motivo?: string }
  | { tipo: "VENTA"; todo: true; motivo?: string };

// ---------- órdenes ----------

export function crearOrden(orden: NuevaOrden): Promise<Orden> {
  return pedir("/api/ordenes", esquemaOrden, { metodo: "POST", cuerpo: orden });
}

export async function obtenerOrdenes(): Promise<Orden[]> {
  return (await pedir("/api/ordenes", z.object({ cantidad: z.number(), ordenes: z.array(esquemaOrden) })))
    .ordenes;
}

export function procesarSiguiente(): Promise<Orden> {
  return pedir("/api/ordenes/procesar", esquemaOrden, { metodo: "POST" });
}

export function deshacerUltima(): Promise<Orden> {
  return pedir("/api/ordenes/deshacer", esquemaOrden, { metodo: "POST" });
}

export function cancelarOrden(id: number): Promise<Orden> {
  return pedir(`/api/ordenes/${encodeURIComponent(String(id))}`, esquemaOrden, { metodo: "DELETE" });
}

// ---------- cartera e historial ----------

export function obtenerCartera(senal?: AbortSignal): Promise<Cartera> {
  return pedir("/api/cartera", esquemaCartera, { senal });
}

export async function obtenerHistorial(limite = 50): Promise<EventoSimulacion[]> {
  return (await pedir(`/api/historial?limite=${limite}`, z.object({ eventos: z.array(esquemaEvento) })))
    .eventos;
}

// ---------- bot ----------

export function obtenerBot(): Promise<EstadoBot> {
  return pedir("/api/bot/estado", esquemaBot);
}

export function iniciarBot(configuracion: Partial<ConfiguracionBot>): Promise<EstadoBot> {
  return pedir("/api/bot/iniciar", esquemaBot, { metodo: "POST", cuerpo: configuracion });
}

export function detenerBot(): Promise<EstadoBot> {
  return pedir("/api/bot/detener", esquemaBot, { metodo: "POST" });
}
