import { describe, expect, it } from "vitest";

import {
  normalizarTelefono,
  validarCorreo,
  validarDocumento,
  validarNombre,
  validarTelefono,
} from "./registro";

// Los mismos casos que tests/usuarios/test_validacion.py del backend.
describe("documento", () => {
  it.each(["1023456789", "1.023.456.789", " 79 123 456 ", "12345"])("CC válida: %s", (n) => {
    expect(validarDocumento("CC", n)).toBeNull();
  });
  it.each(["", "1234", "12345678901", "0123456789", "10234A6789"])("CC inválida: %s", (n) => {
    expect(validarDocumento("CC", n)).toContain("cédula de ciudadanía");
  });
  it.each(["654321", "e-12345a"])("CE válida: %s", (n) => expect(validarDocumento("CE", n)).toBeNull());
  it.each(["1234", "ABCDEFGHIJKLM", "12#456"])("CE inválida: %s", (n) => {
    expect(validarDocumento("CE", n)).toContain("extranjería");
  });
});

describe("teléfono", () => {
  it.each([
    ["3001234567", "+573001234567"],
    ["300 123 4567", "+573001234567"],
    ["+57 300-123-4567", "+573001234567"],
    ["0057 3001234567", "+573001234567"],
    ["+1 (305) 555-0123", "+13055550123"],
    ["+34 612 345 678", "+34612345678"],
  ])("%s → %s", (escrito, esperado) => {
    expect(normalizarTelefono(escrito)).toBe(esperado);
    expect(validarTelefono(escrito)).toBeNull();
  });
  it.each(["", "12345", "6012345678", "+57 601 234 5678", "+0123456789", "300123456a"])(
    "inválido: %s",
    (t) => {
      expect(validarTelefono(t)).not.toBeNull();
    },
  );
  it("explica el formato colombiano", () => {
    expect(validarTelefono("+57 601 234 5678")).toBe(
      "Un celular colombiano tiene 10 dígitos y empieza por 3",
    );
  });
});

describe("correo y nombres", () => {
  it.each(["  Ana.Perez@Gmail.COM ", "santi+bitcoin@uni.edu.co"])("correo válido: %s", (c) => {
    expect(validarCorreo(c)).toBeNull();
  });
  it.each(["", "ana", "ana@", "@gmail.com", "ana@gmail", "ana..p@gmail.com", "a b@c.co", "ana@-gmail.com"])(
    "correo inválido: %s",
    (c) => expect(validarCorreo(c)).toBe("El correo no es válido"),
  );
  it.each(["María   José", "Ñúñez", "O'Connor", "Gómez-Pérez"])("nombre válido: %s", (n) => {
    expect(validarNombre(n)).toBeNull();
  });
  it("nombres inválidos", () => {
    expect(validarNombre("A")).toContain("entre 2 y 50");
    expect(validarNombre("Ana3", "apellido")).toBe(
      "El apellido solo puede tener letras, espacios, apóstrofo o guion",
    );
    for (const malo of ["<script>", "Ana--Luz", "Ana_Luz"]) expect(validarNombre(malo)).not.toBeNull();
  });
});
