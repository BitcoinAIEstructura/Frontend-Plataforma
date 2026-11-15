import { afterEach, describe, expect, it, vi } from "vitest";

import type { Vela } from "./mercado";
import { servidorFalso } from "@/test/utilidades";

import { calcularSiHubiera, obtenerLiga } from "./liga";

afterEach(() => vi.unstubAllGlobals());

const VELA: Vela = {
  tiempoApertura: 1,
  apertura: 50_000,
  maximo: 51_000,
  minimo: 49_000,
  cierre: 50_500,
  volumen: 1.5,
  tiempoCierre: 2,
};

const CLASIFICADO = { posicion: 1, alias: "Ana", rentabilidad: 0.12, valorTotal: 11_200, esTuyo: true };

describe("liga", () => {
  it("pide la liga y deja 'tu' vacío cuando no participas", async () => {
    const servidor = servidorFalso({
      "GET /api/liga": {
        estado: 200,
        cuerpo: { precio: 50_000, participantes: 3, mejores: [CLASIFICADO], tu: null },
      },
    });
    const liga = await obtenerLiga();
    expect(liga.participantes).toBe(3);
    expect(liga.tu).toBeNull();
    expect(liga.mejores[0]?.alias).toBe("Ana");
    expect(servidor.mock.calls[0]![0]).toBe("/api/liga");
  });

  it("propaga el error del backend", async () => {
    servidorFalso({ "GET /api/liga": { estado: 401, cuerpo: { error: "Inicia sesión para ver la liga" } } });
    await expect(obtenerLiga()).rejects.toThrow("Inicia sesión para ver la liga");
  });
});

describe("si hubiera invertido", () => {
  it("manda la fecha y el monto en la consulta", async () => {
    const servidor = servidorFalso({
      "GET /api/si-hubiera": {
        estado: 200,
        cuerpo: {
          fecha: "2024-01-15",
          monto: 1_000,
          vela: VELA,
          btc: 0.0198,
          precioActual: 60_000,
          valorHoy: 1_188,
          ganancia: 188,
          rentabilidad: 0.188,
          mejor: { tiempo: 3, precio: 62_000 },
          peor: { tiempo: 4, precio: 48_000 },
          velasRecorridas: 500,
          alturaArbol: 12,
          velasIndexadas: 500,
        },
      },
    });

    const resultado = await calcularSiHubiera("2024-01-15", 1_000);

    expect(resultado.ganancia).toBe(188);
    expect(resultado.vela.cierre).toBe(50_500);
    const [ruta] = servidor.mock.calls[0]!;
    expect(ruta).toBe("/api/si-hubiera?fecha=2024-01-15&monto=1000");
  });

  it("rechaza una respuesta con otra forma", async () => {
    servidorFalso({ "GET /api/si-hubiera": { estado: 200, cuerpo: { fecha: "2024-01-15" } } });
    await expect(calcularSiHubiera("2024-01-15", 1_000)).rejects.toBeTruthy();
  });
});
