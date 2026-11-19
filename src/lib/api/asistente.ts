/** El chat con el bot (con sesión): POST /api/asistente, ver docs/API.md del backend. */
import { z } from "zod";

import { pedir } from "./cliente";

export const LARGO_MAXIMO_MENSAJE = 300;

export const esquemaRespuestaAsistente = z.object({
  intencion: z.string(),
  respuesta: z.string(),
  /**
   * Algo que la persona puede hacer con un toque. El asistente nunca lo hace solo: la IA lo
   * propone, el backend lo revisa y la persona lo confirma con el botón.
   */
  accion: z
    .object({
      tipo: z.enum(["INICIAR_BOT", "DETENER_BOT", "IR", "ORDEN", "ALERTA"]),
      etiqueta: z.string(),
      ruta: z.string().nullable(),
      /** Solo en ORDEN: `monto` en USDT, o `todo` para vender todo el BTC. */
      orden: z
        .object({ tipo: z.enum(["COMPRA", "VENTA"]), monto: z.number().positive().nullable(), todo: z.boolean() })
        .nullish(),
      /** Solo en ALERTA. */
      alerta: z.object({ tipo: z.enum(["SUBE_A", "BAJA_A"]), precio: z.number().positive() }).nullish(),
      /** Solo en INICIAR_BOT: con qué modo encenderlo (null: el que ya tiene). */
      modo: z.enum(["ia", "reglas"]).nullish(),
    })
    .nullable(),
  sugerencias: z.array(z.string()),
  /** "ia": el texto lo escribió Claude; "reglas": el asistente de palabras clave (sin clave de API o si Claude falló). */
  fuente: z.enum(["ia", "reglas"]).default("reglas"),
});
export type RespuestaAsistente = z.infer<typeof esquemaRespuestaAsistente>;
export type AccionAsistente = NonNullable<RespuestaAsistente["accion"]>;

/** Cuántos mensajes anteriores se mandan para que la IA siga la conversación (el backend usa los últimos 10). */
export const TURNOS_DE_HISTORIAL = 10;
const LARGO_MAXIMO_TURNO = 1500;

export interface TurnoChat {
  rol: "usuario" | "bot";
  texto: string;
}

export function preguntarAlBot({
  mensaje,
  historial = [],
}: {
  mensaje: string;
  historial?: readonly TurnoChat[];
}): Promise<RespuestaAsistente> {
  return pedir("/api/asistente", esquemaRespuestaAsistente, {
    metodo: "POST",
    cuerpo: {
      mensaje: mensaje.slice(0, LARGO_MAXIMO_MENSAJE),
      historial: historial
        .slice(-TURNOS_DE_HISTORIAL)
        .map((t) => ({ rol: t.rol, texto: t.texto.slice(0, LARGO_MAXIMO_TURNO) })),
    },
  });
}
