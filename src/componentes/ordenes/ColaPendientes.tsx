"use client";

import { useEffect, useState } from "react";

import { Boton } from "@/componentes/ui/Boton";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { Orden } from "@/lib/api/simulacion";
import { haceCuanto } from "@/lib/formato";
import { useAccionesOrdenes } from "@/lib/hooks/useDatos";

import { EtiquetaEstado, montoOrden, origenOrden, TipoOrden } from "./textos";

/**
 * La cola de órdenes pendientes (FIFO): se ejecuta la del frente. "Deshacer" saca la
 * última creada (una pila), y cada una se puede cancelar mientras espera.
 */
export function ColaPendientes({ cola, botActivo }: { cola: readonly Orden[]; botActivo: boolean }) {
  const { procesar, deshacer, cancelar } = useAccionesOrdenes();
  const hayPendientes = cola.some((o) => o.estado === "PENDIENTE");
  // Solo se muestra lo de la última acción (ejecutar, deshacer o cancelar).
  const [ultimo, setUltimo] = useState<{ orden: Orden } | { error: string } | null>(null);
  const alTerminar = {
    onSuccess: (orden: Orden) => setUltimo({ orden }),
    onError: (e: Error) => setUltimo({ error: e.message }),
  };
  const ejecutar = () => procesar.mutate(undefined, alTerminar);
  const deshacerUltima = () => deshacer.mutate(undefined, alTerminar);

  // Ctrl + Z (⌘ + Z en Mac) deshace la última orden, salvo mientras se escribe en una casilla.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      const enCasilla =
        e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]");
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z" && !enCasilla) {
        e.preventDefault();
        if (hayPendientes && !deshacer.isPending) deshacer.mutate(undefined, alTerminar);
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  });

  return (
    <Tarjeta
      titulo="Cola de pendientes"
      extra={<span className="cifra text-sm text-texto-atenuado">{cola.length} en espera</span>}
    >
      <p className="mb-4 text-sm text-texto-secundario">
        Se ejecutan en orden de llegada, al precio del momento.{" "}
        {botActivo ? "Tu bot las ejecuta al final de cada ciclo." : "Ejecútalas tú o enciende el bot."}
      </p>

      {cola.length === 0 ? (
        <p className="rounded-xl border border-dashed border-borde py-8 text-center text-sm text-texto-atenuado">
          No hay órdenes esperando.
        </p>
      ) : (
        <ol className="flex flex-col gap-2" aria-label="Órdenes en la cola, de la primera a la última">
          {cola.map((orden, i) => (
            <li
              key={orden.id}
              className={
                "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border px-4 py-3 " +
                (i === 0 ? "border-oro/50 bg-oro/5" : "border-borde")
              }
            >
              <span className="cifra text-xs text-texto-atenuado">
                {i === 0 ? "1º · sigue" : `${i + 1}º`}
              </span>
              <TipoOrden tipo={orden.tipo} />
              <span className="cifra text-texto">{montoOrden(orden)}</span>
              <EtiquetaEstado estado={orden.estado} />
              <span className="text-xs text-texto-atenuado">
                {origenOrden(orden.motivo)} · {haceCuanto(orden.creadaEn)}
              </span>
              {orden.estado === "PENDIENTE" && (
                <button
                  type="button"
                  onClick={() => cancelar.mutate(orden.id, alTerminar)}
                  disabled={cancelar.isPending}
                  className="ml-auto rounded-lg px-2 py-1 text-sm font-medium text-texto-secundario hover:bg-error/10 hover:text-error"
                  aria-label={`Cancelar la orden #${orden.id}`}
                >
                  Cancelar
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <Boton onClick={ejecutar} cargando={procesar.isPending} disabled={!hayPendientes}>
          Ejecutar siguiente
        </Boton>
        <Boton
          variante="contorno"
          onClick={deshacerUltima}
          cargando={deshacer.isPending}
          disabled={!hayPendientes}
          title="Atajo: Ctrl + Z"
        >
          ↶ Deshacer última
        </Boton>
      </div>

      {ultimo && "error" in ultimo && (
        <p role="alert" className="mt-3 text-sm font-medium text-error">
          {ultimo.error}
        </p>
      )}
      {ultimo && "orden" in ultimo && (
        <p role="status" className="mt-3 flex flex-wrap items-center gap-2 text-sm text-texto-secundario">
          Orden #{ultimo.orden.id} <EtiquetaEstado estado={ultimo.orden.estado} />
          {ultimo.orden.detalle}
        </p>
      )}
    </Tarjeta>
  );
}
