/** Búsqueda de Ctrl + K (pública): el backend la responde con un trie de prefijos. */
import { z } from "zod";

import { pedir } from "./cliente";

export const esquemaResultado = z.object({
  id: z.string(),
  titulo: z.string(),
  descripcion: z.string(),
  ruta: z.string(),
  tipo: z.enum(["pagina", "accion", "indicador", "concepto"]),
});
export type ResultadoBusqueda = z.infer<typeof esquemaResultado>;

const esquemaBusqueda = z.object({
  consulta: z.string(),
  resultados: z.array(esquemaResultado),
  palabrasIndexadas: z.number(),
  nodosTrie: z.number(),
});
export type RespuestaBusqueda = z.infer<typeof esquemaBusqueda>;

export function buscar(consulta: string, limite = 8, senal?: AbortSignal): Promise<RespuestaBusqueda> {
  const q = new URLSearchParams({ q: consulta.slice(0, 60), limite: String(limite) });
  return pedir(`/api/buscar?${q}`, esquemaBusqueda, { senal });
}
