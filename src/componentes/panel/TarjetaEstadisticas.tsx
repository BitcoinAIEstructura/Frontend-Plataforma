"use client";

import Link from "next/link";

import { GraficaBarras, type Barra } from "@/componentes/graficas/GraficaBarras";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { Estadisticas, Origen } from "@/lib/api/simulacion";
import { conSigno, fechaHora, usdt, usdtCompacto, variacion } from "@/lib/formato";
import { useEstadisticas } from "@/lib/hooks/useDatos";

export const NOMBRE_ORIGEN: Record<Origen, string> = {
  manual: "Manual",
  bot: "Bot de reglas",
  ia: "Piloto IA",
};

const DIA = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", day: "numeric", month: "short" });

/** "3 nov" en hora de Colombia. */
export function diaCorto(ms: number): string {
  return DIA.format(ms).replace(".", "");
}

const PORCENTAJE = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

/** Barras de ganancia (▲ turquesa) o pérdida (▼ rosa) por cada venta. */
export function barrasGanancia(e: Estadisticas): Barra[] {
  return e.operaciones.map((o) => ({
    clave: o.idOrden,
    etiqueta: diaCorto(o.tiempo),
    segmentos: [
      {
        nombre: o.ganancia >= 0 ? "Ganancia" : "Pérdida",
        valor: o.ganancia,
        color: o.ganancia >= 0 ? "var(--grafica-sube)" : "var(--grafica-baja)",
      },
    ],
    detalle: `Orden #${o.idOrden} · ${fechaHora(o.tiempo)} · ${o.ganancia >= 0 ? "▲" : "▼"} ${conSigno(o.ganancia)} USDT (${variacion(o.rentabilidad)}) · ${NOMBRE_ORIGEN[o.origen]}`,
  }));
}

/** Compras y ventas apiladas por día. */
export function barrasActividad(e: Estadisticas): Barra[] {
  return e.actividad.map((a) => ({
    clave: a.dia,
    etiqueta: diaCorto(a.dia),
    segmentos: [
      { nombre: "Compras", valor: a.compras, color: "var(--grafica-serie-1)" },
      { nombre: "Ventas", valor: a.ventas, color: "var(--grafica-serie-2)" },
    ],
    detalle: `${diaCorto(a.dia)}: ${a.compras} compra${a.compras === 1 ? "" : "s"} y ${a.ventas} venta${a.ventas === 1 ? "" : "s"} · ${usdt(a.volumen)} USDT operados`,
  }));
}

function Cifra({ nombre, valor, clase = "text-texto" }: { nombre: string; valor: string; clase?: string }) {
  return (
    <div className="rounded-xl border border-borde px-3 py-2.5">
      <dt className="text-xs text-texto-atenuado">{nombre}</dt>
      <dd className={`cifra text-lg font-semibold ${clase}`}>{valor}</dd>
    </div>
  );
}

function Leyenda({ elementos }: { elementos: { nombre: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-secundario">
      {elementos.map((e) => (
        <li key={e.nombre} className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-sm" style={{ background: e.color }} />
          {e.nombre}
        </li>
      ))}
    </ul>
  );
}

/** Reparto de la cartera entre USDT y BTC, como una barra partida en dos. */
function Reparto({ usdt: enUsdt, btc: enBtc }: { usdt: number; btc: number }) {
  const total = enUsdt + enBtc || 1;
  const partes = [
    { nombre: "En BTC", valor: enBtc, color: "var(--grafica-serie-1)" },
    { nombre: "En USDT", valor: enUsdt, color: "var(--grafica-serie-2)" },
  ];
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={partes
          .map((p) => `${p.nombre}: ${PORCENTAJE.format((p.valor / total) * 100)} %`)
          .join(", ")}
      >
        {partes
          .filter((p) => p.valor > 0)
          .map((p) => (
            <span key={p.nombre} style={{ width: `${(p.valor / total) * 100}%`, background: p.color }} />
          ))}
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {partes.map((p) => (
          <div key={p.nombre} className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 rounded-sm" style={{ background: p.color }} />
            <dt className="text-texto-secundario">{p.nombre}</dt>
            <dd className="cifra ml-auto font-semibold text-texto">
              {PORCENTAJE.format((p.valor / total) * 100)} %
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Quién ha operado (tú, el bot de reglas o el piloto IA) y cuánto ganó cada uno. */
function PorOrigen({ e }: { e: Estadisticas }) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Órdenes ejecutadas y ganancia realizada según quién operó</caption>
      <thead className="text-xs text-texto-atenuado">
        <tr>
          <th scope="col" className="pb-1 text-left font-medium">
            Quién operó
          </th>
          <th scope="col" className="pb-1 text-right font-medium">
            Órdenes
          </th>
          <th scope="col" className="pb-1 text-right font-medium">
            Ganancia
          </th>
        </tr>
      </thead>
      <tbody className="cifra">
        {e.porOrigen.map((o) => (
          <tr key={o.origen} className="border-t border-borde">
            <th scope="row" className="py-1.5 text-left font-normal text-texto-secundario">
              {o.origen === "ia" && (
                <span aria-hidden className="mr-1 text-violeta">
                  ✦
                </span>
              )}
              {NOMBRE_ORIGEN[o.origen]}
            </th>
            <td className="py-1.5 text-right text-texto">{o.ordenes}</td>
            <td
              className={`py-1.5 text-right ${o.ganancia > 0 ? "text-sube" : o.ganancia < 0 ? "text-baja" : "text-texto"}`}
            >
              {o.ganancia > 0 ? "▲ " : o.ganancia < 0 ? "▼ " : ""}
              {conSigno(o.ganancia)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Tus resultados: aciertos, ganancia por operación, actividad diaria, reparto y quién operó. */
export function TarjetaEstadisticas() {
  const consulta = useEstadisticas();
  if (consulta.isPending) {
    return (
      <Tarjeta titulo="Tus resultados">
        <p role="status" className="text-sm text-texto-secundario">
          Calculando tus resultados…
        </p>
      </Tarjeta>
    );
  }
  if (consulta.isError) {
    return (
      <Tarjeta titulo="Tus resultados">
        <p role="alert" className="text-sm text-error">
          {consulta.error.message}
        </p>
      </Tarjeta>
    );
  }
  const e = consulta.data;
  const r = e.resumen;
  const conOperaciones = e.operaciones.length > 0;
  const activos = e.actividad.some((a) => a.compras + a.ventas > 0);

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <Tarjeta titulo="Tus resultados" className="lg:col-span-3">
        <dl className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Cifra nombre="Operaciones cerradas" valor={String(r.cerradas)} />
          <Cifra
            nombre="Con ganancia"
            valor={r.tasaAcierto === null ? "—" : `✓ ${PORCENTAJE.format(r.tasaAcierto * 100)} %`}
          />
          <Cifra
            nombre="Mejor operación"
            valor={r.mejor === null ? "—" : `▲ ${conSigno(r.mejor)}`}
            clase={r.mejor !== null && r.mejor > 0 ? "text-sube" : "text-texto"}
          />
          <Cifra
            nombre="Peor operación"
            valor={r.peor === null ? "—" : `${r.peor < 0 ? "▼" : "▲"} ${conSigno(r.peor)}`}
            clase={r.peor !== null && r.peor < 0 ? "text-baja" : "text-texto"}
          />
        </dl>
        <h3 className="mb-1 text-sm font-semibold text-texto">Ganancia o pérdida de cada venta (USDT)</h3>
        {conOperaciones ? (
          <GraficaBarras
            titulo="Ganancia o pérdida de cada venta, en USDT"
            barras={barrasGanancia(e)}
            formato={usdtCompacto}
            columnas={["Venta", "Ganancia (USDT)", "Rentabilidad", "Quién"]}
            filas={[...e.operaciones]
              .reverse()
              .map((o) => [
                fechaHora(o.tiempo),
                conSigno(o.ganancia),
                variacion(o.rentabilidad),
                NOMBRE_ORIGEN[o.origen],
              ])}
          />
        ) : (
          <p className="py-8 text-center text-sm text-texto-secundario">
            Cuando vendas por primera vez verás aquí si ganaste o perdiste.{" "}
            <Link href="/ordenes" className="font-medium text-oro hover:underline">
              Ir a Órdenes
            </Link>
          </p>
        )}
      </Tarjeta>

      <div className="flex flex-col gap-5 lg:col-span-2">
        <Tarjeta titulo="Así está repartida tu cartera">
          <Reparto usdt={e.reparto.usdt} btc={e.reparto.btc} />
        </Tarjeta>
        <Tarjeta titulo="Quién ha operado">
          <PorOrigen e={e} />
        </Tarjeta>
      </div>

      <Tarjeta titulo="Tu actividad en los últimos 30 días" className="lg:col-span-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Leyenda
            elementos={[
              { nombre: "Compras", color: "var(--grafica-serie-1)" },
              { nombre: "Ventas", color: "var(--grafica-serie-2)" },
            ]}
          />
          <span className="cifra text-xs text-texto-atenuado">
            {usdt(r.volumenTotal)} USDT operados en total
          </span>
        </div>
        {activos ? (
          <GraficaBarras
            titulo="Compras y ventas ejecutadas por día en los últimos 30 días"
            barras={barrasActividad(e)}
            formato={(v) => PORCENTAJE.format(v)}
            columnas={["Día", "Compras", "Ventas", "Volumen (USDT)"]}
            filas={[...e.actividad]
              .reverse()
              .map((a) => [diaCorto(a.dia), String(a.compras), String(a.ventas), usdt(a.volumen)])}
            alto={180}
            enteros
          />
        ) : (
          <p className="py-8 text-center text-sm text-texto-secundario">
            Aún no hay operaciones en los últimos 30 días.
          </p>
        )}
      </Tarjeta>
    </div>
  );
}
