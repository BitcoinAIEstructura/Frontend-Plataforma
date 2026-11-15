import { describe, expect, it } from "vitest";

import { SECCIONES, seccionActiva } from "./secciones";

describe("SECCIONES", () => {
  it("no repite rutas ni títulos", () => {
    const rutas = SECCIONES.map((s) => s.ruta);
    const titulos = SECCIONES.map((s) => s.titulo);
    expect(new Set(rutas).size).toBe(rutas.length);
    expect(new Set(titulos).size).toBe(titulos.length);
  });

  it("todas las rutas son absolutas", () => {
    for (const seccion of SECCIONES) {
      expect(seccion.ruta.startsWith("/")).toBe(true);
    }
  });

  it("cada sección tiene icono y una frase que la explica", () => {
    for (const seccion of SECCIONES) {
      expect(seccion.icono.length).toBeGreaterThan(0);
      expect(seccion.descripcion.length).toBeGreaterThan(10);
    }
  });

  it("la barra del teléfono no pasa de cuatro secciones", () => {
    expect(SECCIONES.filter((s) => s.enTelefono).length).toBeLessThanOrEqual(4);
  });
});

describe("seccionActiva", () => {
  it("encuentra la sección exacta", () => {
    expect(seccionActiva("/panel")?.titulo).toBe("Panel");
  });

  it("encuentra la sección de una subruta", () => {
    expect(seccionActiva("/mercado/velas")?.titulo).toBe("Mercado");
    expect(seccionActiva("/como-funciona/arbol")?.titulo).toBe("Cómo funciona");
  });

  it("no confunde una ruta que solo empieza parecido", () => {
    expect(seccionActiva("/mercadox")).toBeUndefined();
    expect(seccionActiva("/panelx")?.titulo).not.toBe("Panel");
  });

  it("devuelve undefined fuera del catálogo", () => {
    expect(seccionActiva("/")).toBeUndefined();
    expect(seccionActiva("/ruta-que-no-existe")).toBeUndefined();
  });
});
