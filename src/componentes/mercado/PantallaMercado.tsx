"use client";

import { useMemo, useState } from "react";

import { GraficaOscilador, type SerieOscilador } from "@/componentes/graficas/GraficaOscilador";
import { GraficaVelas, type Capa } from "@/componentes/graficas/GraficaVelas";
import { Segmentado } from "@/componentes/ui/Segmentado";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { Intervalo, Punto } from "@/lib/api/mercado";
import { useIndicador, useVelas } from "@/lib/hooks/useDatos";

import { PrecioEnVivo } from "./PrecioEnVivo";

const CANTIDAD = 300;

export const OPCIONES_INTERVALO: { valor: Intervalo; etiqueta: string }[] = [
  { valor: "1m", etiqueta: "1 min" },
  { valor: "5m", etiqueta: "5 min" },
  { valor: "15m", etiqueta: "15 min" },
  { valor: "1h", etiqueta: "1 h" },
  { valor: "4h", etiqueta: "4 h" },
  { valor: "1d", etiqueta: "1 día" },
];

type Oscilador = "rsi" | "macd";
type CapaElegible = "sma" | "ema" | "bollinger";

const NOMBRE_CAPA: Record<CapaElegible, string> = { sma: "SMA 20", ema: "EMA 50", bollinger: "Bollinger 20" };

const vacio: readonly Punto[] = [];

/** Mercado: precio en vivo, velas con indicadores encima y un oscilador debajo. */
export function PantallaMercado() {
  const [intervalo, setIntervalo] = useState<Intervalo>("1h");
  const [activas, setActivas] = useState<Record<CapaElegible, boolean>>({
    sma: true,
    ema: false,
    bollinger: false,
  });
  const [oscilador, setOscilador] = useState<Oscilador>("rsi");

  const velas = useVelas(intervalo, CANTIDAD);
  const sma = useIndicador("sma", intervalo, CANTIDAD, { periodo: 20 }, activas.sma);
  const ema = useIndicador("ema", intervalo, CANTIDAD, { periodo: 50 }, activas.ema);
  const bollinger = useIndicador("bollinger", intervalo, CANTIDAD, { periodo: 20 }, activas.bollinger);
  const rsi = useIndicador("rsi", intervalo, CANTIDAD, { periodo: 14 }, oscilador === "rsi");
  const macd = useIndicador("macd", intervalo, CANTIDAD, {}, oscilador === "macd");

  const capas = useMemo<Capa[]>(() => {
    const lista: Capa[] = [];
    if (activas.sma)
      lista.push({
        id: "sma",
        nombre: NOMBRE_CAPA.sma,
        color: "serie1",
        puntos: sma.data?.series.valor ?? vacio,
      });
    if (activas.ema)
      lista.push({
        id: "ema",
        nombre: NOMBRE_CAPA.ema,
        color: "serie2",
        puntos: ema.data?.series.valor ?? vacio,
      });
    if (activas.bollinger) {
      const s = bollinger.data?.series;
      lista.push(
        { id: "boll-sup", nombre: NOMBRE_CAPA.bollinger, color: "neutra", puntos: s?.superior ?? vacio },
        { id: "boll-inf", nombre: "", color: "neutra", puntos: s?.inferior ?? vacio },
      );
    }
    return lista;
  }, [activas, sma.data, ema.data, bollinger.data]);

  const seriesOscilador = useMemo<SerieOscilador[]>(() => {
    if (oscilador === "rsi") {
      return [
        { id: "rsi", nombre: "RSI", color: "serie2", tipo: "linea", puntos: rsi.data?.series.valor ?? vacio },
      ];
    }
    const s = macd.data?.series;
    return [
      { id: "macd", nombre: "MACD", color: "serie1", tipo: "linea", puntos: s?.macd ?? vacio },
      { id: "senal", nombre: "Señal", color: "serie2", tipo: "linea", puntos: s?.senal ?? vacio },
      {
        id: "histograma",
        nombre: "Histograma",
        color: "neutra",
        tipo: "histograma",
        puntos: s?.histograma ?? vacio,
      },
    ];
  }, [oscilador, rsi.data, macd.data]);

  const lista = velas.data ?? [];
  const nombreIntervalo = OPCIONES_INTERVALO.find((o) => o.valor === intervalo)?.etiqueta ?? intervalo;

  return (
    <div className="flex flex-col gap-5">
      {/* Filtros en una sola fila, arriba de las gráficas. */}
      <Tarjeta como="div" className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PrecioEnVivo
          referencia={lista[0]?.apertura}
          textoReferencia={`en las últimas ${lista.length} velas`}
        />
        <div className="flex flex-col gap-3 lg:items-end">
          <Segmentado
            etiqueta="Intervalo de las velas"
            opciones={OPCIONES_INTERVALO}
            valor={intervalo}
            alCambiar={setIntervalo}
          />
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">Indicadores sobre las velas</legend>
            {(Object.keys(NOMBRE_CAPA) as CapaElegible[]).map((capa) => (
              <label
                key={capa}
                className={
                  "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition " +
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-oro/60 " +
                  (activas[capa]
                    ? "border-oro bg-oro/10 text-oro"
                    : "border-borde text-texto-secundario hover:border-oro/50")
                }
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={activas[capa]}
                  onChange={(e) => setActivas((a) => ({ ...a, [capa]: e.target.checked }))}
                />
                {activas[capa] ? "✓ " : "+ "}
                {NOMBRE_CAPA[capa]}
              </label>
            ))}
          </fieldset>
        </div>
      </Tarjeta>

      <Tarjeta titulo={`Velas de BTCUSDT · ${nombreIntervalo}`}>
        {velas.isError && !velas.data ? (
          <p role="alert" className="text-error">
            {velas.error.message}
          </p>
        ) : velas.isPending ? (
          <div role="status" className="grid h-[420px] place-items-center text-texto-secundario">
            Cargando velas…
          </div>
        ) : (
          <GraficaVelas titulo={`Velas de BTCUSDT cada ${nombreIntervalo}`} velas={lista} capas={capas} />
        )}
      </Tarjeta>

      <Tarjeta
        titulo="Oscilador"
        extra={
          <Segmentado
            etiqueta="Oscilador"
            valor={oscilador}
            alCambiar={setOscilador}
            opciones={[
              { valor: "rsi", etiqueta: "RSI 14" },
              { valor: "macd", etiqueta: "MACD 12·26·9" },
            ]}
          />
        }
      >
        <GraficaOscilador
          titulo={oscilador === "rsi" ? "RSI 14 (sobreventa bajo 30, sobrecompra sobre 70)" : "MACD 12·26·9"}
          series={seriesOscilador}
          referencias={oscilador === "rsi" ? [30, 70] : [0]}
        />
      </Tarjeta>
    </div>
  );
}
