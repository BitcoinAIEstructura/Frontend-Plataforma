import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MonedaEstatica } from "./MonedaEstatica";

describe("MonedaEstatica", () => {
  it("es una imagen con descripción y el símbolo de Bitcoin", () => {
    render(<MonedaEstatica />);
    const moneda = screen.getByRole("img", { name: "Moneda de Bitcoin dorada" });
    expect(moneda).toHaveTextContent("₿");
  });

  it("solo usa colores de la paleta", () => {
    const { container } = render(<MonedaEstatica />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{6}/i);
  });
});
