import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { aspectoEvento, HistorialEventos, ListaEventos } from "./HistorialEventos";

afterEach(() => vi.unstubAllGlobals());

const EVENTOS = [
  {
    momento: 1791819390557,
    tipo: "ORDEN_EJECUTADA",
    idOrden: 1,
    descripcion:
      "Orden #1 ejecutada: Compró 0.03019431 BTC a 82714.27 por 2500.00 USDT (comisión 2.50 USDT).",
  },
  {
    momento: 1791819379166,
    tipo: "ORDEN_CREADA",
    idOrden: 1,
    descripcion: "Orden #1 de COMPRA por 2500.00 USDT creada (manual).",
  },
];

describe("HistorialEventos", () => {
  it("cada evento con su nombre y descripción, el más reciente primero", () => {
    renderizar(<ListaEventos eventos={EVENTOS} />);
    const [primero, segundo] = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(primero).toHaveTextContent("Orden ejecutada");
    expect(primero).toHaveTextContent("Compró 0.03019431 BTC");
    expect(segundo).toHaveTextContent("Orden creada");
  });

  it("los tipos desconocidos no rompen la lista", () => {
    expect(aspectoEvento("ALGO_NUEVO").nombre).toBe("Evento");
    expect(aspectoEvento("STOP_LOSS")).toMatchObject({ icono: "▼", nombre: "Stop-loss" });
  });

  it("pide los últimos 50 eventos y avisa si no hay", async () => {
    const fetch = servidorFalso({ "GET /api/historial": { estado: 200, cuerpo: { eventos: [] } } });
    renderizar(<HistorialEventos />);
    expect(await screen.findByText(/Todavía no hay movimientos/)).toBeInTheDocument();
    expect(String(fetch.mock.calls[0]![0])).toBe("/api/historial?limite=50");
  });

  it("ofrece descargar el registro de órdenes en CSV", async () => {
    servidorFalso({ "GET /api/historial": { estado: 200, cuerpo: { eventos: [] } } });
    renderizar(<HistorialEventos />);

    // Un <a download> normal: el navegador baja el archivo, no navega a otra página.
    const enlace = screen.getByRole("link", { name: /descargar/i });
    expect(enlace).toHaveAttribute("href", "/api/exportar/ordenes");
    expect(enlace).toHaveAttribute("download", "ordenes.csv");
  });
});
