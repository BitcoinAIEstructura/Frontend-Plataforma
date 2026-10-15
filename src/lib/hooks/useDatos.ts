"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cancelarAlerta, crearAlerta, obtenerAlertas, type Alerta } from "@/lib/api/alertas";
import { obtenerEstructuras } from "@/lib/api/estructuras";
import { obtenerPredicciones, type IntervaloIA } from "@/lib/api/ia";
import { obtenerLiga } from "@/lib/api/liga";
import {
  obtenerIndicador,
  obtenerPrecio,
  obtenerPreciosRecientes,
  obtenerSenal,
  obtenerVelas,
  type Intervalo,
  type NombreIndicador,
} from "@/lib/api/mercado";
import {
  cancelarOrden,
  crearOrden,
  deshacerUltima,
  detenerBot,
  iniciarBot,
  obtenerBot,
  obtenerCartera,
  obtenerHistorial,
  obtenerOrdenes,
  procesarSiguiente,
  type ConfiguracionBot,
  type EstadoBot,
  type NuevaOrden,
} from "@/lib/api/simulacion";
import { CLAVES } from "@/lib/tiempoReal";

/** Cada cuánto refrescar las velas según su intervalo (las de 1 minuto cambian rápido). */
export const REFRESCO_VELAS: Record<Intervalo, number> = {
  "1m": 15_000,
  "5m": 30_000,
  "15m": 60_000,
  "1h": 120_000,
  "4h": 300_000,
  "1d": 600_000,
};

// ---------- mercado ----------

/** Precio actual: lo trae el tiempo real cada 5 s; si la conexión se corta, se pide cada 30 s. */
export function usePrecio() {
  return useQuery({
    queryKey: CLAVES.precio,
    queryFn: ({ signal }) => obtenerPrecio(signal),
    refetchInterval: 30_000,
  });
}

export function useVelas(intervalo: Intervalo, cantidad = 300) {
  return useQuery({
    queryKey: ["mercado", "velas", intervalo, cantidad],
    queryFn: ({ signal }) => obtenerVelas(intervalo, cantidad, signal),
    refetchInterval: REFRESCO_VELAS[intervalo],
    placeholderData: (anterior) => anterior, // al cambiar de intervalo, sin parpadeo
  });
}

export function useIndicador(
  indicador: NombreIndicador,
  intervalo: Intervalo,
  cantidad = 300,
  parametros: Record<string, number> = {},
  activo = true,
) {
  return useQuery({
    queryKey: ["mercado", "indicador", indicador, intervalo, cantidad, parametros],
    queryFn: ({ signal }) => obtenerIndicador(indicador, intervalo, cantidad, parametros, signal),
    refetchInterval: REFRESCO_VELAS[intervalo],
    enabled: activo,
    placeholderData: (anterior) => anterior,
  });
}

export function useSenal(intervalo: Intervalo = "1h") {
  return useQuery({
    queryKey: ["mercado", "senal", intervalo],
    queryFn: ({ signal }) => obtenerSenal(intervalo, signal),
    refetchInterval: 60_000,
  });
}

/** Los últimos precios de la cola circular del servidor. */
export function usePreciosRecientes() {
  return useQuery({
    queryKey: ["mercado", "recientes"],
    queryFn: ({ signal }) => obtenerPreciosRecientes(signal),
    refetchInterval: 10_000,
  });
}

// ---------- estructuras y liga ----------

/** Foto de las estructuras reales (tu cola, tus pilas y las del servidor). */
export function useEstructuras() {
  return useQuery({
    queryKey: ["estructuras"],
    queryFn: ({ signal }) => obtenerEstructuras(signal),
    refetchInterval: 10_000,
  });
}

export function useLiga() {
  return useQuery({
    queryKey: ["liga"],
    queryFn: ({ signal }) => obtenerLiga(signal),
    refetchInterval: 60_000,
  });
}

// ---------- alertas de precio ----------

export function useAlertas() {
  return useQuery({ queryKey: CLAVES.alertas, queryFn: ({ signal }) => obtenerAlertas(signal) });
}

export function useAccionesAlertas() {
  const cliente = useQueryClient();
  const recargar = () => cliente.invalidateQueries({ queryKey: CLAVES.alertas });
  return {
    crear: useMutation({
      mutationFn: ({ tipo, precio }: { tipo: Alerta["tipo"]; precio: number }) => crearAlerta(tipo, precio),
      onSettled: recargar,
    }),
    cancelar: useMutation({ mutationFn: (id: number) => cancelarAlerta(id), onSettled: recargar }),
  };
}

// ---------- inteligencia artificial ----------

/** El backend reentrena cada 10 minutos; antes de eso la respuesta es la misma. */
export function usePredicciones(intervalo: IntervaloIA) {
  return useQuery({
    queryKey: ["ia", intervalo],
    queryFn: ({ signal }) => obtenerPredicciones(intervalo, signal),
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
    placeholderData: (anterior) => anterior,
  });
}

// ---------- simulación ----------

export function useCartera() {
  return useQuery({
    queryKey: CLAVES.cartera,
    queryFn: ({ signal }) => obtenerCartera(signal),
    refetchInterval: 30_000,
  });
}

export function useOrdenes() {
  return useQuery({ queryKey: CLAVES.ordenes, queryFn: obtenerOrdenes });
}

export function useHistorial(limite = 50) {
  return useQuery({ queryKey: [...CLAVES.historial, limite], queryFn: () => obtenerHistorial(limite) });
}

/** Cada cuánto se pregunta por el bot: cada 2 s mientras revisa (o ya le toca), si no cada 15 s. */
export function esperaBot(estado: EstadoBot | undefined, ahora = Date.now()): number {
  if (!estado?.activo) return 15_000;
  const proxima = (estado.ultimoCiclo ?? 0) + estado.configuracion.segundosEntreCiclos * 1000;
  return estado.enCiclo || ahora >= proxima ? 2_000 : 15_000;
}

export function useBot() {
  return useQuery({
    queryKey: CLAVES.bot,
    queryFn: obtenerBot,
    refetchInterval: (consulta) => esperaBot(consulta.state.data),
  });
}

/** Recarga todo lo de la simulación después de una acción del usuario. */
function useRecargarSimulacion() {
  const cliente = useQueryClient();
  return () =>
    Promise.all(
      [CLAVES.ordenes, CLAVES.cartera, CLAVES.historial, CLAVES.bot].map((queryKey) =>
        cliente.invalidateQueries({ queryKey }),
      ),
    );
}

export function useAccionesOrdenes() {
  const recargar = useRecargarSimulacion();
  return {
    crear: useMutation({ mutationFn: (orden: NuevaOrden) => crearOrden(orden), onSettled: recargar }),
    procesar: useMutation({ mutationFn: procesarSiguiente, onSettled: recargar }),
    deshacer: useMutation({ mutationFn: deshacerUltima, onSettled: recargar }),
    cancelar: useMutation({ mutationFn: (id: number) => cancelarOrden(id), onSettled: recargar }),
  };
}

export function useAccionesBot() {
  const recargar = useRecargarSimulacion();
  return {
    iniciar: useMutation({
      mutationFn: (configuracion: Partial<ConfiguracionBot>) => iniciarBot(configuracion),
      onSettled: recargar,
    }),
    detener: useMutation({ mutationFn: detenerBot, onSettled: recargar }),
  };
}
