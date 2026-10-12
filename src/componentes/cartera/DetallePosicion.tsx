"use client";

import type { ReactNode } from "react";

import { COMISION } from "@/componentes/ordenes/calculos";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { Cartera } from "@/lib/api/simulacion";
import { conSigno, sentido, usdt, variacion } from "@/lib/formato";

function colorDe(valor: number): string {
  const s = sentido(valor);
  return s === "sube" ? "text-sube" : s === "baja" ? "text-baja" : "text-texto";
}

function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-sm text-texto-secundario">{etiqueta}</dt>
      <dd className="cifra text-right text-texto">{children}</dd>
    </div>
  );
}

/** Reparto entre USDT y BTC: una barra con dos tramos, cada uno con su nombre y porcentaje. */
export function Reparto({ cartera }: { cartera: Cartera }) {
  const total = cartera.valorTotal || 1;
  const enBtc = Math.min(1, Math.max(0, cartera.valorBtc / total));
  const tramos = [
    { nombre: "Bitcoin", fraccion: enBtc, color: "var(--grafica-serie-1)" },
    { nombre: "USDT", fraccion: 1 - enBtc, color: "var(--grafica-neutra)" },
  ];
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm font-medium text-texto">¿Dónde está tu dinero?</figcaption>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden>
        {tramos
          .filter((t) => t.fraccion > 0)
          .map((t) => (
            <span key={t.nombre} style={{ width: `${t.fraccion * 100}%`, background: t.color }} />
          ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-texto-secundario">
        {tramos.map((t) => (
          <li key={t.nombre} className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm" style={{ background: t.color }} />
            {t.nombre}: <span className="cifra text-texto">{Math.round(t.fraccion * 100)} %</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Costo promedio, precio de ahora, ganancias (realizada y no realizada) y cuánto saldría vender todo. */
export function DetallePosicion({ cartera }: { cartera: Cartera }) {
  const conBtc = cartera.btc > 0;
  const cambioDesdeCompra = conBtc
    ? (cartera.precioActual - cartera.costoPromedio) / cartera.costoPromedio
    : 0;

  return (
    <Tarjeta titulo="Tu posición">
      <Reparto cartera={cartera} />
      <dl className="mt-4 divide-y divide-borde">
        <Fila etiqueta="Precio de ahora">{usdt(cartera.precioActual)} USDT</Fila>
        <Fila etiqueta="Costo promedio de tu BTC (con comisiones)">
          {conBtc ? (
            <>
              {usdt(cartera.costoPromedio)} USDT{" "}
              <span className={`text-sm ${colorDe(cambioDesdeCompra)}`}>{variacion(cambioDesdeCompra)}</span>
            </>
          ) : (
            "—"
          )}
        </Fila>
        <Fila etiqueta="Ganancia no realizada (si vendieras ahora)">
          <span className={colorDe(cartera.gananciaNoRealizada)}>
            {conSigno(cartera.gananciaNoRealizada)}
          </span>
        </Fila>
        <Fila etiqueta="Ganancia realizada (ventas hechas)">
          <span className={colorDe(cartera.gananciaRealizada)}>{conSigno(cartera.gananciaRealizada)}</span>
        </Fila>
        <Fila etiqueta="Comisiones pagadas">{usdt(cartera.comisionesPagadas)} USDT</Fila>
        {conBtc && (
          <Fila etiqueta="Si vendieras todo ahora recibirías">
            ≈ {usdt(cartera.valorBtc * (1 - COMISION))} USDT
          </Fila>
        )}
      </dl>
    </Tarjeta>
  );
}
