"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { RequisitosContrasena } from "@/componentes/acceso/RequisitosContrasena";
import { Boton } from "@/componentes/ui/Boton";
import { Campo } from "@/componentes/ui/Campo";
import { Dialogo } from "@/componentes/ui/Dialogo";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { ErrorApi } from "@/lib/api/cliente";
import { cambiarContrasena, type Usuario } from "@/lib/api/cuentas";
import { contrasenaValida } from "@/lib/validacion/contrasena";

import { CLAVE_SESIONES } from "./TarjetaSesiones";

/**
 * Cambiar la contraseña: la tarjeta solo muestra un botón y el formulario se abre en una
 * ventana, para que la página de Seguridad no se llene de casillas.
 */
export function TarjetaContrasena({ usuario }: { usuario: Usuario }) {
  const cliente = useQueryClient();
  const [abierta, setAbierta] = useState(false);
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
      limpiar();
      setAbierta(false);
      setListo(true);
      void cliente.invalidateQueries({ queryKey: CLAVE_SESIONES });
    },
    onError: (e) => {
      if (e instanceof ErrorApi && e.campo === "contrasenaNueva") setErrores({ nueva: e.message });
      else setErrores({ actual: e instanceof ErrorApi ? e.message : "No se pudo cambiar la contraseña" });
    },
  });

  function limpiar() {
    setActual("");
    setNueva("");
    setConfirmacion("");
    setErrores({});
  }

  function cerrar() {
    limpiar();
    cambiar.reset();
    setAbierta(false);
  }

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
    <Tarjeta titulo="Contraseña">
      <p className="text-sm leading-relaxed text-texto-secundario">
        Cámbiala si crees que alguien más la conoce. Al cambiarla se cerrará la sesión en tus otros
        dispositivos.
      </p>
      {listo && (
        <p role="status" className="mt-3 text-sm font-medium text-exito">
          ✓ Contraseña cambiada. Las demás sesiones se cerraron.
        </p>
      )}
      <Boton
        variante="contorno"
        className="mt-4"
        onClick={() => {
          setListo(false);
          setAbierta(true);
        }}
      >
        Cambiar contraseña
      </Boton>

      <Dialogo
        abierto={abierta}
        alCerrar={cerrar}
        bloqueado={cambiar.isPending}
        titulo="Cambiar la contraseña"
        descripcion="Escribe la que usas hoy y luego la nueva dos veces."
      >
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
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Boton variante="fantasma" onClick={cerrar} disabled={cambiar.isPending}>
              Cancelar
            </Boton>
            <Boton type="submit" cargando={cambiar.isPending}>
              Guardar la nueva contraseña
            </Boton>
          </div>
        </form>
      </Dialogo>
    </Tarjeta>
  );
}
