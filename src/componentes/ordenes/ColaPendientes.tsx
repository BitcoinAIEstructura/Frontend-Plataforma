"use client";

import { useEffect, useState } from "react";

import { Boton } from "@/componentes/ui/Boton";
import { Confirmar } from "@/componentes/ui/Dialogo";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { Orden } from "@/lib/api/simulacion";
import { haceCuanto } from "@/lib/formato";
import { useAccionesOrdenes } from "@/lib/hooks/useDatos";

import { EtiquetaEstado, montoOrden, origenOrden, TipoOrden } from "./textos";

/** "la compra #3 de 500,00 USDT", para decir en la confirmación qué se va a quitar. */
function nombreOrden(orden: Orden): string {
  return `la ${orden.tipo === "COMPRA" ? "compra" : "venta"} #${orden.id} de ${montoOrden(orden)}`;
}

/** Qué se va a confirmar: deshacer la última o cancelar una en particular. */
type Pregunta = { tipo: "deshacer"; orden: Orden } | { tipo: "cancelar"; orden: Orden };

/**
 * La cola de órdenes pendientes (FIFO): se ejecuta la del frente. "Deshacer" saca la
 * última creada (una pila), y cada una se puede cancelar mientras espera. Las dos cosas
 * piden confirmar en una ventana que dice exactamente qué orden se quita.
 */
export function ColaPendientes({ cola, botActivo }: { cola: readonly Orden[]; botActivo: boolean }) {
  const { procesar, deshacer, cancelar } = useAccionesOrdenes();
  const pendientes = cola.filter((o) => o.estado === "PENDIENTE");
  const hayPendientes = pendientes.length > 0;
  // La que saca «Deshacer»: la última creada que sigue pendiente.
  const ultimaCreada = pendientes.reduce<Orden | undefined>((u, o) => (!u || o.id > u.id ? o : u), undefined);
  // Solo se muestra lo de la última acción (ejecutar, deshacer o cancelar).
  const [ultimo, setUltimo] = useState<{ orden: Orden } | { error: string } | null>(null);
  const [pregunta, setPregunta] = useState<Pregunta | null>(null);
  const [errorPregunta, setErrorPregunta] = useState<string | null>(null);

  const ejecutar = () =>
    procesar.mutate(undefined, {
      onSuccess: (orden) => setUltimo({ orden }),
      onError: (e) => setUltimo({ error: e.message }),
    });

  const preguntar = (p: Pregunta) => {
    setErrorPregunta(null);
    setPregunta(p);
  };

  const confirmar = () => {
    if (!pregunta) return;
    const alTerminar = {
      onSuccess: (orden: Orden) => {
        setUltimo({ orden });
        setPregunta(null);
      },
      onError: (e: Error) => setErrorPregunta(e.message),
    };
    if (pregunta.tipo === "deshacer") deshacer.mutate(undefined, alTerminar);
    else cancelar.mutate(pregunta.orden.id, alTerminar);
  };

  // Ctrl + Z (⌘ + Z en Mac) también pregunta antes de deshacer, salvo mientras se escribe.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      const enCasilla =
        e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]");
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z" && !enCasilla) {
        e.preventDefault();
        if (ultimaCreada && !pregunta) preguntar({ tipo: "deshacer", orden: ultimaCreada });
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
      <p className="mb-4 text-sm leading-relaxed text-texto-secundario">
        Tus órdenes esperan aquí y se ejecutan en el orden en que llegaron, al precio de ese momento.{" "}
        {botActivo
          ? "Tu bot las ejecuta cada vez que revisa el mercado."
          : "Ejecútalas tú con «Ejecutar siguiente» o enciende el bot para que lo haga solo."}
      </p>

      {cola.length === 0 ? (
        <p className="rounded-xl border border-dashed border-borde px-4 py-8 text-center text-sm text-texto-atenuado">
          No hay órdenes esperando. Crea una con el formulario «Nueva orden».
        </p>
      ) : (
        <ol className="flex flex-col gap-2.5" aria-label="Órdenes en la cola, de la primera a la última">
          {cola.map((orden, i) => (
            <li
              key={orden.id}
              className={
                "flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border px-4 py-3.5 " +
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
                  onClick={() => preguntar({ tipo: "cancelar", orden })}
                  className="ml-auto min-h-9 rounded-lg px-3 text-sm font-medium text-texto-secundario hover:bg-error/10 hover:text-error"
                  aria-label={`Cancelar la orden #${orden.id}`}
                >
                  Cancelar
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Boton onClick={ejecutar} cargando={procesar.isPending} disabled={!hayPendientes}>
          Ejecutar siguiente
        </Boton>
        <Boton
          variante="contorno"
          onClick={() => ultimaCreada && preguntar({ tipo: "deshacer", orden: ultimaCreada })}
          disabled={!ultimaCreada}
          title="Atajo: Ctrl + Z"
        >
          ↶ Deshacer última
        </Boton>
      </div>
      {!hayPendientes && (
        <p className="mt-2 text-xs text-texto-atenuado">
          Estos botones se activan cuando hay órdenes en la cola.
        </p>
      )}

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

      <Confirmar
        abierto={pregunta !== null}
        alCancelar={() => setPregunta(null)}
        alConfirmar={confirmar}
        cargando={deshacer.isPending || cancelar.isPending}
        error={errorPregunta}
        titulo={pregunta?.tipo === "deshacer" ? "¿Deshacer la última orden?" : "¿Cancelar esta orden?"}
        descripcion={
          pregunta && (
            <p>
              Vas a quitar <strong className="font-semibold text-texto">{nombreOrden(pregunta.orden)}</strong>{" "}
              de la cola. No se ejecutará y no se puede recuperar; si la quieres otra vez, tendrás que crearla
              de nuevo. Tu dinero no se mueve.
            </p>
          )
        }
        confirmar={pregunta?.tipo === "deshacer" ? "Sí, deshacer" : "Sí, cancelar la orden"}
      />
    </Tarjeta>
  );
}
