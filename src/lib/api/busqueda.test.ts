import { afterEach, describe, expect, it, vi } from "vitest";

import { servidorFalso } from "@/test/utilidades";

import { buscar } from "./busqueda";

afterEach(() => vi.unstubAllGlobals());

const RESULTADO = {
  id: "rsi",
  titulo: "RSI",
  descripcion: "Índice de fuerza relativa",
  ruta: "/como-funciona#rsi",
  tipo: "indicador",
};

function responder() {
  return servidorFalso({
    "GET /api/buscar": {
      estado: 200,
      cuerpo: { consulta: "rsi", resultados: [RESULTADO], palabrasIndexadas: 120, nodosTrie: 400 },
    },
  });
}

describe("buscar", () => {
  it("pide la búsqueda con el límite por defecto", async () => {
    const servidor = responder();
    const respuesta = await buscar("rsi");
    expect(respuesta.resultados[0]?.titulo).toBe("RSI");
    expect(respuesta.nodosTrie).toBe(400);
    expect(servidor.mock.calls[0]![0]).toBe("/api/buscar?q=rsi&limite=8");
  });

  it("respeta un límite distinto", async () => {
    const servidor = responder();
    await buscar("rsi", 3);
    expect(servidor.mock.calls[0]![0]).toBe("/api/buscar?q=rsi&limite=3");
  });

  it("recorta la consulta a 60 caracteres", async () => {
    const servidor = responder();
    await buscar("a".repeat(100));
    const ruta = String(servidor.mock.calls[0]![0]);
    expect(ruta).toContain(`q=${"a".repeat(60)}&`);
    expect(ruta).not.toContain("a".repeat(61));
  });

  it("codifica los espacios de la consulta", async () => {
    const servidor = responder();
    await buscar("miedo y codicia");
    expect(servidor.mock.calls[0]![0]).toBe("/api/buscar?q=miedo+y+codicia&limite=8");
  });

  it("propaga el error del backend", async () => {
    servidorFalso({ "GET /api/buscar": { estado: 400, cuerpo: { error: "Parámetro 'limite' inválido" } } });
    await expect(buscar("rsi", 99)).rejects.toThrow("Parámetro 'limite' inválido");
  });
});
