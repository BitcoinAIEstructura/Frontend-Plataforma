"use client";

import { useState } from "react";

import { Segmentado } from "@/componentes/ui/Segmentado";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { Orden } from "@/lib/api/simulacion";
import { btc, fechaHora, usdt } from "@/lib/formato";

import { EtiquetaEstado, montoOrden, origenOrden, TipoOrden } from "./textos";

type Filtro = "todas" | "EJECUTADA" | "CANCELADA" | "RECHAZADA";

const FILTROS: { valor: Filtro; etiqueta: string }[] = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "EJECUTADA", etiqueta: "Ejecutadas" },
  { valor: "CANCELADA", etiqueta: "Canceladas" },
  { valor: "RECHAZADA", etiqueta: "Rechazadas" },
];

const POR_PAGINA = 10;

/** Las órdenes terminadas, de la más reciente a la más vieja. */
export function RegistroOrdenes({ registro }: { registro: readonly Orden[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [visibles, setVisibles] = useState(POR_PAGINA);
  const filtradas = filtro === "todas" ? registro : registro.filter((o) => o.estado === filtro);

  return (
    <Tarjeta titulo="Registro de órdenes">
      <Segmentado
        etiqueta="Filtrar por estado"
        opciones={FILTROS}
        valor={filtro}
        alCambiar={(f) => {
          setFiltro(f);
          setVisibles(POR_PAGINA);
        }}
        className="mb-4"
      />

      {filtradas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-borde py-8 text-center text-sm text-texto-atenuado">
          {registro.length === 0 ? "Aún no has terminado ninguna orden." : "No hay órdenes con ese estado."}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-borde" aria-label="Órdenes terminadas">
          {filtradas.slice(0, visibles).map((o) => (
            <li key={o.id} className="flex flex-col gap-1 py-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="cifra text-xs text-texto-atenuado">#{o.id}</span>
                <TipoOrden tipo={o.tipo} />
                <span className="cifra text-texto">{montoOrden(o)}</span>
                <EtiquetaEstado estado={o.estado} />
                <span className="ml-auto text-xs text-texto-atenuado">
                  {origenOrden(o.motivo)} · {fechaHora(o.ejecutadaEn ?? o.creadaEn)}
                </span>
              </div>
              {o.estado === "EJECUTADA" && o.precioEjecucion != null ? (
                <p className="cifra text-sm text-texto-secundario">
                  {btc(o.cantidadBtc)} BTC a {usdt(o.precioEjecucion)} · comisión {usdt(o.comision)} USDT
                </p>
              ) : (
                o.detalle && <p className="text-sm text-texto-secundario">{o.detalle}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {filtradas.length > visibles && (
        <button
          type="button"
          onClick={() => setVisibles((v) => v + POR_PAGINA)}
          className="mt-3 w-full rounded-xl py-2 text-sm font-medium text-oro hover:bg-oro/10"
        >
          Ver más ({filtradas.length - visibles} restantes)
        </button>
      )}
    </Tarjeta>
  );
}
