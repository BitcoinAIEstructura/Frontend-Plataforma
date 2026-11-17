"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type TipoAviso = "exito" | "info" | "alerta";

export interface Aviso {
  id: number;
  tipo: TipoAviso;
  titulo: string;
  texto?: string;
}

const ICONO: Record<TipoAviso, string> = { exito: "✓", info: "ℹ", alerta: "🔔" };
const BORDE: Record<TipoAviso, string> = {
  exito: "border-exito/50",
  info: "border-violeta/50",
  alerta: "border-oro/60",
};

/** Cuánto se queda un aviso en pantalla antes de irse solo. */
export const DURACION_MS = 10_000;

type Avisar = (aviso: Omit<Aviso, "id">) => void;
const Contexto = createContext<Avisar>(() => {});

/** Para mostrar un aviso desde cualquier componente: `avisar({ tipo, titulo, texto })`. */
export function useAvisos(): Avisar {
  return useContext(Contexto);
}

function Tarjeta({ aviso, cerrar }: { aviso: Aviso; cerrar: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => cerrar(aviso.id), DURACION_MS);
    return () => clearTimeout(t);
  }, [aviso.id, cerrar]);
  return (
    <li
      className={`vidrio flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg motion-safe:animate-[entrar_200ms_ease-out] ${BORDE[aviso.tipo]}`}
    >
      <span aria-hidden className="text-lg leading-6">
        {ICONO[aviso.tipo]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-texto">{aviso.titulo}</p>
        {aviso.texto && <p className="text-sm text-texto-secundario">{aviso.texto}</p>}
      </div>
      <button
        type="button"
        onClick={() => cerrar(aviso.id)}
        className="rounded-lg px-2 text-texto-atenuado hover:text-texto"
        aria-label={`Cerrar el aviso: ${aviso.titulo}`}
      >
        ✕
      </button>
    </li>
  );
}

/**
 * Avisos que aparecen un momento en una esquina (una alerta de precio cumplida…).
 * Se anuncian a los lectores de pantalla sin interrumpir (aria-live="polite").
 */
export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const siguiente = useRef(1); // un contador propio: dos avisos en el mismo instante no comparten id

  const cerrar = useCallback((id: number) => setAvisos((lista) => lista.filter((a) => a.id !== id)), []);
  const avisar = useCallback<Avisar>((aviso) => {
    const id = siguiente.current++;
    setAvisos((lista) => [...lista.slice(-3), { ...aviso, id }]);
  }, []);

  return (
    <Contexto.Provider value={avisar}>
      {children}
      <ol
        aria-live="polite"
        aria-label="Avisos"
        className="pointer-events-none fixed right-3 bottom-24 z-50 flex w-[min(24rem,calc(100vw-1.5rem))] flex-col gap-2 lg:bottom-4 [&>li]:pointer-events-auto"
      >
        {avisos.map((a) => (
          <Tarjeta key={a.id} aviso={a} cerrar={cerrar} />
        ))}
      </ol>
    </Contexto.Provider>
  );
}
