import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { NodoArbolIA, PrediccionIA } from "@/lib/api/ia";

import { porcentaje, valorCaracteristica } from "./formato";

function Nodo({ nodo, rama }: { nodo: NodoArbolIA; rama: "sí" | "no" | null }) {
  const camino = nodo.enCamino ? "border-oro bg-oro/10 text-texto" : "border-borde text-texto-secundario";
  const etiqueta = rama && (
    <span
      className={`mr-1 text-[10px] font-semibold uppercase ${nodo.enCamino ? "text-oro" : "text-texto-atenuado"}`}
    >
      {rama}
    </span>
  );
  if (nodo.hoja) {
    return (
      <li>
        <span
          className={`inline-flex flex-wrap items-baseline gap-x-2 rounded-lg border px-2 py-1 text-xs ${camino}`}
        >
          {etiqueta}
          <span>
            Hoja: subió el <span className="cifra font-semibold">{porcentaje(nodo.probabilidad)}</span> de{" "}
            {nodo.muestras}
          </span>
          {nodo.enCamino && <span className="font-semibold text-oro">← la vela de ahora</span>}
        </span>
      </li>
    );
  }
  return (
    <li>
      <span
        className={`inline-flex flex-wrap items-baseline gap-x-2 rounded-lg border px-2 py-1 text-xs ${camino}`}
      >
        {etiqueta}¿{nodo.caracteristica} ≤{" "}
        <span className="cifra">{valorCaracteristica(nodo.caracteristica, nodo.umbral)}</span>?
        <span className="text-texto-atenuado">({nodo.muestras} velas)</span>
      </span>
      <ul className="mt-1 ml-3 flex flex-col gap-1 border-l border-borde pl-3">
        {nodo.si && <Nodo nodo={nodo.si} rama="sí" />}
        {nodo.no && <Nodo nodo={nodo.no} rama="no" />}
      </ul>
    </li>
  );
}

/** El árbol de decisión entrenado, con el camino de la vela de ahora en oro. */
export function ArbolIA({ arbol }: { arbol: NodoArbolIA | null }) {
  return (
    <Tarjeta titulo="El árbol por dentro">
      <p className="mb-3 text-sm text-texto-secundario">
        Las preguntas que aprendió el árbol. En oro, el camino que siguió la vela de ahora.
      </p>
      {arbol ? (
        <ul aria-label="Árbol de decisión" className="flex flex-col gap-1 overflow-x-auto pb-1">
          <Nodo nodo={arbol} rama={null} />
        </ul>
      ) : (
        <p className="text-sm text-texto-atenuado">No hay árbol entrenado.</p>
      )}
    </Tarjeta>
  );
}

/** Las características de la vela de ahora: lo que miran los modelos. */
export function Caracteristicas({ caracteristicas }: { caracteristicas: PrediccionIA["caracteristicas"] }) {
  return (
    <Tarjeta titulo="Lo que miran los modelos ahora">
      <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        {caracteristicas.map((c) => (
          <div
            key={c.nombre}
            className="flex items-baseline justify-between gap-3 border-b border-borde py-1.5"
          >
            <dt className="text-texto-secundario">{c.nombre}</dt>
            <dd className="cifra text-texto">{valorCaracteristica(c.nombre, c.valor)}</dd>
          </div>
        ))}
      </dl>
    </Tarjeta>
  );
}
