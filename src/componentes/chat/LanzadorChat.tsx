"use client";

import { useEffect, useRef, useState } from "react";

import { Icono } from "@/componentes/marco/Iconos";
import { abrirChat, EVENTO_ABRIR_CHAT } from "@/lib/chat";

import { bienvenida, ChatBot, type Mensaje } from "./ChatBot";

/** El botón «Asistente» de la barra superior: abre el panel del chat. */
export function BotonChat() {
  return (
    <button
      type="button"
      onClick={() => abrirChat()}
      aria-label="Asistente: pregúntale al bot"
      title="Asistente"
      className="flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-texto-secundario transition hover:bg-superficie-alta hover:text-texto"
    >
      <Icono nombre="chat" tamano={18} />
      <span className="hidden xl:inline">Asistente</span>
    </button>
  );
}

/**
 * El panel del chat con el bot (lo abre el botón «Asistente» de la barra superior). El panel no tapa toda la página
 * (se puede seguir mirando la pantalla mientras se conversa) y la conversación se
 * conserva al cerrarlo, mientras no se recargue la página. No se guarda en el navegador.
 */
export function LanzadorChat({ nombre }: { nombre: string }) {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<readonly Mensaje[]>(() => [bienvenida(nombre)]);
  const [pregunta, setPregunta] = useState<string | undefined>(undefined);
  /** Lo que tenía el foco antes de abrir: ahí vuelve al cerrar. */
  const anterior = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const estabaAbierto = useRef(false);

  // Lo abren la búsqueda y los botones de ayuda (con el evento de abrirChat).
  useEffect(() => {
    const alPedir = (e: Event) => {
      if (document.activeElement instanceof HTMLElement) anterior.current = document.activeElement;
      setAbierto(true);
      const detalle = (e as CustomEvent<string | undefined>).detail;
      if (detalle) setPregunta(detalle);
    };
    window.addEventListener(EVENTO_ABRIR_CHAT, alPedir);
    return () => window.removeEventListener(EVENTO_ABRIR_CHAT, alPedir);
  }, []);

  const cerrar = () => {
    setAbierto(false);
    setPregunta(undefined);
  };

  // Al cerrar, el foco vuelve a donde estaba (el botón que lo abrió).
  useEffect(() => {
    if (!abierto && estabaAbierto.current) anterior.current?.focus();
    estabaAbierto.current = abierto;
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    panel.current?.querySelector<HTMLInputElement>("#chat-mensaje")?.focus();
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape" && panel.current?.contains(document.activeElement)) cerrar();
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  return (
    <>
      {abierto && (
        <div
          ref={panel}
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-titulo"
          className="fixed inset-x-2 top-16 bottom-22 z-40 flex flex-col rounded-lg border border-borde bg-superficie p-4 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.45)] motion-safe:animate-[entrar_160ms_ease-out] sm:inset-x-auto sm:right-4 sm:w-[26rem] lg:right-6 lg:bottom-6"
        >
          <header className="flex items-start justify-between gap-3 border-b border-borde pb-3">
            <div>
              <h2 id="chat-titulo" className="text-base font-semibold">
                Habla con tu bot
              </h2>
              <p className="text-xs text-texto-atenuado">
                Responde con tus datos de práctica. Nada se hace sin que lo confirmes.
              </p>
            </div>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar el chat"
              className="grid size-9 shrink-0 place-items-center rounded-md text-xl text-texto-secundario hover:bg-superficie-alta hover:text-texto"
            >
              ×
            </button>
          </header>
          <ChatBot
            mensajes={mensajes}
            setMensajes={setMensajes}
            preguntaInicial={pregunta}
            // En el teléfono el panel tapa la página: al ir a otra, se cierra.
            alIr={() => window.innerWidth < 1024 && cerrar()}
          />
        </div>
      )}
    </>
  );
}
