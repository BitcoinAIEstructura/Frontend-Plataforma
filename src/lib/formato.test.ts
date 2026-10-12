import { describe, expect, it } from "vitest";

import { describirAgente, fechaHora, haceCuanto } from "./formato";

describe("formato", () => {
  it("fecha y hora en hora de Colombia (UTC-5)", () => {
    // 2026-10-12 14:41 UTC = 09:41 en Bogotá
    const texto = fechaHora(Date.UTC(2026, 9, 12, 14, 41));
    expect(texto).toMatch(/12/);
    expect(texto).toMatch(/2026/);
    expect(texto).toMatch(/09:41/);
  });

  it("hace cuánto", () => {
    const ahora = Date.UTC(2026, 9, 12, 12, 0);
    expect(haceCuanto(ahora - 20_000, ahora)).toBe("justo ahora");
    expect(haceCuanto(ahora - 5 * 60_000, ahora)).toBe("hace 5 minutos");
    expect(haceCuanto(ahora - 86_400_000, ahora)).toBe("ayer");
  });

  it.each([
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
      "Chrome en Windows",
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605 Version/19 Safari/604.1",
      "Safari en iPhone / iPad",
    ],
    [
      "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36",
      "Chrome en Android",
    ],
    ["Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/140 Safari/537.36 Edg/140", "Edge en Windows"],
    ["Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0", "Firefox en Linux"],
    ["curl/8.21.0", "Dispositivo desconocido"],
  ])("%s → %s", (agente, esperado) => {
    expect(describirAgente(agente)).toBe(esperado);
  });
});
