"use client";

import { useUsuarioActual } from "@/lib/hooks/useSesion";

import { ColumnaPareja } from "@/componentes/ui/Tarjeta";

import { TarjetaActividad } from "./TarjetaActividad";
import { TarjetaContrasena } from "./TarjetaContrasena";
import { TarjetaDosPasos } from "./TarjetaDosPasos";
import { TarjetaSesiones } from "./TarjetaSesiones";

/** Centro de seguridad: verificación en dos pasos, dispositivos, actividad y contraseña. */
export function CentroSeguridad() {
  const { usuario } = useUsuarioActual();
  if (!usuario) return null;
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* La última tarjeta se estira: las dos columnas terminan a la misma altura. */}
      <div className="flex flex-col gap-4 xl:[&>*:last-child]:flex-1">
        <TarjetaDosPasos usuario={usuario} />
        <TarjetaContrasena usuario={usuario} />
      </div>
      <ColumnaPareja desde="xl">
        <TarjetaSesiones />
        <TarjetaActividad />
      </ColumnaPareja>
    </div>
  );
}
