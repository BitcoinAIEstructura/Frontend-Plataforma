import { afterEach, describe, expect, it, vi } from "vitest";

import { servidorFalso } from "@/test/utilidades";

import { cancelarAlerta, crearAlerta, obtenerAlertas } from "./alertas";

afterEach(() => vi.unstubAllGlobals());

const ALERTA = {
  id: 1,
  tipo: "SUBE_A",
  precio: 90000,
  estado: "ACTIVA",
  creadaEn: 1,
  disparadaEn: null,
  precioDisparo: null,
};

describe("API de alertas", () => {
  it("crea, lista y cancela", async () => {
    const servidor = servidorFalso({
      "POST /api/alertas": { estado: 201, cuerpo: ALERTA },
      "GET /api/alertas": { estado: 200, cuerpo: { activas: 1, alertas: [ALERTA] } },
      "DELETE /api/alertas/1": { estado: 204 },
    });
    expect((await crearAlerta("SUBE_A", 90000)).id).toBe(1);
    expect((await obtenerAlertas()).activas).toBe(1);
    await cancelarAlerta(1);
    expect(JSON.parse(String(servidor.mock.calls[0]![1]?.body))).toEqual({ tipo: "SUBE_A", precio: 90000 });
    expect(servidor.mock.calls[2]![1]?.method).toBe("DELETE");
  });

  it("muestra el motivo del backend", async () => {
    servidorFalso({
      "POST /api/alertas": { estado: 400, cuerpo: { error: "debe estar por encima del actual" } },
    });
    await expect(crearAlerta("SUBE_A", 1)).rejects.toThrow("por encima del actual");
  });
});
