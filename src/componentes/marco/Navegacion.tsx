"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/componentes/marca/Logo";

import { SECCIONES, seccionActiva, type Seccion } from "./secciones";

function Elemento({ seccion, activa, compacto }: { seccion: Seccion; activa: boolean; compacto: boolean }) {
  const base = compacto
    ? "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium"
    : "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium";
  if (!seccion.lista) {
    return (
      <span aria-disabled="true" className={`${base} cursor-not-allowed text-texto-atenuado/70`}>
        <span aria-hidden className="text-base">
          {seccion.icono}
        </span>
        <span>{seccion.titulo}</span>
        {!compacto && (
          <span className="ml-auto rounded-full border border-borde px-2 py-0.5 text-[10px] uppercase">
            Pronto
          </span>
        )}
      </span>
    );
  }
  return (
    <Link
      href={seccion.ruta}
      aria-current={activa ? "page" : undefined}
      className={
        `${base} transition ` +
        (activa
          ? "bg-oro/12 text-oro shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--oro)_35%,transparent)]"
          : "text-texto-secundario hover:bg-superficie-alta hover:text-texto")
      }
    >
      <span aria-hidden className="text-base">
        {seccion.icono}
      </span>
      <span>{seccion.titulo}</span>
    </Link>
  );
}

/** Barra lateral del portátil (oculta en el teléfono). */
export function BarraLateral() {
  const activa = seccionActiva(usePathname());
  return (
    <aside className="vidrio sticky top-4 hidden h-[calc(100dvh-2rem)] w-64 shrink-0 flex-col gap-6 rounded-3xl p-4 lg:flex">
      <div className="px-2 pt-2">
        <Logo tamano={34} />
      </div>
      <nav aria-label="Secciones" className="flex flex-col gap-1">
        {SECCIONES.map((s) => (
          <Elemento key={s.ruta} seccion={s} activa={s === activa} compacto={false} />
        ))}
      </nav>
    </aside>
  );
}

/** Barra inferior del teléfono (oculta en el portátil). */
export function BarraInferior() {
  const activa = seccionActiva(usePathname());
  return (
    <nav
      aria-label="Secciones"
      className="vidrio fixed inset-x-2 bottom-2 z-40 flex gap-1 rounded-2xl p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      {SECCIONES.filter((s) => s.enTelefono).map((s) => (
        <Elemento key={s.ruta} seccion={s} activa={s === activa} compacto />
      ))}
    </nav>
  );
}
