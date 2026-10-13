/** Predicciones de la IA (públicas): docs/IA.md y docs/API.md del backend. */
import { z } from "zod";

import { pedir } from "./cliente";

export const INTERVALOS_IA = ["15m", "1h", "4h", "1d"] as const;
export type IntervaloIA = (typeof INTERVALOS_IA)[number];

const esquemaMetricas = z.object({
  muestras: z.number(),
  exactitud: z.number(),
  base: z.number(),
  ventaja: z.number(),
  precisionSube: z.number().nullable(),
  vecesDijoSube: z.number(),
});
export type MetricasIA = z.infer<typeof esquemaMetricas>;

const esquemaModelo = z.object({
  nombre: z.string(),
  probabilidad: z.number(),
  direccion: z.enum(["SUBE", "BAJA"]),
  confianza: z.number(),
  peso: z.number().nullable(),
  explicacion: z.object({
    resumen: z.string(),
    factores: z.array(z.object({ nombre: z.string(), peso: z.number() })),
    pasos: z.array(z.string()),
  }),
  metricas: esquemaMetricas,
});
export type ModeloIA = z.infer<typeof esquemaModelo>;

export type NodoArbolIA =
  | { hoja: true; muestras: number; probabilidad: number; enCamino: boolean }
  | {
      hoja: false;
      caracteristica: string;
      umbral: number;
      muestras: number;
      probabilidad: number;
      enCamino: boolean;
      si: NodoArbolIA | null;
      no: NodoArbolIA | null;
    };

const esquemaNodo: z.ZodType<NodoArbolIA> = z.lazy(() =>
  z.union([
    z.object({
      hoja: z.literal(true),
      muestras: z.number(),
      probabilidad: z.number(),
      enCamino: z.boolean(),
    }),
    z.object({
      hoja: z.literal(false),
      caracteristica: z.string(),
      umbral: z.number(),
      muestras: z.number(),
      probabilidad: z.number(),
      enCamino: z.boolean(),
      si: esquemaNodo.nullable(),
      no: esquemaNodo.nullable(),
    }),
  ]),
);

const esquemaPrediccion = z.object({
  simbolo: z.string(),
  intervalo: z.enum(INTERVALOS_IA),
  tiempoVela: z.number(),
  entrenadoEn: z.number(),
  muestrasEntrenamiento: z.number(),
  muestrasPrueba: z.number(),
  comite: esquemaModelo,
  modelos: z.array(esquemaModelo),
  caracteristicas: z.array(z.object({ nombre: z.string(), valor: z.number() })),
  arbol: esquemaNodo.nullable(),
  prueba: z.array(z.object({ tiempo: z.number(), probabilidad: z.number(), subio: z.boolean() })),
  aviso: z.string(),
});
export type PrediccionIA = z.infer<typeof esquemaPrediccion>;

export function obtenerPredicciones(intervalo: IntervaloIA, senal?: AbortSignal): Promise<PrediccionIA> {
  return pedir(`/api/ia/predicciones?intervalo=${intervalo}`, esquemaPrediccion, { senal });
}
