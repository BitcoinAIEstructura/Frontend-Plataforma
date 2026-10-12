"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { buscar, type ResultadoBusqueda } from "@/lib/api/busqueda";

const TIPO: Record<ResultadoBusqueda["tipo"], string> = {
  pagina: "Página",
  accion: "Acción",
  indicador: "Indicador",
  concepto: "Concepto",
};

/** Para cuando no se ha escrito nada: lo más usado. */
export const SUGERENCIAS: ResultadoBusqueda[] = [
  { id: "s-ordenes", titulo: "Órdenes", descripcion: "Comprar y vender", ruta: "/ordenes", tipo: "pagina" },
  {
    id: "s-mercado",
    titulo: "Mercado",
    descripcion: "Velas e indicadores",
    ruta: "/mercado",
    tipo: "pagina",
  },
  { id: "s-liga", titulo: "Liga de inversores", descripcion: "Tu puesto", ruta: "/liga", tipo: "pagina" },
  {
    id: "s-como",
    titulo: "Cómo funciona",
    descripcion: "Las estructuras de datos, en vivo",
    ruta: "/como-funciona",
    tipo: "pagina",
  },
];

const ESPERA_MS = 150;

/** Espera a que se deje de escribir un momento antes de buscar. */
function useConsultaPausada(texto: string): string {
  const [pausada, setPausada] = useState(texto);
  useEffect(() => {
    const t = setTimeout(() => setPausada(texto.trim()), ESPERA_MS);
    return () => clearTimeout(t);
  }, [texto]);
  return pausada;
}

/** Búsqueda de Ctrl + K (⌘ + K en Mac): el backend responde con un trie mientras se escribe. */
export function PaletaBusqueda() {
  const [abierta, setAbierta] = useState(false);
  const [texto, setTexto] = useState("");
  const [activo, setActivo] = useState(0);
  const casilla = useRef<HTMLInputElement>(null);
  const anterior = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const idLista = useId();
  const consulta = useConsultaPausada(texto);

  const busqueda = useQuery({
    queryKey: ["buscar", consulta],
    queryFn: ({ signal }) => buscar(consulta, 8, signal),
    enabled: abierta && consulta.length > 0,
    placeholderData: (previa) => previa,
    staleTime: 5 * 60_000,
  });
  const resultados = texto.trim() === "" ? SUGERENCIAS : (busqueda.data?.resultados ?? []);
  const indice = Math.min(activo, Math.max(0, resultados.length - 1));

  const abrir = () => {
    anterior.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setAbierta(true);
  };
  const cerrar = () => {
    setAbierta(false);
    setTexto("");
    setActivo(0);
    anterior.current?.focus();
  };

  useEffect(() => {
    const alTeclear = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (abierta) cerrar();
        else abrir();
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  });

  useEffect(() => {
    if (abierta) casilla.current?.focus();
  }, [abierta]);

  const ir = (r: ResultadoBusqueda) => {
    cerrar();
    router.push(r.ruta);
  };

  const alTeclearCasilla = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivo((indice + 1) % Math.max(1, resultados.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((indice - 1 + resultados.length) % Math.max(1, resultados.length));
    } else if (e.key === "Enter" && resultados[indice]) {
      e.preventDefault();
      ir(resultados[indice]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cerrar();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="flex min-h-10 items-center gap-2 rounded-xl border border-borde px-3 text-sm text-texto-atenuado hover:border-oro/50 hover:text-texto"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <span aria-hidden>⌕</span>
        <span className="hidden sm:inline">Buscar</span>
        <kbd className="hidden rounded border border-borde-fuerte px-1.5 text-[10px] sm:inline">Ctrl K</kbd>
        <span className="sr-only sm:hidden">Buscar</span>
      </button>

      {abierta && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-fondo/70 px-3 pt-[12vh] backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) cerrar();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar en Nexabit"
            className="vidrio borde-oro w-full max-w-xl overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-borde px-4">
              <span aria-hidden className="text-oro">
                ⌕
              </span>
              <input
                ref={casilla}
                role="combobox"
                aria-expanded="true"
                aria-controls={idLista}
                aria-activedescendant={resultados[indice] ? `${idLista}-${indice}` : undefined}
                aria-autocomplete="list"
                aria-label="Buscar páginas, acciones, indicadores y conceptos"
                placeholder="Busca «órdenes», «rsi», «trie», «2fa»…"
                value={texto}
                maxLength={60}
                onChange={(e) => {
                  setTexto(e.target.value);
                  setActivo(0);
                }}
                onKeyDown={alTeclearCasilla}
                className="min-h-14 flex-1 bg-transparent text-base text-texto placeholder:text-texto-atenuado focus:outline-none focus-visible:outline-none"
              />
              <kbd className="rounded border border-borde-fuerte px-1.5 text-[10px] text-texto-atenuado">
                Esc
              </kbd>
            </div>

            <ul
              id={idLista}
              role="listbox"
              aria-label="Resultados"
              className="max-h-[50vh] overflow-y-auto p-2"
            >
              {texto.trim() === "" && (
                <li role="presentation" className="px-3 pt-1 pb-2 text-xs text-texto-atenuado">
                  Sugerencias
                </li>
              )}
              {resultados.map((r, i) => (
                <li
                  key={r.id}
                  id={`${idLista}-${i}`}
                  role="option"
                  aria-selected={i === indice}
                  onMouseEnter={() => setActivo(i)}
                  onClick={() => ir(r)}
                  className={
                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 " +
                    (i === indice ? "bg-oro/10 text-texto" : "text-texto-secundario")
                  }
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium text-texto">{r.titulo}</span>
                    <span className="truncate text-xs">{r.descripcion}</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-borde px-2 py-0.5 text-[10px]">
                    {TIPO[r.tipo]}
                  </span>
                </li>
              ))}
              {texto.trim() !== "" && consulta !== "" && busqueda.data && resultados.length === 0 && (
                <li role="presentation" className="px-3 py-6 text-center text-sm text-texto-atenuado">
                  Nada empieza por «{texto.trim()}».
                </li>
              )}
            </ul>

            <p className="border-t border-borde px-4 py-2 text-[11px] text-texto-atenuado">
              ↑↓ para moverte · Enter para abrir
              {busqueda.data &&
                ` · Trie de ${busqueda.data.palabrasIndexadas} palabras en ${busqueda.data.nodosTrie} nodos`}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
