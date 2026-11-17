"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Boton, type VarianteBoton } from "./Boton";

const ENFOCABLES =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface PropsDialogo {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  /** Texto corto bajo el título (lo leen los lectores de pantalla al abrir). */
  descripcion?: ReactNode;
  children?: ReactNode;
  /** "alertdialog" para confirmar algo que no se puede deshacer. */
  rol?: "dialog" | "alertdialog";
  /** No se cierra con Escape ni tocando afuera (por ejemplo, mientras se espera al servidor). */
  bloqueado?: boolean;
}

/**
 * Ventana centrada sobre la página. Se dibuja en `document.body` (un portal) porque las
 * tarjetas de vidrio usan `backdrop-filter` y eso encierra a los elementos `fixed`.
 * - Al abrir, el foco va al primer botón o casilla; al cerrar, vuelve a donde estaba.
 * - Tab no se escapa de la ventana; Escape o tocar afuera la cierran.
 */
export function Dialogo({
  abierto,
  alCerrar,
  titulo,
  descripcion,
  children,
  rol = "dialog",
  bloqueado = false,
}: PropsDialogo) {
  const id = useId();
  const caja = useRef<HTMLDivElement>(null);
  const cerrar = useRef(alCerrar);
  const trabado = useRef(bloqueado);
  useEffect(() => {
    cerrar.current = alCerrar;
    trabado.current = bloqueado;
  });

  useEffect(() => {
    if (!abierto) return;
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const primero =
      caja.current?.querySelector<HTMLElement>("[data-autofocus]") ??
      caja.current?.querySelector<HTMLElement>(ENFOCABLES);
    primero?.focus();
    const desbordeAntes = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !trabado.current) {
        e.stopPropagation();
        cerrar.current();
      }
      if (e.key !== "Tab" || !caja.current) return;
      const enfocables = [...caja.current.querySelectorAll<HTMLElement>(ENFOCABLES)];
      const inicio = enfocables[0];
      const fin = enfocables[enfocables.length - 1];
      if (!inicio || !fin) return;
      if (e.shiftKey && document.activeElement === inicio) {
        e.preventDefault();
        fin.focus();
      } else if (!e.shiftKey && document.activeElement === fin) {
        e.preventDefault();
        inicio.focus();
      }
    };
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = desbordeAntes;
      anterior?.focus();
    };
  }, [abierto]);

  if (!abierto || typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-fondo/75 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !bloqueado) alCerrar();
      }}
    >
      <div
        ref={caja}
        role={rol}
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        aria-describedby={descripcion ? `${id}-texto` : undefined}
        className="vidrio flex motion-safe:animate-[entrar_180ms_ease-out] w-full max-w-md flex-col gap-5 rounded-md p-6 sm:p-7"
      >
        <header className="flex flex-col gap-2">
          <h2 id={`${id}-titulo`} className="text-2xl">
            {titulo}
          </h2>
          {descripcion && (
            <div id={`${id}-texto`} className="text-texto-secundario">
              {descripcion}
            </div>
          )}
        </header>
        {children}
      </div>
    </div>,
    document.body,
  );
}

interface PropsConfirmar {
  abierto: boolean;
  alCancelar: () => void;
  alConfirmar: () => void;
  titulo: string;
  descripcion: ReactNode;
  /** Lo que dice el botón que confirma: mejor un verbo claro ("Sí, cancelar la orden"). */
  confirmar: string;
  cancelar?: string;
  variante?: VarianteBoton;
  cargando?: boolean;
  /** Error del servidor, si la acción falló (la ventana sigue abierta). */
  error?: string | null;
}

/**
 * La segunda confirmación de una acción que borra o deshace algo. El foco empieza en
 * «No, volver», para que un Enter apurado no confirme nada.
 */
export function Confirmar({
  abierto,
  alCancelar,
  alConfirmar,
  titulo,
  descripcion,
  confirmar,
  cancelar = "No, volver",
  variante = "peligro",
  cargando = false,
  error,
}: PropsConfirmar) {
  return (
    <Dialogo
      abierto={abierto}
      alCerrar={alCancelar}
      titulo={titulo}
      descripcion={descripcion}
      rol="alertdialog"
      bloqueado={cargando}
    >
      {error && (
        <p
          role="alert"
          className="rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
        >
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Boton variante="fantasma" onClick={alCancelar} disabled={cargando} data-autofocus>
          {cancelar}
        </Boton>
        <Boton variante={variante} onClick={alConfirmar} cargando={cargando}>
          {confirmar}
        </Boton>
      </div>
    </Dialogo>
  );
}
