import { act, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CLAVES } from "@/lib/tiempoReal";
import { renderizarGancho, servidorFalso } from "@/test/utilidades";

import { REFRESCO_VELAS, useAccionesOrdenes, usePrecio } from "./useDatos";

afterEach(() => vi.unstubAllGlobals());

describe("ganchos de datos", () => {
  it("el precio comparte la caché con el tiempo real", async () => {
    servidorFalso({
      "GET /api/precio": { estado: 200, cuerpo: { simbolo: "BTCUSDT", precio: 84000, momento: 1 } },
    });
    const { result, cliente } = renderizarGancho(usePrecio);
    await waitFor(() => expect(result.current.data?.precio).toBe(84000));
    act(() => cliente.setQueryData(CLAVES.precio, { simbolo: "BTCUSDT", precio: 85000, momento: 2 }));
    await waitFor(() => expect(result.current.data?.precio).toBe(85000));
  });

  it("las velas de 1 minuto se refrescan más seguido que las diarias", () => {
    expect(REFRESCO_VELAS["1m"]).toBeLessThan(REFRESCO_VELAS["1d"]);
  });

  it("crear una orden recarga órdenes, cartera, historial y bot", async () => {
    servidorFalso({
      "POST /api/ordenes": {
        estado: 201,
        cuerpo: {
          id: 1,
          tipo: "COMPRA",
          monto: 100,
          todo: false,
          estado: "PENDIENTE",
          creadaEn: 1,
          ejecutadaEn: null,
          precioEjecucion: null,
          cantidadBtc: null,
          comision: null,
          motivo: "manual",
          detalle: null,
        },
      },
    });
    const { result, cliente } = renderizarGancho(useAccionesOrdenes);
    const invalidar = vi.spyOn(cliente, "invalidateQueries");
    await act(() => result.current.crear.mutateAsync({ tipo: "COMPRA", monto: 100 }));
    const claves = invalidar.mock.calls.map(([filtro]) => JSON.stringify(filtro?.queryKey));
    for (const clave of [CLAVES.ordenes, CLAVES.cartera, CLAVES.historial, CLAVES.bot]) {
      expect(claves).toContain(JSON.stringify(clave));
    }
  });
});
