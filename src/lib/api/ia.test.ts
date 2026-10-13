import { afterEach, describe, expect, it, vi } from "vitest";

import { PREDICCION } from "@/test/prediccion";
import { servidorFalso } from "@/test/utilidades";

import { obtenerPredicciones } from "./ia";

afterEach(() => vi.unstubAllGlobals());

describe("API de la IA", () => {
  it("pide el intervalo y valida el árbol anidado", async () => {
    const servidor = servidorFalso({ "GET /api/ia/predicciones": { estado: 200, cuerpo: PREDICCION } });
    const p = await obtenerPredicciones("4h");
    expect(p.arbol?.hoja).toBe(false);
    expect(p.modelos).toHaveLength(3);
    expect(servidor.mock.calls[0]![0]).toBe("/api/ia/predicciones?intervalo=4h");
  });

  it("rechaza una dirección desconocida", async () => {
    servidorFalso({
      "GET /api/ia/predicciones": {
        estado: 200,
        cuerpo: { ...PREDICCION, comite: { ...PREDICCION.comite, direccion: "LATERAL" } },
      },
    });
    await expect(obtenerPredicciones("1h")).rejects.toThrow();
  });
});
