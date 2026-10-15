"use client";

import { useId, type ReactNode } from "react";

import { leerMonto } from "@/componentes/ordenes/calculos";
import { usdt } from "@/lib/formato";

/**
 * Deja solo lo que puede ser un monto: números, un separador decimal y como mucho
 * `decimales` cifras después de él. Acepta coma ("150,50") o punto ("150.50"); los
 * puntos de miles a la colombiana ("1.250,50") también pasan.
 */
export function limpiarMonto(texto: string, decimales = 2): string {
  let limpio = texto.replace(/[^\d.,]/g, "");
  const coma = limpio.indexOf(",");
  if (coma >= 0) {
    // Con coma, la coma es el decimal: se quitan las comas de más y se cortan los decimales.
    const entero = limpio.slice(0, coma);
    const fraccion = limpio.slice(coma + 1).replace(/[.,]/g, "");
    return decimales === 0 ? entero : `${entero},${fraccion.slice(0, decimales)}`;
  }
  // Sin coma, un único punto es decimal ("150.5"), salvo con 3 cifras detrás: "1.250" son miles.
  const partes = limpio.split(".");
  if (partes.length === 2) {
    const [entero = "", fraccion = ""] = partes;
    if (fraccion.length !== 3)
      limpio = decimales === 0 ? entero : `${entero}.${fraccion.slice(0, decimales)}`;
  }
  return limpio;
}

export interface PropsCampoDinero {
  etiqueta: string;
  valor: string;
  alCambiar: (texto: string) => void;
  /** Lo que se muestra a la derecha de la casilla. */
  moneda?: string;
  decimales?: number;
  /** Cómo leer el monto en voz alta bajo la casilla: "Vas a gastar 150,50 USDT". */
  lectura?: (monto: number) => ReactNode;
  error?: string | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Casilla para escribir dinero, pensada para quien empieza: acepta decimales con coma o
 * punto, dice qué moneda es y muestra debajo cómo quedó la cifra, para no confundir
 * 1.500 (mil quinientos) con 1,500.
 */
export function CampoDinero({
  etiqueta,
  valor,
  alCambiar,
  moneda = "USDT",
  decimales = 2,
  lectura = (monto) => `= ${usdt(monto)} ${moneda}`,
  error,
  placeholder = "0,00",
  disabled = false,
  className = "",
}: PropsCampoDinero) {
  const id = useId();
  const monto = leerMonto(valor);
  const valido = Number.isFinite(monto) && monto > 0;
  const idAyuda = `${id}-ayuda`;
  const idError = error ? `${id}-error` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-texto-secundario">
        {etiqueta}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={valor}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => alCambiar(limpiarMonto(e.target.value, decimales))}
          aria-invalid={error ? true : undefined}
          aria-describedby={[idAyuda, idError].filter(Boolean).join(" ")}
          className={
            "cifra min-h-12 w-full rounded-xl border bg-superficie-alta/70 py-2 pr-20 pl-4 text-lg text-texto " +
            "placeholder:text-texto-atenuado transition focus:outline-none focus:ring-2 focus:ring-oro/60 " +
            "disabled:opacity-60 " +
            (error ? "border-error" : "border-borde-fuerte/70 hover:border-oro/50")
          }
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-texto-atenuado"
        >
          {moneda}
        </span>
      </div>
      <p
        id={idAyuda}
        className={`min-h-5 text-sm ${valido && !disabled ? "cifra text-texto-secundario" : "text-texto-atenuado"}`}
        aria-live="polite"
      >
        {valido && !disabled
          ? lectura(monto)
          : decimales > 0
            ? `Puedes usar decimales con coma: 150,50`
            : null}
      </p>
      {error && (
        <p id={idError} role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
