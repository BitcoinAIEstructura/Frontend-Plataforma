import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { FormularioOrden } from "./FormularioOrden";

afterEach(() => vi.unstubAllGlobals());

const CARTERA = {
  precioActual: 80_000,
  saldoUsdt: 9_500,
  btc: 0.00625,
  costoPromedio: 80_000,
  valorBtc: 500,
  valorTotal: 10_000,
  gananciaNoRealizada: 0,
  gananciaRealizada: 0,
  gananciaTotal: 0,
  rentabilidad: 0,
  comisionesPagadas: 0.5,
  saldoInicial: 10_000,
};

const ORDEN = {
  id: 7,
  tipo: "COMPRA",
  monto: 500,
  todo: false,
  estado: "PENDIENTE",
  creadaEn: 1,
  ejecutadaEn: null,
  precioEjecucion: null,
  cantidadBtc: null,
  comision: null,
  motivo: "manual",
  detalle: null,
};

function servidor() {
  const cuerpos: unknown[] = [];
  const fetch = servidorFalso({
    "GET /api/cartera": { estado: 200, cuerpo: CARTERA },
    "GET /api/precio": { estado: 200, cuerpo: { simbolo: "BTCUSDT", precio: 80_000, momento: 1 } },
    "POST /api/ordenes": (cuerpo) => {
      cuerpos.push(cuerpo);
      return { estado: 201, cuerpo: ORDEN };
    },
  });
  return { fetch, cuerpos };
}

describe("FormularioOrden", () => {
  it("compra con un monto escrito a la colombiana y muestra la vista previa", async () => {
    const { cuerpos } = servidor();
    renderizar(<FormularioOrden />);
    expect(await screen.findByText("Disponible: 9.500,00 USDT")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("USDT a gastar (comisión incluida)"), "1.000,50");
    expect(await screen.findByText(/Recibirías ≈ 0,01249374 BTC/)).toHaveTextContent("comisión ≈ 1,00 USDT");
    await userEvent.click(screen.getByRole("button", { name: "Comprar 1.000,50 USDT" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Orden #7 en la cola");
    expect(cuerpos).toEqual([{ tipo: "COMPRA", monto: 1000.5 }]);
  });

  it("no envía si el monto pasa lo disponible", async () => {
    const { cuerpos } = servidor();
    renderizar(<FormularioOrden />);
    await screen.findByText("Disponible: 9.500,00 USDT");
    await userEvent.type(screen.getByLabelText("USDT a gastar (comisión incluida)"), "20000");
    await userEvent.click(screen.getByRole("button", { name: /^Comprar/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("Solo tienes 9.500,00 USDT disponibles.");
    expect(cuerpos).toEqual([]);
  });

  it("los botones rápidos calculan sobre lo disponible", async () => {
    servidor();
    renderizar(<FormularioOrden />);
    await screen.findByText("Disponible: 9.500,00 USDT");
    await userEvent.click(screen.getByRole("button", { name: "25 %" }));
    expect(screen.getByLabelText("USDT a gastar (comisión incluida)")).toHaveValue("2375");
    await userEvent.click(screen.getByRole("radio", { name: "▼ Vender" }));
    await userEvent.click(screen.getByRole("button", { name: "50 %" }));
    expect(screen.getByLabelText("Valor en USDT del BTC a vender")).toHaveValue("250");
  });

  it("vender todo manda todo: true y lo dice en el botón", async () => {
    const { cuerpos } = servidor();
    renderizar(<FormularioOrden />);
    await userEvent.click(await screen.findByRole("radio", { name: "▼ Vender" }));
    await screen.findByText("Tienes 0,00625 BTC (≈ 500,00 USDT)");
    await userEvent.click(screen.getByRole("button", { name: "Todo" }));
    expect(screen.getByLabelText("Valor en USDT del BTC a vender")).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Vender todo mi BTC" }));
    await waitFor(() => expect(cuerpos).toEqual([{ tipo: "VENTA", todo: true }]));
  });

  it("muestra el error del backend", async () => {
    servidorFalso({
      "GET /api/cartera": { estado: 200, cuerpo: CARTERA },
      "POST /api/ordenes": { estado: 400, cuerpo: { error: "El monto debe ser mayor que 0" } },
    });
    renderizar(<FormularioOrden />);
    await screen.findByText("Disponible: 9.500,00 USDT");
    await userEvent.type(screen.getByLabelText("USDT a gastar (comisión incluida)"), "10");
    await userEvent.click(screen.getByRole("button", { name: /^Comprar/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("El monto debe ser mayor que 0");
  });

  it("avisa lo que ya está en la cola y sigue el estado de la orden creada", async () => {
    let ordenes = [{ ...ORDEN, id: 3, monto: 100 }];
    servidorFalso({
      "GET /api/cartera": { estado: 200, cuerpo: CARTERA },
      "GET /api/ordenes": () => ({ estado: 200, cuerpo: { cantidad: ordenes.length, ordenes } }),
      "POST /api/ordenes": () => {
        ordenes = [{ ...ORDEN, estado: "EJECUTADA" }];
        return { estado: 201, cuerpo: ORDEN };
      },
    });
    renderizar(<FormularioOrden />);
    expect(
      await screen.findByText("100,00 USDT ya están en órdenes de compra en la cola."),
    ).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("USDT a gastar (comisión incluida)"), "50");
    await userEvent.click(screen.getByRole("button", { name: /^Comprar/ }));
    // Tras crear se recarga la lista: la orden #7 ya aparece ejecutada.
    expect(await screen.findByText("Ejecutada")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Orden #7");
  });
});
