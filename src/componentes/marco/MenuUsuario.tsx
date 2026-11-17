"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { Confirmar } from "@/componentes/ui/Dialogo";
import type { Usuario } from "@/lib/api/cuentas";
import { useCerrarSesion } from "@/lib/hooks/useSesion";

import { Icono } from "./Iconos";

export function iniciales(usuario: Pick<Usuario, "nombre" | "apellido">): string {
  return `${usuario.nombre.trim()[0] ?? ""}${usuario.apellido.trim()[0] ?? ""}`.toLocaleUpperCase("es");
}

/** Botón con las iniciales que abre un menú con la cuenta, Seguridad y Cerrar sesión. */
export function MenuUsuario({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const cerrar = useCerrarSesion();
  const [abierto, setAbierto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const idMenu = useId();

  useEffect(() => {
    if (!abierto) return;
    const alHacerClicFuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    const alPresionarTecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", alHacerClicFuera);
    document.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.removeEventListener("mousedown", alHacerClicFuera);
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [abierto]);

  async function cerrarSesion() {
    await cerrar.mutateAsync().catch(() => undefined);
    setConfirmando(false);
    router.replace("/iniciar-sesion");
  }

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={idMenu}
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-2.5 rounded-md p-1 sm:ml-1 sm:pr-2 transition hover:bg-superficie-alta"
      >
        <span className="grid size-8 place-items-center rounded-md bg-oro/15 text-xs font-bold text-oro">
          {iniciales(usuario)}
        </span>
        <span className="hidden text-left text-sm leading-tight xl:block">
          <span className="block font-semibold text-texto">
            {usuario.nombre} {usuario.apellido}
          </span>
          <span className="block text-xs text-texto-atenuado">Cuenta de práctica</span>
        </span>
        <span className="sr-only">Menú de la cuenta</span>
      </button>
      {abierto && (
        <div
          id={idMenu}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-borde bg-superficie p-1.5 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.4)]"
        >
          <div className="border-b border-borde px-3 pt-2 pb-3">
            <p className="font-semibold text-texto">
              {usuario.nombre} {usuario.apellido}
            </p>
            <p className="truncate text-sm text-texto-atenuado">{usuario.correo}</p>
          </div>
          <Link
            role="menuitem"
            href="/seguridad"
            onClick={() => setAbierto(false)}
            className="mt-1 flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-texto-secundario hover:bg-superficie-alta hover:text-texto"
          >
            <Icono nombre="seguridad" tamano={18} /> Seguridad de la cuenta
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setAbierto(false);
              setConfirmando(true);
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-error hover:bg-error/10"
          >
            <Icono nombre="salir" tamano={18} /> Cerrar sesión
          </button>
        </div>
      )}
      <Confirmar
        abierto={confirmando}
        alCancelar={() => setConfirmando(false)}
        alConfirmar={cerrarSesion}
        titulo="¿Cerrar sesión?"
        descripcion="Vas a salir de tu cuenta. Tu cartera, tus órdenes y tu historial quedan guardados para cuando vuelvas."
        confirmar="Sí, cerrar sesión"
        cargando={cerrar.isPending}
      />
    </div>
  );
}
