import type { HTMLAttributes, ReactNode } from "react";

export interface PropsTarjeta extends HTMLAttributes<HTMLElement> {
  titulo?: ReactNode;
  /** Acción o dato a la derecha del título (un botón, una insignia…). */
  extra?: ReactNode;
  /** Con filo dorado: para destacar lo más importante de la pantalla. */
  destacada?: boolean;
  como?: "section" | "article" | "div";
}

export function Tarjeta({
  titulo,
  extra,
  destacada = false,
  como: Etiqueta = "section",
  className = "",
  children,
  ...resto
}: PropsTarjeta) {
  return (
    <Etiqueta
      // Con nombre, la sección aparece como región en los lectores de pantalla.
      aria-label={typeof titulo === "string" ? titulo : undefined}
      className={`vidrio rounded-2xl p-5 sm:p-6 ${destacada ? "borde-oro" : ""} ${className}`}
      {...resto}
    >
      {(titulo || extra) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {titulo && <h2 className="text-base font-semibold text-texto sm:text-lg">{titulo}</h2>}
          {extra}
        </header>
      )}
      {children}
    </Etiqueta>
  );
}
