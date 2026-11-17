"use client";

import { useEffect, useState } from "react";

import type { EstadoBot } from "@/lib/api/simulacion";

/** La hora de ahora, al día cada `cadaMs` (para los relojes que avanzan solos). */
export function useAhora(cadaMs = 1000): number {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), cadaMs);
    return () => clearInterval(reloj);
  }, [cadaMs]);
  return ahora;
}

/** Un reloj: 75 000 ms → "01:15"; con horas, "1:02:05". */
export function reloj(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const dos = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${dos(m)}:${dos(s)}` : `${dos(m)}:${dos(s)}`;
}

/** Cuánto falta, en palabras: "42 s", "3 min 5 s". */
export function falta(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  if (total < 60) return `${total} s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return s ? `${m} min ${s} s` : `${m} min`;
}

/**
 * Con el bot encendido, que se note que trabaja: cuánto lleva encendido (un reloj que
 * avanza), una barra hasta la próxima revisión del mercado y la cuenta regresiva.
 * Mientras revisa (o si ya le tocaba), lo dice en vez de quedarse en 0 s.
 */
export function TrabajoBot({ estado }: { estado: EstadoBot }) {
  const ahora = useAhora();
  if (!estado.activo) return null;

  const espera = estado.configuracion.segundosEntreCiclos * 1000;
  const proxima = estado.ultimoCiclo === null ? null : estado.ultimoCiclo + espera;
  const restante = proxima === null ? 0 : proxima - ahora;
  const revisando = estado.enCiclo || proxima === null || restante <= 0;
  const avance = revisando ? 100 : Math.min(100, Math.max(0, (1 - restante / espera) * 100));

  return (
    <div className="mb-5 rounded-lg border border-exito/40 bg-exito/5 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="flex items-center gap-2.5 text-lg font-semibold text-texto">
          {revisando ? (
            <span
              aria-hidden
              className="size-5 animate-spin rounded-full border-2 border-exito border-t-transparent"
            />
          ) : (
            <span aria-hidden className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-exito opacity-60" />
              <span className="relative inline-flex size-3 rounded-full bg-exito" />
            </span>
          )}
          {/* Solo este texto se anuncia, y solo cuando cambia (no cada segundo). */}
          <span aria-live="polite">{revisando ? "Revisando el mercado…" : "Trabajando"}</span>
        </p>
        {estado.encendidoDesde !== null && (
          <p className="text-sm text-texto-secundario">
            Encendido hace{" "}
            <span role="timer" className="cifra font-semibold text-texto">
              {reloj(ahora - estado.encendidoDesde)}
            </span>
          </p>
        )}
      </div>

      <div
        role="progressbar"
        aria-label="Tiempo hasta la próxima revisión"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(avance)}
        className="mt-3 h-2 overflow-hidden rounded-full bg-superficie-alta"
      >
        <div
          className={`h-full rounded-full bg-exito transition-[width] duration-1000 ease-linear ${revisando ? "animate-pulse" : ""}`}
          style={{ width: `${avance}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-texto-secundario">
        {revisando ? (
          "Está leyendo las velas y el precio para decidir. Tarda unos segundos."
        ) : (
          <>
            Próxima revisión en <span className="cifra font-semibold text-texto">{falta(restante)}</span>. No
            tienes que hacer nada: puedes salir de esta página y el bot sigue.
          </>
        )}
      </p>
    </div>
  );
}
