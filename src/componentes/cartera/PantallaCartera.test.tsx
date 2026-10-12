import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { PantallaCartera } from "./PantallaCartera";

afterEach(() => vi.unstubAllGlobals());

describe("PantallaCartera", () => {
  it("junta cifras, posición e historial", async () => {
    servidorFalso({
      "GET /api/cartera": {
        estado: 200,
        cuerpo: {
          precioActual: 80_000,
          saldoUsdt: 10_000,
          btc: 0,
          costoPromedio: 0,
          valorBtc: 0,
          valorTotal: 10_000,
          gananciaNoRealizada: 0,
          gananciaRealizada: 0,
          gananciaTotal: 0,
          rentabilidad: 0,
          comisionesPagadas: 0,
          saldoInicial: 10_000,
        },
      },
      "GET /api/historial": { estado: 200, cuerpo: { eventos: [] } },
    });
    renderizar(<PantallaCartera />);
    expect(await screen.findByRole("region", { name: "Tu posición" })).toBeInTheDocument();
    expect(screen.getByText("Valor de tu cartera")).toBeInTheDocument();
    expect(await screen.findByText(/Todavía no hay movimientos/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nueva orden" })).toHaveAttribute("href", "/ordenes");
  });
});
