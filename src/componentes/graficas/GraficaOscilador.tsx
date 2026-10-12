"use client";

import {
  createChart,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

import { useTema } from "@/componentes/ui/InterruptorTema";
import type { Punto } from "@/lib/api/mercado";
import { numero } from "@/lib/formato";

import { INTERACCION, aLineaGrafica, conAlfa, leerColoresGrafica, type ColoresGrafica } from "./datos";

export interface SerieOscilador {
  id: string;
  nombre: string;
  color: "serie1" | "serie2" | "neutra";
  /** "histograma": barras que suben y bajan desde 0 (como el del MACD). */
  tipo: "linea" | "histograma";
  puntos: readonly Punto[];
}

interface Props {
  titulo: string;
  series: readonly SerieOscilador[];
  /** Líneas de referencia horizontales (RSI: 30 y 70). */
  referencias?: readonly number[];
  alto?: number;
}

const VARIABLE: Record<SerieOscilador["color"], string> = {
  serie1: "var(--grafica-serie-1)",
  serie2: "var(--grafica-serie-2)",
  neutra: "var(--grafica-neutra)",
};

function opcionesTema(c: ColoresGrafica) {
  return {
    layout: { background: { color: "transparent" }, textColor: c.textoAtenuado, attributionLogo: false },
    grid: { vertLines: { color: c.rejilla }, horzLines: { color: c.rejilla } },
  };
}

/** Un indicador que oscila (RSI, MACD) en su propia gráfica, con una sola escala. */
export function GraficaOscilador({ titulo, series, referencias = [], alto = 170 }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const grafica = useRef<IChartApi | null>(null);
  const creadas = useRef(new Map<string, ISeriesApi<"Line"> | ISeriesApi<"Histogram">>());
  const tema = useTema();
  const claveSeries = series.map((s) => `${s.id}:${s.tipo}`).join("|");

  useEffect(() => {
    if (!contenedor.current) return;
    const nueva = createChart(contenedor.current, {
      autoSize: true,
      ...INTERACCION,
      ...opcionesTema(leerColoresGrafica()),
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal },
      localization: { locale: "es-CO", priceFormatter: numero },
    });
    grafica.current = nueva;
    const mapa = creadas.current;
    return () => {
      nueva.remove();
      grafica.current = null;
      mapa.clear();
    };
  }, []);

  // Series (se recrean si cambia cuáles son) y sus datos.
  useEffect(() => {
    const g = grafica.current;
    if (!g) return;
    const c = leerColoresGrafica();
    for (const serie of creadas.current.values()) g.removeSeries(serie);
    creadas.current.clear();
    series.forEach((s, i) => {
      const nueva =
        s.tipo === "histograma"
          ? g.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false })
          : g.addSeries(LineSeries, { lineWidth: 2, priceLineVisible: false, lastValueVisible: i === 0 });
      if (s.tipo === "histograma") {
        nueva.setData(
          s.puntos.map((p) => ({
            ...aLineaGrafica([p])[0]!,
            color: conAlfa(p.valor >= 0 ? c.sube : c.baja, 0.55),
          })),
        );
      } else {
        nueva.applyOptions({ color: c[s.color] });
        nueva.setData(aLineaGrafica(s.puntos));
      }
      if (i === 0) {
        for (const nivel of referencias) {
          nueva.createPriceLine({
            price: nivel,
            color: c.neutra,
            lineWidth: 1,
            lineStyle: LineStyle.Solid,
            axisLabelVisible: true,
            title: "",
          });
        }
      }
      creadas.current.set(s.id, nueva);
    });
    // claveSeries resume qué series hay; los datos van en `series`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveSeries, series, tema, referencias.join(",")]);

  useEffect(() => {
    grafica.current?.applyOptions(opcionesTema(leerColoresGrafica()));
  }, [tema]);

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex flex-wrap items-center gap-3 text-xs text-texto-secundario">
        <span className="text-sm font-semibold text-texto">{titulo}</span>
        {series.length > 1 &&
          series.map((s) => (
            <span key={s.id} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className={s.tipo === "histograma" ? "size-2.5 rounded-sm" : "h-0.5 w-4 rounded-full"}
                style={{ background: s.tipo === "histograma" ? "var(--grafica-neutra)" : VARIABLE[s.color] }}
              />
              {s.nombre}
            </span>
          ))}
        {series[0] && series[0].puntos.length > 0 && (
          <span className="cifra ml-auto text-texto">
            {series[0].nombre}: {numero(series[0].puntos.at(-1)!.valor)}
          </span>
        )}
      </figcaption>
      <div ref={contenedor} role="img" aria-label={titulo} style={{ height: alto }} className="w-full" />
    </figure>
  );
}
