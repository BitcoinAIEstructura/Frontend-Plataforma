"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Boton } from "@/componentes/ui/Boton";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { cerrarOtrasSesiones, cerrarSesionPorId, obtenerSesiones } from "@/lib/api/cuentas";
import { describirAgente, fechaHora, haceCuanto } from "@/lib/formato";

export const CLAVE_SESIONES = ["cuentas", "sesiones"] as const;

/** Dispositivos con la sesión abierta; se puede cerrar cualquiera (por ejemplo, un teléfono perdido). */
export function TarjetaSesiones() {
  const cliente = useQueryClient();
  const consulta = useQuery({ queryKey: CLAVE_SESIONES, queryFn: obtenerSesiones });
  const refrescar = () => cliente.invalidateQueries({ queryKey: CLAVE_SESIONES });
  const cerrarUna = useMutation({ mutationFn: cerrarSesionPorId, onSettled: refrescar });
  const cerrarOtras = useMutation({ mutationFn: cerrarOtrasSesiones, onSettled: refrescar });

  const sesiones = consulta.data ?? [];
  const hayOtras = sesiones.some((s) => !s.actual);

  return (
    <Tarjeta
      titulo="Dispositivos con sesión abierta"
      extra={
        hayOtras && (
          <Boton
            variante="peligro"
            onClick={() => cerrarOtras.mutate()}
            cargando={cerrarOtras.isPending}
            className="min-h-9 px-3 text-sm"
          >
            Cerrar las demás
          </Boton>
        )
      }
    >
      {consulta.isPending && <p className="text-texto-secundario">Cargando…</p>}
      {consulta.isError && (
        <p role="alert" className="text-error">
          {consulta.error.message}
        </p>
      )}
      <ul className="flex flex-col divide-y divide-borde">
        {sesiones.map((s) => (
          <li key={s.id} className="flex items-center gap-3 py-3">
            <span
              aria-hidden
              className="grid size-10 place-items-center rounded-md bg-superficie-alta text-oro"
            >
              {/Android|iPhone|iPad|Mobile/.test(s.agente) ? "▯" : "▭"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-texto">
                {describirAgente(s.agente)}
                {s.actual && (
                  <span className="ml-2 rounded-full bg-oro/15 px-2 py-0.5 text-xs font-semibold text-oro">
                    Este dispositivo
                  </span>
                )}
              </p>
              <p className="text-sm text-texto-atenuado">
                <span className="cifra">{s.ip}</span> · activo {haceCuanto(s.ultimaActividad)} ·{" "}
                <span title={fechaHora(s.creadaEn)}>desde {fechaHora(s.creadaEn)}</span>
              </p>
            </div>
            {!s.actual && (
              <Boton
                variante="fantasma"
                onClick={() => cerrarUna.mutate(s.id)}
                disabled={cerrarUna.isPending}
                className="min-h-9 px-3 text-sm"
                aria-label={`Cerrar la sesión de ${describirAgente(s.agente)}`}
              >
                Cerrar
              </Boton>
            )}
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}
