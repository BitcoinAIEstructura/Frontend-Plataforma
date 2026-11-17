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
      <div className="inline-flex flex-wrap gap-1 rounded-lg border border-borde bg-superficie-alta/70 p-1">
        {opciones.map((o) => (
          <label
            key={o.valor}
            className={
              "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition " +
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-oro/60 " +
              (valor === o.valor
                ? "bg-superficie text-texto shadow-[0_1px_2px_rgb(0_0_0/0.12),inset_0_-2px_0_var(--oro)]"
                : "text-texto-secundario hover:text-texto")
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
