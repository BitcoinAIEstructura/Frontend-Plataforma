/**
 * Cuentas y seguridad: registro, sesión y centro de seguridad.
 * Las formas salen de la sección "Cuentas y seguridad" de docs/API.md del backend.
 */
import { z } from "zod";

import { pedir } from "./cliente";

export const esquemaUsuario = z.object({
  id: z.number().int(),
  nombre: z.string(),
  apellido: z.string(),
  correo: z.string(),
  tipoDocumento: z.enum(["CC", "CE"]),
  documento: z.string(), // ya viene enmascarado: "******6789"
  telefono: z.string(), // enmascarado: "+57******4567"
  verificacionDosPasos: z.boolean(),
  creadoEn: z.number(),
});
export type Usuario = z.infer<typeof esquemaUsuario>;

const esquemaConUsuario = z.object({ usuario: esquemaUsuario });

/** Falta confirmar el correo: llegó un código a ese correo (viene enmascarado: "a***@correo.co"). */
const esquemaFaltaCorreo = z.object({ verificarCorreo: z.literal(true), correo: z.string() });

export const esquemaInicio = z.union([
  z.object({ segundoPaso: z.literal(true) }),
  esquemaFaltaCorreo.extend({ segundoPaso: z.literal(false) }),
  z.object({ segundoPaso: z.literal(false), usuario: esquemaUsuario }),
]);
export type ResultadoInicio = z.infer<typeof esquemaInicio>;

/** El registro pide confirmar el correo (lo normal) o, sin envío de correos, deja la sesión abierta. */
export const esquemaRegistro = z.union([
  esquemaFaltaCorreo,
  z.object({ verificarCorreo: z.literal(false).optional(), usuario: esquemaUsuario }),
]);
export type ResultadoRegistro = z.infer<typeof esquemaRegistro>;

export const esquemaConfiguracionDosPasos = z.object({ secreto: z.string(), uri: z.string() });
export const esquemaCodigosRespaldo = z.object({ codigosRespaldo: z.array(z.string()) });

export const esquemaSesion = z.object({
  id: z.number().int(),
  actual: z.boolean(),
  ip: z.string(),
  agente: z.string(),
  creadaEn: z.number(),
  ultimaActividad: z.number(),
  expiraEn: z.number(),
});
export type SesionAbierta = z.infer<typeof esquemaSesion>;

export const esquemaEventoActividad = z.object({
  momento: z.number(),
  tipo: z.string(),
  descripcion: z.string(),
  ip: z.string(),
  detalle: z.string(),
});
export type EventoActividad = z.infer<typeof esquemaEventoActividad>;

export type TipoDocumento = Usuario["tipoDocumento"];

export interface DatosRegistro {
  nombre: string;
  apellido: string;
  correo: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  contrasena: string;
}

// ---------- registro y sesión ----------

export function registrar(datos: DatosRegistro): Promise<ResultadoRegistro> {
  return pedir("/api/cuentas/registro", esquemaRegistro, { metodo: "POST", cuerpo: datos });
}

/** El código de 6 dígitos que llegó al correo: confirma la cuenta y abre la sesión. */
export async function verificarCorreo(codigo: string): Promise<Usuario> {
  return (
    await pedir("/api/cuentas/verificar-correo", esquemaConUsuario, { metodo: "POST", cuerpo: { codigo } })
  ).usuario;
}

/** Manda otro código (uno por minuto). Devuelve el correo enmascarado. */
export async function reenviarCodigo(): Promise<string> {
  return (await pedir("/api/cuentas/reenviar-codigo", z.object({ correo: z.string() }), { metodo: "POST" }))
    .correo;
}

export function iniciarSesion(correo: string, contrasena: string): Promise<ResultadoInicio> {
  return pedir("/api/sesion", esquemaInicio, { metodo: "POST", cuerpo: { correo, contrasena } });
}

export async function enviarCodigo(codigo: string): Promise<Usuario> {
  return (await pedir("/api/sesion/codigo", esquemaConUsuario, { metodo: "POST", cuerpo: { codigo } }))
    .usuario;
}

export function cerrarSesion(): Promise<void> {
  return pedir("/api/sesion", null, { metodo: "DELETE" });
}

export async function obtenerUsuarioActual(senal?: AbortSignal): Promise<Usuario> {
  return (await pedir("/api/cuentas/yo", esquemaConUsuario, { senal })).usuario;
}

// ---------- centro de seguridad ----------

export function iniciarDosPasos() {
  return pedir("/api/cuentas/dos-pasos", esquemaConfiguracionDosPasos, { metodo: "POST" });
}

export async function confirmarDosPasos(codigo: string): Promise<string[]> {
  const r = await pedir("/api/cuentas/dos-pasos/confirmar", esquemaCodigosRespaldo, {
    metodo: "POST",
    cuerpo: { codigo },
  });
  return r.codigosRespaldo;
}

export function desactivarDosPasos(contrasena: string, codigo: string): Promise<void> {
  return pedir("/api/cuentas/dos-pasos/desactivar", null, { metodo: "POST", cuerpo: { contrasena, codigo } });
}

export async function regenerarCodigos(codigo: string): Promise<string[]> {
  const r = await pedir("/api/cuentas/dos-pasos/codigos", esquemaCodigosRespaldo, {
    metodo: "POST",
    cuerpo: { codigo },
  });
  return r.codigosRespaldo;
}

export async function obtenerSesiones(): Promise<SesionAbierta[]> {
  return (await pedir("/api/cuentas/sesiones", z.object({ sesiones: z.array(esquemaSesion) }))).sesiones;
}

export function cerrarSesionPorId(id: number): Promise<void> {
  return pedir(`/api/cuentas/sesiones/${encodeURIComponent(String(id))}`, null, { metodo: "DELETE" });
}

export async function cerrarOtrasSesiones(): Promise<number> {
  return (
    await pedir("/api/cuentas/sesiones/cerrar-otras", z.object({ cerradas: z.number() }), { metodo: "POST" })
  ).cerradas;
}

export async function obtenerActividad(limite = 50): Promise<EventoActividad[]> {
  const r = await pedir(
    `/api/cuentas/actividad?limite=${limite}`,
    z.object({ eventos: z.array(esquemaEventoActividad) }),
  );
  return r.eventos;
}

export function cambiarContrasena(contrasenaActual: string, contrasenaNueva: string): Promise<void> {
  return pedir("/api/cuentas/contrasena", null, {
    metodo: "POST",
    cuerpo: { contrasenaActual, contrasenaNueva },
  });
}
