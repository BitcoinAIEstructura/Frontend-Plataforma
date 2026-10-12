import { describe, expect, it } from "vitest";

import type { NodoAvl, NodoTrie } from "@/lib/api/estructuras";

import { dibujarBinario, dibujarMonticulo, dibujarNario } from "./arbol";

const hoja = (clave: number): NodoAvl => ({ clave, altura: 1, izquierdo: null, derecho: null });

function avl(raiz: NodoAvl | null) {
  return dibujarBinario(raiz, {
    id: (n) => String(n.clave),
    etiqueta: (n) => String(n.clave),
    izquierdo: (n) => n.izquierdo,
    derecho: (n) => n.derecho,
    nota: (n) => `h${n.altura}`,
  });
}

describe("dibujar árboles", () => {
  it("en un árbol de búsqueda la x sigue el orden de las claves", () => {
    const d = avl({
      clave: 20,
      altura: 3,
      izquierdo: hoja(10),
      derecho: { ...hoja(30), izquierdo: hoja(25) },
    });
    const x = Object.fromEntries(d.nodos.map((n) => [n.etiqueta, n.x]));
    expect(x).toEqual({ "10": 0, "20": 1, "25": 2, "30": 3 });
    expect(d.nodos.find((n) => n.etiqueta === "25")?.y).toBe(2);
    expect(d.aristas).toContainEqual({ desde: "30", hasta: "25" });
    expect([d.ancho, d.alto]).toEqual([4, 3]);
  });

  it("árbol vacío", () => {
    expect(avl(null)).toEqual({ nodos: [], aristas: [], ancho: 0, alto: 0 });
    expect(dibujarMonticulo([]).nodos).toEqual([]);
  });

  it("el montículo se dibuja desde el arreglo, con el índice de cada casilla", () => {
    const d = dibujarMonticulo([1, 5, 3, 9]);
    expect(d.aristas).toEqual([
      { desde: "m0", hasta: "m1" },
      { desde: "m1", hasta: "m3" },
      { desde: "m0", hasta: "m2" },
    ]);
    expect(d.nodos.find((n) => n.id === "m3")).toMatchObject({ etiqueta: "9", y: 2, nota: "[3]" });
  });

  it("en un trie cada padre queda centrado sobre sus hijos y se marcan los finales", () => {
    const t: NodoTrie = {
      letra: "",
      fin: false,
      hijos: [
        {
          letra: "s",
          fin: false,
          hijos: [
            { letra: "a", fin: false, hijos: [{ letra: "l", fin: true, hijos: [] }] },
            { letra: "o", fin: false, hijos: [{ letra: "l", fin: true, hijos: [] }] },
          ],
        },
      ],
    };
    const d = dibujarNario(t, {
      id: (_, ruta) => `t${ruta}`,
      etiqueta: (n) => n.letra,
      hijos: (n) => n.hijos,
      marcado: (n) => n.fin,
    });
    const s = d.nodos.find((n) => n.id === "t/0")!;
    expect(s.x).toBe(0.5);
    expect(d.nodos.filter((n) => n.marcado)).toHaveLength(2);
    expect(new Set(d.nodos.map((n) => n.id)).size).toBe(d.nodos.length);
    expect([d.ancho, d.alto]).toEqual([2, 4]);
  });
});
