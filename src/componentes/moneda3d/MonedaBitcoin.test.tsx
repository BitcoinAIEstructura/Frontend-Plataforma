import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MonedaBitcoin } from "./MonedaBitcoin";

describe("MonedaBitcoin", () => {
  it("sin WebGL (como en jsdom) muestra la moneda fija", () => {
    render(<MonedaBitcoin />);
    expect(screen.getByRole("img", { name: "Moneda de Bitcoin dorada girando" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Moneda de Bitcoin dorada" })).toBeInTheDocument();
  });

  it("con la calidad estática forzada, nunca carga el 3D", () => {
    const { container } = render(<MonedaBitcoin calidadForzada="estatica" />);
    expect(container.querySelector("canvas")).toBeNull();
  });
});
