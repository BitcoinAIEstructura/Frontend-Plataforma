import { describe, expect, it } from "vitest";

import { contrasenaValida, fortaleza, requisitosContrasena } from "./contrasena";

const faltan = (c: string, ...datos: string[]) =>
  requisitosContrasena(c, datos)
    .filter((r) => !r.cumple)
    .map((r) => r.id);

// Los mismos casos que tests/seguridad/test_politica.py del backend.
describe("requisitos de contraseña (iguales al backend)", () => {
  it.each(["Luna-Roja-2026", "tren azul VERDE 7", "Ñandú.Saltó#Lejos", "x9$Kp2!mQz"])(
    "acepta %s",
    (buena) => {
      expect(faltan(buena)).toEqual([]);
      expect(contrasenaValida(buena)).toBe(true);
    },
  );

  it("corta, larga y poco variada", () => {
    expect(faltan("Ab1!x")).toContain("longitud");
    expect(faltan("Ab1!".repeat(40))).toContain("longitud");
    expect(faltan("solominusculasperolarga")).toEqual(["variedad"]);
  });

  it.each(["Password123!", "Contraseña1!", "Bitcoin123$$", "Qwertyuiop1!", "Aaaaaaaaaa1!"])(
    "rechaza la común o predecible %s",
    (comun) => {
      expect(faltan(comun)).toContain("comun");
    },
  );

  it("no puede contener datos personales", () => {
    expect(faltan("Santiago#2026x", "Santiago", "Pérez")).toContain("personal");
    expect(faltan("Perez!Segura9", "Santiago", "Pérez")).toContain("personal");
    expect(faltan("Mi-correo-santi77", "santi77@gmail.com")).toContain("personal");
    expect(faltan("Doc#1023456789", "1023456789")).toContain("personal");
    expect(faltan("Ana-Luna-Roja-26", "Ana")).toEqual([]);
  });

  it("vacía no cumple nada", () => {
    expect(faltan("")).toEqual(["longitud", "variedad", "comun", "personal"]);
  });
});

describe("fortaleza", () => {
  it("sube a medida que se cumplen los requisitos", () => {
    expect(fortaleza("")).toBe(0);
    expect(fortaleza("abc")).toBe(1);
    expect(fortaleza("Luna-Roja-2026")).toBe(4);
    expect(fortaleza("tren azul VERDE 7")).toBe(4);
    expect(fortaleza("x9$Kp2!mQz")).toBe(3);
  });
});
