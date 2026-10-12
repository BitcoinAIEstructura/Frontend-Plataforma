"use client";

import { useId } from "react";

interface Opcion<T extends string> {
  valor: T;
  etiqueta: string;
}

interface Props<T extends string> {
  etiqueta: string;
  opciones: readonly Opcion<T>[];
  valor: T;
  alCambiar: (valor: T) => void;
  className?: string;
}

/** Botones pegados para elegir una opción (intervalo, indicador…), hechos con radios nativos. */
export function Segmentado<T extends string>({
  etiqueta,
  opciones,
  valor,
  alCambiar,
  className = "",
}: Props<T>) {
  const nombre = useId();
  return (
    <fieldset className={className}>
      <legend className="sr-only">{etiqueta}</legend>
      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-borde bg-superficie-alta/60 p-1">
        {opciones.map((o) => (
          <label
            key={o.valor}
            className={
              "cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition " +
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-oro/60 " +
              (valor === o.valor ? "bg-oro text-sobre-oro shadow" : "text-texto-secundario hover:text-texto")
            }
          >
            <input
              type="radio"
              name={nombre}
              value={o.valor}
              checked={valor === o.valor}
              onChange={() => alCambiar(o.valor)}
              className="sr-only"
            />
            {o.etiqueta}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
