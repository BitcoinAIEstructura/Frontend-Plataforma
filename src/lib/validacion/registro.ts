/**
 * Validación de los datos de registro con las mismas reglas que el backend
 * (usuarios/validacion.py). Devuelve el mensaje que se muestra bajo la casilla,
 * o null si está bien. El backend vuelve a validar todo.
 */
import type { TipoDocumento } from "@/lib/api/cuentas";

export type Mensaje = string | null;

const CC = /^[1-9]\d{4,9}$/;
const CE = /^[A-Z0-9]{5,12}$/;
const CELULAR_COLOMBIA = /^3\d{9}$/;
const INTERNACIONAL = /^\+[1-9]\d{7,14}$/;
const CORREO = /^[a-z0-9._%+-]{1,64}@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;
const NOMBRE = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;

export function limpiarDocumento(numero: string): string {
  return numero.replace(/[\s.-]/g, "").toUpperCase();
}

export function validarDocumento(tipo: TipoDocumento, numero: string): Mensaje {
  const limpio = limpiarDocumento(numero);
  if (tipo === "CC" && !CC.test(limpio))
    return "La cédula de ciudadanía debe tener entre 5 y 10 dígitos, sin letras";
  if (tipo === "CE" && !CE.test(limpio))
    return "La cédula de extranjería debe tener entre 5 y 12 letras o números";
  return null;
}

/** Teléfono en formato internacional (E.164), o null si no es válido. */
export function normalizarTelefono(telefono: string): string | null {
  let limpio = telefono.replace(/[\s.()-]/g, "");
  if (limpio.startsWith("00")) limpio = "+" + limpio.slice(2);
  if (CELULAR_COLOMBIA.test(limpio)) return "+57" + limpio;
  if (INTERNACIONAL.test(limpio)) {
    if (limpio.startsWith("+57") && !CELULAR_COLOMBIA.test(limpio.slice(3))) return null;
    return limpio;
  }
  return null;
}

export function validarTelefono(telefono: string): Mensaje {
  const limpio = telefono.replace(/[\s.()-]/g, "");
  if (limpio.startsWith("+57") && !CELULAR_COLOMBIA.test(limpio.slice(3)) && INTERNACIONAL.test(limpio)) {
    return "Un celular colombiano tiene 10 dígitos y empieza por 3";
  }
  return normalizarTelefono(telefono)
    ? null
    : "Escribe un celular colombiano de 10 dígitos o un número con indicativo (+57, +1…)";
}

export function validarCorreo(correo: string): Mensaje {
  const limpio = correo.trim().toLowerCase();
  return limpio.length <= 254 && CORREO.test(limpio) && !limpio.includes("..")
    ? null
    : "El correo no es válido";
}

export function validarNombre(texto: string, campo: "nombre" | "apellido" = "nombre"): Mensaje {
  const limpio = texto.trim().split(/\s+/).join(" ");
  const que = campo === "nombre" ? "El nombre" : "El apellido";
  if (limpio.length < 2 || limpio.length > 50) return `${que} debe tener entre 2 y 50 caracteres`;
  if (!NOMBRE.test(limpio)) return `${que} solo puede tener letras, espacios, apóstrofo o guion`;
  return null;
}
