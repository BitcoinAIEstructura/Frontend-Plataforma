"use client";

import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useAvisos } from "@/componentes/ui/Avisos";
import { esquemaAlerta, type Alerta } from "@/lib/api/alertas";
import { esquemaDecision, esquemaPrecio } from "@/lib/api/mercado";
import { esquemaCartera, esquemaOrden } from "@/lib/api/simulacion";

/** Claves de caché que el tiempo real mantiene al día. */
export const CLAVES = {
  precio: ["mercado", "precio"] as const,
  cartera: ["simulacion", "cartera"] as const,
  ordenes: ["simulacion", "ordenes"] as const,
  historial: ["simulacion", "historial"] as const,
  bot: ["simulacion", "bot"] as const,
  senalBot: ["simulacion", "senal-bot"] as const,
  alertas: ["alertas"] as const,
};

export type EstadoConexion = "conectando" | "en-vivo" | "reconectando";

/**
 * Aplica un evento del stream a la caché. Devuelve false si el evento no es válido
 * (se ignora en vez de romper la pantalla).
 */
export function aplicarEvento(
  cliente: QueryClient,
  tipo: string,
  texto: string,
  alCumplirseAlerta?: (alerta: Alerta) => void,
): boolean {
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return false;
  }
  switch (tipo) {
    case "precio": {
      const r = esquemaPrecio.safeParse(datos);
      if (r.success) cliente.setQueryData(CLAVES.precio, r.data);
      return r.success;
    }
    case "cartera": {
      const r = esquemaCartera.safeParse(datos);
      if (r.success) cliente.setQueryData(CLAVES.cartera, r.data);
      return r.success;
    }
    case "orden": {
      const r = esquemaOrden.safeParse(datos);
      if (r.success) {
        void cliente.invalidateQueries({ queryKey: CLAVES.ordenes });
        void cliente.invalidateQueries({ queryKey: CLAVES.historial });
      }
      return r.success;
    }
    case "senal": {
      const r = esquemaDecision.safeParse(datos);
      if (r.success) {
        cliente.setQueryData(CLAVES.senalBot, r.data);
        void cliente.invalidateQueries({ queryKey: CLAVES.bot });
        void cliente.invalidateQueries({ queryKey: CLAVES.historial });
      }
      return r.success;
    }
    case "alerta": {
      const r = esquemaAlerta.safeParse(datos);
      if (r.success) {
        void cliente.invalidateQueries({ queryKey: CLAVES.alertas });
        alCumplirseAlerta?.(r.data);
      }
      return r.success;
    }
    default:
      return false;
  }
}

const PRECIO = new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** El texto del aviso cuando se cumple una alerta. */
export function textoAlerta(alerta: Alerta): { titulo: string; texto: string } {
  const sube = alerta.tipo === "SUBE_A";
  return {
    titulo: `${sube ? "▲" : "▼"} El BTC ${sube ? "subió" : "bajó"} a ${PRECIO.format(alerta.precio)}`,
    texto: `Tu alerta se cumplió: ahora está en ${PRECIO.format(alerta.precioDisparo ?? alerta.precio)} USDT.`,
  };
}

const ContextoConexion = createContext<EstadoConexion>("conectando");

/** El estado de la conexión en vivo ("en-vivo", "conectando"…), para mostrarlo en pantalla. */
export function useEstadoConexion(): EstadoConexion {
  return useContext(ContextoConexion);
}

/**
 * Abre UNA conexión SSE a /api/stream (mismo sitio, con la cookie de sesión) y
 * reparte sus eventos. Si se corta, el navegador reintenta solo (retry: 5000).
 */
export function ProveedorTiempoReal({ children }: { children: ReactNode }) {
  const cliente = useQueryClient();
  const avisar = useAvisos();
  const [estado, setEstado] = useState<EstadoConexion>("conectando");

  useEffect(() => {
    if (typeof EventSource === "undefined") return;
    const fuente = new EventSource("/api/stream", { withCredentials: true });
    const tipos = ["precio", "cartera", "orden", "senal", "alerta"] as const;
    const oyentes = tipos.map((tipo) => {
      const oyente = (e: MessageEvent<string>) =>
        aplicarEvento(cliente, tipo, e.data, (a) => avisar({ tipo: "alerta", ...textoAlerta(a) }));
      fuente.addEventListener(tipo, oyente);
      return [tipo, oyente] as const;
    });
    fuente.onopen = () => setEstado("en-vivo");
    fuente.onerror = () =>
      setEstado(fuente.readyState === EventSource.CLOSED ? "reconectando" : "conectando");
    return () => {
      for (const [tipo, oyente] of oyentes) fuente.removeEventListener(tipo, oyente);
      fuente.close();
    };
  }, [cliente, avisar]);

  return <ContextoConexion.Provider value={estado}>{children}</ContextoConexion.Provider>;
}
