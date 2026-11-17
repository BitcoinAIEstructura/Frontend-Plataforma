"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { Boton } from "@/componentes/ui/Boton";
import { correrDemo, type EstructuraDemo, type OperacionDemo } from "@/lib/api/estructuras";

import { MAXIMO_OPERACIONES, type FichaEstructura } from "./catalogo";
import { VistaEstado } from "./Vistas";

/** Lee el valor de la casilla: un entero (números) o una palabra (trie). */
export function leerValor(texto: string, tipo: FichaEstructura["valor"]): number | string | null {
  const limpio = texto.trim();
  if (tipo === "palabra") return /^\p{L}{1,12}$/u.test(limpio) ? limpio : null;
  return /^-?\d{1,5}$/.test(limpio) ? Number(limpio) : null;
}

/**
 * Juega con la estructura: cada operación se manda al backend junto con las
 * anteriores y él corre el código real y devuelve cómo quedó en cada paso.
 */
export function Laboratorio({ ficha }: { ficha: FichaEstructura }) {
  const [operaciones, setOperaciones] = useState<readonly OperacionDemo[]>([]);
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  // null = el último paso; un número = el que se eligió para mirar.
  const [elegido, setElegido] = useState<number | null>(null);

  const demo = useQuery({
    queryKey: ["demo", ficha.id, operaciones],
    queryFn: ({ signal }) => correrDemo(ficha.id as EstructuraDemo, operaciones, signal),
    enabled: operaciones.length > 0,
    placeholderData: (anterior) => anterior,
    staleTime: Infinity,
  });

  const pasos = operaciones.length > 0 ? (demo.data ?? []) : [];
  const indice = elegido ?? pasos.length - 1;
  const paso = pasos[indice];
  const lleno = operaciones.length >= MAXIMO_OPERACIONES;

  const cambiar = (nuevas: readonly OperacionDemo[]) => {
    setOperaciones(nuevas);
    setElegido(null);
    setAviso(null);
  };

  const agregar = (operacion: string, conValor: boolean) => {
    if (!conValor) return cambiar([...operaciones, { operacion }]);
    const valor = leerValor(texto, ficha.valor);
    if (valor === null) {
      setAviso(
        ficha.valor === "palabra"
          ? "Escribe una palabra de 1 a 12 letras."
          : "Escribe un número entero (de −9999 a 99999).",
      );
      return;
    }
    cambiar([...operaciones, { operacion, valor }]);
    setTexto("");
  };

  const principal = ficha.botones.find((b) => b.conValor);
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (principal) agregar(principal.operacion, true);
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={enviar} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-sm text-texto-secundario">
          {ficha.valor === "palabra" ? "Palabra" : "Número"}
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            inputMode={ficha.valor === "palabra" ? "text" : "numeric"}
            maxLength={ficha.valor === "palabra" ? 12 : 6}
            className="min-h-11 w-32 rounded-md border border-borde-fuerte/70 bg-superficie-alta/70 px-3 text-texto focus:ring-2 focus:ring-oro/60 focus:outline-none"
            aria-describedby={`aviso-${ficha.id}`}
          />
        </label>
        {ficha.botones.map((b) => (
          <Boton
            key={b.operacion}
            type={b === principal ? "submit" : "button"}
            variante={b === principal ? "dorado" : "contorno"}
            disabled={lleno}
            onClick={b === principal ? undefined : () => agregar(b.operacion, b.conValor)}
          >
            {b.etiqueta}
          </Boton>
        ))}
        <Boton variante="fantasma" onClick={() => cambiar(ficha.ejemplo)}>
          Ejemplo
        </Boton>
        <Boton variante="fantasma" onClick={() => cambiar([])} disabled={operaciones.length === 0}>
          Reiniciar
        </Boton>
      </form>
      <p id={`aviso-${ficha.id}`} role={aviso ? "alert" : undefined} className="min-h-5 text-sm text-error">
        {aviso ??
          (lleno ? `Llegaste al máximo de ${MAXIMO_OPERACIONES} operaciones: reinicia para seguir.` : "")}
      </p>

      {operaciones.length === 0 ? (
        <p className="rounded-md border border-dashed border-borde px-4 py-8 text-center text-sm text-texto-atenuado">
          Agrega valores o toca <strong className="text-oro">Ejemplo</strong> para verla trabajar.
        </p>
      ) : demo.isError ? (
        <p role="alert" className="text-error">
          {demo.error.message}
        </p>
      ) : !paso ? (
        <p role="status" className="text-texto-secundario">
          Corriendo en el servidor…
        </p>
      ) : (
        <>
          <div className="min-h-40 rounded-lg border border-borde bg-superficie/50 p-4">
            <VistaEstado estructura={ficha.id} estado={paso.estado} />
          </div>
          <div aria-live="polite" className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="cifra rounded-full border border-violeta/50 px-2 py-0.5 text-xs text-violeta">
              {paso.complejidad}
            </span>
            <p className="text-sm text-texto">
              <strong className="font-semibold">
                {paso.operacion}
                {paso.valor !== null ? ` ${paso.valor}` : ""}:
              </strong>{" "}
              {paso.descripcion}
            </p>
          </div>
          <nav aria-label="Pasos" className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setElegido(Math.max(0, indice - 1))}
              disabled={indice === 0}
              className="rounded-lg px-2 py-1 text-sm text-oro hover:bg-oro/10 disabled:opacity-40"
              aria-label="Paso anterior"
            >
              ◀
            </button>
            <span className="cifra text-sm text-texto-secundario">
              Paso {indice + 1} de {pasos.length}
            </span>
            <button
              type="button"
              onClick={() => setElegido(indice + 1 >= pasos.length - 1 ? null : indice + 1)}
              disabled={indice >= pasos.length - 1}
              className="rounded-lg px-2 py-1 text-sm text-oro hover:bg-oro/10 disabled:opacity-40"
              aria-label="Paso siguiente"
            >
              ▶
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
