/**
 * Las mismas reglas de contraseña que el backend (seguridad/politica.py), para
 * mostrar en vivo qué le falta a la contraseña mientras se escribe. El backend
 * siempre vuelve a comprobarlas: esto solo ayuda a la persona.
 */

export const LONGITUD_MINIMA = 10;
export const LONGITUD_MAXIMA = 128;

const COMUNES = new Set([
  "contraseña",
  "contrasena",
  "password",
  "passw0rd",
  "123456789",
  "1234567890",
  "qwertyuiop",
  "bitcoin",
  "bitcoin123",
  "colombia",
  "administrador",
  "admin12345",
  "iloveyou",
  "tequiero",
  "abc1234567",
  "aaaaaaaaaa",
  "contraseña1",
  "password123",
  "qwerty123",
  "1q2w3e4r5t",
]);

const SECUENCIAS = ["0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

export interface Requisito {
  id: "longitud" | "variedad" | "comun" | "personal";
  texto: string;
  cumple: boolean;
}

/** Minúsculas y sin tildes, como el backend ("Contraseña" → "contrasena"). */
export function normalizar(texto: string): string {
  return texto.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("es");
}

export function clasesDeCaracteres(contrasena: string): number {
  return [/\p{Ll}/u, /\p{Lu}/u, /\p{Nd}/u, /[^\p{L}\p{Nd}]/u].filter((patron) => patron.test(contrasena))
    .length;
}

function esComunOPredecible(contrasena: string): boolean {
  const normal = normalizar(contrasena);
  const raiz = normal.replace(/[0-9!@#$%&*.?\-_ ]+$/, "");
  if (COMUNES.has(normal) || COMUNES.has(raiz)) return true;
  if (new Set(normal).size <= 2) return true;
  return SECUENCIAS.some((s) => s.includes(normal) || [...s].reverse().join("").includes(normal));
}

function contieneDatosPersonales(contrasena: string, datos: readonly string[]): boolean {
  const normal = normalizar(contrasena);
  return datos.some((dato) =>
    normalizar(dato)
      .replace(/[@.]/g, " ")
      .split(/\s+/)
      .some((parte) => parte.length >= 4 && normal.includes(parte)),
  );
}

/** Cada requisito y si se cumple. ``datosPersonales``: nombre, apellido, correo, documento. */
export function requisitosContrasena(
  contrasena: string,
  datosPersonales: readonly string[] = [],
): Requisito[] {
  const largo = [...contrasena].length;
  return [
    {
      id: "longitud",
      texto: `Entre ${LONGITUD_MINIMA} y ${LONGITUD_MAXIMA} caracteres`,
      cumple: largo >= LONGITUD_MINIMA && largo <= LONGITUD_MAXIMA,
    },
    {
      id: "variedad",
      texto: "Al menos 3 de: minúsculas, mayúsculas, números y símbolos",
      cumple: clasesDeCaracteres(contrasena) >= 3,
    },
    {
      id: "comun",
      texto: "Que no sea común ni predecible",
      cumple: contrasena.length > 0 && !esComunOPredecible(contrasena),
    },
    {
      id: "personal",
      texto: "Sin tu nombre, correo ni documento",
      cumple: contrasena.length > 0 && !contieneDatosPersonales(contrasena, datosPersonales),
    },
  ];
}

export function contrasenaValida(contrasena: string, datosPersonales: readonly string[] = []): boolean {
  return requisitosContrasena(contrasena, datosPersonales).every((r) => r.cumple);
}

/** Fortaleza de 0 a 4 para la barra: requisitos cumplidos, con un punto extra por longitud. */
export function fortaleza(contrasena: string, datosPersonales: readonly string[] = []): 0 | 1 | 2 | 3 | 4 {
  if (!contrasena) return 0;
  const cumplidos = requisitosContrasena(contrasena, datosPersonales).filter((r) => r.cumple).length;
  if (cumplidos < 4) return Math.max(1, cumplidos - 1) as 1 | 2 | 3;
  return [...contrasena].length >= 14 && clasesDeCaracteres(contrasena) === 4 ? 4 : 3;
}
