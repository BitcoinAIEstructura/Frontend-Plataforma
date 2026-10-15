import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { TarjetaAlertas } from "./TarjetaAlertas";

afterEach(() => vi.unstubAllGlobals());

const alerta = (id: number, tipo: string, precio: number, estado = "ACTIVA") => ({
  id,
  tipo,
  precio,
  estado,
  creadaEn: Date.now(),
  disparadaEn: estado === "DISPARADA" ? Date.now() : null,
  precioDisparo: estado === "DISPARADA" ? precio + 10 : null,
});

function servidor(alertas: unknown[] = []) {
  const cuerpos: unknown[] = [];
  const fetch = servidorFalso({
    "GET /api/precio": { estado: 200, cuerpo: { simbolo: "BTCUSDT", precio: 80_000, momento: 1 } },
    "GET /api/alertas": { estado: 200, cuerpo: { activas: 1, alertas } },
    "POST /api/alertas": (c) => {
      cuerpos.push(c);
      return { estado: 201, cuerpo: alerta(9, "SUBE_A", 84_000) };
    },
    "DELETE /api/alertas/1": { estado: 204 },
  });
  return { fetch, cuerpos };
}

describe("TarjetaAlertas", () => {
  it("crea una alerta con un precio sugerido", async () => {
    const { cuerpos } = servidor();
    renderizar(<TarjetaAlertas />);
    await userEvent.click(await screen.findByRole("button", { name: /\+5 %/ }));
    expect(screen.getByLabelText("Precio (USDT)")).toHaveValue("84000");
    await userEvent.click(screen.getByRole("button", { name: "Crear alerta" }));
    await waitFor(() => expect(cuerpos).toEqual([{ tipo: "SUBE_A", precio: 84000 }]));
  });

  it("no deja crear una alerta que ya se cumple", async () => {
    const { cuerpos } = servidor();
    renderizar(<TarjetaAlertas />);
    await screen.findByRole("button", { name: /\+2 %/ });
    await userEvent.click(screen.getByRole("radio", { name: "▼ Cuando baje a" }));
    await userEvent.type(screen.getByLabelText("Precio (USDT)"), "90000");
    await userEvent.click(screen.getByRole("button", { name: "Crear alerta" }));
    expect(screen.getByRole("alert")).toHaveTextContent("por debajo del precio de ahora");
    expect(cuerpos).toEqual([]);
  });

  it("lista las activas para borrarlas (con confirmación) y las cumplidas", async () => {
    const { fetch } = servidor([alerta(1, "BAJA_A", 75_000), alerta(2, "SUBE_A", 79_000, "DISPARADA")]);
    renderizar(<TarjetaAlertas />);
    const activas = await screen.findByRole("list", { name: "Alertas activas" });
    expect(activas).toHaveTextContent("▼ Baje a 75.000,00");
    expect(screen.getByRole("list", { name: "Alertas cumplidas" })).toHaveTextContent(
      "▲ Suba a 79.000,00 · se cumplió a 79.010,00",
    );
    await userEvent.click(within(activas).getByRole("button", { name: /Borrar la alerta/ }));
    const ventana = screen.getByRole("alertdialog", { name: "¿Borrar esta alerta?" });
    expect(ventana).toHaveTextContent("baje a 75.000,00 USDT");
    expect(fetch).not.toHaveBeenCalledWith("/api/alertas/1", expect.anything());
    await userEvent.click(within(ventana).getByRole("button", { name: "Sí, borrar la alerta" }));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/alertas/1", expect.objectContaining({ method: "DELETE" })),
    );
  });
});
