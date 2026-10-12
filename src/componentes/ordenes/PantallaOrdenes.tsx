"use client";

import { PrecioEnVivo } from "@/componentes/mercado/PrecioEnVivo";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { useBot, useOrdenes } from "@/lib/hooks/useDatos";

import { separarOrdenes } from "./calculos";
import { ColaPendientes } from "./ColaPendientes";
import { FormularioOrden } from "./FormularioOrden";
import { RegistroOrdenes } from "./RegistroOrdenes";

/** Órdenes: el formulario a la izquierda; la cola y el registro a la derecha. */
export function PantallaOrdenes() {
  const ordenes = useOrdenes();
  const bot = useBot();
  const { cola, registro } = separarOrdenes(ordenes.data ?? []);

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="flex flex-col gap-5 lg:col-span-2">
        <Tarjeta como="div">
          <PrecioEnVivo />
        </Tarjeta>
        <FormularioOrden />
      </div>
      <div className="flex flex-col gap-5 lg:col-span-3">
        {ordenes.isError && !ordenes.data ? (
          <p role="alert" className="text-error">
            {ordenes.error.message}
          </p>
        ) : ordenes.isPending ? (
          <p role="status" className="text-texto-secundario">
            Cargando tus órdenes…
          </p>
        ) : (
          <>
            <ColaPendientes cola={cola} botActivo={bot.data?.activo ?? false} />
            <RegistroOrdenes registro={registro} />
          </>
        )}
      </div>
    </div>
  );
}
