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

export const esquemaInicio = z.union([
  z.object({ segundoPaso: z.literal(true) }),
  z.object({ segundoPaso: z.literal(false), usuario: esquemaUsuario }),
]);
export type ResultadoInicio = z.infer<typeof esquemaInicio>;

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

export async function registrar(datos: DatosRegistro): Promise<Usuario> {
  return (await pedir("/api/cuentas/registro", esquemaConUsuario, { metodo: "POST", cuerpo: datos })).usuario;
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
