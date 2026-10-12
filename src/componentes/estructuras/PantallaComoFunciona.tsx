"use client";

import Link from "next/link";

import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { variacion } from "@/lib/formato";
import { useEstructuras, useLiga, usePreciosRecientes } from "@/lib/hooks/useDatos";

import { FICHAS, type FichaEstructura } from "./catalogo";
import { EnVivoCircular, EnVivoCola, EnVivoPila, EnVivoTabla, EnVivoTrie } from "./EnVivo";
import { Laboratorio } from "./Laboratorio";

function EnVivoLiga() {
  const liga = useLiga();
  if (!liga.data) return null;
  const { mejores, tu, participantes } = liga.data;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-exito uppercase">
        La liga ahora · {participantes} participantes
      </p>
      <p className="text-sm text-texto-secundario">
        {mejores[0]
          ? `Va primero ${mejores[0].esTuyo ? "tu cuenta" : mejores[0].alias} con ${variacion(mejores[0].rentabilidad)}. `
          : "Todavía nadie ha operado. "}
        {tu ? `Tú vas en el puesto ${tu.posicion}.` : "Opera una vez para entrar."}{" "}
        <Link href="/liga" className="text-oro hover:underline">
          Ver la liga
        </Link>
      </p>
    </div>
  );
}

function EnVivo({ ficha }: { ficha: FichaEstructura }) {
  const actuales = useEstructuras();
  const recientes = usePreciosRecientes();
  const d = actuales.data;
  if (ficha.id === "monticulo") return <EnVivoLiga />;
  if (ficha.id === "avl")
    return (
      <p className="text-sm text-texto-secundario">
        Pruébalo en{" "}
        <Link href="/liga#si-hubiera" className="text-oro hover:underline">
          ¿Y si hubiera invertido?
        </Link>
        : elige una fecha y el AVL encuentra esa vela entre 1000.
      </p>
    );
  if (!d) return null;
  switch (ficha.id) {
    case "cola":
      return <EnVivoCola cola={d.cola} />;
    case "pila":
      return <EnVivoPila pila={d.pila} deshacer={d.pilaDeshacer} />;
    case "tabla-hash":
      return <EnVivoTabla tabla={d.tablaHash} />;
    case "cola-circular":
      return <EnVivoCircular anillo={d.colaCircular} recientes={recientes.data} />;
    default:
      return <EnVivoTrie trie={d.trie} />;
  }
}

function Seccion({ ficha }: { ficha: FichaEstructura }) {
  return (
    <Tarjeta id={ficha.id} titulo={ficha.nombre} className="scroll-mt-24">
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <p className="text-texto">{ficha.idea}</p>
          <div className="rounded-xl border border-oro/30 bg-oro/5 px-4 py-3 text-sm text-texto-secundario">
            <p className="mb-1 text-xs font-semibold tracking-wide text-oro uppercase">En Nexabit</p>
            {ficha.enNexabit}
          </div>
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
            {ficha.complejidades.map(([operacion, costo]) => (
              <div key={operacion} className="contents">
                <dt className="text-texto-secundario">{operacion}</dt>
                <dd className="cifra text-right font-semibold text-violeta">{costo}</dd>
              </div>
            ))}
          </dl>
          <EnVivo ficha={ficha} />
        </div>
        <div className="lg:col-span-3">
          <Laboratorio ficha={ficha} />
        </div>
      </div>
    </Tarjeta>
  );
}

/** "Cómo funciona": cada estructura de datos con su uso real, lo que guarda ahora y un laboratorio. */
export function PantallaComoFunciona() {
  return (
    <div className="flex flex-col gap-5">
      <Tarjeta destacada como="div" className="flex flex-col gap-3 sm:p-8">
        <p className="text-sm font-medium tracking-wide text-oro uppercase">Hecho a mano</p>
        <h2 className="text-2xl leading-tight font-semibold sm:text-3xl">
          Las estructuras de datos de <span className="texto-oro">Nexabit</span>, en vivo
        </h2>
        <p className="max-w-3xl text-texto-secundario">
          Todas están programadas a mano en el backend (Python), con nodos enlazados o sobre un arreglo de
          tamaño fijo, sin las listas ni los diccionarios de Python. Lo que ves aquí no es una animación
          inventada: el laboratorio corre ese mismo código y «En vivo» muestra lo que guardan ahora con tus
          datos.
        </p>
        <nav aria-label="Estructuras" className="mt-2 flex flex-wrap gap-2">
          {FICHAS.map((f) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="rounded-full border border-borde px-3 py-1 text-sm text-texto-secundario hover:border-oro/50 hover:text-texto"
            >
              {f.nombre}
            </a>
          ))}
        </nav>
      </Tarjeta>

      {FICHAS.map((f) => (
        <Seccion key={f.id} ficha={f} />
      ))}

      <Tarjeta titulo="Y además: listas enlazadas">
        <p className="text-sm text-texto-secundario">
          Una <strong className="text-texto">lista simple</strong> guarda el registro de órdenes terminadas, y
          una <strong className="text-texto">lista doble</strong> la ventana de velas de los indicadores
          (entran por un extremo y salen por el otro en O(1)) y los clientes conectados al tiempo real, que se
          quitan por su nodo en O(1) al desconectarse.
        </p>
      </Tarjeta>
    </div>
  );
}
