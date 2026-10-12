import { describe, expect, it } from "vitest";

import { decidirCalidad, type Dispositivo } from "./calidad";

const PORTATIL: Dispositivo = {
  webgl: true,
  menosMovimiento: false,
  nucleos: 12,
  memoriaGb: 16,
  anchoPantalla: 1440,
};

describe("decidirCalidad", () => {
  it("un portátil potente ve la escena completa", () => {
    expect(decidirCalidad(PORTATIL)).toBe("completa");
  });

  it("sin WebGL o con menos movimiento pedido: imagen fija", () => {
    expect(decidirCalidad({ ...PORTATIL, webgl: false })).toBe("estatica");
    expect(decidirCalidad({ ...PORTATIL, menosMovimiento: true })).toBe("estatica");
  });

  it("teléfonos y equipos modestos: versión liviana", () => {
    expect(decidirCalidad({ ...PORTATIL, anchoPantalla: 390 })).toBe("liviana");
    expect(decidirCalidad({ ...PORTATIL, nucleos: 4 })).toBe("liviana");
    expect(decidirCalidad({ ...PORTATIL, memoriaGb: 2 })).toBe("liviana");
    expect(decidirCalidad({ ...PORTATIL, ahorroDatos: true })).toBe("liviana");
  });

  it("si el navegador no dice núcleos ni memoria, decide por el ancho", () => {
    expect(decidirCalidad({ webgl: true, menosMovimiento: false, anchoPantalla: 1280 })).toBe("completa");
  });
});
