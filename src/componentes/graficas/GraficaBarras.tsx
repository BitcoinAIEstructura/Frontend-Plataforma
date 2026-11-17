"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

/** Un tramo de una barra (en barras apiladas hay varios; en barras con signo, uno). */
export interface Segmento {
  nombre: string;
  valor: number;
  /** Variable CSS del color (solo tokens `--grafica-*`). */
  color: string;
}

export interface Barra {
  clave: string | number;
  /** Texto corto del eje X (se muestran solo algunos para que no se encimen). */
  etiqueta: string;
  segmentos: Segmento[];
  /** Lo que dice la ayuda al pasar el ratón o el dedo. */
  detalle: string;
}

interface Props {
  titulo: string;
  barras: readonly Barra[];
  formato: (valor: number) => string;
  /** Encabezados de la tabla (la primera columna es la etiqueta). */
  columnas: readonly string[];
  /** Filas de la tabla, una por barra, en el mismo orden. */
  filas: readonly (readonly string[])[];
  alto?: number;
  /** Para conteos: marcas del eje solo en números enteros. */
  enteros?: boolean;
}

const MARGEN = { arriba: 12, derecha: 8, abajo: 26, izquierda: 56 };
const HUECO = 2; // separación entre barras y entre tramos apilados

/** Ancho real del contenedor: así el texto del SVG se lee igual en teléfono y en portátil. */
function useAncho<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [ancho, setAncho] = useState(600);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observador = new ResizeObserver(([entrada]) => {
      if (entrada) setAncho(Math.max(240, Math.round(entrada.contentRect.width)));
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  return [ref, ancho] as const;
}

/** Cuatro marcas "redondas" que cubren de `min` a `max`. */
export function marcasEje(min: number, max: number, enteros = false): number[] {
  const rango = max - min || 1;
  const crudo = rango / 4;
  const potencia = 10 ** Math.floor(Math.log10(crudo));
  const redondo = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= crudo) ?? crudo;
  const paso = enteros ? Math.max(1, Math.ceil(redondo)) : redondo;
  const desde = Math.floor(min / paso) * paso;
  const marcas: number[] = [];
  // Hasta la primera marca que alcanza el máximo (si no, la barra más alta se saldría del eje).
  for (let v = desde; v < max + paso * 0.999; v += paso) marcas.push(Math.round(v * 1e6) / 1e6);
  return marcas;
}

/**
 * Barras verticales en SVG, con signo (ganancia o pérdida) o apiladas (compras y ventas).
 * Puntas redondeadas en el extremo del dato, ayuda al pasar el ratón y vista de tabla.
 */
export function GraficaBarras({
  titulo,
  barras,
  formato,
  columnas,
  filas,
  alto = 220,
  enteros = false,
}: Props) {
  const [contenedor, ancho] = useAncho<HTMLDivElement>();
  const [activa, setActiva] = useState<number | null>(null);
  const [comoTabla, setComoTabla] = useState(false);

  const sumas = barras.map((b) => b.segmentos.reduce((s, x) => s + x.valor, 0));
  const marcas = marcasEje(Math.min(0, ...sumas), Math.max(0, ...sumas), enteros);
  const min = marcas[0] ?? 0;
  const max = marcas.at(-1) ?? 1;
  const anchoPlot = ancho - MARGEN.izquierda - MARGEN.derecha;
  const altoPlot = alto - MARGEN.arriba - MARGEN.abajo;
  const y = (v: number) => MARGEN.arriba + ((max - v) / (max - min || 1)) * altoPlot;
  const paso = anchoPlot / Math.max(1, barras.length);
  const anchoBarra = Math.max(2, Math.min(28, paso - HUECO));
  const cadaCuanto = Math.max(1, Math.ceil(barras.length / Math.max(1, Math.floor(anchoPlot / 64))));

  const alMover = (e: PointerEvent<SVGSVGElement>) => {
    const caja = e.currentTarget.getBoundingClientRect();
    const i = Math.floor((e.clientX - caja.left - MARGEN.izquierda) / paso);
    setActiva(i >= 0 && i < barras.length ? i : null);
  };

  const elegida = activa !== null ? barras[activa] : undefined;
  const xElegida = activa !== null ? MARGEN.izquierda + activa * paso + paso / 2 : 0;

  return (
    <figure className="flex flex-col gap-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setComoTabla((v) => !v)}
          aria-pressed={comoTabla}
          className="rounded-lg px-2 py-1 text-xs font-medium text-oro hover:bg-oro/10"
        >
          {comoTabla ? "Ver gráfica" : "Ver como tabla"}
        </button>
      </div>

      <div ref={contenedor} className={comoTabla ? "hidden" : "relative w-full"}>
        <svg
          width={ancho}
          height={alto}
          role="img"
          aria-label={titulo}
          onPointerMove={alMover}
          onPointerLeave={() => setActiva(null)}
          className="block touch-pan-y"
        >
          {marcas.map((v) => (
            <g key={v}>
              <line
                x1={MARGEN.izquierda}
                x2={ancho - MARGEN.derecha}
                y1={y(v)}
                y2={y(v)}
                stroke={v === 0 ? "var(--grafica-neutra)" : "var(--grafica-rejilla)"}
              />
              <text
                x={MARGEN.izquierda - 6}
                y={y(v) + 4}
                textAnchor="end"
                fontSize={11}
                fill="var(--texto-atenuado)"
                className="cifra"
              >
                {formato(v)}
              </text>
            </g>
          ))}
          {barras.map((b, i) => {
            const x = MARGEN.izquierda + i * paso + (paso - anchoBarra) / 2;
            let positivo = 0;
            let negativo = 0;
            const tramos = b.segmentos.filter((s) => s.valor !== 0);
            return (
              <g key={b.clave} opacity={activa === null || activa === i ? 1 : 0.55}>
                {tramos.map((s, k) => {
                  const desde = s.valor >= 0 ? positivo : negativo;
                  const hasta = desde + s.valor;
                  if (s.valor >= 0) positivo = hasta;
                  else negativo = hasta;
                  const arriba = y(Math.max(desde, hasta));
                  const abajo = y(Math.min(desde, hasta));
                  const esPunta = k === tramos.length - 1;
                  const h = Math.max(1, abajo - arriba - (k > 0 ? HUECO : 0));
                  const top = s.valor >= 0 ? arriba : arriba + (k > 0 ? HUECO : 0);
                  const r = esPunta ? Math.min(4, anchoBarra / 2, h) : 0;
                  // Solo el extremo del dato va redondeado; la base queda recta sobre el cero.
                  const d =
                    s.valor >= 0
                      ? `M${x},${top + h} V${top + r} Q${x},${top} ${x + r},${top} H${x + anchoBarra - r} Q${x + anchoBarra},${top} ${x + anchoBarra},${top + r} V${top + h} Z`
                      : `M${x},${top} H${x + anchoBarra} V${top + h - r} Q${x + anchoBarra},${top + h} ${x + anchoBarra - r},${top + h} H${x + r} Q${x},${top + h} ${x},${top + h - r} Z`;
                  return <path key={s.nombre} d={d} fill={s.color} />;
                })}
                {i % cadaCuanto === 0 && (
                  <text
                    x={x + anchoBarra / 2}
                    y={alto - 8}
                    textAnchor="middle"
                    fontSize={11}
                    fill="var(--texto-atenuado)"
                  >
                    {b.etiqueta}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {elegida && (
          <div
            role="status"
            className="pointer-events-none absolute top-1 z-10 max-w-[220px] rounded-lg border border-borde bg-superficie px-3 py-2 text-xs text-texto shadow-lg"
            style={{
              left: Math.min(Math.max(8, xElegida - 110), ancho - 228),
            }}
          >
            {elegida.detalle}
          </div>
        )}
      </div>

      {comoTabla && (
        <div className="max-h-[320px] overflow-auto rounded-md border border-borde">
          <table className="cifra w-full text-right text-sm">
            <caption className="sr-only">{titulo}</caption>
            <thead className="sticky top-0 bg-superficie-alta text-xs text-texto-atenuado">
              <tr>
                {columnas.map((c, i) => (
                  <th key={c} scope="col" className={`px-3 py-2 ${i === 0 ? "text-left" : ""}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, i) => (
                <tr key={i} className="border-t border-borde">
                  {fila.map((celda, k) =>
                    k === 0 ? (
                      <th
                        key={k}
                        scope="row"
                        className="px-3 py-1.5 text-left font-normal text-texto-secundario"
                      >
                        {celda}
                      </th>
                    ) : (
                      <td key={k} className="px-3 py-1.5 text-texto">
                        {celda}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
