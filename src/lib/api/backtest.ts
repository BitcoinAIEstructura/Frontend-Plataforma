/** Máquina del tiempo: el bot sobre velas del pasado (GET /api/backtest, pública). */
import { z } from "zod";

import { pedir } from "./cliente";
import { esquemaPunto, type Intervalo } from "./mercado";

export const ESTRATEGIAS = ["combinada", "cruce", "rsi", "macd"] as const;
export type Estrategia = (typeof ESTRATEGIAS)[number];

const esquemaOperacion = z.object({
  tiempoEntrada: z.number(),
  precioEntrada: z.number(),
  tiempoSalida: z.number(),
  precioSalida: z.number(),
  cantidadBtc: z.number(),
  comisiones: z.number(),
  ganancia: z.number(),
  rentabilidad: z.number(),
  motivoSalida: z.string(),
});
export type OperacionBacktest = z.infer<typeof esquemaOperacion>;

const esquemaResultado = z.object({
  capitalInicial: z.number(),
  capitalFinal: z.number(),
  rentabilidadTotal: z.number(),
  rentabilidadComprarYMantener: z.number(),
  numeroOperaciones: z.number(),
  tasaGanadoras: z.number(),
  caidaMaxima: z.number(),
  comisionesPagadas: z.number(),
  velasAnalizadas: z.number(),
  tiempoInicio: z.number(),
  tiempoFin: z.number(),
  operaciones: z.array(esquemaOperacion),
  curvaCapital: z.array(esquemaPunto),
});
export type ResultadoBacktest = z.infer<typeof esquemaResultado>;

const esquemaBacktest = z.object({
  estrategia: z.string(),
  intervalo: z.string(),
  resultado: esquemaResultado,
  validacion: z.object({
    velasEntrenamiento: z.number(),
    velasPrueba: z.number(),
    entrenamiento: esquemaResultado.pick({ rentabilidadTotal: true, rentabilidadComprarYMantener: true }),
    prueba: esquemaResultado.pick({ rentabilidadTotal: true, rentabilidadComprarYMantener: true }),
  }),
  aviso: z.string(),
});
export type Backtest = z.infer<typeof esquemaBacktest>;

export function correrBacktest(
  estrategia: Estrategia,
  intervalo: Intervalo,
  cantidad: number,
  capital: number,
): Promise<Backtest> {
  const q = new URLSearchParams({
    estrategia,
    intervalo,
    cantidad: String(cantidad),
    capital: String(capital),
  });
  return pedir(`/api/backtest?${q}`, esquemaBacktest);
}
