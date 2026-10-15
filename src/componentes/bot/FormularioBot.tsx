"use client";

import { useId, useState, type FormEvent } from "react";

import { OPCIONES_INTERVALO } from "@/componentes/mercado/PantallaMercado";
import { Boton } from "@/componentes/ui/Boton";
import { Segmentado } from "@/componentes/ui/Segmentado";
import { Termino, type Concepto } from "@/componentes/ui/Termino";
import type { Intervalo } from "@/lib/api/mercado";
import type { ConfiguracionBot } from "@/lib/api/simulacion";

export const CADA_CUANTO = [
  { valor: "30", etiqueta: "Cada 30 s" },
  { valor: "60", etiqueta: "Cada minuto" },
  { valor: "300", etiqueta: "Cada 5 min" },
  { valor: "900", etiqueta: "Cada 15 min" },
] as const;

type Segundos = (typeof CADA_CUANTO)[number]["valor"];

/** Un control deslizante en porcentaje, con su valor escrito al lado. */
function Porcentaje({
  etiqueta,
  concepto,
  ayuda,
  valor,
  min,
  max,
  alCambiar,
  disabled,
}: {
  etiqueta: string;
  concepto: Concepto;
  ayuda: string;
  valor: number;
  min: number;
  max: number;
  alCambiar: (v: number) => void;
  disabled: boolean;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-1.5">
          <label htmlFor={id} className="text-sm font-medium text-texto-secundario">
            {etiqueta}
          </label>
          <Termino concepto={concepto} />
        </span>
        <output htmlFor={id} className="cifra text-sm font-semibold text-texto">
          {valor} %
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={valor}
        disabled={disabled}
        aria-describedby={`${id}-ayuda`}
        onChange={(e) => alCambiar(Number(e.target.value))}
        className="accent-oro disabled:opacity-55"
      />
      <p id={`${id}-ayuda`} className="text-xs text-texto-atenuado">
        {ayuda}
      </p>
    </div>
  );
}

/** Convierte lo que se ve (porcentajes enteros) en lo que espera el backend (fracciones). */
export function aConfiguracion(c: {
  segundos: Segundos;
  intervalo: Intervalo;
  riesgo: number;
  stopLoss: number;
  takeProfit: number;
}): Partial<ConfiguracionBot> {
  return {
    segundosEntreCiclos: Number(c.segundos),
    intervalo: c.intervalo,
    riesgo: c.riesgo / 100,
    stopLoss: c.stopLoss / 100,
    takeProfit: c.takeProfit / 100,
  };
}

function cercano(segundos: number): Segundos {
  return CADA_CUANTO.reduce((mejor, o) =>
    Math.abs(Number(o.valor) - segundos) < Math.abs(Number(mejor.valor) - segundos) ? o : mejor,
  ).valor;
}

interface Props {
  actual: ConfiguracionBot;
  activo: boolean;
  cargando: boolean;
  alIniciar: (configuracion: Partial<ConfiguracionBot>) => void;
  alDetener: () => void;
}

/** Ajustes del bot. Mientras está en marcha se ven, pero no se cambian (hay que detenerlo). */
export function FormularioBot({ actual, activo, cargando, alIniciar, alDetener }: Props) {
  const [segundos, setSegundos] = useState<Segundos>(cercano(actual.segundosEntreCiclos));
  const [intervalo, setIntervalo] = useState<Intervalo>(
    (OPCIONES_INTERVALO.find((o) => o.valor === actual.intervalo)?.valor ?? "1h") as Intervalo,
  );
  const [riesgo, setRiesgo] = useState(Math.round(actual.riesgo * 100));
  const [stopLoss, setStopLoss] = useState(Math.round(actual.stopLoss * 100));
  const [takeProfit, setTakeProfit] = useState(Math.round(actual.takeProfit * 100));

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (activo) alDetener();
    else alIniciar(aConfiguracion({ segundos, intervalo, riesgo, stopLoss, takeProfit }));
  };

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <fieldset disabled={activo} className="flex flex-col gap-5 disabled:opacity-80">
        <legend className="sr-only">Ajustes del bot</legend>
        <div className="flex flex-col gap-1.5">
          <span aria-hidden className="text-sm font-medium text-texto-secundario">
            Cada cuánto revisa el mercado
          </span>
          <Segmentado
            etiqueta="Cada cuánto revisa el mercado"
            opciones={CADA_CUANTO}
            valor={segundos}
            alCambiar={setSegundos}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="text-sm font-medium text-texto-secundario">
              Tamaño de las velas que mira
            </span>
            <Termino concepto="vela" />
          </span>
          <Segmentado
            etiqueta="Intervalo de las velas que analiza"
            opciones={OPCIONES_INTERVALO}
            valor={intervalo}
            alCambiar={setIntervalo}
          />
        </div>
        <Porcentaje
          etiqueta="Riesgo por compra"
          concepto="riesgo"
          ayuda="Qué parte de tus USDT usa en cada compra."
          valor={riesgo}
          min={1}
          max={100}
          alCambiar={setRiesgo}
          disabled={activo}
        />
        <Porcentaje
          etiqueta="Stop-loss (freno de pérdidas)"
          concepto="stop-loss"
          ayuda="Si el precio cae esto desde lo que pagaste, vende todo para limitar la pérdida."
          valor={stopLoss}
          min={1}
          max={50}
          alCambiar={setStopLoss}
          disabled={activo}
        />
        <Porcentaje
          etiqueta="Take-profit (meta de ganancia)"
          concepto="take-profit"
          ayuda="Si el precio sube esto desde lo que pagaste, vende todo y asegura la ganancia."
          valor={takeProfit}
          min={1}
          max={100}
          alCambiar={setTakeProfit}
          disabled={activo}
        />
      </fieldset>

      {activo ? (
        <Boton type="submit" variante="peligro" cargando={cargando} anchoCompleto>
          ■ Detener el bot
        </Boton>
      ) : (
        <Boton type="submit" cargando={cargando} anchoCompleto>
          ▶ Encender el bot
        </Boton>
      )}
    </form>
  );
}
