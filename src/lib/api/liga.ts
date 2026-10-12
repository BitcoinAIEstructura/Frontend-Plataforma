/** Liga de inversores (con sesión) y "¿y si hubiera invertido?" (pública). */
import { z } from "zod";

import { pedir } from "./cliente";
import { esquemaVela } from "./mercado";

const esquemaClasificado = z.object({
  posicion: z.number(),
  alias: z.string(),
  rentabilidad: z.number(),
  valorTotal: z.number(),
  esTuyo: z.boolean(),
});
export type Clasificado = z.infer<typeof esquemaClasificado>;

const esquemaLiga = z.object({
  precio: z.number(),
  participantes: z.number(),
  mejores: z.array(esquemaClasificado),
  tu: esquemaClasificado.nullable(),
});
export type Liga = z.infer<typeof esquemaLiga>;

export function obtenerLiga(senal?: AbortSignal): Promise<Liga> {
  return pedir("/api/liga", esquemaLiga, { senal });
}

const esquemaMomento = z.object({ tiempo: z.number(), precio: z.number() });

const esquemaSiHubiera = z.object({
  fecha: z.string(),
  monto: z.number(),
  vela: esquemaVela,
  btc: z.number(),
  precioActual: z.number(),
  valorHoy: z.number(),
  ganancia: z.number(),
  rentabilidad: z.number(),
  mejor: esquemaMomento,
  peor: esquemaMomento,
  velasRecorridas: z.number(),
  alturaArbol: z.number(),
  velasIndexadas: z.number(),
});
export type SiHubiera = z.infer<typeof esquemaSiHubiera>;

/** `fecha` en AAAA-MM-DD. */
export function calcularSiHubiera(fecha: string, monto: number): Promise<SiHubiera> {
  const q = new URLSearchParams({ fecha, monto: String(monto) });
  return pedir(`/api/si-hubiera?${q}`, esquemaSiHubiera);
}
