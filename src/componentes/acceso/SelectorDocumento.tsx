"use client";

import { useId } from "react";

import type { TipoDocumento } from "@/lib/api/cuentas";

const OPCIONES: { valor: TipoDocumento; titulo: string; detalle: string }[] = [
  { valor: "CC", titulo: "Cédula de ciudadanía", detalle: "Colombianos" },
  { valor: "CE", titulo: "Cédula de extranjería", detalle: "Extranjeros residentes" },
];

interface Props {
  valor: TipoDocumento;
  alCambiar: (tipo: TipoDocumento) => void;
}

/** Dos opciones grandes (cómodas en el teléfono) hechas con radios nativos: accesibles con teclado. */
export function SelectorDocumento({ valor, alCambiar }: Props) {
  const nombre = useId();
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium text-texto-secundario">Tipo de documento</legend>
      <div className="grid grid-cols-2 gap-2">
        {OPCIONES.map((o) => (
          <label
            key={o.valor}
            className={
              "flex min-h-14 cursor-pointer flex-col justify-center rounded-xl border px-3 py-2 transition " +
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-oro/60 " +
              (valor === o.valor
                ? "border-oro bg-oro/10 text-texto"
                : "border-borde-fuerte/70 text-texto-secundario hover:border-oro/50")
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
            <span className="text-sm font-semibold">
              {o.valor} · {o.titulo}
            </span>
            <span className="text-xs text-texto-atenuado">{o.detalle}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
