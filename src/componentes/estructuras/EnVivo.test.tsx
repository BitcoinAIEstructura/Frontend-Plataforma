import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EnVivoCircular, EnVivoCola, EnVivoPila, EnVivoTabla, EnVivoTrie } from "./EnVivo";

describe("estructuras en vivo", () => {
  it("la cola muestra tus pendientes en orden, la primera resaltada", () => {
    render(
      <EnVivoCola
        cola={{
          tamanio: 2,
          ordenes: [
            { id: 4, tipo: "COMPRA", monto: 10, todo: false },
            { id: 5, tipo: "VENTA", monto: null, todo: true },
          ],
        }}
      />,
    );
    const [primera, segunda] = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(primera).toHaveTextContent("#4 ▲");
    expect(primera).toHaveClass("text-oro");
    expect(segunda).toHaveTextContent("#5 ▼");
  });

  it("la cola vacía invita a crear una orden", () => {
    render(<EnVivoCola cola={{ tamanio: 0, ordenes: [] }} />);
    expect(screen.getByRole("link", { name: "Crea una orden" })).toHaveAttribute("href", "/ordenes");
  });

  it("la pila muestra el tope y lo que desharía Ctrl + Z", () => {
    render(
      <EnVivoPila
        pila={{ tamanio: 2, eventos: [{ tipo: "ORDEN_EJECUTADA", idOrden: 1, momento: 2 }] }}
        deshacer={{ tamanio: 3, ids: [3, 2, 1] }}
      />,
    );
    expect(screen.getByText("Orden ejecutada")).toBeInTheDocument();
    expect(screen.getByText(/Ctrl \+ Z intentaría primero/)).toHaveTextContent("#3, luego #2, #1.");
  });

  it("la tabla del servidor solo muestra cantidades", () => {
    render(<EnVivoTabla tabla={{ capacidad: 4, tamanio: 3, factorCarga: 0.75, longitudes: [1, 0, 2, 0] }} />);
    expect(screen.getByRole("img", { name: /factor de carga 0.75/ })).toBeInTheDocument();
    expect(screen.getByText(/3 simulaciones en 4 cubetas/)).toBeInTheDocument();
  });

  it("el anillo de precios dibuja la línea con su resumen", () => {
    render(
      <EnVivoCircular
        anillo={{ capacidad: 120, frente: 0, tamanio: 2, casillas: [] }}
        recientes={{
          capacidad: 120,
          cantidad: 2,
          precios: [
            { momento: 1, precio: 80_000 },
            { momento: 2, precio: 81_000 },
          ],
        }}
      />,
    );
    expect(screen.getByRole("img", { name: /el último 81\.000,00/ })).toBeInTheDocument();
  });

  it("el trie invita a probar Ctrl + K", () => {
    render(<EnVivoTrie trie={{ palabras: 222, nodos: 886 }} />);
    expect(screen.getByText("886")).toBeInTheDocument();
  });
});
