"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { RequisitosContrasena } from "@/componentes/acceso/RequisitosContrasena";
import { Boton } from "@/componentes/ui/Boton";
import { Campo } from "@/componentes/ui/Campo";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { ErrorApi } from "@/lib/api/cliente";
import { cambiarContrasena, type Usuario } from "@/lib/api/cuentas";
import { contrasenaValida } from "@/lib/validacion/contrasena";

import { CLAVE_SESIONES } from "./TarjetaSesiones";

export function TarjetaContrasena({ usuario }: { usuario: Usuario }) {
  const cliente = useQueryClient();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [errores, setErrores] = useState<{ actual?: string; nueva?: string; confirmacion?: string }>({});
  const [listo, setListo] = useState(false);

  // El documento llega enmascarado; nombre, apellido y correo sí se comparan.
  const personales = [usuario.nombre, usuario.apellido, usuario.correo];

  const cambiar = useMutation({
    mutationFn: () => cambiarContrasena(actual, nueva),
    onSuccess: () => {
      setActual("");
      setNueva("");
      setConfirmacion("");
      setListo(true);
      void cliente.invalidateQueries({ queryKey: CLAVE_SESIONES });
    },
    onError: (e) => {
      if (e instanceof ErrorApi && e.campo === "contrasenaNueva") setErrores({ nueva: e.message });
      else setErrores({ actual: e instanceof ErrorApi ? e.message : "No se pudo cambiar la contraseña" });
    },
  });

  function alEnviar(evento: FormEvent) {
    evento.preventDefault();
    setListo(false);
    const nuevos: typeof errores = {};
    if (!actual) nuevos.actual = "Escribe tu contraseña actual";
    if (!contrasenaValida(nueva, personales))
      nuevos.nueva = "La contraseña nueva no cumple todos los requisitos";
    else if (nueva === actual) nuevos.nueva = "La contraseña nueva debe ser distinta de la actual";
    if (confirmacion !== nueva) nuevos.confirmacion = "Las contraseñas no coinciden";
    setErrores(nuevos);
    if (Object.keys(nuevos).length === 0) cambiar.mutate();
  }

  return (
    <Tarjeta titulo="Cambiar la contraseña">
      <form onSubmit={alEnviar} className="flex flex-col gap-4" noValidate>
        <Campo
          etiqueta="Contraseña actual"
          revelable
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          autoComplete="current-password"
          error={errores.actual}
        />
        <Campo
          etiqueta="Contraseña nueva"
          revelable
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          autoComplete="new-password"
          error={errores.nueva}
          ayuda={<RequisitosContrasena contrasena={nueva} datosPersonales={personales} />}
        />
        <Campo
          etiqueta="Confirma la contraseña nueva"
          revelable
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          autoComplete="new-password"
          error={errores.confirmacion}
        />
        <p className="text-sm text-texto-atenuado">
          Al cambiarla se cerrará la sesión en tus otros dispositivos.
        </p>
        {listo && (
          <p role="status" className="text-sm font-medium text-exito">
            ✓ Contraseña cambiada. Las demás sesiones se cerraron.
          </p>
        )}
        <Boton type="submit" cargando={cambiar.isPending} className="self-start">
          Cambiar contraseña
        </Boton>
      </form>
    </Tarjeta>
  );
}
