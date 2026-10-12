"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { GraficaEvolucion } from "@/componentes/graficas/GraficaEvolucion";
import { clasesBoton } from "@/componentes/ui/Boton";
import { Segmentado } from "@/componentes/ui/Segmentado";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { Intervalo } from "@/lib/api/mercado";
import { useCartera, useOrdenes, useVelas } from "@/lib/hooks/useDatos";

import { evolucionCartera, tieneMovimientos } from "./evolucion";

type Rango = "24h" | "7d" | "30d";

export const RANGOS: Record<Rango, { etiqueta: string; intervalo: Intervalo; cantidad: number }> = {
  "24h": { etiqueta: "24 h", intervalo: "1h", cantidad: 24 },
  "7d": { etiqueta: "7 días", intervalo: "1h", cantidad: 168 },
  "30d": { etiqueta: "30 días", intervalo: "4h", cantidad: 180 },
};

const OPCIONES = (Object.keys(RANGOS) as Rango[]).map((valor) => ({
  valor,
  etiqueta: RANGOS[valor].etiqueta,
}));

/** Cómo ha cambiado el valor de la cartera, con el saldo inicial como referencia. */
export function TarjetaEvolucion() {
  const [rango, setRango] = useState<Rango>("7d");
  const { intervalo, cantidad, etiqueta } = RANGOS[rango];
  const cartera = useCartera();
  const ordenes = useOrdenes();
  const velas = useVelas(intervalo, cantidad);

  const saldoInicial = cartera.data?.saldoInicial;
  const puntos = useMemo(
    () =>
      saldoInicial !== undefined && ordenes.data && velas.data
        ? evolucionCartera(saldoInicial, ordenes.data, velas.data)
        : [],
    [saldoInicial, ordenes.data, velas.data],
  );

  const sinMovimientos = ordenes.data !== undefined && !tieneMovimientos(ordenes.data);

  return (
    <Tarjeta
      titulo="Evolución de tu cartera"
      extra={
        !sinMovimientos && (
          <Segmentado etiqueta="Rango de tiempo" opciones={OPCIONES} valor={rango} alCambiar={setRango} />
        )
      }
    >
      {sinMovimientos ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span aria-hidden className="text-3xl text-oro">
            ◎
          </span>
          <p className="max-w-sm text-texto-secundario">
            Aquí verás cómo crece (o baja) tu cartera cuando hagas tu primera orden. Puedes empezar con poco:
            es dinero de práctica.
          </p>
          <Link href="/ordenes" className={clasesBoton("dorado")}>
            Hacer mi primera orden
          </Link>
        </div>
      ) : ordenes.isError || velas.isError ? (
        <p role="alert" className="text-error">
          {(ordenes.error ?? velas.error)?.message}
        </p>
      ) : puntos.length === 0 || saldoInicial === undefined ? (
        <p role="status" className="grid h-[240px] place-items-center text-texto-secundario">
          Calculando tu evolución…
        </p>
      ) : (
        <GraficaEvolucion
          titulo={`Valor de tu cartera en los últimos ${etiqueta}, frente a tu saldo inicial`}
          puntos={puntos}
          base={saldoInicial}
        />
      )}
    </Tarjeta>
  );
}
