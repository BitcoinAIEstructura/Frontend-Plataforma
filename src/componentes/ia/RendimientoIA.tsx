"use client";

import {
  createChart,
  CrosshairMode,
  LineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";

import { INTERACCION, aLineaGrafica, aTiempoGrafica, leerColoresGrafica } from "@/componentes/graficas/datos";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { useTema } from "@/componentes/ui/InterruptorTema";
import type { PrediccionIA } from "@/lib/api/ia";
import { fechaHora, numero, variacion } from "@/lib/formato";

import { curvasRendimiento } from "./rendimiento";

/** Cada línea con su nombre y su color (y su forma: la IA continua, comprar y guardar punteada). */
const LINEAS = [
  { id: "ia", nombre: "Siguiendo a la IA", color: "var(--grafica-serie-1)", estilo: LineStyle.Solid },
  { id: "guardar", nombre: "Comprar y guardar", color: "var(--grafica-serie-2)", estilo: LineStyle.Dashed },
] as const;

/** La librería exige tiempos estrictamente crecientes: si dos caen en el mismo segundo, queda el último. */
function unicos<T extends { time: UTCTimestamp }>(datos: T[]): T[] {
  return datos.filter((d, i) => i === datos.length - 1 || datos[i + 1]!.time > d.time);
}

/**
 * Qué habría pasado con 100 USDT siguiendo a la IA en las velas de prueba (que no vio al
 * entrenar) frente a comprar y guardar. Una sola escala: las dos líneas son USDT.
 */
export function TarjetaRendimientoIA({ prediccion }: { prediccion: PrediccionIA }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const grafica = useRef<IChartApi | null>(null);
  const series = useRef<ISeriesApi<"Line">[]>([]);
  const [enMira, setEnMira] = useState<UTCTimestamp | null>(null);
  const tema = useTema();
  const curvas = useMemo(() => curvasRendimiento(prediccion.prueba), [prediccion.prueba]);
  const indice = useMemo(() => new Map(curvas.ia.map((p, i) => [aTiempoGrafica(p.tiempo), i])), [curvas]);

  useEffect(() => {
    if (!contenedor.current) return;
    const c = leerColoresGrafica();
    const nueva = createChart(contenedor.current, {
      autoSize: true,
      ...INTERACCION,
      layout: { background: { color: "transparent" }, textColor: c.textoAtenuado, attributionLogo: false },
      grid: { vertLines: { visible: false }, horzLines: { color: c.rejilla } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Magnet },
      localization: { locale: "es-CO", priceFormatter: (p: number) => numero(p) },
    });
    series.current = LINEAS.map((l) =>
      nueva.addSeries(LineSeries, {
        color: l.id === "ia" ? c.serie1 : c.serie2,
        lineWidth: 2,
        lineStyle: l.estilo,
        priceLineVisible: false,
        lastValueVisible: true,
      }),
    );
    const alMover = (p: MouseEventParams) => setEnMira((p.time as UTCTimestamp | undefined) ?? null);
    nueva.subscribeCrosshairMove(alMover);
    grafica.current = nueva;
    return () => {
      nueva.unsubscribeCrosshairMove(alMover);
      nueva.remove();
      grafica.current = null;
      series.current = [];
    };
  }, []);

  useEffect(() => {
    const c = leerColoresGrafica();
    grafica.current?.applyOptions({
      layout: { textColor: c.textoAtenuado },
      grid: { horzLines: { color: c.rejilla } },
    });
    series.current[0]?.applyOptions({ color: c.serie1 });
    series.current[1]?.applyOptions({ color: c.serie2 });
  }, [tema]);

  useEffect(() => {
    const [ia, guardar] = series.current;
    ia?.setData(unicos(aLineaGrafica(curvas.ia)));
    guardar?.setData(unicos(aLineaGrafica(curvas.guardar)));
    const base = ia?.createPriceLine({
      price: 100,
      color: leerColoresGrafica().neutra,
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      axisLabelVisible: false,
      title: "",
    });
    grafica.current?.timeScale().fitContent();
    return () => {
      if (base) ia?.removePriceLine(base);
    };
  }, [curvas, tema]);

  if (curvas.ia.length === 0) return null;
  const i = (enMira !== null ? indice.get(enMira) : undefined) ?? curvas.ia.length - 1;
  const valores = { ia: curvas.ia[i]!.valor, guardar: curvas.guardar[i]!.valor };
  const finalIa = curvas.ia.at(-1)!.valor;
  const finalGuardar = curvas.guardar.at(-1)!.valor;
  const gana = finalIa > finalGuardar;
  const titulo = `Valor de 100 USDT siguiendo a la IA (${variacion(finalIa / 100 - 1)}) frente a comprar y guardar (${variacion(finalGuardar / 100 - 1)}) en las ${curvas.ia.length} velas de prueba`;

  return (
    <Tarjeta
      titulo={
        <span className="flex items-center gap-2">
          <span aria-hidden className="text-violeta">
            ✦
          </span>
          Si hubieras seguido a la IA
        </span>
      }
      aria-label="Si hubieras seguido a la IA"
    >
      <p className="mb-3 text-sm leading-relaxed text-texto-secundario">
        Con 100 USDT en las {curvas.ia.length} velas de {prediccion.nombreIntervalo} que la IA no vio al
        entrenar: tener BTC cuando el comité dice «sube» y USDT cuando dice «baja» (pagando 0,1 % en cada
        cambio; cambió {curvas.operaciones} veces), frente a comprar al principio y no tocar nada.{" "}
        <strong className="font-medium text-texto">
          {gana
            ? "En este periodo la IA le ganó a comprar y guardar."
            : "En este periodo comprar y guardar le ganó a la IA."}
        </strong>
      </p>
      <figure className="flex flex-col gap-3">
        <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {LINEAS.map((l) => (
              <li key={l.id} className="flex items-center gap-2">
                <svg aria-hidden width="22" height="6">
                  <line
                    x1="1"
                    x2="21"
                    y1="3"
                    y2="3"
                    stroke={l.color}
                    strokeWidth="2.5"
                    strokeDasharray={l.estilo === LineStyle.Dashed ? "5 3" : undefined}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-texto-secundario">{l.nombre}</span>
                <span className="cifra font-semibold text-texto">{numero(valores[l.id])}</span>
              </li>
            ))}
          </ul>
          <span className="cifra text-xs text-texto-atenuado">{fechaHora(curvas.ia[i]!.tiempo)}</span>
        </figcaption>
        <div ref={contenedor} role="img" aria-label={titulo} className="w-full" style={{ height: 240 }} />
      </figure>
      <p className="mt-3 text-xs text-texto-atenuado">
        Es una prueba con datos del pasado: que la IA haya ganado (o perdido) aquí no garantiza lo que pase
        después.
      </p>
    </Tarjeta>
  );
}
