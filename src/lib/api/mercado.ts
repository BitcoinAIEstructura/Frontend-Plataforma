/** Datos de mercado (públicos): precio, velas, indicadores y señal. Formas de docs/API.md del backend. */
import { z } from "zod";

import { pedir } from "./cliente";

export const INTERVALOS = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;
export type Intervalo = (typeof INTERVALOS)[number];

export const esquemaPrecio = z.object({ simbolo: z.string(), precio: z.number(), momento: z.number() });
export type Precio = z.infer<typeof esquemaPrecio>;

export const esquemaVela = z.object({
  tiempoApertura: z.number(),
  apertura: z.number(),
  maximo: z.number(),
  minimo: z.number(),
  cierre: z.number(),
  volumen: z.number(),
  tiempoCierre: z.number(),
});
export type Vela = z.infer<typeof esquemaVela>;

const esquemaVelas = z.object({
  simbolo: z.string(),
  intervalo: z.string(),
  cantidad: z.number(),
  velas: z.array(esquemaVela),
});

export const esquemaPunto = z.object({ tiempo: z.number(), valor: z.number() });
export type Punto = z.infer<typeof esquemaPunto>;

export const NOMBRES_INDICADORES = ["sma", "ema", "rsi", "macd", "bollinger", "volatilidad"] as const;
export type NombreIndicador = (typeof NOMBRES_INDICADORES)[number];

const esquemaIndicador = z.object({
  indicador: z.string(),
  parametros: z.record(z.string(), z.unknown()),
  series: z.record(z.string(), z.array(esquemaPunto)),
});
export type ResultadoIndicador = z.infer<typeof esquemaIndicador>;

export const esquemaDecision = z.object({
  tiempo: z.number(),
  senal: z.enum(["COMPRAR", "VENDER", "MANTENER"]),
  precio: z.number(),
  confianza: z.number(),
  motivo: z.string(),
});
export type Decision = z.infer<typeof esquemaDecision>;

const esquemaSenal = z.object({
  estrategia: z.string(),
  velasAnalizadas: z.number(),
  decision: esquemaDecision,
  pronostico: z.object({
    direccion: z.enum(["SUBE", "BAJA", "LATERAL"]),
    confianza: z.number(),
    justificacion: z.array(z.string()),
    indicadores: z.record(z.string(), z.number()),
    aviso: z.string(),
  }),
});
export type Senal = z.infer<typeof esquemaSenal>;

export function obtenerPrecio(senal?: AbortSignal): Promise<Precio> {
  return pedir("/api/precio", esquemaPrecio, { senal });
}

export async function obtenerVelas(
  intervalo: Intervalo,
  cantidad: number,
  senal?: AbortSignal,
): Promise<Vela[]> {
  const r = await pedir(`/api/velas?intervalo=${intervalo}&cantidad=${cantidad}`, esquemaVelas, { senal });
  return r.velas;
}

export function obtenerIndicador(
  indicador: NombreIndicador,
  intervalo: Intervalo,
  cantidad: number,
  parametros: Record<string, number> = {},
  senal?: AbortSignal,
): Promise<ResultadoIndicador> {
  const consulta = new URLSearchParams({ indicador, intervalo, cantidad: String(cantidad) });
  for (const [clave, valor] of Object.entries(parametros)) consulta.set(clave, String(valor));
  return pedir(`/api/indicadores?${consulta}`, esquemaIndicador, { senal });
}

export function obtenerSenal(intervalo: Intervalo = "1h", senal?: AbortSignal): Promise<Senal> {
  return pedir(`/api/senal?estrategia=combinada&intervalo=${intervalo}`, esquemaSenal, { senal });
}
