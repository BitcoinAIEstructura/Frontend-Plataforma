import type { EstadoDemo, EstructuraDemo } from "@/lib/api/estructuras";

import { dibujarBinario, dibujarMonticulo, dibujarNario } from "./arbol";
import { DibujoArbol } from "./DibujoArbol";

const CAJA =
  "cifra grid h-11 min-w-11 place-items-center rounded-lg border px-2 text-sm font-semibold " +
  "motion-safe:transition-all motion-safe:duration-300";

function Caja({ valor, destacada = false }: { valor: number | string; destacada?: boolean }) {
  return (
    <span
      className={`${CAJA} ${destacada ? "border-oro bg-oro/15 text-oro" : "border-borde-fuerte bg-superficie-alta text-texto"}`}
    >
      {valor}
    </span>
  );
}

function Vacia({ texto = "Vacía" }: { texto?: string }) {
  return (
    <p className="grid h-24 place-items-center rounded-xl border border-dashed border-borde text-sm text-texto-atenuado">
      {texto}
    </p>
  );
}

/** Cola: entra por la derecha (final), sale por la izquierda (frente). */
export function VistaCola({ elementos }: EstadoDemo<"cola">) {
  if (elementos.length === 0) return <Vacia />;
  return (
    <ol aria-label="Cola, del frente al final" className="flex flex-wrap items-end gap-2">
      {elementos.map((x, i) => (
        <li key={i} className="flex flex-col items-center gap-1">
          <Caja valor={x} destacada={i === 0} />
          <span className="h-4 text-[10px] text-texto-atenuado">
            {i === 0 ? "frente" : i === elementos.length - 1 ? "final" : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Pila: el tope arriba. */
export function VistaPila({ elementos }: EstadoDemo<"pila">) {
  if (elementos.length === 0) return <Vacia />;
  return (
    <ol aria-label="Pila, del tope al fondo" className="mx-auto flex w-40 flex-col gap-1.5">
      {elementos.map((x, i) => (
        <li key={elementos.length - i} className="flex items-center gap-2">
          <span className="w-10 text-right text-[10px] text-texto-atenuado">{i === 0 ? "tope →" : ""}</span>
          <span className="flex-1">
            <Caja valor={x} destacada={i === 0} />
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Montículo: el árbol y, debajo, el arreglo donde de verdad vive. */
export function VistaMonticulo({ arreglo, capacidad }: EstadoDemo<"monticulo">) {
  return (
    <div className="flex flex-col gap-4">
      <DibujoArbol
        dibujo={dibujarMonticulo(arreglo)}
        titulo={`Montículo con ${arreglo.length} elementos; el menor está en la raíz`}
        resaltados={new Set(arreglo.length ? ["m0"] : [])}
      />
      <div>
        <p className="mb-1 text-xs text-texto-atenuado">
          El mismo montículo en su arreglo ({arreglo.length} de {capacidad} casillas):
        </p>
        <ol className="flex flex-wrap gap-1" aria-label="Arreglo del montículo">
          {Array.from({ length: capacidad }, (_, i) => (
            <li key={i} className="flex flex-col items-center">
              <span
                className={`${CAJA} ${i < arreglo.length ? "border-borde-fuerte bg-superficie-alta text-texto" : "border-dashed border-borde text-texto-atenuado"}`}
              >
                {i < arreglo.length ? arreglo[i] : ""}
              </span>
              <span className="text-[10px] text-texto-atenuado">{i}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function VistaAvl({ raiz, altura, tamanio }: EstadoDemo<"avl">) {
  return (
    <DibujoArbol
      dibujo={dibujarBinario(raiz, {
        id: (n) => `a${n.clave}`,
        etiqueta: (n) => String(n.clave),
        izquierdo: (n) => n.izquierdo,
        derecho: (n) => n.derecho,
        nota: (n) => `h${n.altura}`,
      })}
      titulo={`Árbol AVL con ${tamanio} claves y ${altura} niveles`}
      resaltados={new Set(raiz ? [`a${raiz.clave}`] : [])}
      vacio="Árbol vacío"
    />
  );
}

/** Tabla hash: una fila por cubeta, con su cadena de claves. */
export function VistaTabla({ capacidad, factorCarga, cubetas }: EstadoDemo<"tabla-hash">) {
  return (
    <div className="flex flex-col gap-2">
      <p className="cifra text-xs text-texto-secundario">
        {capacidad} cubetas · factor de carga {factorCarga.toFixed(2).replace(".", ",")} (máximo 0,75)
      </p>
      <ol aria-label="Cubetas de la tabla hash" className="flex flex-col gap-1">
        {cubetas.map((claves, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="cifra w-8 text-right text-xs text-texto-atenuado">[{i}]</span>
            <span className="h-px w-3 bg-borde-fuerte" aria-hidden />
            {claves.length === 0 ? (
              <span className="text-xs text-texto-atenuado">vacía</span>
            ) : (
              <span className="flex flex-wrap items-center gap-1">
                {claves.map((c, j) => (
                  <span key={j} className="flex items-center gap-1">
                    {j > 0 && (
                      <span aria-hidden className="text-texto-atenuado">
                        →
                      </span>
                    )}
                    <Caja valor={c} destacada={claves.length > 1} />
                  </span>
                ))}
                {claves.length > 1 && <span className="text-[10px] text-oro">colisión</span>}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Cola circular: las casillas en anillo; el frente en oro. */
export function VistaCircular({ capacidad, frente, tamanio, casillas }: EstadoDemo<"cola-circular">) {
  const radio = 88;
  const centro = 120;
  const final = (frente + tamanio - 1 + capacidad) % capacidad;
  return (
    <svg
      role="img"
      aria-label={`Cola circular de ${capacidad} casillas con ${tamanio} elementos; el frente está en la casilla ${frente}`}
      viewBox="0 0 240 240"
      className="mx-auto block h-60 w-60"
    >
      <circle cx={centro} cy={centro} r={radio} fill="none" stroke="var(--borde)" strokeDasharray="4 6" />
      {casillas.map((valor, i) => {
        const angulo = (i / capacidad) * 2 * Math.PI - Math.PI / 2;
        const x = centro + radio * Math.cos(angulo);
        const y = centro + radio * Math.sin(angulo);
        const esFrente = tamanio > 0 && i === frente;
        const esFinal = tamanio > 0 && i === final;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect
              x={-19}
              y={-15}
              width={38}
              height={30}
              rx={7}
              fill={esFrente ? "var(--oro)" : valor === null ? "transparent" : "var(--superficie-alta)"}
              stroke={valor === null ? "var(--borde)" : "var(--oro)"}
              strokeDasharray={valor === null ? "3 3" : undefined}
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={600}
              fill={esFrente ? "var(--sobre-oro)" : "var(--texto)"}
            >
              {valor ?? ""}
            </text>
            <text y={26} textAnchor="middle" fontSize={9} fill="var(--texto-atenuado)">
              {i}
              {esFrente ? " frente" : esFinal ? " final" : ""}
            </text>
          </g>
        );
      })}
      <text x={centro} y={centro} textAnchor="middle" fontSize={12} fill="var(--texto-secundario)">
        {tamanio}/{capacidad}
      </text>
    </svg>
  );
}

export function VistaTrie({ raiz, palabras, nodos }: EstadoDemo<"trie">) {
  if (raiz.hijos.length === 0) return <Vacia texto="Trie vacío" />;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-texto-secundario">
        {palabras} palabra{palabras === 1 ? "" : "s"} con {nodos} nodos. Anillo violeta: ahí termina una
        palabra.
      </p>
      <DibujoArbol
        dibujo={dibujarNario(raiz, {
          id: (_, ruta) => `t${ruta}`,
          etiqueta: (n) => n.letra,
          hijos: (n) => n.hijos,
          marcado: (n) => n.fin,
        })}
        titulo={`Trie con ${palabras} palabras y ${nodos} nodos`}
      />
    </div>
  );
}

/** El estado de cualquier estructura de la demostración. */
export function VistaEstado<E extends EstructuraDemo>({
  estructura,
  estado,
}: {
  estructura: E;
  estado: EstadoDemo<E>;
}) {
  switch (estructura) {
    case "cola":
      return <VistaCola {...(estado as EstadoDemo<"cola">)} />;
    case "pila":
      return <VistaPila {...(estado as EstadoDemo<"pila">)} />;
    case "monticulo":
      return <VistaMonticulo {...(estado as EstadoDemo<"monticulo">)} />;
    case "avl":
      return <VistaAvl {...(estado as EstadoDemo<"avl">)} />;
    case "tabla-hash":
      return <VistaTabla {...(estado as EstadoDemo<"tabla-hash">)} />;
    case "cola-circular":
      return <VistaCircular {...(estado as EstadoDemo<"cola-circular">)} />;
    default:
      return <VistaTrie {...(estado as EstadoDemo<"trie">)} />;
  }
}
