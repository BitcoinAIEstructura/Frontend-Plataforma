import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { GraficaBarras, marcasEje } from "./GraficaBarras";

describe("marcasEje", () => {
  it("da marcas redondas que cubren el rango, con el cero incluido", () => {
    expect(marcasEje(-30, 80)).toEqual([-50, 0, 50, 100]);
    expect(marcasEje(0, 50)).toEqual([0, 20, 40, 60]);
    expect(marcasEje(0, 3, true)).toEqual([0, 1, 2, 3]);
  });
});

describe("GraficaBarras", () => {
  const barras = [
    {
      clave: 1,
      etiqueta: "3 nov",
      segmentos: [{ nombre: "Ganancia", valor: 40, color: "var(--grafica-sube)" }],
      detalle: "▲ +40",
    },
    {
      clave: 2,
      etiqueta: "4 nov",
      segmentos: [{ nombre: "Pérdida", valor: -15, color: "var(--grafica-baja)" }],
      detalle: "▼ −15",
    },
  ];

  it("dibuja una barra por dato y tiene vista de tabla", async () => {
    const { container } = render(
      <GraficaBarras
        titulo="Ganancia por venta"
        barras={barras}
        formato={String}
        columnas={["Venta", "Ganancia"]}
        filas={[
          ["3 nov", "+40"],
          ["4 nov", "−15"],
        ]}
      />,
    );
    expect(screen.getByRole("img", { name: "Ganancia por venta" })).toBeInTheDocument();
    expect(container.querySelectorAll("path")).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "Ver como tabla" }));
    expect(screen.getByRole("table", { name: "Ganancia por venta" })).toHaveTextContent("−15");
  });
});
