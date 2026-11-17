"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";

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

type Modo = ConfiguracionBot["modo"];

export const MODOS: readonly { valor: Modo; etiqueta: string }[] = [
  { valor: "ia", etiqueta: "Piloto IA" },
  { valor: "reglas", etiqueta: "Reglas (indicadores)" },
];

/** Una fila del panel de ajustes: rótulo corto a la izquierda y el control a la derecha. */
function Fila({ rotulo, children }: { rotulo: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-1.5 border-b border-borde/70 pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center sm:gap-3">
      <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-texto-atenuado uppercase">
        {rotulo}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * Un control deslizante en porcentaje, en una fila: rótulo corto, barra y el valor al lado.
 * `nombre` es el nombre completo para los lectores de pantalla (contiene el rótulo visible);
 * la explicación queda en la ayuda (?) y como descripción del control.
 */
function Porcentaje({
  rotulo,
  nombre,
  concepto,
  ayuda,
  valor,
  min,
  max,
  alCambiar,
  disabled,
}: {
  rotulo: string;
  nombre: string;
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
    <Fila
      rotulo={
        <>
          <span aria-hidden>{rotulo}</span>
          <Termino concepto={concepto} />
        </>
      }
    >
      <div className="flex items-center gap-3" title={ayuda}>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={1}
          value={valor}
          disabled={disabled}
          aria-label={nombre}
          aria-describedby={`${id}-ayuda`}
          onChange={(e) => alCambiar(Number(e.target.value))}
          className="min-w-0 flex-1 accent-oro disabled:opacity-55"
        />
        <output htmlFor={id} className="cifra w-12 text-right text-sm font-semibold text-texto">
          {valor} %
        </output>
      </div>
      <p id={`${id}-ayuda`} className="sr-only">
        {ayuda}
      </p>
    </Fila>
  );
}

/** Convierte lo que se ve (porcentajes enteros) en lo que espera el backend (fracciones). */
export function aConfiguracion(c: {
  segundos: Segundos;
  intervalo: Intervalo;
  riesgo: number;
  stopLoss: number;
  takeProfit: number;
  modo?: Modo;
}): Partial<ConfiguracionBot> {
  return {
    modo: c.modo,
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
  /** Si el servidor tiene la IA lista para manejar el bot. */
  pilotoDisponible?: boolean;
}

/** Ajustes del bot. Mientras está en marcha se ven, pero no se cambian (hay que detenerlo). */
export function FormularioBot({
  actual,
  activo,
  cargando,
  alIniciar,
  alDetener,
  pilotoDisponible = false,
}: Props) {
  // Con la IA disponible se propone el piloto (si el bot ya está en marcha, se muestra cómo va).
  const [modo, setModo] = useState<Modo>(pilotoDisponible ? (activo ? actual.modo : "ia") : "reglas");
  const ia = modo === "ia";
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
    else alIniciar(aConfiguracion({ segundos, intervalo, riesgo, stopLoss, takeProfit, modo }));
  };

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <fieldset disabled={activo} className="flex flex-col gap-3 disabled:opacity-80">
        <legend className="sr-only">Ajustes del bot</legend>
        {pilotoDisponible && (
          <Fila rotulo={<span aria-hidden>Decide</span>}>
            <Segmentado
              etiqueta="Quién decide las operaciones"
              opciones={MODOS}
              valor={modo}
              alCambiar={setModo}
            />
            <p className="mt-1.5 text-xs text-texto-atenuado" aria-live="polite">
              {ia
                ? "Tres modelos votan y eligen cuánto arriesgar; abajo pones los topes."
                : "Medias, RSI y MACD con los valores exactos de abajo."}
            </p>
          </Fila>
        )}
        <Fila rotulo={<span aria-hidden>Revisa</span>}>
          <Segmentado
            etiqueta="Cada cuánto revisa el mercado"
            opciones={CADA_CUANTO}
            valor={segundos}
            alCambiar={setSegundos}
          />
        </Fila>
        <Fila
          rotulo={
            <>
              <span aria-hidden>Velas</span>
              <Termino concepto="vela" />
            </>
          }
        >
          <Segmentado
            etiqueta="Intervalo de las velas que analiza"
            opciones={OPCIONES_INTERVALO}
            valor={intervalo}
            alCambiar={setIntervalo}
          />
        </Fila>
        <Porcentaje
          rotulo={ia ? "Riesgo máx." : "Riesgo"}
          nombre={ia ? "Riesgo máximo por compra" : "Riesgo por compra"}
          concepto="riesgo"
          ayuda={
            ia
              ? "Lo máximo de tus USDT que la IA puede usar; con poca confianza usa menos."
              : "Qué parte de tus USDT usa en cada compra."
          }
          valor={riesgo}
          min={1}
          max={100}
          alCambiar={setRiesgo}
          disabled={activo}
        />
        <Porcentaje
          rotulo={ia ? "Stop-loss máx." : "Stop-loss"}
          nombre={ia ? "Stop-loss máximo" : "Stop-loss (freno de pérdidas)"}
          concepto="stop-loss"
          ayuda={
            ia
              ? "La IA lo ajusta a la volatilidad del mercado, sin pasar de este valor."
              : "Si el precio cae esto desde lo que pagaste, vende todo para limitar la pérdida."
          }
          valor={stopLoss}
          min={1}
          max={50}
          alCambiar={setStopLoss}
          disabled={activo}
        />
        <Porcentaje
          rotulo={ia ? "Take-profit máx." : "Take-profit"}
          nombre={ia ? "Take-profit máximo" : "Take-profit (meta de ganancia)"}
          concepto="take-profit"
          ayuda={
            ia
              ? "La IA pone la meta en el doble de su stop-loss, sin pasar de este valor."
              : "Si el precio sube esto desde lo que pagaste, vende todo y asegura la ganancia."
          }
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
          {ia ? "Encender el piloto IA" : "Encender el bot"}
        </Boton>
      )}
    </form>
  );
}
