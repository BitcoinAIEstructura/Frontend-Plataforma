"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ProveedorAvisos } from "@/componentes/ui/Avisos";
import { ErrorApi } from "@/lib/api/cliente";
import { CLAVE_USUARIO } from "@/lib/hooks/useSesion";

/** Reintentar solo lo que puede arreglarse solo: fallas de red o del servidor (no 4xx). */
export function debeReintentar(intentos: number, error: unknown): boolean {
  if (error instanceof ErrorApi && error.codigo >= 400 && error.codigo < 500) return false;
  return intentos < 2;
}

/**
 * Si una consulta responde 401, la sesión pudo vencer (por ejemplo, dos horas sin usarla).
 * Se vuelve a preguntar quién está conectado: si nadie, el marco manda a iniciar sesión.
 * Solo consultas: en las acciones un 401 también significa "contraseña o código incorrecto".
 */
function alFallarUnaConsulta(cliente: () => QueryClient) {
  return (error: unknown, consulta: { queryKey: readonly unknown[] }) => {
    const esLaDelUsuario =
      consulta.queryKey[0] === CLAVE_USUARIO[0] && consulta.queryKey[1] === CLAVE_USUARIO[1];
    if (error instanceof ErrorApi && error.sinSesion && !esLaDelUsuario) {
      void cliente().invalidateQueries({ queryKey: CLAVE_USUARIO });
    }
  };
}

export function crearClienteDeConsultas(): QueryClient {
  const cliente: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError: alFallarUnaConsulta(() => cliente) }),
    defaultOptions: {
      queries: { staleTime: 30_000, retry: debeReintentar, refetchOnWindowFocus: true },
      mutations: { retry: false },
    },
  });
  return cliente;
}

export function Proveedores({ children }: { children: ReactNode }) {
  // Un cliente por pestaña (no compartido entre peticiones del servidor).
  const [cliente] = useState(crearClienteDeConsultas);
  return (
    <QueryClientProvider client={cliente}>
      <ProveedorAvisos>{children}</ProveedorAvisos>
    </QueryClientProvider>
  );
}
