import type { HTMLAttributes, ReactNode } from "react";

export interface PropsTarjeta extends HTMLAttributes<HTMLElement> {
  titulo?: ReactNode;
  /** Acción o dato a la derecha del título (un botón, una insignia…). */
  extra?: ReactNode;
  /** Con filete de latón arriba: para destacar lo más importante de la pantalla. */
  destacada?: boolean;
  /**
   * Para listas largas: el título queda fijo y el contenido se desplaza por dentro.
   * `true`: llena el alto que le dé su contenedor (por ejemplo, `ColumnaPareja`).
   * `"tope"`: para la tarjeta de arriba de una columna: crece con su contenido hasta la
   * mitad del alto y desde ahí se desplaza, para dejarle sitio a la de abajo.
   */
  desplazable?: boolean | "tope";
  como?: "section" | "article" | "div";
}

const ALTOS = {
  // En el teléfono (una sola columna) las dos tienen un alto máximo y scroll propio.
  llenar: "max-h-[36rem] lg:max-h-none lg:min-h-[12rem] lg:flex-1",
  tope: "max-h-[24rem] shrink-0 lg:max-h-[50%]",
} as const;

export function Tarjeta({
  titulo,
  extra,
  destacada = false,
  desplazable = false,
  como: Etiqueta = "section",
  className = "",
  children,
  ...resto
}: PropsTarjeta) {
  return (
    <Etiqueta
      // Con nombre, la sección aparece como región en los lectores de pantalla.
      aria-label={typeof titulo === "string" ? titulo : undefined}
      className={
        `vidrio rounded-md p-4 sm:p-5 ${destacada ? "borde-oro" : ""} ` +
        `${desplazable ? "flex min-h-0 flex-col" : ""} ${desplazable ? ALTOS[desplazable === "tope" ? "tope" : "llenar"] : ""} ${className}`
      }
      {...resto}
    >
      {(titulo || extra) && (
        <header className="-mx-4 mb-4 flex min-h-6 shrink-0 items-center justify-between gap-3 border-b border-borde px-4 pb-3 sm:-mx-5 sm:px-5">
          {titulo && (
            <h2 className="text-xs font-semibold tracking-[0.12em] text-texto-secundario uppercase">
              {titulo}
            </h2>
          )}
          {extra}
        </header>
      )}
      {desplazable ? (
        // tabIndex: con el teclado también se puede llegar al recuadro y desplazarlo con las flechas.
        <div tabIndex={0} className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-gutter:stable]">
          {children}
        </div>
      ) : (
        children
      )}
    </Etiqueta>
  );
}

/**
 * Columna derecha que mide lo mismo que la izquierda en el portátil: su contenido no
 * empuja la fila, sino que llena el alto disponible (y una `Tarjeta desplazable` hace
 * scroll por dentro). En el teléfono es una columna normal.
 */
export function ColumnaPareja({
  children,
  className = "",
  desde = "lg",
}: {
  children: ReactNode;
  className?: string;
  /** Desde qué ancho hay dos columnas (el mismo de la cuadrícula que la contiene). */
  desde?: "lg" | "xl";
}) {
  const fuera = desde === "lg" ? "lg:min-h-[28rem]" : "xl:min-h-[28rem]";
  // overflow-y-auto: red de seguridad; si todo junto no cabe, la columna se desplaza en vez de salirse.
  const dentro =
    desde === "lg"
      ? "lg:absolute lg:inset-0 lg:overflow-y-auto"
      : "xl:absolute xl:inset-0 xl:overflow-y-auto";
  return (
    <div className={`relative ${fuera} ${className}`}>
      <div className={`flex flex-col gap-4 ${dentro}`}>{children}</div>
    </div>
  );
}
