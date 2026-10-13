import { describe, expect, it } from "vitest";

import { encabezadosSeguridad, politicaDeContenido } from "./encabezados";

describe("encabezados de seguridad", () => {
  it("en producción solo deja cargar del mismo sitio y sin eval", () => {
    const csp = politicaDeContenido(false);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self';");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("ws:");
  });

  it("en desarrollo permite la recarga en caliente", () => {
    const csp = politicaDeContenido(true);
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("connect-src 'self' ws: wss:");
  });

  it("incluye los demás encabezados", () => {
    const nombres = encabezadosSeguridad(false).map((e) => e.key);
    expect(nombres).toEqual([
      "Content-Security-Policy",
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Cross-Origin-Opener-Policy",
      "Permissions-Policy",
    ]);
  });
});
