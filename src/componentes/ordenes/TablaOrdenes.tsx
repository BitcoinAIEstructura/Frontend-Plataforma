import type { Orden } from "@/lib/api/simulacion";
import { btc, fechaCorta, fechaHora, usdt } from "@/lib/formato";

import { EtiquetaEstado, origenOrden, TipoOrden } from "./textos";

/**
 * Órdenes en una tabla, como en una plataforma de trading: fecha, tipo, cantidad, precio,
 * total, origen y estado. Las cifras van a la derecha y en letra de cifras para que se
 * puedan comparar de un vistazo. En el teléfono la tabla se desliza de lado.
 */
export function TablaOrdenes({ ordenes, titulo }: { ordenes: readonly Orden[]; titulo: string }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:-mx-5">
      <table className="w-full min-w-[34rem] border-collapse text-sm">
        <caption className="sr-only">{titulo}</caption>
        <thead>
          <tr className="border-b border-borde text-left text-[11px] font-semibold tracking-wider text-texto-atenuado uppercase">
            <th scope="col" className="py-2 pr-3 pl-4 font-semibold sm:pl-5">
              Fecha
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Tipo
            </th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">
              BTC
            </th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">
              Precio
            </th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">
              Total USDT
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Origen
            </th>
            <th scope="col" className="py-2 pr-4 pl-3 font-semibold sm:pr-5">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((o) => {
            const ejecutada = o.estado === "EJECUTADA" && o.precioEjecucion != null;
            const total =
              ejecutada && o.cantidadBtc != null && o.precioEjecucion != null
                ? o.cantidadBtc * o.precioEjecucion
                : (o.monto ?? null);
            return (
              <tr key={o.id} className="border-b border-borde/70 last:border-b-0 hover:bg-superficie-alta/60">
                <td className="cifra py-2.5 pr-3 pl-4 whitespace-nowrap text-texto-secundario sm:pl-5">
                  <time title={fechaHora(o.ejecutadaEn ?? o.creadaEn)}>
                    {fechaCorta(o.ejecutadaEn ?? o.creadaEn)}
                  </time>
                </td>
                <td className="px-3 py-2.5">
                  <TipoOrden tipo={o.tipo} />
                </td>
                <td className="cifra px-3 py-2.5 text-right text-texto">
                  {o.cantidadBtc != null ? btc(o.cantidadBtc) : "—"}
                </td>
                <td className="cifra px-3 py-2.5 text-right text-texto">
                  {ejecutada ? usdt(o.precioEjecucion) : "—"}
                </td>
                <td className="cifra px-3 py-2.5 text-right text-texto">
                  {total != null ? usdt(total) : "—"}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-texto-secundario">
                  {origenOrden(o.motivo)}
                </td>
                <td className="py-2.5 pr-4 pl-3 sm:pr-5">
                  <EtiquetaEstado estado={o.estado} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
