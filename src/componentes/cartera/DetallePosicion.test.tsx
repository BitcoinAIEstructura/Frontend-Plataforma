import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Cartera } from "@/lib/api/simulacion";

import { DetallePosicion } from "./DetallePosicion";

// El ejemplo real de docs/API.md, después de comprar 500 USDT.
const CARTERA: Cartera = {
  precioActual: 82937.59,
  saldoUsdt: 9500,
  btc: 0.00602260084962681,
  costoPromedio: 83020.61,
  valorBtc: 499.5,
  valorTotal: 9999.5,
  gananciaNoRealizada: -0.5,
  gananciaRealizada: 0,
  gananciaTotal: -0.5,
  rentabilidad: -0.00005,
  comisionesPagadas: 0.5,
  saldoInicial: 10000,
};

describe("DetallePosicion", () => {
  it("muestra el reparto con nombres y porcentajes", () => {
    render(<DetallePosicion cartera={CARTERA} />);
    const [btc, usdt] = screen.getAllByRole("listitem");
    expect(btc).toHaveTextContent("Bitcoin: 5 %");
    expect(usdt).toHaveTextContent("USDT: 95 %");
  });

  it("costo promedio con variación, ganancias con signo y lo que daría vender todo", () => {
    render(<DetallePosicion cartera={CARTERA} />);
    expect(screen.getByText("83.020,61 USDT", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("▼ −0,10 %")).toBeInTheDocument();
    expect(screen.getByText("−0,50")).toHaveClass("text-baja");
    expect(screen.getByText(/≈ 499,00 USDT/)).toBeInTheDocument();
  });

  it("sin BTC no muestra costo ni venta total", () => {
    render(
      <DetallePosicion cartera={{ ...CARTERA, btc: 0, valorBtc: 0, costoPromedio: 0, valorTotal: 10000 }} />,
    );
    expect(screen.queryByText(/Si vendieras todo/)).toBeNull();
    expect(screen.getAllByRole("listitem")[1]).toHaveTextContent("USDT: 100 %");
  });
});
