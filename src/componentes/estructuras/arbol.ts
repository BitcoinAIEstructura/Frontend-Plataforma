/**
 * Posiciones para dibujar árboles sin que se encimen los nodos.
 *
 * - Binarios (AVL, montículo): x es el puesto del nodo en inorden. En un árbol de
 *   búsqueda eso deja cada clave a la derecha de las menores, como en una recta.
 * - N-arios (trie): las hojas van una al lado de otra y cada padre queda centrado
 *   sobre sus hijos.
 * En ambos, y es la profundidad.
 */

export interface NodoDibujo {
  id: string;
  etiqueta: string;
  x: number;
  y: number;
  /** Texto pequeño junto al nodo (la altura en el AVL, el índice en el montículo). */
  nota?: string;
  /** El trie marca así los nodos donde termina una palabra. */
  marcado?: boolean;
}

export interface Arista {
  desde: string;
  hasta: string;
}

export interface Dibujo {
  nodos: NodoDibujo[];
  aristas: Arista[];
  /** Columnas (x máximo + 1) y filas (profundidad máxima + 1). */
  ancho: number;
  alto: number;
}

const VACIO: Dibujo = { nodos: [], aristas: [], ancho: 0, alto: 0 };

interface Binario<T> {
  id: (n: T) => string;
  etiqueta: (n: T) => string;
  izquierdo: (n: T) => T | null;
  derecho: (n: T) => T | null;
  nota?: (n: T) => string;
}

export function dibujarBinario<T>(raiz: T | null, f: Binario<T>): Dibujo {
  if (raiz === null) return VACIO;
  const nodos: NodoDibujo[] = [];
  const aristas: Arista[] = [];
  let columna = 0;
  let alto = 0;
  const visitar = (n: T, nivel: number, padre: string | null) => {
    alto = Math.max(alto, nivel + 1);
    const id = f.id(n);
    if (padre !== null) aristas.push({ desde: padre, hasta: id });
    const izq = f.izquierdo(n);
    if (izq !== null) visitar(izq, nivel + 1, id);
    nodos.push({ id, etiqueta: f.etiqueta(n), x: columna++, y: nivel, nota: f.nota?.(n) });
    const der = f.derecho(n);
    if (der !== null) visitar(der, nivel + 1, id);
  };
  visitar(raiz, 0, null);
  return { nodos, aristas, ancho: columna, alto };
}

interface Nario<T> {
  id: (n: T, ruta: string) => string;
  etiqueta: (n: T) => string;
  hijos: (n: T) => readonly T[];
  marcado?: (n: T) => boolean;
}

export function dibujarNario<T>(raiz: T, f: Nario<T>): Dibujo {
  const nodos: NodoDibujo[] = [];
  const aristas: Arista[] = [];
  let hojas = 0;
  let alto = 0;
  // Devuelve la x del nodo: la siguiente columna libre si es hoja; el centro de sus hijos si no.
  const visitar = (n: T, nivel: number, ruta: string, padre: string | null): number => {
    alto = Math.max(alto, nivel + 1);
    const id = f.id(n, ruta);
    if (padre !== null) aristas.push({ desde: padre, hasta: id });
    const hijos = f.hijos(n);
    let x: number;
    if (hijos.length === 0) {
      x = hojas++;
    } else {
      const xs = hijos.map((h, i) => visitar(h, nivel + 1, `${ruta}/${i}`, id));
      x = (xs[0]! + xs[xs.length - 1]!) / 2;
    }
    nodos.push({ id, etiqueta: f.etiqueta(n), x, y: nivel, marcado: f.marcado?.(n) });
    return x;
  };
  visitar(raiz, 0, "", null);
  return { nodos, aristas, ancho: Math.max(hojas, 1), alto };
}

/** Un montículo es un árbol completo guardado en un arreglo: los hijos de i están en 2i+1 y 2i+2. */
export function dibujarMonticulo(arreglo: readonly number[]): Dibujo {
  if (arreglo.length === 0) return VACIO;
  const hijo = (i: number) => (i < arreglo.length ? i : null);
  return dibujarBinario<number>(0, {
    id: (i) => `m${i}`,
    etiqueta: (i) => String(arreglo[i]),
    izquierdo: (i) => hijo(2 * i + 1),
    derecho: (i) => hijo(2 * i + 2),
    nota: (i) => `[${i}]`,
  });
}
