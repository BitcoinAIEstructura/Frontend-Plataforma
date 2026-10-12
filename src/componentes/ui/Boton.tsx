import type { ButtonHTMLAttributes, ReactNode } from "react";

export type VarianteBoton = "dorado" | "contorno" | "fantasma" | "peligro";

const VARIANTES: Record<VarianteBoton, string> = {
  // La acción principal: oro con destello, para invitar a usarla.
  dorado:
    "relative overflow-hidden bg-gradient-to-r from-oro-profundo via-oro to-oro-claro text-sobre-oro " +
    "shadow-[0_10px_30px_-10px_var(--oro)] hover:brightness-110 active:brightness-95",
  contorno: "border border-oro/50 text-oro hover:bg-oro/10",
  fantasma: "text-texto-secundario hover:bg-superficie-alta hover:text-texto",
  peligro: "border border-error/60 text-error hover:bg-error/10",
};

export interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  /** Muestra un indicador y deshabilita el botón mientras se espera al servidor. */
  cargando?: boolean;
  anchoCompleto?: boolean;
  icono?: ReactNode;
}

export function Boton({
  variante = "dorado",
  cargando = false,
  anchoCompleto = false,
  icono,
  children,
  className = "",
  disabled,
  type = "button",
  ...resto
}: PropsBoton) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 font-semibold " +
        "transition disabled:cursor-not-allowed disabled:opacity-55 " +
        `${VARIANTES[variante]} ${anchoCompleto ? "w-full" : ""} ${className}`
      }
      {...resto}
    >
      {variante === "dorado" && (
        <span
          aria-hidden
          className="animar-destello pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/25 blur-md"
        />
      )}
      {cargando ? (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        icono
      )}
      <span className="relative">{children}</span>
    </button>
  );
}
