import { afterEach, describe, expect, it, vi } from "vitest";

import { servidorFalso } from "@/test/utilidades";

import { buscar } from "./busqueda";
import { correrDemo } from "./estructuras";
import { calcularSiHubiera, obtenerLiga } from "./liga";
import { obtenerPreciosRecientes } from "./mercado";

afterEach(() => vi.unstubAllGlobals());

describe("API de las estructuras", () => {
  it("la demostración valida el estado según la estructura (árbol anidado)", async () => {
    const servidor = servidorFalso({
      "POST /api/estructuras/demo": {
        estado: 200,
        cuerpo: {
          estructura: "avl",
          pasos: [
            {
              operacion: "insertar",
              valor: 10,
              resultado: null,
              descripcion: "10 entra.",
              complejidad: "O(log n)",
              estado: {
                raiz: { clave: 10, altura: 1, izquierdo: null, derecho: null },
                altura: 1,
                tamanio: 1,
              },
            },
          ],
        },
      },
    });
    const pasos = await correrDemo("avl", [{ operacion: "insertar", valor: 10 }]);
    expect(pasos[0]!.estado.raiz?.clave).toBe(10);
    expect(JSON.parse(String(servidor.mock.calls[0]![1]?.body))).toEqual({
      estructura: "avl",
      operaciones: [{ operacion: "insertar", valor: 10 }],
    });
  });

  it("rechaza un estado que no corresponde a la estructura", async () => {
    servidorFalso({
      "POST /api/estructuras/demo": {
        estado: 200,
        cuerpo: {
          estructura: "pila",
          pasos: [
            {
              operacion: "apilar",
              valor: 1,
              resultado: null,
              descripcion: "",
              complejidad: "O(1)",
              estado: { arreglo: [1] },
            },
          ],
        },
      },
    });
    await expect(correrDemo("pila", [{ operacion: "apilar", valor: 1 }])).rejects.toThrow();
  });

  it("búsqueda, liga, si-hubiera y precios recientes arman la ruta correcta", async () => {
    const servidor = servidorFalso({
      "GET /api/buscar": {
        estado: 200,
        cuerpo: { consulta: "ord", resultados: [], palabrasIndexadas: 1, nodosTrie: 2 },
      },
      "GET /api/liga": { estado: 200, cuerpo: { precio: 1, participantes: 0, mejores: [], tu: null } },
      "GET /api/precio/recientes": { estado: 200, cuerpo: { capacidad: 120, cantidad: 0, precios: [] } },
      "GET /api/si-hubiera": { estado: 400, cuerpo: { error: "Esa fecha es anterior a los datos" } },
    });
    await buscar("ord", 5);
    expect((await obtenerLiga()).tu).toBeNull();
    expect((await obtenerPreciosRecientes()).capacidad).toBe(120);
    await expect(calcularSiHubiera("2010-01-01", 100)).rejects.toThrow("anterior a los datos");
    expect(servidor.mock.calls.map((c) => c[0])).toEqual([
      "/api/buscar?q=ord&limite=5",
      "/api/liga",
      "/api/precio/recientes",
      "/api/si-hubiera?fecha=2010-01-01&monto=100",
    ]);
  });
});
