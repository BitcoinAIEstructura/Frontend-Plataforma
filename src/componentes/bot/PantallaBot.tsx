"use client";

import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { useAccionesBot, useBot, useHistorial } from "@/lib/hooks/useDatos";

import { ActividadBot, EstadoBot } from "./EstadoBot";
import { FormularioBot } from "./FormularioBot";
import { MaquinaDelTiempo } from "./MaquinaDelTiempo";

/** Bot: ajustes y encendido a la izquierda; estado y actividad a la derecha. */
export function PantallaBot() {
  const bot = useBot();
  const historial = useHistorial(100);
  const { iniciar, detener } = useAccionesBot();
  const error = iniciar.error ?? detener.error;

  if (bot.isError && !bot.data) {
    return (
      <p role="alert" className="text-error">
        {bot.error.message}
      </p>
    );
  }
  if (!bot.data) {
    return (
      <p role="status" className="text-texto-secundario">
        Cargando tu bot…
      </p>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="flex flex-col gap-5 lg:col-span-2">
        <Tarjeta titulo="Tu bot" destacada>
          <p className="mb-5 text-sm text-texto-secundario">
            Con el <strong className="font-medium text-texto">piloto IA</strong>, el comité de modelos decide
            por ti y ajusta el riesgo a su confianza. Con las{" "}
            <strong className="font-medium text-texto">reglas</strong>, sigue la estrategia combinada (cruce
            de medias, RSI y MACD). En los dos casos se activa tu stop-loss o take-profit.{" "}
            <strong className="font-medium text-texto">También puede perder</strong>: es práctica con dinero
            simulado.
          </p>
          <FormularioBot
            actual={bot.data.configuracion}
            activo={bot.data.activo}
            pilotoDisponible={bot.data.pilotoDisponible}
            cargando={iniciar.isPending || detener.isPending}
            alIniciar={(c) => {
              detener.reset();
              iniciar.mutate(c);
            }}
            alDetener={() => {
              iniciar.reset();
              detener.mutate();
            }}
          />
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-error">
              {error.message}
            </p>
          )}
        </Tarjeta>
      </div>
      <div className="flex flex-col gap-5 lg:col-span-3">
        <EstadoBot estado={bot.data} />
        <ActividadBot eventos={historial.data ?? []} />
      </div>
      <div className="lg:col-span-5">
        <MaquinaDelTiempo />
      </div>
    </div>
  );
}
