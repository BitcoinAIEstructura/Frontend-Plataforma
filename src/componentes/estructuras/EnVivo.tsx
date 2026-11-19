"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { EstructurasActuales } from "@/lib/api/estructuras";
import type { PreciosRecientes } from "@/lib/api/mercado";
import { usdt } from "@/lib/formato";

import { aspectoEvento } from "@/componentes/cartera/HistorialEventos";

function Titulo({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-exito uppercase">
      <span aria-hidden className="size-2 animate-pulse rounded-full bg-exito" />
      {children}
    </p>
  );
}

const CHIP =
  "cifra inline-grid h-9 min-w-9 place-items-center rounded-lg border border-borde-fuerte bg-superficie-alta px-2 text-xs font-semibold text-texto";

export function EnVivoCola({ cola }: { cola: EstructurasActuales["cola"] }) {
  return (
    <div>
      <Titulo>Tu cola ahora · {cola.tamanio} pendientes</Titulo>
      {cola.ordenes.length === 0 ? (
        <p className="text-sm text-texto-secundario">
          Vacía.{" "}
          <Link href="/ordenes" className="text-oro hover:underline">
            Crea una orden
          </Link>{" "}
          y vuelve: aparecerá aquí.
        </p>
      ) : (
        <ol className="flex flex-wrap gap-1.5" aria-label="Tus órdenes pendientes, de la primera a la última">
          {cola.ordenes.map((o, i) => (
            <li key={o.id} className={CHIP + (i === 0 ? " border-oro text-oro" : "")}>
              #{o.id} {o.tipo === "COMPRA" ? "▲" : "▼"}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function EnVivoPila({
  pila,
  deshacer,
}: {
  pila: EstructurasActuales["pila"];
  deshacer: EstructurasActuales["pilaDeshacer"];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Titulo>Tu historial · {pila.tamanio} eventos</Titulo>
        {pila.eventos.length === 0 ? (
          <p className="text-sm text-texto-secundario">Aún sin eventos.</p>
        ) : (
          <ol className="flex flex-col gap-1 text-sm" aria-label="Tu historial, del tope al fondo">
            {pila.eventos.slice(0, 5).map((e, i) => (
              <li key={`${e.momento}-${i}`} className="flex items-center gap-2 text-texto-secundario">
                <span className="w-10 text-right text-[10px] text-texto-atenuado">
                  {i === 0 ? "tope" : ""}
                </span>
                <span className={aspectoEvento(e.tipo).clase}>{aspectoEvento(e.tipo).icono}</span>
                {aspectoEvento(e.tipo).nombre}
                {e.idOrden !== null && <span className="cifra text-texto-atenuado">#{e.idOrden}</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
      <div>
        <Titulo>Pila de deshacer · {deshacer.tamanio} ids</Titulo>
        {deshacer.ids.length === 0 ? (
          <p className="text-sm text-texto-secundario">Nada que deshacer.</p>
        ) : (
          <p className="text-sm text-texto-secundario">
            Ctrl + Z intentaría primero{" "}
            <span className="cifra font-semibold text-oro">#{deshacer.ids[0]}</span>
            {deshacer.ids.length > 1 && (
              <>
                , luego <span className="cifra">#{deshacer.ids.slice(1, 4).join(", #")}</span>
              </>
            )}
            .
          </p>
        )}
      </div>
    </div>
  );
}

export function EnVivoTabla({ tabla }: { tabla: EstructurasActuales["tablaHash"] }) {
  const mayor = Math.max(1, ...tabla.longitudes);
  return (
    <div>
      <Titulo>
        La tabla de Nexabit · {tabla.tamanio} simulaciones en {tabla.capacidad} cubetas
      </Titulo>
      <div
        className="flex h-16 items-end gap-0.5"
        role="img"
        aria-label={`Cuántas simulaciones hay en cada cubeta; factor de carga ${tabla.factorCarga.toFixed(2)}`}
      >
        {tabla.longitudes.map((n, i) => (
          <span
            key={i}
            className="flex-1 rounded-t bg-grafica-serie-1"
            style={{ height: `${Math.max(4, (n / mayor) * 100)}%`, opacity: n === 0 ? 0.2 : 1 }}
          />
        ))}
      </div>
      <p className="cifra mt-1 text-xs text-texto-atenuado">
        Factor de carga {tabla.factorCarga.toFixed(2).replace(".", ",")}. Solo se ven cantidades: nunca de
        quién es cada simulación.
      </p>
    </div>
  );
}

/** Los precios de la cola circular como una línea pequeña (una sola serie: sin leyenda). */
export function EnVivoCircular({
  anillo,
  recientes,
}: {
  anillo: EstructurasActuales["colaCircular"];
  recientes: PreciosRecientes | undefined;
}) {
  const precios = recientes?.precios ?? [];
  let linea = null;
  if (precios.length > 1) {
    const valores = precios.map((p) => p.precio);
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const puntos = valores
      .map((v, i) => `${(i / (valores.length - 1)) * 300},${58 - ((v - min) / (max - min || 1)) * 52}`)
      .join(" ");
    linea = (
      <svg
        viewBox="0 0 300 64"
        className="h-16 w-full"
        role="img"
        aria-label={`Últimos ${precios.length} precios: entre ${usdt(min)} y ${usdt(max)} USDT; el último ${usdt(valores.at(-1))}`}
      >
        <polyline points={puntos} fill="none" stroke="var(--grafica-serie-1)" strokeWidth={2} />
      </svg>
    );
  }
  return (
    <div>
      <Titulo>
        El anillo de precios · {anillo.tamanio}/{anillo.capacidad} casillas, frente en la {anillo.frente}
      </Titulo>
      {linea ?? (
        <p className="text-sm text-texto-secundario">Se llena con el precio en vivo: cada 5 s entra uno.</p>
      )}
    </div>
  );
}

export function EnVivoTrie({ trie }: { trie: EstructurasActuales["trie"] }) {
  return (
    <div>
      <Titulo>El trie de la búsqueda</Titulo>
      <p className="text-sm text-texto-secundario">
        <span className="cifra font-semibold text-texto">{trie.palabras}</span> palabras en{" "}
        <span className="cifra font-semibold text-texto">{trie.nodos}</span> nodos. Pruébalo con{" "}
        <kbd className="rounded border border-borde-fuerte px-1.5 text-xs">Ctrl</kbd> +{" "}
        <kbd className="rounded border border-borde-fuerte px-1.5 text-xs">K</kbd>.
      </p>
    </div>
  );
}
