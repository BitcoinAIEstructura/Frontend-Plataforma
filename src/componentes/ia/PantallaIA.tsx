"use client";

import { useState } from "react";

import { Segmentado } from "@/componentes/ui/Segmentado";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { IntervaloIA } from "@/lib/api/ia";
import { haceCuanto } from "@/lib/formato";
import { useFuentesIA, usePredicciones } from "@/lib/hooks/useDatos";

import { ArbolIA, Caracteristicas } from "./Detalle";
import { TarjetaEvaluacion } from "./Evaluacion";
import { TarjetaComite } from "./TarjetaComite";
import { TarjetaFuentes } from "./TarjetaFuentes";
import { TarjetaModelo } from "./TarjetaModelo";
import { TarjetaRendimientoIA } from "./RendimientoIA";

/**
 * Predicciones IA: tres modelos hechos a mano y un comité, medidos con honestidad. Los textos
 * (encabezado, nombres de los intervalos, ideas y veredictos) vienen del backend.
 */
export function PantallaIA() {
  const [intervalo, setIntervalo] = useState<IntervaloIA>("1h");
  const prediccion = usePredicciones(intervalo);
  const fuentes = useFuentesIA(intervalo);
  const p = prediccion.data;
  const actualizando = prediccion.isFetching && p?.intervalo !== intervalo;
  const opciones = (p?.intervalos ?? []).map((i) => ({ valor: i.codigo, etiqueta: i.nombre }));
  const pedido = p?.intervalos.find((i) => i.codigo === intervalo)?.nombre;

  return (
    <div className="flex flex-col gap-5">
      {p && (
        <Tarjeta como="div" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-oro uppercase">{p.encabezado.etiqueta}</p>
            <p className="max-w-2xl leading-relaxed text-texto-secundario">{p.encabezado.texto}</p>
          </div>
          <Segmentado
            etiqueta="Velas que analiza"
            opciones={opciones}
            valor={intervalo}
            alCambiar={setIntervalo}
          />
        </Tarjeta>
      )}

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
            Entrenando los tres modelos con 1000 velas{pedido ? ` de ${pedido}` : ""} y los datos de otras
            fuentes… tarda unos segundos.
          </p>
        </Tarjeta>
      ) : (
        <>
          <TarjetaComite comite={p.comite} velas={p.nombreIntervalo} />
          <div className="grid gap-5 lg:grid-cols-3">
            {p.modelos.map((m) => (
              <TarjetaModelo key={m.nombre} modelo={m} />
            ))}
          </div>
          <TarjetaRendimientoIA prediccion={p} />
          <TarjetaFuentes fuentes={fuentes.data} externos={p.fuentesExternas} />
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
