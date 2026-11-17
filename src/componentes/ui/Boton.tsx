import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

export type VarianteBoton = "dorado" | "contorno" | "fantasma" | "peligro";

const VARIANTES: Record<VarianteBoton, string> = {
  // La acción principal: latón macizo, sin brillos.
  dorado: "bg-oro text-sobre-oro hover:bg-oro-profundo active:translate-y-px",
  contorno: "border border-oro/50 text-oro hover:border-oro hover:bg-oro/8",
  fantasma: "text-texto-secundario hover:bg-superficie-alta hover:text-texto",
  peligro: "border border-error/60 text-error hover:bg-error/10",
};

/** Clases de un botón, para que un enlace (`<Link>`) se vea igual que un `<Boton>`.
 * Apagado se ve gris y sin brillo, para que nadie piense que se puede tocar. */
export function clasesBoton(variante: VarianteBoton = "dorado", anchoCompleto = false): string {
  return (
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 font-semibold " +
    "transition disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:saturate-0 " +
    `${VARIANTES[variante]} ${anchoCompleto ? "w-full" : ""}`
  );
}

export interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  /** Muestra un indicador y deshabilita el botón mientras se espera al servidor. */
  cargando?: boolean;
  anchoCompleto?: boolean;
  icono?: ReactNode;
  /** Para darle el foco desde afuera (en React 19 ref es una prop más). */
  ref?: Ref<HTMLButtonElement>;
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
      className={`${clasesBoton(variante, anchoCompleto)} ${className}`}
      {...resto}
    >
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
