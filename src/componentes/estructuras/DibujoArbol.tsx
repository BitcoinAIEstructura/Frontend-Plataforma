import type { Dibujo } from "./arbol";

const COLUMNA = 46;
const FILA = 62;
const RADIO = 17;
const MARGEN = 26;

interface Props {
  dibujo: Dibujo;
  /** Nombre para lectores de pantalla ("Árbol AVL con 5 claves"). */
  titulo: string;
  /** Ids a resaltar (el nodo recién insertado, la raíz que rotó…). */
  resaltados?: ReadonlySet<string>;
  vacio?: string;
}

/** Dibuja un árbol en SVG. Los nodos se deslizan a su nueva posición cuando el árbol cambia. */
export function DibujoArbol({ dibujo, titulo, resaltados, vacio = "Vacío" }: Props) {
  if (dibujo.nodos.length === 0) {
    return (
      <p className="grid h-32 place-items-center rounded-md border border-dashed border-borde text-sm text-texto-atenuado">
        {vacio}
      </p>
    );
  }
  const posicion = new Map(
    dibujo.nodos.map((n) => [n.id, { x: MARGEN + n.x * COLUMNA, y: MARGEN + n.y * FILA }]),
  );
  const ancho = MARGEN * 2 + Math.max(0, dibujo.ancho - 1) * COLUMNA;
  const alto = MARGEN * 2 + Math.max(0, dibujo.alto - 1) * FILA + 12;

  return (
    <div className="overflow-x-auto">
      <svg
        role="img"
        aria-label={titulo}
        viewBox={`0 0 ${ancho} ${alto}`}
        width={ancho}
        height={alto}
        className="mx-auto block max-w-none"
      >
        {dibujo.aristas.map((a) => {
          const p = posicion.get(a.desde)!;
          const h = posicion.get(a.hasta)!;
          return (
            <line
              key={`${a.desde}-${a.hasta}`}
              x1={p.x}
              y1={p.y}
              x2={h.x}
              y2={h.y}
              stroke="var(--borde-fuerte)"
              strokeWidth={1.5}
            />
          );
        })}
        {dibujo.nodos.map((n) => {
          const p = posicion.get(n.id)!;
          const resaltado = resaltados?.has(n.id) ?? false;
          return (
            <g
              key={n.id}
              data-id={n.id}
              transform={`translate(${p.x} ${p.y})`}
              className="motion-safe:transition-transform motion-safe:duration-500"
            >
              <circle
                r={RADIO}
                fill={resaltado ? "var(--oro)" : "var(--superficie-alta)"}
                stroke={n.marcado ? "var(--grafica-serie-2)" : "var(--oro)"}
                strokeWidth={n.marcado ? 3 : 1.5}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={n.etiqueta.length > 3 ? 10 : 13}
                fontWeight={600}
                fill={resaltado ? "var(--sobre-oro)" : "var(--texto)"}
              >
                {n.etiqueta || "·"}
              </text>
              {n.nota && (
                <text y={RADIO + 11} textAnchor="middle" fontSize={9} fill="var(--texto-atenuado)">
                  {n.nota}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
