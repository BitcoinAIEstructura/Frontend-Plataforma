/** El chat con el bot (con sesión): POST /api/asistente, ver docs/API.md del backend. */
import { z } from "zod";

import { pedir } from "./cliente";

export const LARGO_MAXIMO_MENSAJE = 300;

export const esquemaRespuestaAsistente = z.object({
  intencion: z.string(),
  respuesta: z.string(),
  /** Algo que la persona puede hacer con un toque. El asistente nunca lo hace solo. */
  accion: z
    .object({
      tipo: z.enum(["INICIAR_BOT", "DETENER_BOT", "IR"]),
      etiqueta: z.string(),
      ruta: z.string().nullable(),
    })
    .nullable(),
  sugerencias: z.array(z.string()),
});
export type RespuestaAsistente = z.infer<typeof esquemaRespuestaAsistente>;
export type AccionAsistente = NonNullable<RespuestaAsistente["accion"]>;

export function preguntarAlBot(mensaje: string): Promise<RespuestaAsistente> {
  return pedir("/api/asistente", esquemaRespuestaAsistente, {
    metodo: "POST",
    cuerpo: { mensaje: mensaje.slice(0, LARGO_MAXIMO_MENSAJE) },
  });
}
