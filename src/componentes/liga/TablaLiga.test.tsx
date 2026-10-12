import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { TablaLiga } from "./TablaLiga";

afterEach(() => vi.unstubAllGlobals());

const fila = (posicion: number, rentabilidad: number, esTuyo = false) => ({
  posicion,
  alias: `Halcón Dorado ${posicion}`,
  rentabilidad,
  valorTotal: 10_000 * (1 + rentabilidad),
  esTuyo,
});

describe("TablaLiga", () => {
  it("muestra los mejores con alias y marca el tuyo", async () => {
    servidorFalso({
      "GET /api/liga": {
        estado: 200,
        cuerpo: {
          precio: 1,
          participantes: 2,
          mejores: [fila(1, 0.1), fila(2, -0.02, true)],
          tu: fila(2, -0.02, true),
        },
      },
    });
    renderizar(<TablaLiga />);
    const filas = within(await screen.findByRole("table")).getAllByRole("row");
    expect(filas).toHaveLength(3);
    expect(filas[1]).toHaveTextContent("Halcón Dorado 1");
    expect(filas[1]).toHaveTextContent("▲ +10,00 %");
    expect(filas[2]).toHaveTextContent("Tú");
    expect(filas[2]).toHaveTextContent("▼ −2,00 %");
  });

  it("si estás fuera del top 10, tu fila va al final", async () => {
    servidorFalso({
      "GET /api/liga": {
        estado: 200,
        cuerpo: { precio: 1, participantes: 30, mejores: [fila(1, 0.3)], tu: fila(27, -0.1, true) },
      },
    });
    renderizar(<TablaLiga />);
    const filas = within(await screen.findByRole("table")).getAllByRole("row");
    expect(filas.at(-1)).toHaveTextContent("27");
    expect(filas.at(-1)).toHaveTextContent("Tú");
  });

  it("vacía invita a ser el primero", async () => {
    servidorFalso({
      "GET /api/liga": { estado: 200, cuerpo: { precio: 1, participantes: 0, mejores: [], tu: null } },
    });
    renderizar(<TablaLiga />);
    expect(await screen.findByText(/Puedes ser el primero/)).toBeInTheDocument();
  });
});
