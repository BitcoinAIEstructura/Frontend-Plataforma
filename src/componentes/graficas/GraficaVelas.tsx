"use client";

import {
  CandlestickSeries,
  createChart,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTema } from "@/componentes/ui/InterruptorTema";
import type { Punto, Vela } from "@/lib/api/mercado";
import { btc, fechaHora, usdt, variacion } from "@/lib/formato";

import {
  aLineaGrafica,
  aTiempoGrafica,
  aVelasGrafica,
  aVolumenGrafica,
  conAlfa,
  leerColoresGrafica,
  type ColoresGrafica,
} from "./datos";

/** Una línea encima de las velas (una media, una banda…). */
export interface Capa {
  id: string;
  nombre: string;
  color: "serie1" | "serie2" | "neutra";
  puntos: readonly Punto[];
}

const VARIABLE_CAPA: Record<Capa["color"], string> = {
  serie1: "var(--grafica-serie-1)",
  serie2: "var(--grafica-serie-2)",
  neutra: "var(--grafica-neutra)",
};

interface Props {
  velas: readonly Vela[];
  capas?: readonly Capa[];
  alto?: number;
  /** Nombre de la gráfica para lectores de pantalla ("Velas de BTCUSDT cada hora"). */
  titulo: string;
}

function opcionesTema(c: ColoresGrafica) {
  return {
    layout: {
      background: { color: "transparent" },
      textColor: c.textoAtenuado,
      fontFamily: "var(--font-texto), system-ui, sans-serif",
      attributionLogo: false,
    },
    grid: { vertLines: { color: c.rejilla }, horzLines: { color: c.rejilla } },
  };
}

function opcionesVelas(c: ColoresGrafica) {
  // Codificación secundaria: la vela que sube va hueca y la que baja, rellena.
  return {
    upColor: "rgba(0,0,0,0)",
    borderUpColor: c.sube,
    wickUpColor: c.sube,
    downColor: c.baja,
    borderDownColor: c.baja,
    wickDownColor: c.baja,
  };
}

/** Velas de BTCUSDT con volumen en un panel aparte, capas de indicadores, mira y vista de tabla. */
export function GraficaVelas({ velas, capas = [], alto = 420, titulo }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const grafica = useRef<IChartApi | null>(null);
  const serieVelas = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const serieVolumen = useRef<ISeriesApi<"Histogram"> | null>(null);
  const seriesCapas = useRef(new Map<string, ISeriesApi<"Line">>());
  const [enMira, setEnMira] = useState<UTCTimestamp | null>(null);
  const [comoTabla, setComoTabla] = useState(false);
  const tema = useTema();

  const porTiempo = useMemo(() => new Map(velas.map((v) => [aTiempoGrafica(v.tiempoApertura), v])), [velas]);

  // Crear la gráfica una sola vez.
  useEffect(() => {
    if (!contenedor.current) return;
    const c = leerColoresGrafica();
    const nueva = createChart(contenedor.current, {
      autoSize: true,
      ...opcionesTema(c),
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal },
      localization: { locale: "es-CO", priceFormatter: (p: number) => usdt(p) },
    });
    serieVelas.current = nueva.addSeries(CandlestickSeries, opcionesVelas(c));
    // Volumen en su propio panel: nunca dos escalas sobre el mismo plano.
    serieVolumen.current = nueva.addSeries(
      HistogramSeries,
      { priceFormat: { type: "volume" }, lastValueVisible: false, priceLineVisible: false },
      1,
    );
    nueva.panes()[1]?.setHeight(Math.round(alto * 0.2));
    const alMoverMira = (p: MouseEventParams) => setEnMira((p.time as UTCTimestamp | undefined) ?? null);
    nueva.subscribeCrosshairMove(alMoverMira);
    grafica.current = nueva;
    const capasActuales = seriesCapas.current;
    return () => {
      nueva.unsubscribeCrosshairMove(alMoverMira);
      nueva.remove();
      grafica.current = null;
      capasActuales.clear();
    };
  }, [alto]);

  // Datos de velas y volumen.
  useEffect(() => {
    const c = leerColoresGrafica();
    serieVelas.current?.setData(aVelasGrafica(velas));
    serieVolumen.current?.setData(aVolumenGrafica(velas, conAlfa(c.sube, 0.45), conAlfa(c.baja, 0.45)));
  }, [velas, tema]);

  // Capas de indicadores: se agregan, actualizan o quitan según `capas`.
  useEffect(() => {
    const g = grafica.current;
    if (!g) return;
    const c = leerColoresGrafica();
    const vigentes = new Set(capas.map((capa) => capa.id));
    for (const [id, serie] of seriesCapas.current) {
      if (!vigentes.has(id)) {
        g.removeSeries(serie);
        seriesCapas.current.delete(id);
      }
    }
    for (const capa of capas) {
      let serie = seriesCapas.current.get(capa.id);
      if (!serie) {
        serie = g.addSeries(LineSeries, { lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
        seriesCapas.current.set(capa.id, serie);
      }
      serie.applyOptions({ color: c[capa.color], title: "" });
      serie.setData(aLineaGrafica(capa.puntos));
    }
  }, [capas, tema]);

  // Colores al cambiar de tema.
  useEffect(() => {
    const c = leerColoresGrafica();
    grafica.current?.applyOptions(opcionesTema(c));
    serieVelas.current?.applyOptions(opcionesVelas(c));
  }, [tema]);

  const vela = (enMira !== null ? porTiempo.get(enMira) : undefined) ?? velas.at(-1);
  const cambio = vela ? (vela.cierre - vela.apertura) / vela.apertura : 0;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        {vela ? (
          <span className="cifra flex flex-wrap gap-x-3 gap-y-1 text-texto-secundario" aria-live="off">
            <span className="text-texto-atenuado">{fechaHora(vela.tiempoApertura)}</span>
            <span>A {usdt(vela.apertura)}</span>
            <span>M {usdt(vela.maximo)}</span>
            <span>m {usdt(vela.minimo)}</span>
            <span className="text-texto">C {usdt(vela.cierre)}</span>
            <span className={cambio >= 0 ? "text-sube" : "text-baja"}>{variacion(cambio)}</span>
          </span>
        ) : (
          <span className="text-texto-atenuado">Sin velas todavía</span>
        )}
        <span className="flex items-center gap-3">
          {capas.map((capa) => (
            <span key={capa.id} className="flex items-center gap-1.5 text-xs text-texto-secundario">
              <span
                aria-hidden
                className="h-0.5 w-4 rounded-full"
                style={{ background: VARIABLE_CAPA[capa.color] }}
              />
              {capa.nombre}
            </span>
          ))}
          <button
            type="button"
            onClick={() => setComoTabla((v) => !v)}
            aria-pressed={comoTabla}
            className="rounded-lg px-2 py-1 text-xs font-medium text-oro hover:bg-oro/10"
          >
            {comoTabla ? "Ver gráfica" : "Ver como tabla"}
          </button>
        </span>
      </figcaption>

      <div
        ref={contenedor}
        role="img"
        aria-label={titulo}
        className={comoTabla ? "hidden" : "w-full"}
        style={{ height: alto }}
      />

      {comoTabla && (
        <div className="max-h-[420px] overflow-auto rounded-xl border border-borde">
          <table className="cifra w-full text-right text-sm">
            <caption className="sr-only">{titulo}</caption>
            <thead className="sticky top-0 bg-superficie-alta text-xs text-texto-atenuado">
              <tr>
                <th scope="col" className="px-3 py-2 text-left">
                  Apertura de la vela
                </th>
                <th scope="col" className="px-3 py-2">
                  Apertura
                </th>
                <th scope="col" className="px-3 py-2">
                  Máximo
                </th>
                <th scope="col" className="px-3 py-2">
                  Mínimo
                </th>
                <th scope="col" className="px-3 py-2">
                  Cierre
                </th>
                <th scope="col" className="px-3 py-2">
                  Volumen (BTC)
                </th>
              </tr>
            </thead>
            <tbody>
              {[...velas]
                .reverse()
                .slice(0, 50)
                .map((v) => (
                  <tr key={v.tiempoApertura} className="border-t border-borde">
                    <th scope="row" className="px-3 py-1.5 text-left font-normal text-texto-secundario">
                      {fechaHora(v.tiempoApertura)}
                    </th>
                    <td className="px-3 py-1.5">{usdt(v.apertura)}</td>
                    <td className="px-3 py-1.5">{usdt(v.maximo)}</td>
                    <td className="px-3 py-1.5">{usdt(v.minimo)}</td>
                    <td className="px-3 py-1.5 text-texto">{usdt(v.cierre)}</td>
                    <td className="px-3 py-1.5">{btc(v.volumen)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
