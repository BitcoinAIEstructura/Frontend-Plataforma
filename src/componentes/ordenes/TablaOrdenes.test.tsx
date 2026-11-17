import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Orden } from "@/lib/api/simulacion";

import { TablaOrdenes } from "./TablaOrdenes";

function orden(id: number, estado: Orden["estado"], parcial: Partial<Orden> = {}): Orden {
  return {
    id,
    tipo: "COMPRA",
    monto: 500,
    todo: false,
    estado,
    creadaEn: Date.UTC(2026, 9, 12, 19, 41),
    ejecutadaEn: estado === "EJECUTADA" ? Date.UTC(2026, 9, 12, 19, 41) : null,
    precioEjecucion: estado === "EJECUTADA" ? 80_000 : null,
    cantidadBtc: estado === "EJECUTADA" ? 0.005 : null,
    comision: estado === "EJECUTADA" ? 0.4 : null,
    motivo: "manual",
    detalle: null,
    ...parcial,
  };
}

describe("TablaOrdenes", () => {
  it("es una tabla con título y una fila por orden", () => {
    render(<TablaOrdenes ordenes={[orden(1, "EJECUTADA"), orden(2, "CANCELADA")]} titulo="Mis órdenes" />);
    const tabla = screen.getByRole("table", { name: "Mis órdenes" });
    // Encabezado + 2 filas.
    expect(within(tabla).getAllByRole("row")).toHaveLength(3);
    expect(within(tabla).getByRole("columnheader", { name: "Precio" })).toBeInTheDocument();
  });

  it("una ejecutada muestra cantidad, precio y total = cantidad × precio, con la fecha corta", () => {
    render(<TablaOrdenes ordenes={[orden(1, "EJECUTADA")]} titulo="t" />);
    const fila = screen.getAllByRole("row")[1]!;
    expect(fila).toHaveTextContent("12/10 14:41");
    expect(fila).toHaveTextContent("▲ Compra");
    expect(fila).toHaveTextContent("0,0050");
    expect(fila).toHaveTextContent("80.000,00");
    expect(fila).toHaveTextContent("400,00");
    expect(fila).toHaveTextContent("Ejecutada");
  });

  it("una no ejecutada muestra el monto pedido y guiones donde no hay datos", () => {
    render(<TablaOrdenes ordenes={[orden(2, "CANCELADA", { monto: 250 })]} titulo="t" />);
    const celdas = within(screen.getAllByRole("row")[1]!).getAllByRole("cell");
    expect(celdas[2]).toHaveTextContent("—");
    expect(celdas[3]).toHaveTextContent("—");
    expect(celdas[4]).toHaveTextContent("250,00");
  });

  it("dice de dónde vino: tú, el bot o el piloto IA", () => {
    render(
      <TablaOrdenes
        ordenes={[
          orden(1, "EJECUTADA"),
          orden(2, "EJECUTADA", { motivo: "señal del bot: cruce" }),
          orden(3, "EJECUTADA", { motivo: "piloto IA: el comité da 60 %" }),
        ]}
        titulo="t"
      />,
    );
    const filas = screen.getAllByRole("row").slice(1);
    expect(filas[0]).toHaveTextContent("Tú");
    expect(filas[1]).toHaveTextContent("El bot");
    expect(filas[2]).toHaveTextContent("Piloto IA");
  });
});
