"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ErrorApi } from "@/lib/api/cliente";
import {
  cerrarSesion,
  enviarCodigo,
  iniciarSesion,
  obtenerUsuarioActual,
  registrar,
  type DatosRegistro,
  type Usuario,
} from "@/lib/api/cuentas";

export const CLAVE_USUARIO = ["cuentas", "yo"] as const;

/**
 * La cuenta de la sesión actual, según el backend (la única fuente de verdad).
 * `usuario` es null si no hay sesión (401), no un error.
 */
export function useUsuarioActual() {
  const consulta = useQuery<Usuario | null>({
    queryKey: CLAVE_USUARIO,
    queryFn: async ({ signal }) => {
      try {
        return await obtenerUsuarioActual(signal);
      } catch (error) {
        if (error instanceof ErrorApi && error.sinSesion) return null;
        throw error;
      }
    },
  });
  return {
    usuario: consulta.data ?? null,
    cargando: consulta.isPending,
    sinSesion: consulta.data === null,
    error: consulta.error,
  };
}

export function useIniciarSesion() {
  const cliente = useQueryClient();
  return useMutation({
    // La caché de TanStack guarda lo que se envió (correo y contraseña): con gcTime 0 se
    // borra apenas termina, en vez de quedarse 5 minutos en memoria.
    gcTime: 0,
    mutationFn: ({ correo, contrasena }: { correo: string; contrasena: string }) =>
      iniciarSesion(correo, contrasena),
    onSuccess: (resultado) => {
      if (!resultado.segundoPaso) cliente.setQueryData(CLAVE_USUARIO, resultado.usuario);
    },
  });
}

export function useEnviarCodigo() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (codigo: string) => enviarCodigo(codigo),
    onSuccess: (usuario) => cliente.setQueryData(CLAVE_USUARIO, usuario),
  });
}

export function useRegistrar() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosRegistro) => registrar(datos),
    onSuccess: (usuario) => cliente.setQueryData(CLAVE_USUARIO, usuario),
  });
}

export function useCerrarSesion() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: () => cerrarSesion(),
    // Aunque falle la red, se borra todo lo guardado de la cuenta en esta pestaña.
    onSettled: () => {
      cliente.clear();
      cliente.setQueryData(CLAVE_USUARIO, null);
    },
  });
}
