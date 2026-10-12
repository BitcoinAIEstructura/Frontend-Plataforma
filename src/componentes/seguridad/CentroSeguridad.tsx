"use client";

import { useUsuarioActual } from "@/lib/hooks/useSesion";

import { TarjetaActividad } from "./TarjetaActividad";
import { TarjetaContrasena } from "./TarjetaContrasena";
import { TarjetaDosPasos } from "./TarjetaDosPasos";
import { TarjetaSesiones } from "./TarjetaSesiones";

/** Centro de seguridad: verificación en dos pasos, dispositivos, actividad y contraseña. */
export function CentroSeguridad() {
  const { usuario } = useUsuarioActual();
  if (!usuario) return null;
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="flex flex-col gap-5">
        <TarjetaDosPasos usuario={usuario} />
        <TarjetaContrasena usuario={usuario} />
      </div>
      <div className="flex flex-col gap-5">
        <TarjetaSesiones />
        <TarjetaActividad />
      </div>
    </div>
  );
}
