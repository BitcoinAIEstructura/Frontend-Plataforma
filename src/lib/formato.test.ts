import { describe, expect, it } from "vitest";

import {
  btc,
  conSigno,
  describirAgente,
  fechaCorta,
  fechaHora,
  haceCuanto,
  numero,
  usdt,
  usdtCompacto,
  variacion,
} from "./formato";

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

describe("dinero y variaciones", () => {
  it("USDT y BTC en formato colombiano", () => {
    expect(usdt(84184.03)).toBe("84.184,03");
    expect(usdt(null)).toBe("—");
    expect(btc(0.0125)).toBe("0,0125");
    expect(btc(0.00604171651)).toBe("0,00604172");
  });

  it("la variación lleva ícono y signo, no solo color", () => {
    expect(variacion(0.024)).toBe("▲ +2,40 %");
    expect(variacion(-0.011)).toBe("▼ −1,10 %");
    expect(variacion(0)).toBe("● 0,00 %");
    expect(conSigno(125.5)).toBe("+125,50");
    expect(conSigno(-30)).toBe("−30,00");
  });

  it("compacto para ejes", () => {
    expect(usdtCompacto(12600)).toMatch(/12,6/);
  });

  it("números sin unidad con coma decimal", () => {
    expect(numero(70)).toBe("70,00");
    expect(numero(36.128)).toBe("36,13");
    expect(numero(Number.NaN)).toBe("—");
  });
});

describe("fechaCorta", () => {
  it("día/mes y hora de 24 h en Colombia (UTC−5)", () => {
    expect(fechaCorta(Date.UTC(2026, 9, 12, 19, 41))).toBe("12/10 14:41");
    expect(fechaCorta(Date.UTC(2026, 0, 3, 4, 5))).toBe("02/01 23:05");
  });
});
