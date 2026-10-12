"use client";

import { useQuery } from "@tanstack/react-query";

import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { obtenerActividad } from "@/lib/api/cuentas";
import { describirAgente, fechaHora, haceCuanto } from "@/lib/formato";

export const CLAVE_ACTIVIDAD = ["cuentas", "actividad"] as const;

/** Eventos que conviene revisar con atención si no los reconoces. */
const ALERTAS = new Set([
  "INICIO_FALLIDO",
  "CODIGO_FALLIDO",
  "DOS_PASOS_DESACTIVADA",
  "CODIGO_RESPALDO_USADO",
]);

const SEGUNDO_PASO = "(con verificación en dos pasos)";

/** Si el detalle es un User-Agent, lo resume ("Chrome en Android"); si no, lo deja igual. */
export function detalleLegible(detalle: string): string {
  if (!/^Mozilla\/|^[\w.-]+\/[\d.]+/.test(detalle)) return detalle;
  const conSegundoPaso = detalle.includes(SEGUNDO_PASO);
  return `${describirAgente(detalle)}${conSegundoPaso ? ` ${SEGUNDO_PASO}` : ""}`;
}

export function TarjetaActividad() {
  const consulta = useQuery({ queryKey: CLAVE_ACTIVIDAD, queryFn: () => obtenerActividad(20) });
  return (
    <Tarjeta titulo="Actividad reciente">
      <p className="mb-3 text-sm text-texto-secundario">
        Si ves algo que no fuiste tú, cambia tu contraseña y cierra las demás sesiones.
      </p>
      {consulta.isPending && <p className="text-texto-secundario">Cargando…</p>}
      {consulta.isError && (
        <p role="alert" className="text-error">
          {consulta.error.message}
        </p>
      )}
      <ol className="flex flex-col gap-2">
        {(consulta.data ?? []).map((e, i) => {
          const alerta = ALERTAS.has(e.tipo);
          return (
            <li
              key={`${e.momento}-${i}`}
              className={`flex items-start gap-3 rounded-xl px-3 py-2 ${alerta ? "bg-bitcoin/10" : ""}`}
            >
              <span aria-hidden className={alerta ? "text-bitcoin" : "text-oro"}>
                {alerta ? "▲" : "●"}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${alerta ? "text-bitcoin" : "text-texto"}`}>
                  {alerta && <span className="sr-only">Atención: </span>}
                  {e.descripcion}
                </p>
                <p className="text-xs text-texto-atenuado">
                  <time dateTime={new Date(e.momento).toISOString()} title={fechaHora(e.momento)}>
                    {haceCuanto(e.momento)}
                  </time>{" "}
                  · <span className="cifra">{e.ip}</span>
                  {e.detalle && ` · ${detalleLegible(e.detalle)}`}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Tarjeta>
  );
}
