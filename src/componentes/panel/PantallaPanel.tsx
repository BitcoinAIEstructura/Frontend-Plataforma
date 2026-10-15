"use client";

import { PrecioEnVivo } from "@/componentes/mercado/PrecioEnVivo";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { useVelas } from "@/lib/hooks/useDatos";

import { Bienvenida } from "./Bienvenida";
import { TarjetaSenal } from "./MedidorSenal";
import { ResumenCartera } from "./ResumenCartera";
import { TarjetaEvolucion } from "./TarjetaEvolucion";

/** Panel principal: saludo, cifras de la cartera, precio, evolución y señal de la estrategia. */
export function PantallaPanel() {
  // Variación de las últimas 24 h: la apertura de la primera de 24 velas de 1 h.
  const dia = useVelas("1h", 24);
  return (
    <div className="flex flex-col gap-5">
      <Bienvenida />
      <ResumenCartera />
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="flex flex-col gap-5 lg:col-span-3">
          <Tarjeta como="div">
            <PrecioEnVivo referencia={dia.data?.[0]?.apertura} textoReferencia="en las últimas 24 h" />
          </Tarjeta>
          <TarjetaEvolucion />
        </div>
        <div className="lg:col-span-2">
          <TarjetaSenal />
        </div>
      </div>
    </div>
  );
}
