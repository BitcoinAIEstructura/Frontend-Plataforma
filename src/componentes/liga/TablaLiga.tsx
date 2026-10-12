"use client";

import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { Clasificado } from "@/lib/api/liga";
import { sentido, usdt, variacion } from "@/lib/formato";
import { useLiga } from "@/lib/hooks/useDatos";

const MEDALLAS = ["🥇", "🥈", "🥉"];

function color(rentabilidad: number) {
  const s = sentido(rentabilidad);
  return s === "sube" ? "text-sube" : s === "baja" ? "text-baja" : "text-texto";
}

function Fila({ c }: { c: Clasificado }) {
  return (
    <tr className={`border-t border-borde ${c.esTuyo ? "bg-oro/10" : ""}`}>
      <th scope="row" className="cifra px-3 py-2 text-left font-semibold text-texto">
        <span aria-hidden className="mr-1">
          {MEDALLAS[c.posicion - 1] ?? ""}
        </span>
        {c.posicion}
      </th>
      <td className="px-3 py-2 text-texto">
        {c.alias}
        {c.esTuyo && (
          <span className="ml-2 rounded-full bg-oro px-2 py-0.5 text-xs font-semibold text-sobre-oro">
            Tú
          </span>
        )}
      </td>
      <td className={`cifra px-3 py-2 text-right font-semibold whitespace-nowrap ${color(c.rentabilidad)}`}>
        {variacion(c.rentabilidad)}
      </td>
      <td className="cifra hidden px-3 py-2 text-right whitespace-nowrap text-texto-secundario sm:table-cell">
        {usdt(c.valorTotal)}
      </td>
    </tr>
  );
}

/** Los 10 mejores por rentabilidad y tu puesto. Nadie aparece con su nombre real. */
export function TablaLiga() {
  const liga = useLiga();
  const datos = liga.data;
  const fueraDelTop = datos?.tu && !datos.mejores.some((m) => m.esTuyo) ? datos.tu : null;

  return (
    <Tarjeta
      titulo="Liga de inversores"
      extra={
        datos && (
          <span className="cifra text-sm text-texto-atenuado">{datos.participantes} participantes</span>
        )
      }
    >
      <p className="mb-4 text-sm text-texto-secundario">
        Rentabilidad de cada cartera de práctica al precio de ahora. Cada quien aparece con un alias: nadie ve
        tu nombre. Un montículo de 10 elige a los mejores sin ordenar a todos.
      </p>
      {liga.isError ? (
        <p role="alert" className="text-error">
          {liga.error.message}
        </p>
      ) : !datos ? (
        <p role="status" className="text-texto-secundario">
          Cargando la liga…
        </p>
      ) : datos.mejores.length === 0 ? (
        <p className="rounded-xl border border-dashed border-borde py-8 text-center text-sm text-texto-atenuado">
          Todavía nadie ha ejecutado una orden. ¡Puedes ser el primero!
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-borde">
          <table className="w-full text-sm">
            <caption className="sr-only">Los 10 mejores por rentabilidad</caption>
            <thead className="bg-superficie-alta text-xs text-texto-atenuado">
              <tr>
                <th scope="col" className="px-3 py-2 text-left">
                  Puesto
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Inversor
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Rentabilidad
                </th>
                <th scope="col" className="hidden px-3 py-2 text-right sm:table-cell">
                  Valor (USDT)
                </th>
              </tr>
            </thead>
            <tbody>
              {datos.mejores.map((c) => (
                <Fila key={c.posicion} c={c} />
              ))}
              {fueraDelTop && <Fila c={fueraDelTop} />}
            </tbody>
          </table>
        </div>
      )}
      {datos && !datos.tu && datos.mejores.length > 0 && (
        <p className="mt-3 text-sm text-texto-secundario">Ejecuta tu primera orden para entrar a la liga.</p>
      )}
    </Tarjeta>
  );
}
