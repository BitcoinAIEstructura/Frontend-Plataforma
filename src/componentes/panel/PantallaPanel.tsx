"use client";

import { ConsejoIA } from "@/componentes/ia/ConsejoIA";

import { GraficaPanel } from "./GraficaPanel";
import { TarjetaSenal } from "./MedidorSenal";
import { ResumenCartera } from "./ResumenCartera";
import { TarjetaEstadisticas } from "./TarjetaEstadisticas";
import { TarjetaEvolucion } from "./TarjetaEvolucion";
import { UltimasOrdenes } from "./UltimasOrdenes";

/**
 * Panel principal, ordenado como un terminal: las cifras de la cartera en una franja, la
 * gráfica del precio como protagonista con la IA y la señal al lado, y debajo las últimas
 * órdenes, la evolución de la cartera y tus resultados.
 */
export function PantallaPanel() {
  return (
    <div className="flex flex-col gap-4">
      <ResumenCartera />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <GraficaPanel />
        <div className="flex flex-col gap-4">
          <ConsejoIA compacto />
          <TarjetaSenal />
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <UltimasOrdenes />
        <TarjetaEvolucion />
      </div>
      <TarjetaEstadisticas />
    </div>
  );
}
