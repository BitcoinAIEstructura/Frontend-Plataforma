"use client";

import { useState } from "react";

import { Segmentado } from "@/componentes/ui/Segmentado";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { INTERVALOS_IA, type IntervaloIA } from "@/lib/api/ia";
import { haceCuanto } from "@/lib/formato";
import { usePredicciones } from "@/lib/hooks/useDatos";

import { ArbolIA, Caracteristicas } from "./Detalle";
import { TarjetaEvaluacion } from "./Evaluacion";
import { TarjetaComite } from "./TarjetaComite";
import { TarjetaModelo } from "./TarjetaModelo";

const NOMBRE: Record<IntervaloIA, string> = { "15m": "15 min", "1h": "1 h", "4h": "4 h", "1d": "1 día" };
const OPCIONES = INTERVALOS_IA.map((valor) => ({ valor, etiqueta: NOMBRE[valor] }));

/** Predicciones IA: tres modelos hechos a mano y un comité, medidos con honestidad. */
export function PantallaIA() {
  const [intervalo, setIntervalo] = useState<IntervaloIA>("1h");
  const prediccion = usePredicciones(intervalo);
  const p = prediccion.data;
  const actualizando = prediccion.isFetching && p?.intervalo !== intervalo;

  return (
    <div className="flex flex-col gap-5">
      <Tarjeta como="div" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-wide text-oro uppercase">Hecho a mano</p>
          <p className="max-w-2xl text-texto-secundario">
            Regresión logística, árbol de decisión y k vecinos, programados sin librerías de aprendizaje, más
            un comité que los combina. Todos responden lo mismo: ¿la próxima vela cerrará más arriba?
          </p>
        </div>
        <Segmentado
          etiqueta="Velas que analiza"
          opciones={OPCIONES}
          valor={intervalo}
          alCambiar={setIntervalo}
        />
      </Tarjeta>

      {prediccion.isError && !p ? (
        <p role="alert" className="text-error">
          {prediccion.error.message}
        </p>
      ) : !p || actualizando ? (
        <Tarjeta como="div" className="grid place-items-center py-16 text-center">
          <p role="status" className="flex flex-col items-center gap-3 text-texto-secundario">
            <span
              aria-hidden
              className="size-8 animate-spin rounded-full border-2 border-oro border-t-transparent"
            />
            Entrenando los tres modelos con 1000 velas de {NOMBRE[intervalo]}… tarda unos segundos.
          </p>
        </Tarjeta>
      ) : (
        <>
          <TarjetaComite comite={p.comite} velas={NOMBRE[p.intervalo]} />
          <div className="grid gap-5 lg:grid-cols-3">
            {p.modelos.map((m) => (
              <TarjetaModelo key={m.nombre} modelo={m} />
            ))}
          </div>
          <TarjetaEvaluacion prediccion={p} />
          <div className="grid gap-5 lg:grid-cols-2">
            <ArbolIA arbol={p.arbol} />
            <Caracteristicas caracteristicas={p.caracteristicas} />
          </div>
          <p className="px-1 text-xs text-texto-atenuado">
            Entrenado {haceCuanto(p.entrenadoEn)}; se vuelve a entrenar cada 10 minutos. {p.aviso}
          </p>
        </>
      )}
    </div>
  );
}
