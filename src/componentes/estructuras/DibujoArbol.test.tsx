import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dibujarMonticulo } from "./arbol";
import { DibujoArbol } from "./DibujoArbol";

describe("DibujoArbol", () => {
  it("dibuja un círculo por nodo y una línea por arista", () => {
    const { container } = render(
      <DibujoArbol dibujo={dibujarMonticulo([1, 5, 3])} titulo="Montículo con 3 elementos" />,
    );
    expect(screen.getByRole("img", { name: "Montículo con 3 elementos" })).toBeInTheDocument();
    expect(container.querySelectorAll("circle")).toHaveLength(3);
    expect(container.querySelectorAll("line")).toHaveLength(2);
    expect(screen.getByText("[2]")).toBeInTheDocument();
  });

  it("resalta los nodos pedidos", () => {
    const { container } = render(
      <DibujoArbol dibujo={dibujarMonticulo([1, 5])} titulo="x" resaltados={new Set(["m1"])} />,
    );
    const circulo = (id: string) => container.querySelector(`[data-id="${id}"] circle`);
    expect(circulo("m1")).toHaveAttribute("fill", "var(--oro)");
    expect(circulo("m0")).toHaveAttribute("fill", "var(--superficie-alta)");
  });

  it("vacío muestra el aviso", () => {
    render(<DibujoArbol dibujo={dibujarMonticulo([])} titulo="x" vacio="Sin elementos" />);
    expect(screen.getByText("Sin elementos")).toBeInTheDocument();
  });
});
