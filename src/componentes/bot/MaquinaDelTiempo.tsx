"use client";

import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { GraficaEvolucion } from "@/componentes/graficas/GraficaEvolucion";
import { Boton } from "@/componentes/ui/Boton";
import { Segmentado } from "@/componentes/ui/Segmentado";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { correrBacktest, type Backtest, type Estrategia } from "@/lib/api/backtest";
import type { Intervalo } from "@/lib/api/mercado";
import { conSigno, sentido, usdt, variacion } from "@/lib/formato";

const ESTRATEGIAS: { valor: Estrategia; etiqueta: string }[] = [
  { valor: "combinada", etiqueta: "Combinada (la del bot)" },
  { valor: "cruce", etiqueta: "Cruce de medias" },
  { valor: "rsi", etiqueta: "RSI" },
  { valor: "macd", etiqueta: "MACD" },
];

const PERIODOS: { valor: string; etiqueta: string; intervalo: Intervalo; cantidad: number }[] = [
  { valor: "1m", etiqueta: "Último mes (1 h)", intervalo: "1h", cantidad: 720 },
  { valor: "6m", etiqueta: "6 meses (4 h)", intervalo: "4h", cantidad: 1000 },
  { valor: "2a", etiqueta: "2 años (1 día)", intervalo: "1d", cantidad: 730 },
];

const CAPITAL = 10_000;
const UN_DECIMAL = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

function color(v: number) {
  const s = sentido(v);
  return s === "sube" ? "text-sube" : s === "baja" ? "text-baja" : "text-texto";
}

function dia(ms: number) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(ms);
}

export function ResultadoMaquina({ b }: { b: Backtest }) {
  const r = b.resultado;
  const ganoAMantener = r.rentabilidadTotal > r.rentabilidadComprarYMantener;
  const v = b.validacion;
  return (
    <div aria-live="polite" className="flex flex-col gap-5">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [
            "El bot",
            <span key="b" className={color(r.rentabilidadTotal)}>
              {variacion(r.rentabilidadTotal)}
            </span>,
          ],
          [
            "Comprar y no hacer nada",
            <span key="m" className={color(r.rentabilidadComprarYMantener)}>
              {variacion(r.rentabilidadComprarYMantener)}
            </span>,
          ],
          ["Operaciones", `${r.numeroOperaciones} · ${Math.round(r.tasaGanadoras * 100)} % ganadoras`],
          [
            "Peor caída",
            <span key="c" className="text-baja">
              ▼ {UN_DECIMAL.format(r.caidaMaxima * 100)} %
            </span>,
          ],
        ].map(([etiqueta, valor]) => (
          <div key={String(etiqueta)} className="rounded-xl bg-superficie-alta/60 p-3">
            <dt className="text-xs text-texto-atenuado">{etiqueta}</dt>
            <dd className="cifra text-lg font-semibold text-texto">{valor}</dd>
          </div>
        ))}
      </dl>

      <p
        className={`rounded-xl border px-4 py-3 text-sm text-texto-secundario ${ganoAMantener ? "border-exito/40 bg-exito/10" : "border-bitcoin/50 bg-bitcoin/10"}`}
      >
        Del {dia(r.tiempoInicio)} al {dia(r.tiempoFin)}, con {usdt(r.capitalInicial)} USDT el bot habría
        terminado con <span className="cifra text-texto">{usdt(r.capitalFinal)}</span> (
        <span className={color(r.capitalFinal - r.capitalInicial)}>
          {conSigno(r.capitalFinal - r.capitalInicial)}
        </span>
        ).{" "}
        {ganoAMantener
          ? "Le ganó a comprar al inicio y no hacer nada."
          : "Comprar al inicio y no hacer nada habría rendido más: operar no siempre ayuda."}
      </p>

      <GraficaEvolucion
        titulo="Valor de la cartera del bot en el periodo, frente al capital inicial"
        puntos={r.curvaCapital}
        base={r.capitalInicial}
      />

      <p className="text-sm text-texto-secundario">
        <strong className="text-texto">¿Y sin hacer trampa?</strong> Con los parámetros elegidos en las
        primeras {v.velasEntrenamiento} velas, en las {v.velasPrueba} siguientes (que no vio al elegir) rindió{" "}
        <span className={`cifra ${color(v.prueba.rentabilidadTotal)}`}>
          {variacion(v.prueba.rentabilidadTotal)}
        </span>
        , frente a{" "}
        <span className={`cifra ${color(v.prueba.rentabilidadComprarYMantener)}`}>
          {variacion(v.prueba.rentabilidadComprarYMantener)}
        </span>{" "}
        de comprar y mantener.
      </p>
      <p className="text-xs text-texto-atenuado">{b.aviso}</p>
    </div>
  );
}

/** Máquina del tiempo: ¿cómo le habría ido al bot si lo hubieras encendido en el pasado? */
export function MaquinaDelTiempo() {
  const [estrategia, setEstrategia] = useState<Estrategia>("combinada");
  const [periodo, setPeriodo] = useState("6m");
  const prueba = useMutation({
    mutationFn: ({ e, p }: { e: Estrategia; p: (typeof PERIODOS)[number] }) =>
      correrBacktest(e, p.intervalo, p.cantidad, CAPITAL),
  });

  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    prueba.mutate({ e: estrategia, p: PERIODOS.find((x) => x.valor === periodo)! });
  };

  return (
    <Tarjeta id="maquina-del-tiempo" titulo="Máquina del tiempo" className="scroll-mt-24">
      <p className="mb-4 text-sm text-texto-secundario">
        Viaja al pasado y enciende el bot ahí: se simula vela por vela, sin mirar el futuro, con comisión de
        0,1 % y {usdt(CAPITAL)} USDT de práctica.
      </p>
      <form onSubmit={enviar} className="mb-5 flex flex-col gap-3">
        <Segmentado
          etiqueta="Estrategia"
          opciones={ESTRATEGIAS}
          valor={estrategia}
          alCambiar={setEstrategia}
        />
        <Segmentado etiqueta="Periodo" opciones={PERIODOS} valor={periodo} alCambiar={setPeriodo} />
        <div>
          <Boton type="submit" cargando={prueba.isPending}>
            ⟲ Viajar y simular
          </Boton>
        </div>
      </form>
      {prueba.isError && (
        <p role="alert" className="mb-4 text-sm font-medium text-error">
          {prueba.error.message}
        </p>
      )}
      {prueba.data && <ResultadoMaquina b={prueba.data} />}
    </Tarjeta>
  );
}
