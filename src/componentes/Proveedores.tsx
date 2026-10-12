"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ErrorApi } from "@/lib/api/cliente";

/** Reintentar solo lo que puede arreglarse solo: fallas de red o del servidor (no 4xx). */
export function debeReintentar(intentos: number, error: unknown): boolean {
  if (error instanceof ErrorApi && error.codigo >= 400 && error.codigo < 500) return false;
  return intentos < 2;
}

export function crearClienteDeConsultas(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: debeReintentar, refetchOnWindowFocus: true },
      mutations: { retry: false },
    },
  });
}

export function Proveedores({ children }: { children: ReactNode }) {
  // Un cliente por pestaña (no compartido entre peticiones del servidor).
  const [cliente] = useState(crearClienteDeConsultas);
  return <QueryClientProvider client={cliente}>{children}</QueryClientProvider>;
}
