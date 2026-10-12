import { afterEach, describe, expect, it, vi } from "vitest";

import { servidorFalso } from "@/test/utilidades";

import { obtenerIndicador, obtenerSenal, obtenerVelas } from "./mercado";
import { crearOrden, obtenerCartera } from "./simulacion";

afterEach(() => vi.unstubAllGlobals());

const VELA = {
  tiempoApertura: 1791244800000,
  apertura: 85766.87,
  maximo: 86698.99,
  minimo: 85136.11,
  cierre: 85549.93,
  volumen: 12614.48,
  tiempoCierre: 1791331199999,
};

describe("API de mercado", () => {
  it("velas e indicadores arman la consulta correcta", async () => {
    const servidor = servidorFalso({
      "GET /api/velas": {
        estado: 200,
        cuerpo: { simbolo: "BTCUSDT", intervalo: "1h", cantidad: 1, velas: [VELA] },
      },
      "GET /api/indicadores": {
        estado: 200,
        cuerpo: {
          indicador: "bollinger",
          parametros: { periodo: 20 },
          series: { media: [{ tiempo: 1, valor: 2 }] },
        },
      },
    });
    expect(await obtenerVelas("1h", 1)).toEqual([VELA]);
    await obtenerIndicador("bollinger", "1h", 300, { periodo: 20, desviaciones: 2 });
    expect(servidor.mock.calls.map((c) => c[0])).toEqual([
      "/api/velas?intervalo=1h&cantidad=1",
      "/api/indicadores?indicador=bollinger&intervalo=1h&cantidad=300&periodo=20&desviaciones=2",
    ]);
  });

  it("la señal valida decisión y pronóstico", async () => {
    servidorFalso({
      "GET /api/senal": {
        estado: 200,
        cuerpo: {
          estrategia: "combinada",
          velasAnalizadas: 199,
          decision: { tiempo: 1, senal: "COMPRAR", precio: 80000, confianza: 0.7, motivo: "m" },
          pronostico: {
            direccion: "SUBE",
            confianza: 0.7,
            justificacion: ["a"],
            indicadores: { rsi: 31 },
            aviso: "x",
          },
        },
      },
    });
    const senal = await obtenerSenal();
    expect(senal.pronostico.direccion).toBe("SUBE");
  });
});

describe("API de simulación", () => {
  it("crear una orden envía el cuerpo y valida la respuesta", async () => {
    const servidor = servidorFalso({
      "POST /api/ordenes": {
        estado: 201,
        cuerpo: {
          id: 1,
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
        },
      },
    });
    expect((await crearOrden({ tipo: "COMPRA", monto: 500 })).estado).toBe("PENDIENTE");
    expect(JSON.parse(String(servidor.mock.calls[0]?.[1]?.body))).toEqual({ tipo: "COMPRA", monto: 500 });
  });

  it("sin sesión la cartera da 401", async () => {
    servidorFalso({ "GET /api/cartera": { estado: 401, cuerpo: { error: "Tu sesión terminó" } } });
    await expect(obtenerCartera()).rejects.toMatchObject({ codigo: 401 });
  });
});
