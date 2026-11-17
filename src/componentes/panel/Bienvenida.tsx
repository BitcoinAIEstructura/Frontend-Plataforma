"use client";

import Link from "next/link";

import { Icono } from "@/componentes/marco/Iconos";
import { useUsuarioActual } from "@/lib/hooks/useSesion";

/** Franja del panel que recuerda activar la verificación en dos pasos (si falta). */
export function AvisoDosPasos() {
  const { usuario } = useUsuarioActual();
  if (!usuario || usuario.verificacionDosPasos) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-bitcoin/35 bg-bitcoin/8 px-4 py-2.5 text-sm">
      <span className="text-bitcoin">
        <Icono nombre="seguridad" tamano={18} />
      </span>
      <span className="font-semibold text-texto">Protege tu cuenta con verificación en dos pasos.</span>
      <span className="text-texto-secundario">
        Con Google Authenticator nadie entra aunque sepa tu contraseña.
      </span>
      <Link href="/seguridad" className="ml-auto font-semibold text-oro hover:underline">
        Activarla ahora
      </Link>
    </div>
  );
}
