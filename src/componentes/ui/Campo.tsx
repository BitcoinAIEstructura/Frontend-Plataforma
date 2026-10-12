"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

export interface PropsCampo extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  etiqueta: string;
  /** Mensaje de error bajo la casilla; la marca como inválida para los lectores de pantalla. */
  error?: string | null;
  ayuda?: ReactNode;
  /** Para contraseñas: agrega el botón "Mostrar / Ocultar". */
  revelable?: boolean;
}

export function Campo({
  etiqueta,
  error,
  ayuda,
  revelable = false,
  type = "text",
  className = "",
  ...resto
}: PropsCampo) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;
  const tipo = revelable ? (visible ? "text" : "password") : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-texto-secundario">
        {etiqueta}
      </label>
      <div className="relative">
        <input
          id={id}
          type={tipo}
          aria-invalid={error ? true : undefined}
          aria-describedby={[idAyuda, idError].filter(Boolean).join(" ") || undefined}
          className={
            "min-h-11 w-full rounded-xl border bg-superficie-alta/70 px-4 text-base text-texto " +
            "placeholder:text-texto-atenuado transition focus:outline-none focus:ring-2 focus:ring-oro/60 " +
            (error ? "border-error" : "border-borde-fuerte/70 hover:border-oro/50") +
            (revelable ? " pr-24" : "")
          }
          {...resto}
        />
        {revelable && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            className="absolute inset-y-1 right-1 rounded-lg px-3 text-sm font-medium text-oro hover:bg-oro/10"
          >
            {visible ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>
      {ayuda && (
        <div id={idAyuda} className="text-sm text-texto-atenuado">
          {ayuda}
        </div>
      )}
      {error && (
        <p id={idError} role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
