import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { vi } from "vitest";

export const USUARIO_PRUEBA = {
  id: 1,
  nombre: "Ana",
  apellido: "Pérez",
  correo: "ana@correo.co",
  tipoDocumento: "CC" as const,
  documento: "******6789",
  telefono: "+57******4567",
  verificacionDosPasos: false,
  creadoEn: 1791604997952,
};

export function clienteDePrueba(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function envoltorio(cliente: QueryClient) {
  return function Envoltorio({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={cliente}>{children}</QueryClientProvider>;
  };
}

export function renderizar(ui: ReactElement, opciones?: RenderOptions & { cliente?: QueryClient }) {
  const cliente = opciones?.cliente ?? clienteDePrueba();
  return { cliente, ...render(ui, { wrapper: envoltorio(cliente), ...opciones }) };
}

export function renderizarGancho<T>(gancho: () => T, cliente = clienteDePrueba()) {
  return { cliente, ...renderHook(gancho, { wrapper: envoltorio(cliente) }) };
}

type Respuesta = { estado: number; cuerpo?: unknown; encabezados?: Record<string, string> };

/**
 * fetch falso que responde según "MÉTODO /ruta". Devuelve el mock para revisar las llamadas.
 * Rutas no definidas responden 404.
 */
export function servidorFalso(rutas: Record<string, Respuesta | ((cuerpo: unknown) => Respuesta)>) {
  const falso = vi.fn(async (ruta: string, opciones?: RequestInit) => {
    const clave = `${opciones?.method ?? "GET"} ${ruta.split("?")[0]}`;
    const definida = rutas[clave];
    const cuerpo = typeof opciones?.body === "string" ? (JSON.parse(opciones.body) as unknown) : undefined;
    const r =
      typeof definida === "function"
        ? definida(cuerpo)
        : (definida ?? { estado: 404, cuerpo: { error: "no" } });
    return new Response(r.cuerpo === undefined ? null : JSON.stringify(r.cuerpo), {
      status: r.estado,
      headers: { "Content-Type": "application/json", ...r.encabezados },
    });
  });
  vi.stubGlobal("fetch", falso);
  return falso;
}
