/** Las estructuras de datos del backend, a la vista (pantalla "Cómo funciona"). */
import { z } from "zod";

import { pedir } from "./cliente";

// ---------- foto de las estructuras reales (con sesión) ----------

const esquemaActuales = z.object({
  cola: z.object({
    tamanio: z.number(),
    ordenes: z.array(
      z.object({
        id: z.number(),
        tipo: z.enum(["COMPRA", "VENTA"]),
        monto: z.number().nullable(),
        todo: z.boolean(),
      }),
    ),
  }),
  pila: z.object({
    tamanio: z.number(),
    eventos: z.array(z.object({ tipo: z.string(), idOrden: z.number().nullable(), momento: z.number() })),
  }),
  pilaDeshacer: z.object({ tamanio: z.number(), ids: z.array(z.number()) }),
  lista: z.object({ tamanio: z.number() }),
  tablaHash: z.object({
    capacidad: z.number(),
    tamanio: z.number(),
    factorCarga: z.number(),
    longitudes: z.array(z.number()),
  }),
  colaCircular: z.object({
    capacidad: z.number(),
    frente: z.number(),
    tamanio: z.number(),
    casillas: z.array(z.number().nullable()),
  }),
  trie: z.object({ palabras: z.number(), nodos: z.number() }),
});
export type EstructurasActuales = z.infer<typeof esquemaActuales>;

export function obtenerEstructuras(senal?: AbortSignal): Promise<EstructurasActuales> {
  return pedir("/api/estructuras", esquemaActuales, { senal });
}

// ---------- demostración paso a paso (pública) ----------

export const ESTRUCTURAS_DEMO = [
  "cola",
  "pila",
  "monticulo",
  "avl",
  "tabla-hash",
  "cola-circular",
  "trie",
] as const;
export type EstructuraDemo = (typeof ESTRUCTURAS_DEMO)[number];

export interface NodoAvl {
  clave: number;
  altura: number;
  izquierdo: NodoAvl | null;
  derecho: NodoAvl | null;
}
const esquemaNodoAvl: z.ZodType<NodoAvl> = z.lazy(() =>
  z.object({
    clave: z.number(),
    altura: z.number(),
    izquierdo: esquemaNodoAvl.nullable(),
    derecho: esquemaNodoAvl.nullable(),
  }),
);

export interface NodoTrie {
  letra: string;
  fin: boolean;
  hijos: NodoTrie[];
}
const esquemaNodoTrie: z.ZodType<NodoTrie> = z.lazy(() =>
  z.object({ letra: z.string(), fin: z.boolean(), hijos: z.array(esquemaNodoTrie) }),
);

/** Cómo queda cada estructura después de un paso (la forma depende de la estructura). */
export const esquemasEstado = {
  cola: z.object({ elementos: z.array(z.number()) }),
  pila: z.object({ elementos: z.array(z.number()) }),
  monticulo: z.object({ arreglo: z.array(z.number()), capacidad: z.number() }),
  avl: z.object({ raiz: esquemaNodoAvl.nullable(), altura: z.number(), tamanio: z.number() }),
  "tabla-hash": z.object({
    capacidad: z.number(),
    factorCarga: z.number(),
    cubetas: z.array(z.array(z.number())),
  }),
  "cola-circular": z.object({
    capacidad: z.number(),
    frente: z.number(),
    tamanio: z.number(),
    casillas: z.array(z.number().nullable()),
  }),
  trie: z.object({ raiz: esquemaNodoTrie, palabras: z.number(), nodos: z.number() }),
} satisfies Record<EstructuraDemo, z.ZodType>;

export type EstadoDemo<E extends EstructuraDemo> = z.infer<(typeof esquemasEstado)[E]>;

export interface PasoDemo<E extends EstructuraDemo> {
  operacion: string;
  valor: number | string | null;
  resultado: unknown;
  descripcion: string;
  complejidad: string;
  estado: EstadoDemo<E>;
}

export interface OperacionDemo {
  operacion: string;
  valor?: number | string;
}

export async function correrDemo<E extends EstructuraDemo>(
  estructura: E,
  operaciones: readonly OperacionDemo[],
  senal?: AbortSignal,
): Promise<PasoDemo<E>[]> {
  const esquema = z.object({
    estructura: z.literal(estructura),
    pasos: z.array(
      z.object({
        operacion: z.string(),
        valor: z.union([z.number(), z.string()]).nullable(),
        resultado: z.unknown(),
        descripcion: z.string(),
        complejidad: z.string(),
        estado: esquemasEstado[estructura],
      }),
    ),
  });
  const respuesta = await pedir("/api/estructuras/demo", esquema, {
    metodo: "POST",
    cuerpo: { estructura, operaciones },
    senal,
  });
  return respuesta.pasos as PasoDemo<E>[];
}
