import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { PantallaOrdenes } from "./PantallaOrdenes";

afterEach(() => vi.unstubAllGlobals());

const base = {
  tipo: "COMPRA",
  monto: 500,
  todo: false,
  creadaEn: 1,
  ejecutadaEn: null,
  precioEjecucion: null,
  cantidadBtc: null,
  comision: null,
  motivo: "manual",
  detalle: null,
};

describe("PantallaOrdenes", () => {
  it("separa la cola del registro", async () => {
    servidorFalso({
      "GET /api/ordenes": {
        estado: 200,
        cuerpo: {
          cantidad: 2,
          ordenes: [
            { ...base, id: 2, estado: "PENDIENTE" },
            { ...base, id: 1, estado: "CANCELADA", detalle: "Deshecha: era la última orden creada." },
          ],
        },
      },
    });
    renderizar(<PantallaOrdenes />);
    const cola = await screen.findByRole("region", { name: "Cola de pendientes" });
    expect(within(cola).getByText("1 en espera")).toBeInTheDocument();
    const registro = screen.getByRole("region", { name: "Registro de órdenes" });
    expect(within(registro).getByText("Deshecha: era la última orden creada.")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Nueva orden" })).toBeInTheDocument();
  });
});
