/** Alertas de precio del usuario (con sesión): docs/API.md del backend. */
import { z } from "zod";

import { pedir } from "./cliente";

export const esquemaAlerta = z.object({
  id: z.number(),
  tipo: z.enum(["SUBE_A", "BAJA_A"]),
  precio: z.number(),
  estado: z.enum(["ACTIVA", "DISPARADA", "CANCELADA"]),
  creadaEn: z.number(),
  disparadaEn: z.number().nullable(),
  precioDisparo: z.number().nullable(),
});
export type Alerta = z.infer<typeof esquemaAlerta>;

const esquemaLista = z.object({ activas: z.number(), alertas: z.array(esquemaAlerta) });
export type ListaAlertas = z.infer<typeof esquemaLista>;

export function obtenerAlertas(senal?: AbortSignal): Promise<ListaAlertas> {
  return pedir("/api/alertas", esquemaLista, { senal });
}

export function crearAlerta(tipo: Alerta["tipo"], precio: number): Promise<Alerta> {
  return pedir("/api/alertas", esquemaAlerta, { metodo: "POST", cuerpo: { tipo, precio } });
}

export function cancelarAlerta(id: number): Promise<void> {
  return pedir(`/api/alertas/${encodeURIComponent(String(id))}`, null, { metodo: "DELETE" });
}
