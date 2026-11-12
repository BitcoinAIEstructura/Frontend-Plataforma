"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const forma = "relative flex h-11 w-full items-center gap-3 rounded-xl px-[15px] text-sm font-medium";
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
          ? "bg-oro/12 text-oro shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--oro)_35%,transparent)]"
          : "text-texto-secundario hover:bg-superficie-alta hover:text-texto")
      }
    >
      {activa && <span aria-hidden className="absolute top-2 bottom-2 -left-3 w-1 rounded-r-full bg-oro" />}
      <Icono nombre={seccion.icono} />
      <span className={textoOculto(abierta)}>{seccion.titulo}</span>
    </Link>
  );
}

/**
 * Barra lateral del portátil (oculta en el teléfono). Cerrada muestra solo los iconos;
 * al acercar el cursor se abre por encima del contenido con el nombre de cada sección,
 * y al quitarlo vuelve a los iconos. El hueco que ocupa en la página no cambia, así
 * que el contenido no salta.
 */
export function BarraLateral() {
  const activa = seccionActiva(usePathname());
  const [abierta, setAbierta] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const programar = (valor: boolean, espera: number) => {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAbierta(valor), espera);
  };
  useEffect(() => () => clearTimeout(temporizador.current), []);

  return (
    <aside className="sticky top-4 z-30 hidden h-[calc(100dvh-2rem)] w-[4.75rem] shrink-0 lg:block">
      <div
        data-abierta={abierta}
        onMouseEnter={() => programar(true, ESPERA_ABRIR_MS)}
        onMouseLeave={() => programar(false, ESPERA_CERRAR_MS)}
        className={
          "vidrio absolute inset-y-0 left-0 flex flex-col gap-6 overflow-hidden rounded-3xl px-3 py-4 " +
          "transition-[width,box-shadow] duration-300 ease-out motion-reduce:transition-none " +
          (abierta ? "w-64 shadow-2xl" : "w-[4.75rem]")
        }
      >
        <div className="flex items-center gap-2.5 pt-2 pl-[9px]">
          <SimboloNexabit tamano={34} className="shrink-0" />
          <span
            aria-hidden
            className={`font-titulo text-xl font-semibold tracking-wide ${textoOculto(abierta)}`}
          >
            <span className="texto-oro">Nexa</span>
            <span className="text-texto">bit</span>
          </span>
        </div>
        <nav aria-label="Secciones" className="flex flex-col gap-1.5">
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
    "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium";
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
        (activa ? "bg-oro/12 text-oro" : "text-texto-secundario hover:bg-superficie-alta hover:text-texto")
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
        className="vidrio fixed inset-x-2 bottom-2 z-40 flex gap-1 rounded-2xl p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        {SECCIONES.filter((s) => s.enTelefono).map((s) => (
          <ElementoInferior key={s.ruta} seccion={s} activa={s === activa} />
        ))}
        <button
          type="button"
          onClick={() => setMas(true)}
          aria-haspopup="dialog"
          className={
            "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition " +
            (activaEnMas
              ? "bg-oro/12 text-oro"
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
                    "flex items-start gap-3 rounded-xl px-3 py-2.5 transition " +
                    (s === activa ? "bg-oro/12 text-oro" : "hover:bg-superficie-alta")
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
