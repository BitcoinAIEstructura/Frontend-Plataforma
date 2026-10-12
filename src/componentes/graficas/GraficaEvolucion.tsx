"use client";

import {
  BaselineSeries,
  createChart,
  CrosshairMode,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTema } from "@/componentes/ui/InterruptorTema";
import type { Punto } from "@/lib/api/mercado";
import { conSigno, fechaHora, usdt, variacion } from "@/lib/formato";

import {
  INTERACCION,
  aLineaGrafica,
  aTiempoGrafica,
  conAlfa,
  leerColoresGrafica,
  type ColoresGrafica,
} from "./datos";

interface Props {
  titulo: string;
  puntos: readonly Punto[];
  /** Valor de referencia: por encima se pinta turquesa, por debajo rosa (y el texto lleva ▲▼). */
  base: number;
  alto?: number;
}

function opcionesTema(c: ColoresGrafica) {
  return {
    layout: { background: { color: "transparent" }, textColor: c.textoAtenuado, attributionLogo: false },
    grid: { vertLines: { visible: false }, horzLines: { color: c.rejilla } },
  };
}

function opcionesSerie(c: ColoresGrafica, base: number) {
  return {
    baseValue: { type: "price" as const, price: base },
    lineWidth: 2 as const,
    topLineColor: c.sube,
    topFillColor1: conAlfa(c.sube, 0.28),
    topFillColor2: conAlfa(c.sube, 0.02),
    bottomLineColor: c.baja,
    bottomFillColor1: conAlfa(c.baja, 0.02),
    bottomFillColor2: conAlfa(c.baja, 0.28),
    priceLineVisible: false,
  };
}

/** Valor de la cartera en el tiempo, comparado contra una base (el saldo inicial). */
export function GraficaEvolucion({ titulo, puntos, base, alto = 240 }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const grafica = useRef<IChartApi | null>(null);
  const serie = useRef<ISeriesApi<"Baseline"> | null>(null);
  const [enMira, setEnMira] = useState<UTCTimestamp | null>(null);
  const [comoTabla, setComoTabla] = useState(false);
  const tema = useTema();

  const porTiempo = useMemo(() => new Map(puntos.map((p) => [aTiempoGrafica(p.tiempo), p])), [puntos]);

  useEffect(() => {
    if (!contenedor.current) return;
    const c = leerColoresGrafica();
    const nueva = createChart(contenedor.current, {
      autoSize: true,
      ...INTERACCION,
      ...opcionesTema(c),
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Magnet },
      localization: { locale: "es-CO", priceFormatter: (p: number) => usdt(p) },
    });
    serie.current = nueva.addSeries(BaselineSeries, opcionesSerie(c, 0));
    const alMoverMira = (p: MouseEventParams) => setEnMira((p.time as UTCTimestamp | undefined) ?? null);
    nueva.subscribeCrosshairMove(alMoverMira);
    grafica.current = nueva;
    return () => {
      nueva.unsubscribeCrosshairMove(alMoverMira);
      nueva.remove();
      grafica.current = null;
      serie.current = null;
    };
  }, []);

  useEffect(() => {
    const c = leerColoresGrafica();
    grafica.current?.applyOptions(opcionesTema(c));
    serie.current?.applyOptions(opcionesSerie(c, base));
  }, [base, tema]);

  // La línea de la base se rehace con los colores del tema.
  useEffect(() => {
    const s = serie.current;
    if (!s) return;
    const linea = s.createPriceLine({
      price: base,
      color: leerColoresGrafica().neutra,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "",
    });
    return () => s.removePriceLine(linea);
  }, [base, tema]);

  useEffect(() => {
    serie.current?.setData(aLineaGrafica(puntos));
    grafica.current?.timeScale().fitContent();
  }, [puntos]);

  const punto = (enMira !== null ? porTiempo.get(enMira) : undefined) ?? puntos.at(-1);
  const diferencia = punto ? punto.valor - base : 0;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        {punto && (
          <span className="cifra flex flex-wrap gap-x-3 gap-y-1 text-texto-secundario" aria-live="off">
            <span className="text-texto-atenuado">{fechaHora(punto.tiempo)}</span>
            <span className="text-texto">{usdt(punto.valor)} USDT</span>
            <span className={diferencia >= 0 ? "text-sube" : "text-baja"}>
              {conSigno(diferencia)} ({variacion(diferencia / base)})
            </span>
          </span>
        )}
        <button
          type="button"
          onClick={() => setComoTabla((v) => !v)}
          aria-pressed={comoTabla}
          className="rounded-lg px-2 py-1 text-xs font-medium text-oro hover:bg-oro/10"
        >
          {comoTabla ? "Ver gráfica" : "Ver como tabla"}
        </button>
      </figcaption>

      <div
        ref={contenedor}
        role="img"
        aria-label={titulo}
        className={comoTabla ? "hidden" : "w-full"}
        style={{ height: alto }}
      />

      {comoTabla && (
        <div className="max-h-[320px] overflow-auto rounded-xl border border-borde">
          <table className="cifra w-full text-right text-sm">
            <caption className="sr-only">{titulo}</caption>
            <thead className="sticky top-0 bg-superficie-alta text-xs text-texto-atenuado">
              <tr>
                <th scope="col" className="px-3 py-2 text-left">
                  Momento
                </th>
                <th scope="col" className="px-3 py-2">
                  Valor (USDT)
                </th>
                <th scope="col" className="px-3 py-2">
                  Frente al inicio
                </th>
              </tr>
            </thead>
            <tbody>
              {[...puntos]
                .reverse()
                .slice(0, 50)
                .map((p) => (
                  <tr key={p.tiempo} className="border-t border-borde">
                    <th scope="row" className="px-3 py-1.5 text-left font-normal text-texto-secundario">
                      {fechaHora(p.tiempo)}
                    </th>
                    <td className="px-3 py-1.5 text-texto">{usdt(p.valor)}</td>
                    <td className={`px-3 py-1.5 ${p.valor >= base ? "text-sube" : "text-baja"}`}>
                      {variacion((p.valor - base) / base)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
