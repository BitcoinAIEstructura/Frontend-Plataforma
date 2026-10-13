import { existsSync } from "node:fs";

import { describe, expect, it } from "vitest";

import manifest from "./manifest";

describe("manifest de la PWA", () => {
  it("es instalable: nombre, inicio, standalone e íconos de 192 y 512 (uno maskable)", () => {
    const m = manifest();
    expect(m.short_name).toBe("Nexabit");
    expect(m.start_url).toBe("/panel");
    expect(m.display).toBe("standalone");
    const tamanos = m.icons?.map((i) => i.sizes);
    expect(tamanos).toContain("192x192");
    expect(tamanos).toContain("512x512");
    expect(m.icons?.some((i) => i.purpose === "maskable")).toBe(true);
  });

  it("los íconos existen en public/", () => {
    for (const icono of manifest().icons ?? []) expect(existsSync(`public${icono.src}`)).toBe(true);
    expect(existsSync("public/sw.js")).toBe(true);
    expect(existsSync("public/sin-conexion.html")).toBe(true);
  });
});
