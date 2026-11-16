"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { Confirmar } from "@/componentes/ui/Dialogo";
import type { Usuario } from "@/lib/api/cuentas";
import { useCerrarSesion } from "@/lib/hooks/useSesion";

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
        className="flex items-center gap-3 rounded-full py-1 pr-3 pl-1 transition hover:bg-superficie-alta"
      >
        <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-oro-claro to-bitcoin font-titulo text-sm font-bold text-sobre-oro">
          {iniciales(usuario)}
        </span>
        <span className="hidden text-left text-sm sm:block">
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
          className="vidrio absolute right-0 z-50 mt-2 w-64 rounded-2xl p-2 shadow-2xl"
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
            className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-texto-secundario hover:bg-superficie-alta hover:text-texto"
          >
            <span aria-hidden>⛨</span> Seguridad de la cuenta
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setAbierto(false);
              setConfirmando(true);
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-error hover:bg-error/10"
          >
            <span aria-hidden>⏻</span> Cerrar sesión
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
