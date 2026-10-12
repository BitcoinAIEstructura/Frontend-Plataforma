import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { TarjetaEvolucion } from "./TarjetaEvolucion";

vi.mock("@/componentes/graficas/GraficaEvolucion", () => ({
  GraficaEvolucion: ({
    titulo,
    puntos,
    base,
  }: {
    titulo: string;
    puntos: { valor: number }[];
    base: number;
  }) => (
    <div data-testid="evolucion">
      {titulo} · base {base} · {puntos.map((p) => Math.round(p.valor)).join(",")}
    </div>
  ),
}));

afterEach(() => vi.unstubAllGlobals());

const CARTERA = {
  precioActual: 60_000,
  saldoUsdt: 9_000,
  btc: 0.0198,
  costoPromedio: 50_505,
  valorBtc: 1188,
  valorTotal: 10_188,
  gananciaNoRealizada: 188,
  gananciaRealizada: 0,
  gananciaTotal: 188,
  rentabilidad: 0.0188,
  comisionesPagadas: 10,
  saldoInicial: 10_000,
};

const EJECUTADA = {
  id: 1,
  tipo: "COMPRA",
  monto: 1000,
  todo: false,
  estado: "EJECUTADA",
  creadaEn: 0,
  ejecutadaEn: 50,
  precioEjecucion: 50_000,
  cantidadBtc: 0.0198,
  comision: 10,
  motivo: "manual",
  detalle: null,
};

const vela = (t: number, cierre: number) => ({
  tiempoApertura: t,
  apertura: cierre,
  maximo: cierre,
  minimo: cierre,
  cierre,
  volumen: 1,
  tiempoCierre: t + 99,
});

function servidor(ordenes: unknown[]) {
  return servidorFalso({
    "GET /api/cartera": { estado: 200, cuerpo: CARTERA },
    "GET /api/ordenes": { estado: 200, cuerpo: { cantidad: ordenes.length, ordenes } },
    "GET /api/velas": {
      estado: 200,
      cuerpo: {
        simbolo: "BTCUSDT",
        intervalo: "1h",
        cantidad: 2,
        velas: [vela(0, 50_000), vela(100, 60_000)],
      },
    },
  });
}

describe("TarjetaEvolucion", () => {
  it("sin órdenes ejecutadas invita a la primera, sin gráfica plana", async () => {
    servidor([{ ...EJECUTADA, estado: "PENDIENTE", ejecutadaEn: null }]);
    renderizar(<TarjetaEvolucion />);
    expect(await screen.findByRole("link", { name: "Ir a Órdenes" })).toHaveAttribute("href", "/ordenes");
    expect(screen.queryByTestId("evolucion")).toBeNull();
    expect(screen.queryByRole("radiogroup")).toBeNull();
  });

  it("reconstruye el valor con las órdenes y las velas (7 días por defecto)", async () => {
    const fetch = servidor([EJECUTADA]);
    renderizar(<TarjetaEvolucion />);
    expect(await screen.findByTestId("evolucion")).toHaveTextContent("últimos 7 días");
    expect(screen.getByTestId("evolucion")).toHaveTextContent("base 10000 · 9990,10188");
    expect(fetch.mock.calls.map((c) => String(c[0]))).toContain("/api/velas?intervalo=1h&cantidad=168");
  });

  it("el rango de 30 días usa velas de 4 h", async () => {
    const fetch = servidor([EJECUTADA]);
    renderizar(<TarjetaEvolucion />);
    await screen.findByTestId("evolucion");
    await userEvent.click(screen.getByRole("radio", { name: "30 días" }));
    await waitFor(() =>
      expect(fetch.mock.calls.map((c) => String(c[0]))).toContain("/api/velas?intervalo=4h&cantidad=180"),
    );
  });
});
