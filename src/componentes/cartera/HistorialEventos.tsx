"use client";

import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { EventoSimulacion } from "@/lib/api/simulacion";
import { fechaHora, haceCuanto } from "@/lib/formato";
import { useHistorial } from "@/lib/hooks/useDatos";

/** Ícono y nombre de cada tipo de evento (docs/API.md, "Tipos de evento"). */
const TIPOS: Record<string, { icono: string; nombre: string; clase: string }> = {
  ORDEN_CREADA: { icono: "＋", nombre: "Orden creada", clase: "text-oro" },
  ORDEN_EJECUTADA: { icono: "✓", nombre: "Orden ejecutada", clase: "text-exito" },
  ORDEN_CANCELADA: { icono: "✕", nombre: "Orden cancelada", clase: "text-texto-atenuado" },
  ORDEN_DESHECHA: { icono: "↶", nombre: "Orden deshecha", clase: "text-texto-atenuado" },
  ORDEN_RECHAZADA: { icono: "!", nombre: "Orden rechazada", clase: "text-error" },
  DECISION_BOT: { icono: "✦", nombre: "Decisión del bot", clase: "text-violeta" },
  STOP_LOSS: { icono: "▼", nombre: "Stop-loss", clase: "text-baja" },
  TAKE_PROFIT: { icono: "▲", nombre: "Take-profit", clase: "text-sube" },
  BOT_INICIADO: { icono: "▶", nombre: "Bot encendido", clase: "text-oro" },
  BOT_DETENIDO: { icono: "■", nombre: "Bot detenido", clase: "text-texto-atenuado" },
  ERROR_BOT: { icono: "⚠", nombre: "Error del bot", clase: "text-error" },
};

const DESCONOCIDO = { icono: "•", nombre: "Evento", clase: "text-texto-atenuado" };

export function aspectoEvento(tipo: string) {
  return TIPOS[tipo] ?? DESCONOCIDO;
}

/** Lista de eventos, del más reciente al más viejo (así sale de la pila del backend). */
export function ListaEventos({ eventos }: { eventos: readonly EventoSimulacion[] }) {
  if (eventos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-borde py-8 text-center text-sm text-texto-atenuado">
        Todavía no hay movimientos. Cuando crees una orden o enciendas el bot, aparecerán aquí.
      </p>
    );
  }
  return (
    <ol
      className="relative flex flex-col gap-4 border-l border-borde pl-5"
      aria-label="Movimientos, del más reciente al más viejo"
    >
      {eventos.map((e, i) => {
        const a = aspectoEvento(e.tipo);
        return (
          <li key={`${e.momento}-${i}`} className="relative">
            <span
              aria-hidden
              className={`absolute top-0.5 -left-[1.95rem] grid size-5 place-items-center rounded-full bg-superficie-alta text-xs ${a.clase}`}
            >
              {a.icono}
            </span>
            <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
              <span className={`font-semibold ${a.clase}`}>{a.nombre}</span>
              <time
                dateTime={new Date(e.momento).toISOString()}
                title={fechaHora(e.momento)}
                className="text-xs text-texto-atenuado"
              >
                {haceCuanto(e.momento)}
              </time>
            </p>
            <p className="text-sm text-texto-secundario">{e.descripcion}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function HistorialEventos() {
  const historial = useHistorial(50);
  return (
    <Tarjeta
      titulo="Historial"
      extra={<span className="text-xs text-texto-atenuado">Una pila: lo último queda arriba</span>}
    >
      {historial.data ? (
        <ListaEventos eventos={historial.data} />
      ) : historial.isError ? (
        <p role="alert" className="text-error">
          {historial.error.message}
        </p>
      ) : (
        <p role="status" className="text-texto-secundario">
          Cargando el historial…
        </p>
      )}
    </Tarjeta>
  );
}
