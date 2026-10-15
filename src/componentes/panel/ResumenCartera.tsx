"use client";

import type { ReactNode } from "react";

import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { Termino, type Concepto } from "@/componentes/ui/Termino";
import type { Cartera } from "@/lib/api/simulacion";
import { btc, conSigno, sentido, usdt, variacion } from "@/lib/formato";
import { useCartera } from "@/lib/hooks/useDatos";

function Cifra({
  etiqueta,
  valor,
  detalle,
  concepto,
}: {
  etiqueta: string;
  valor: ReactNode;
  detalle?: ReactNode;
  concepto?: Concepto;
}) {
  return (
    <Tarjeta como="div" className="flex flex-col gap-1">
      <dt className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-texto-atenuado uppercase">
        {etiqueta}
        {concepto && <Termino concepto={concepto} />}
      </dt>
      <dd className="cifra text-xl font-semibold text-texto sm:text-2xl">{valor}</dd>
      {detalle && <dd className="cifra text-sm text-texto-secundario">{detalle}</dd>}
    </Tarjeta>
  );
}

/** Las cuatro cifras de la cartera: valor, ganancia, USDT disponibles y BTC. */
export function CifrasCartera({ cartera }: { cartera: Cartera }) {
  const s = sentido(cartera.gananciaTotal);
  const color = s === "sube" ? "text-sube" : s === "baja" ? "text-baja" : "text-texto";
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Cifra
        etiqueta="Valor de tu cartera"
        valor={
          <>
            {usdt(cartera.valorTotal)} <span className="text-sm text-texto-atenuado">USDT</span>
          </>
        }
        detalle={`Empezaste con ${usdt(cartera.saldoInicial)}`}
      />
      <Cifra
        etiqueta="Ganancia total"
        concepto="rentabilidad"
        valor={<span className={color}>{conSigno(cartera.gananciaTotal)}</span>}
        detalle={<span className={color}>{variacion(cartera.rentabilidad)}</span>}
      />
      <Cifra
        etiqueta="USDT disponibles"
        concepto="usdt"
        valor={usdt(cartera.saldoUsdt)}
        detalle={`Comisiones pagadas: ${usdt(cartera.comisionesPagadas)}`}
      />
      <Cifra
        etiqueta="Bitcoin"
        concepto="btc"
        valor={
          <>
            {btc(cartera.btc)} <span className="text-sm text-texto-atenuado">BTC</span>
          </>
        }
        detalle={cartera.btc > 0 ? `Vale ${usdt(cartera.valorBtc)} USDT` : "Aún no tienes BTC"}
      />
    </dl>
  );
}

export function ResumenCartera() {
  const cartera = useCartera();
  if (cartera.data) return <CifrasCartera cartera={cartera.data} />;
  if (cartera.isError)
    return (
      <p role="alert" className="text-error">
        {cartera.error.message}
      </p>
    );
  return (
    <p role="status" className="text-texto-secundario">
      Cargando tu cartera…
    </p>
  );
}
