"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";

import { SimboloNexabit } from "@/componentes/marca/Logo";
import { Dialogo } from "@/componentes/ui/Dialogo";

import { Icono } from "./Iconos";
import { SECCIONES, seccionActiva, type Seccion } from "./secciones";

/** Espera antes de abrir (pasar de largo con el cursor no la abre) y antes de cerrar (salirse un poco no la cierra). */
export const ESPERA_ABRIR_MS = 90;
export const ESPERA_CERRAR_MS = 220;

/** Lo que solo se ve con la barra abierta: el nombre se desvanece sin moverse de su sitio. */
function textoOculto(abierta: boolean) {
  return (
    "whitespace-nowrap transition-opacity duration-200 motion-reduce:transition-none " +
    (abierta ? "opacity-100 delay-75" : "opacity-0")
  );
}

/** Un elemento de la barra lateral: el icono siempre; el nombre aparece cuando la barra se abre. */
function ElementoLateral({
  seccion,
  activa,
  abierta,
}: {
  seccion: Seccion;
  activa: boolean;
  abierta: boolean;
}) {
  // El icono queda centrado en la barra cerrada (52 px de ancho útil) y no se mueve al abrirse.
  const forma = "relative flex h-10 w-full items-center gap-3 rounded-md px-[15px] text-sm font-medium";
  if (!seccion.lista) {
    return (
      <span aria-disabled="true" className={`${forma} cursor-not-allowed text-texto-atenuado/70`}>
        <Icono nombre={seccion.icono} />
        <span className={textoOculto(abierta)}>{seccion.titulo}</span>
        <span
          className={`ml-auto rounded-full border border-borde px-2 py-0.5 text-[10px] uppercase ${textoOculto(abierta)}`}
        >
          Pronto
        </span>
      </span>
    );
  }
  return (
    <Link
      href={seccion.ruta}
      aria-current={activa ? "page" : undefined}
      className={
        `${forma} transition-colors outline-none focus-visible:ring-2 focus-visible:ring-oro/60 ` +
        (activa
          ? "bg-superficie-alta text-texto"
          : "text-texto-secundario hover:bg-superficie-alta hover:text-texto")
      }
    >
      {activa && <span aria-hidden className="absolute inset-y-1.5 -left-3 w-[3px] bg-oro" />}
      <Icono nombre={seccion.icono} />
      <span className={textoOculto(abierta)}>{seccion.titulo}</span>
    </Link>
  );
}

/**
 * Barra lateral del portátil (oculta en el teléfono). Cerrada muestra solo los iconos;
 * al acercar el cursor se abre por encima del contenido con el nombre de cada sección,
 * y al quitarlo vuelve a los iconos. Con el teclado se abre al llegar con Tab y se
 * cierra al salir de ella o con Escape. El hueco que ocupa en la página no cambia, así
 * que el contenido no salta.
 */
export function BarraLateral() {
  const activa = seccionActiva(usePathname());
  const [abierta, setAbierta] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /** Si el foco llegó por un clic o un toque (no por el teclado). */
  const conPuntero = useRef(false);

  const programar = (valor: boolean, espera: number) => {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAbierta(valor), espera);
  };
  useEffect(() => {
    // Se escucha en toda la página: a la barra también se llega con Tab desde afuera.
    const puntero = () => {
      conPuntero.current = true;
    };
    const teclado = () => {
      conPuntero.current = false;
    };
    window.addEventListener("pointerdown", puntero, true);
    window.addEventListener("keydown", teclado, true);
    return () => {
      window.removeEventListener("pointerdown", puntero, true);
      window.removeEventListener("keydown", teclado, true);
      clearTimeout(temporizador.current);
    };
  }, []);

  const alEnfocar = () => {
    // Solo con el teclado: un clic deja el foco en el enlace y la barra quedaría abierta.
    if (!conPuntero.current) {
      clearTimeout(temporizador.current);
      setAbierta(true);
    }
  };
  const alDesenfocar = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      clearTimeout(temporizador.current);
      setAbierta(false);
    }
  };
  const alTeclear = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      clearTimeout(temporizador.current);
      setAbierta(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[4.75rem] lg:block">
      <div
        data-abierta={abierta}
        onMouseEnter={() => programar(true, ESPERA_ABRIR_MS)}
        onMouseLeave={() => programar(false, ESPERA_CERRAR_MS)}
        onFocus={alEnfocar}
        onBlur={alDesenfocar}
        onKeyDown={alTeclear}
        className={
          "absolute inset-y-0 left-0 flex flex-col gap-4 overflow-hidden border-r border-borde bg-superficie px-3 pb-4 " +
          "transition-[width,box-shadow] duration-300 ease-out motion-reduce:transition-none " +
          (abierta ? "w-60 shadow-[16px_0_40px_-20px_rgb(0_0_0/0.35)]" : "w-[4.75rem]")
        }
      >
        <div className="-mx-3 flex h-14 shrink-0 items-center gap-2.5 border-b border-borde pl-[21px]">
          <SimboloNexabit tamano={30} className="shrink-0" />
          <span aria-hidden className={`text-lg font-semibold tracking-tight ${textoOculto(abierta)}`}>
            <span className="text-oro">Nexa</span>
            <span className="text-texto">bit</span>
          </span>
        </div>
        <nav aria-label="Secciones" className="flex flex-col gap-1">
          {SECCIONES.map((s) => (
            <ElementoLateral key={s.ruta} seccion={s} activa={s === activa} abierta={abierta} />
          ))}
        </nav>
      </div>
    </aside>
  );
}

/** Un elemento de la barra inferior del teléfono: icono con su nombre debajo. */
function ElementoInferior({ seccion, activa }: { seccion: Seccion; activa: boolean }) {
  const base =
    "flex min-h-13 flex-1 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium";
  if (!seccion.lista) {
    return (
      <span aria-disabled="true" className={`${base} cursor-not-allowed text-texto-atenuado/70`}>
        <Icono nombre={seccion.icono} tamano={20} />
        <span>{seccion.titulo}</span>
      </span>
    );
  }
  return (
    <Link
      href={seccion.ruta}
      aria-current={activa ? "page" : undefined}
      className={
        `${base} transition ` +
        (activa ? "bg-oro/10 text-oro" : "text-texto-secundario hover:bg-superficie-alta hover:text-texto")
      }
    >
      <Icono nombre={seccion.icono} tamano={20} />
      <span>{seccion.titulo}</span>
    </Link>
  );
}

/** Barra inferior del teléfono (oculta en el portátil): 4 secciones y «Más» con todas. */
export function BarraInferior() {
  const activa = seccionActiva(usePathname());
  const [mas, setMas] = useState(false);
  const activaEnMas = activa !== undefined && !activa.enTelefono;
  return (
    <>
      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-40 flex gap-1 border-t border-borde bg-superficie px-1.5 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        {SECCIONES.filter((s) => s.enTelefono).map((s) => (
          <ElementoInferior key={s.ruta} seccion={s} activa={s === activa} />
        ))}
        <button
          type="button"
          onClick={() => setMas(true)}
          aria-haspopup="dialog"
          className={
            "flex min-h-13 flex-1 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition " +
            (activaEnMas
              ? "bg-oro/10 text-oro"
              : "text-texto-secundario hover:bg-superficie-alta hover:text-texto")
          }
        >
          <Icono nombre="mas" tamano={20} />
          <span>Más</span>
        </button>
      </nav>
      <Dialogo abierto={mas} alCerrar={() => setMas(false)} titulo="Todas las secciones">
        <nav aria-label="Todas las secciones">
          <ul className="flex flex-col gap-1">
            {SECCIONES.filter((s) => s.lista).map((s) => (
              <li key={s.ruta}>
                <Link
                  href={s.ruta}
                  onClick={() => setMas(false)}
                  aria-current={s === activa ? "page" : undefined}
                  className={
                    "flex items-start gap-3 rounded-md px-3 py-2.5 transition " +
                    (s === activa ? "bg-oro/10 text-oro" : "hover:bg-superficie-alta")
                  }
                >
                  <Icono nombre={s.icono} className="mt-0.5" />
                  <span className="flex flex-col">
                    <span className="font-semibold text-texto">{s.titulo}</span>
                    <span className="text-sm text-texto-secundario">{s.descripcion}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Dialogo>
    </>
  );
}
