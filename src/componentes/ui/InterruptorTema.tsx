"use client";

import { useSyncExternalStore } from "react";

export type Tema = "oscuro" | "claro";
export const CLAVE_TEMA = "nexabit-tema";

/**
 * Script que corre antes de pintar la página: aplica el tema guardado y evita el
 * "parpadeo" del tema equivocado. Por defecto, el oscuro (la identidad de Nexabit).
 */
export const SCRIPT_TEMA = `try{var t=localStorage.getItem("${CLAVE_TEMA}");if(t==="claro"||t==="oscuro")document.documentElement.dataset.theme=t}catch(e){}`;

function temaActual(): Tema {
  return document.documentElement.dataset.theme === "claro" ? "claro" : "oscuro";
}

export function aplicarTema(tema: Tema): void {
  document.documentElement.dataset.theme = tema;
  try {
    localStorage.setItem(CLAVE_TEMA, tema);
  } catch {
    // navegación privada o almacenamiento bloqueado: el tema dura solo esta visita
  }
  window.dispatchEvent(new CustomEvent("nexabit:tema", { detail: tema }));
}

/** Botón que alterna entre el tema oscuro y el claro. */
function suscribir(alCambiar: () => void) {
  window.addEventListener("nexabit:tema", alCambiar);
  return () => window.removeEventListener("nexabit:tema", alCambiar);
}

/** El tema actual, leído del documento y actualizado cuando cambia (en cualquier interruptor). */
export function useTema(): Tema {
  return useSyncExternalStore(suscribir, temaActual, () => "oscuro");
}

export function InterruptorTema({ className = "" }: { className?: string }) {
  const tema = useTema();
  const siguiente: Tema = tema === "oscuro" ? "claro" : "oscuro";
  return (
    <button
      type="button"
      onClick={() => aplicarTema(siguiente)}
      aria-label={`Cambiar al tema ${siguiente}`}
      title={`Tema ${siguiente}`}
      className={`grid size-10 place-items-center rounded-full text-lg text-texto-secundario transition hover:bg-superficie-alta hover:text-oro ${className}`}
    >
      <span aria-hidden>{tema === "oscuro" ? "☀" : "☾"}</span>
    </button>
  );
}
