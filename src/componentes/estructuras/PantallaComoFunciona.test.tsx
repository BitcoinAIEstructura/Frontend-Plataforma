import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { PantallaComoFunciona } from "./PantallaComoFunciona";

afterEach(() => vi.unstubAllGlobals());

describe("PantallaComoFunciona", () => {
  it("una sección por estructura, con su uso real y lo que guarda ahora", async () => {
    servidorFalso({
      "GET /api/estructuras": {
        estado: 200,
        cuerpo: {
          cola: { tamanio: 1, ordenes: [{ id: 9, tipo: "COMPRA", monto: 5, todo: false }] },
          pila: { tamanio: 0, eventos: [] },
          pilaDeshacer: { tamanio: 0, ids: [] },
          lista: { tamanio: 0 },
          tablaHash: { capacidad: 8, tamanio: 1, factorCarga: 0.125, longitudes: [0, 1, 0, 0, 0, 0, 0, 0] },
          colaCircular: { capacidad: 120, frente: 0, tamanio: 0, casillas: [] },
          trie: { palabras: 222, nodos: 886 },
        },
      },
      "GET /api/precio/recientes": { estado: 200, cuerpo: { capacidad: 120, cantidad: 0, precios: [] } },
      "GET /api/liga": { estado: 200, cuerpo: { precio: 1, participantes: 0, mejores: [], tu: null } },
    });
    renderizar(<PantallaComoFunciona />);
    for (const nombre of [
      "Cola (FIFO)",
      "Pila (LIFO)",
      "Montículo",
      "Árbol AVL",
      "Tabla hash",
      "Cola circular",
      "Trie",
    ]) {
      expect(screen.getByRole("region", { name: nombre })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Árbol AVL" })).toHaveAttribute("href", "#avl");
    expect(await screen.findByText("#9 ▲")).toBeInTheDocument();
    expect(await screen.findByText(/Todavía nadie ha operado/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Ejemplo" })).toHaveLength(7);
  });
});
