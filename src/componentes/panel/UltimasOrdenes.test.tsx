import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Orden } from "@/lib/api/simulacion";
import { CLAVES } from "@/lib/tiempoReal";
import { clienteDePrueba, renderizar } from "@/test/utilidades";

import { CUANTAS, UltimasOrdenes } from "./UltimasOrdenes";

function orden(id: number, estado: Orden["estado"], momento: number): Orden {
  const ejecutada = estado === "EJECUTADA";
  return {
    id,
    tipo: "COMPRA",
    monto: 100,
    todo: false,
    estado,
    creadaEn: momento,
    ejecutadaEn: ejecutada ? momento : null,
    precioEjecucion: ejecutada ? 80_000 : null,
    cantidadBtc: ejecutada ? 0.00125 : null,
    comision: ejecutada ? 0.1 : null,
    motivo: "manual",
    detalle: null,
  };
}

function conOrdenes(ordenes: Orden[]) {
  const cliente = clienteDePrueba();
  // staleTime: los datos sembrados no se vuelven a pedir.
  cliente.setQueryDefaults(CLAVES.ordenes, { staleTime: Infinity });
  cliente.setQueryData(CLAVES.ordenes, ordenes);
  return cliente;
}

describe("UltimasOrdenes", () => {
  it("muestra solo las terminadas, de la más reciente a la más vieja", () => {
    const cliente = conOrdenes([
      orden(1, "EJECUTADA", 1_000),
      orden(2, "PENDIENTE", 5_000),
      orden(3, "CANCELADA", 3_000),
      orden(4, "PROCESANDO", 6_000),
      orden(5, "EJECUTADA", 4_000),
    ]);
    renderizar(<UltimasOrdenes />, { cliente });
    const filas = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(filas).toHaveLength(3);
    expect(filas[0]).toHaveTextContent("Ejecutada");
    expect(filas[1]).toHaveTextContent("Cancelada");
    expect(screen.queryByText("En la cola")).toBeNull();
    expect(screen.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/ordenes");
  });

  it(`no muestra más de ${CUANTAS}`, () => {
    const muchas = Array.from({ length: 12 }, (_, i) => orden(i + 1, "EJECUTADA", i * 1_000));
    renderizar(<UltimasOrdenes />, { cliente: conOrdenes(muchas) });
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(CUANTAS + 1);
  });

  it("sin órdenes invita a hacer la primera", () => {
    renderizar(<UltimasOrdenes />, { cliente: conOrdenes([]) });
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByRole("link", { name: "Haz la primera" })).toHaveAttribute("href", "/ordenes");
  });
});
