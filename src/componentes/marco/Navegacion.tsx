"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Logo } from "@/componentes/marca/Logo";
import { Dialogo } from "@/componentes/ui/Dialogo";

import { Icono } from "./Iconos";
import { SECCIONES, seccionActiva, type Seccion } from "./secciones";

/** Preferencia de este navegador (no es un dato personal): barra con nombres o solo iconos. */
const CLAVE_EXPANDIDA = "nexabit.barra-expandida";

function leerExpandida(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CLAVE_EXPANDIDA) === "1";
  } catch {
    return false; // ventana privada o almacenamiento bloqueado: solo iconos
  }
}

function guardarExpandida(valor: boolean) {
  try {
    window.localStorage.setItem(CLAVE_EXPANDIDA, valor ? "1" : "0");
  } catch {
    // sin almacenamiento la preferencia dura hasta recargar
  }
}

/** Nombre flotante a la derecha del icono; aparece al pasar el ratón o al llegar con el teclado. */
function Globo({ children }: { children: ReactNode }) {
  return (
    <span
      className={
        "pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 translate-x-1 rounded-lg " +
        "border border-borde bg-superficie px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-texto " +
        "opacity-0 shadow-lg transition motion-reduce:transition-none " +
        "group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      }
    >
      {children}
    </span>
  );
}

/** Un elemento de la barra lateral: solo el icono (con su nombre flotante) o icono y nombre. */
function ElementoLateral({
  seccion,
  activa,
  expandida,
}: {
  seccion: Seccion;
  activa: boolean;
  expandida: boolean;
}) {
  const forma = expandida
    ? "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium"
    : "grid size-11 place-items-center rounded-xl";
  const marca = activa && (
    <span aria-hidden className="absolute top-2 bottom-2 -left-3 w-1 rounded-r-full bg-oro" />
  );
  if (!seccion.lista) {
    return (
      <span
        aria-disabled="true"
        className={`group relative ${forma} cursor-not-allowed text-texto-atenuado/70`}
      >
        <Icono nombre={seccion.icono} />
        {expandida ? (
          <>
            <span>{seccion.titulo}</span>
            <span className="ml-auto rounded-full border border-borde px-2 py-0.5 text-[10px] uppercase">
              Pronto
            </span>
          </>
        ) : (
          <Globo>
            <span>{seccion.titulo}</span> · <span className="uppercase">Pronto</span>
          </Globo>
        )}
      </span>
    );
  }
  return (
    <Link
      href={seccion.ruta}
      aria-current={activa ? "page" : undefined}
      className={
        `group relative ${forma} transition outline-none focus-visible:ring-2 focus-visible:ring-oro/60 ` +
        (activa
          ? "bg-oro/12 text-oro shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--oro)_35%,transparent)]"
          : "text-texto-secundario hover:bg-superficie-alta hover:text-texto")
      }
    >
      {marca}
      <Icono nombre={seccion.icono} />
      {expandida ? <span>{seccion.titulo}</span> : <Globo>{seccion.titulo}</Globo>}
    </Link>
  );
}

/**
 * Barra lateral del portátil (oculta en el teléfono): solo iconos, con el nombre de cada
 * sección al pasar el ratón o el teclado. Un botón la expande para ver los nombres.
 */
export function BarraLateral() {
  const activa = seccionActiva(usePathname());
  // Solo se monta en el navegador (MarcoApp espera a saber quién entró), así que puede leerse ya.
  const [expandida, setExpandida] = useState(leerExpandida);

  const alternar = () => {
    setExpandida((v) => {
      guardarExpandida(!v);
      return !v;
    });
  };

  return (
    <aside
      className={
        "vidrio sticky top-4 z-30 hidden h-[calc(100dvh-2rem)] shrink-0 flex-col gap-6 rounded-3xl py-4 transition-[width] " +
        "duration-300 motion-reduce:transition-none lg:flex " +
        (expandida ? "w-64 px-4" : "w-[4.75rem] items-center px-3")
      }
    >
      <div className={expandida ? "px-2 pt-2" : "pt-2"}>
        <Logo conNombre={expandida} tamano={34} />
      </div>
      <nav aria-label="Secciones" className={`flex flex-col gap-1.5 ${expandida ? "" : "items-center"}`}>
        {SECCIONES.map((s) => (
          <ElementoLateral key={s.ruta} seccion={s} activa={s === activa} expandida={expandida} />
        ))}
      </nav>
      <button
        type="button"
        onClick={alternar}
        aria-expanded={expandida}
        aria-label={expandida ? "Mostrar solo los iconos" : "Mostrar los nombres de las secciones"}
        className={
          "group relative mt-auto text-texto-atenuado transition outline-none hover:bg-superficie-alta hover:text-texto " +
          "focus-visible:ring-2 focus-visible:ring-oro/60 " +
          (expandida
            ? "flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm"
            : "grid size-10 place-items-center rounded-xl")
        }
      >
        <Icono nombre={expandida ? "contraer" : "expandir"} tamano={20} />
        {expandida ? <span>Solo iconos</span> : <Globo>Mostrar nombres</Globo>}
      </button>
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
