"use client";

import { useEffect, useRef, useState } from "react";

import { EVENTO_ABRIR_CHAT } from "@/lib/chat";

import { bienvenida, ChatBot, type Mensaje } from "./ChatBot";

/**
 * El botón flotante «Pregúntale al bot» y su panel. El panel no tapa toda la página
 * (se puede seguir mirando la pantalla mientras se conversa) y la conversación se
 * conserva al cerrarlo, mientras no se recargue la página. No se guarda en el navegador.
 */
export function LanzadorChat({ nombre }: { nombre: string }) {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<readonly Mensaje[]>(() => [bienvenida(nombre)]);
  const [pregunta, setPregunta] = useState<string | undefined>(undefined);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const estabaAbierto = useRef(false);

  // Lo abren la búsqueda y los botones de ayuda (con el evento de abrirChat).
  useEffect(() => {
    const alPedir = (e: Event) => {
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

  // Al cerrar, el foco vuelve al botón que lo abrió.
  useEffect(() => {
    if (!abierto && estabaAbierto.current) boton.current?.focus();
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
      {!abierto && (
        <button
          ref={boton}
          type="button"
          onClick={() => setAbierto(true)}
          className="fixed right-4 bottom-24 z-40 flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-oro-profundo via-oro to-oro-claro px-5 font-semibold text-sobre-oro shadow-[0_10px_30px_-10px_var(--oro)] hover:brightness-110 lg:right-6 lg:bottom-6"
        >
          <span aria-hidden className="text-lg">
            💬
          </span>
          Pregúntale al bot
        </button>
      )}
      {abierto && (
        <div
          ref={panel}
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-titulo"
          className="vidrio borde-oro fixed inset-x-2 top-16 bottom-22 z-40 flex flex-col rounded-3xl p-4 shadow-2xl motion-safe:animate-[entrar_200ms_ease-out] sm:inset-x-auto sm:right-4 sm:w-[26rem] lg:top-auto lg:right-6 lg:bottom-6 lg:h-[36rem]"
        >
          <header className="flex items-start justify-between gap-3 border-b border-borde pb-3">
            <div>
              <h2 id="chat-titulo" className="text-lg font-semibold">
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
              className="grid size-10 shrink-0 place-items-center rounded-xl text-xl text-texto-secundario hover:bg-superficie-alta hover:text-texto"
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
