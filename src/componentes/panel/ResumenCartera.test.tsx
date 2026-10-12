import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Cartera } from "@/lib/api/simulacion";
import { renderizar, servidorFalso } from "@/test/utilidades";

import { CifrasCartera, ResumenCartera } from "./ResumenCartera";

afterEach(() => vi.unstubAllGlobals());

const NUEVA: Cartera = {
  precioActual: 82722.52,
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
};

describe("CifrasCartera", () => {
  it("una cartera nueva dice que aún no hay BTC", () => {
    renderizar(<CifrasCartera cartera={NUEVA} />);
    expect(screen.getByText("Aún no tienes BTC")).toBeInTheDocument();
    expect(screen.getByText("Empezaste con 10.000,00")).toBeInTheDocument();
  });

  it("la pérdida va con signo e ícono, no solo en rosa", () => {
    renderizar(
      <CifrasCartera
        cartera={{
          ...NUEVA,
          saldoUsdt: 9_000,
          btc: 0.012,
          valorBtc: 960,
          valorTotal: 9_960,
          gananciaTotal: -40,
          rentabilidad: -0.004,
          comisionesPagadas: 10,
        }}
      />,
    );
    expect(screen.getByText("−40,00")).toHaveClass("text-baja");
    expect(screen.getByText("▼ −0,40 %")).toBeInTheDocument();
    expect(screen.getByText("Vale 960,00 USDT")).toBeInTheDocument();
  });
});

describe("ResumenCartera", () => {
  it("trae la cartera del usuario", async () => {
    servidorFalso({ "GET /api/cartera": { estado: 200, cuerpo: NUEVA } });
    renderizar(<ResumenCartera />);
    expect(await screen.findByText("Valor de tu cartera")).toBeInTheDocument();
  });
});
