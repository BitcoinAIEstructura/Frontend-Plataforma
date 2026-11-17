"use client";

import Link from "next/link";

import { TablaOrdenes } from "@/componentes/ordenes/TablaOrdenes";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { useOrdenes } from "@/lib/hooks/useDatos";

export const CUANTAS = 8;

/** Las últimas órdenes terminadas, en tabla, con enlace al registro completo. */
export function UltimasOrdenes() {
  const ordenes = useOrdenes();
  const terminadas = (ordenes.data ?? [])
    .filter((o) => o.estado !== "PENDIENTE" && o.estado !== "PROCESANDO")
    .toSorted((a, b) => (b.ejecutadaEn ?? b.creadaEn) - (a.ejecutadaEn ?? a.creadaEn))
    .slice(0, CUANTAS);

  return (
    <Tarjeta
      titulo="Últimas órdenes"
      extra={
        <Link href="/ordenes" className="text-sm font-medium text-oro hover:underline">
          Ver todas
        </Link>
      }
    >
      {ordenes.isError ? (
        <p role="alert" className="text-error">
          {ordenes.error.message}
        </p>
      ) : ordenes.isPending ? (
        <p role="status" className="text-texto-secundario">
          Cargando órdenes…
        </p>
      ) : terminadas.length === 0 ? (
        <p className="py-6 text-center text-sm text-texto-atenuado">
          Aún no tienes órdenes.{" "}
          <Link href="/ordenes" className="font-medium text-oro hover:underline">
            Haz la primera
          </Link>{" "}
          con tus 10.000 USDT de práctica.
        </p>
      ) : (
        <TablaOrdenes ordenes={terminadas} titulo="Últimas órdenes terminadas" />
      )}
    </Tarjeta>
  );
}
