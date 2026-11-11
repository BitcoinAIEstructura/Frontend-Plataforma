/** Predicciones de la IA (públicas): docs/IA.md y docs/API.md del backend. */
import { z } from "zod";

import { pedir } from "./cliente";

/** Los códigos que acepta el backend; los nombres para mostrar ("1 día") vienen en la respuesta. */
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
  /** Qué hace el modelo y cómo leer sus factores (lo escribe el backend). */
  descripcion: z.object({ idea: z.string(), tituloFactores: z.string(), factoresConSigno: z.boolean() }),
  /** Si le ganó a la base, dicho con honestidad (lo escribe el backend). */
  veredicto: z.object({ gana: z.boolean(), titulo: z.string(), texto: z.string() }),
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

const esquemaFuente = z.object({ id: z.string(), nombre: z.string() });

const esquemaPrediccion = z.object({
  simbolo: z.string(),
  intervalo: z.enum(INTERVALOS_IA),
  nombreIntervalo: z.string(),
  intervalos: z.array(z.object({ codigo: z.enum(INTERVALOS_IA), nombre: z.string() })),
  encabezado: z.object({ etiqueta: z.string(), texto: z.string() }),
  tiempoVela: z.number(),
  entrenadoEn: z.number(),
  muestrasEntrenamiento: z.number(),
  muestrasPrueba: z.number(),
  comite: esquemaModelo,
  modelos: z.array(esquemaModelo),
  caracteristicas: z.array(z.object({ nombre: z.string(), valor: z.number() })),
  arbol: esquemaNodo.nullable(),
  prueba: z.array(
    z.object({
      tiempo: z.number(),
      probabilidad: z.number(),
      subio: z.boolean(),
      /** Cuánto cambió el precio en la vela siguiente (0,01 = +1 %). */
      rendimiento: z.number().default(0),
    }),
  ),
  fuentesExternas: z.object({
    usadas: z.array(esquemaFuente),
    omitidas: z.array(esquemaFuente.extend({ motivo: z.string() })),
    comparacion: z
      .object({ sinExternos: esquemaMetricas, conExternos: esquemaMetricas, conclusion: z.string() })
      .nullable(),
  }),
  aviso: z.string(),
});
export type PrediccionIA = z.infer<typeof esquemaPrediccion>;

const esquemaFuentes = z.object({
  lecturas: z.array(
    z.object({
      id: z.string(),
      nombre: z.string(),
      fuente: z.string(),
      valor: z.number(),
      valorTexto: z.string(),
      explicacion: z.string(),
    }),
  ),
  errores: z.array(z.object({ id: z.string(), motivo: z.string() })),
  actualizadoEn: z.number().nullable(),
});
export type FuentesIA = z.infer<typeof esquemaFuentes>;

/** Lo que dicen ahora las fuentes externas (miedo y codicia, futuros, Deribit), explicado. */
export function obtenerFuentes(intervalo: IntervaloIA, senal?: AbortSignal): Promise<FuentesIA> {
  return pedir(`/api/ia/fuentes?intervalo=${intervalo}`, esquemaFuentes, { senal });
}

export function obtenerPredicciones(intervalo: IntervaloIA, senal?: AbortSignal): Promise<PrediccionIA> {
  return pedir(`/api/ia/predicciones?intervalo=${intervalo}`, esquemaPrediccion, { senal });
}
