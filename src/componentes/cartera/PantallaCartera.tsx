"use client";

import Link from "next/link";

import { ConsejoIA } from "@/componentes/ia/ConsejoIA";
import { ResumenCartera } from "@/componentes/panel/ResumenCartera";
import { clasesBoton } from "@/componentes/ui/Boton";
import { ColumnaPareja } from "@/componentes/ui/Tarjeta";
import { useCartera } from "@/lib/hooks/useDatos";

import { DetallePosicion } from "./DetallePosicion";
import { HistorialEventos } from "./HistorialEventos";

/** Cartera: las cifras, la posición en detalle y el historial de movimientos. */
export function PantallaCartera() {
  const cartera = useCartera();
  return (
    <div className="flex flex-col gap-4">
      <ResumenCartera />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {cartera.data && <DetallePosicion cartera={cartera.data} />}
          <ConsejoIA compacto />
          <div className="flex flex-wrap gap-3">
            <Link href="/ordenes" className={clasesBoton("dorado")}>
              Nueva orden
            </Link>
            <Link href="/mercado" className={clasesBoton("contorno")}>
              Ver el mercado
            </Link>
          </div>
        </div>
        <ColumnaPareja>
          <HistorialEventos />
        </ColumnaPareja>
      </div>
    </div>
  );
}
