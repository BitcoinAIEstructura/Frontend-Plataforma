"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Boton } from "@/componentes/ui/Boton";
import {
  LARGO_MAXIMO_MENSAJE,
  preguntarAlBot,
  type AccionAsistente,
  type TurnoChat,
} from "@/lib/api/asistente";
import { obtenerOrdenes, type NuevaOrden } from "@/lib/api/simulacion";
import { useAccionesAlertas, useAccionesBot, useAccionesOrdenes, useBot } from "@/lib/hooks/useDatos";

export const SUGERENCIAS_INICIALES = [
  "¿Qué me recomiendas hacer?",
  "¿Cuánto he ganado?",
  "¿Qué estás haciendo?",
  "¿Qué es el stop loss?",
];

export interface Mensaje {
  id: number;
  de: "tu" | "bot";
  texto: string;
  accion?: AccionAsistente | null;
  /** La acción ya se usó (o se descartó): su botón queda apagado. */
  accionUsada?: boolean;
  sugerencias?: readonly string[];
  error?: boolean;
  /** La respuesta la escribió la IA (Claude). */
  deIA?: boolean;
}

/**
 * Lo que se le manda a la IA para que siga la conversación (sin errores ni la bienvenida).
 * Si el bot propuso algo, va anotado, para que la IA sepa qué ofreció y si se aceptó.
 */
export function historialDe(mensajes: readonly Mensaje[]): TurnoChat[] {
  return mensajes
    .filter((m) => !m.error && m.id !== 0)
    .map((m) => {
      if (m.de === "tu") return { rol: "usuario", texto: m.texto };
      const nota = m.accion
        ? `\n[Propuse: ${m.accion.etiqueta}${m.accionUsada ? " (la persona lo confirmó)" : ""}]`
        : "";
      return { rol: "bot", texto: m.texto + nota };
    });
}

/** La orden de la propuesta, como la recibe POST /api/ordenes. */
/**
 * El chat muestra texto plano. Si la IA escribe Markdown, se quitan las marcas para que no
 * se vean asteriscos ni almohadillas sueltos.
 */
export function sinMarkdown(texto: string): string {
  return texto
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*\*\s+/gm, "- ");
}

export function ordenDe(accion: AccionAsistente): NuevaOrden | null {
  const o = accion.orden;
  if (!o) return null;
  if (o.todo && o.tipo === "VENTA") return { tipo: "VENTA", todo: true, motivo: "propuesta de la IA del chat" };
  return o.monto ? { tipo: o.tipo, monto: o.monto, motivo: "propuesta de la IA del chat" } : null;
}

export function bienvenida(nombre: string): Mensaje {
  return {
    id: 0,
    de: "bot",
    texto:
      `¡Hola, ${nombre}! Soy tu asistente de práctica. Puedo revisar tu cartera, explicarte el mercado, ` +
      "proponerte una orden o encender el bot (tú confirmas todo). Toca una pregunta o escribe la tuya.",
    sugerencias: SUGERENCIAS_INICIALES,
  };
}

interface Props {
  mensajes: readonly Mensaje[];
  setMensajes: (cambiar: (antes: readonly Mensaje[]) => Mensaje[]) => void;
  /** Una pregunta para enviar apenas se abre (por ejemplo, desde un botón «¿Qué es esto?»). */
  preguntaInicial?: string;
  alIr?: () => void;
}

/**
 * La conversación con el bot. Lo que pide hacer (encenderse, detenerse, ir a una página)
 * llega como un botón: nada pasa hasta que la persona lo toca.
 */
export function ChatBot({ mensajes, setMensajes, preguntaInicial, alIr }: Props) {
  const router = useRouter();
  const bot = useBot();
  const { iniciar, detener } = useAccionesBot();
  const ordenes = useAccionesOrdenes();
  const alertas = useAccionesAlertas();
  const [texto, setTexto] = useState("");
  const casilla = useRef<HTMLInputElement>(null);
  const fin = useRef<HTMLDivElement>(null);
  const siguienteId = useRef(mensajes.reduce((m, x) => Math.max(m, x.id), 0) + 1);
  const pregunta = useMutation({ mutationFn: preguntarAlBot });

  const agregar = (m: Omit<Mensaje, "id">) => {
    const id = siguienteId.current++;
    setMensajes((antes) => [...antes, { ...m, id }]);
  };

  const enviar = (contenido: string) => {
    const limpio = contenido.trim().slice(0, LARGO_MAXIMO_MENSAJE);
    if (!limpio || pregunta.isPending) return;
    const historial = historialDe(mensajes);
    agregar({ de: "tu", texto: limpio });
    setTexto("");
    pregunta.mutate(
      { mensaje: limpio, historial },
      {
        onSuccess: (r) =>
          agregar({
            de: "bot",
            texto: r.fuente === "ia" ? sinMarkdown(r.respuesta) : r.respuesta,
            accion: r.accion,
            sugerencias: r.sugerencias,
            deIA: r.fuente === "ia",
          }),
        onError: (e) =>
          agregar({
            de: "bot",
            texto: `No pude responder: ${e.message}. Intenta de nuevo en un momento.`,
            error: true,
          }),
      },
    );
  };

  // La pregunta que venía al abrir se envía una sola vez.
  const enviada = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (preguntaInicial && enviada.current !== preguntaInicial) {
      enviada.current = preguntaInicial;
      enviar(preguntaInicial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preguntaInicial]);

  useEffect(() => {
    fin.current?.scrollIntoView?.({ block: "end" });
  }, [mensajes.length, pregunta.isPending]);

  const usarAccion = (m: Mensaje) => {
    if (!m.accion || m.accionUsada) return;
    setMensajes((antes) => antes.map((x) => (x.id === m.id ? { ...x, accionUsada: true } : x)));
    const alFallar = (e: Error) =>
      agregar({ de: "bot", texto: `No pude hacerlo: ${e.message}`, error: true });
    if (m.accion.tipo === "IR" && m.accion.ruta) {
      router.push(m.accion.ruta);
      alIr?.();
    } else if (m.accion.tipo === "ORDEN") {
      const orden = ordenDe(m.accion);
      if (orden) void hacerOrden(orden).catch(alFallar);
    } else if (m.accion.tipo === "ALERTA" && m.accion.alerta) {
      const { tipo, precio } = m.accion.alerta;
      alertas.crear.mutate(
        { tipo, precio },
        {
          onSuccess: () =>
            agregar({
              de: "bot",
              texto: "Listo, te aviso cuando el precio llegue ahí. Tus alertas están en la página Mercado.",
              sugerencias: ["¿Qué me recomiendas hacer?", "¿Cuánto he ganado?"],
            }),
          onError: alFallar,
        },
      );
    } else if (m.accion.tipo === "INICIAR_BOT") {
      const configuracion = { ...(bot.data?.configuracion ?? {}), ...(m.accion.modo ? { modo: m.accion.modo } : {}) };
      iniciar.mutate(configuracion, {
        onSuccess: () =>
          agregar({
            de: "bot",
            texto:
              "¡Listo, ya estoy encendido! Estoy revisando el mercado. Pregúntame «¿qué estás haciendo?» cuando quieras.",
            sugerencias: ["¿Qué estás haciendo?", "¿Por qué decidiste eso?"],
          }),
        onError: alFallar,
      });
    } else if (m.accion.tipo === "DETENER_BOT") {
      detener.mutate(undefined, {
        onSuccess: () =>
          agregar({
            de: "bot",
            texto: "Listo, me detuve. Tu cartera queda tal como está.",
            sugerencias: ["¿Cuánto he ganado?", "Enciéndete"],
          }),
        onError: alFallar,
      });
    }
  };

  /**
   * La orden va a la cola (FIFO). Si la cola estaba vacía, se ejecuta enseguida; si no, se
   * ejecutaría primero otra orden, así que queda esperando su turno.
   */
  async function hacerOrden(orden: NuevaOrden) {
    const habiaCola = (await obtenerOrdenes()).some((o) => o.estado === "PENDIENTE");
    await ordenes.crear.mutateAsync(orden);
    if (habiaCola) {
      agregar({
        de: "bot",
        texto: "Listo, la orden quedó en la cola detrás de las que ya esperaban. Ejecútalas en la página Órdenes.",
        accion: { tipo: "IR", etiqueta: "Ir a Órdenes", ruta: "/ordenes" },
      });
      return;
    }
    const hecha = await ordenes.procesar.mutateAsync();
    agregar({
      de: "bot",
      texto:
        hecha.estado === "EJECUTADA"
          ? `¡Hecho! ${hecha.detalle ?? "La orden se ejecutó."} Es dinero de práctica: mira cómo evoluciona.`
          : `No se pudo ejecutar: ${hecha.detalle ?? "la orden fue rechazada"}.`,
      sugerencias: ["¿Cuánto he ganado?", "¿Qué me recomiendas hacer?"],
    });
  }

  const ultimoBot = [...mensajes].reverse().find((m) => m.de === "bot");
  const sugerencias = pregunta.isPending ? [] : (ultimoBot?.sugerencias ?? []);

  const alEnviar = (e: FormEvent) => {
    e.preventDefault();
    enviar(texto);
    casilla.current?.focus();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversación con el bot"
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 py-2"
      >
        {mensajes.map((m) => (
          <div key={m.id} className={`flex flex-col gap-2 ${m.de === "tu" ? "items-end" : "items-start"}`}>
            <p
              className={
                "max-w-[88%] rounded-lg px-4 py-2.5 text-[15px] leading-relaxed " +
                (m.de === "tu"
                  ? "rounded-br-md bg-oro/15 text-texto"
                  : m.error
                    ? "rounded-bl-md border border-error/40 bg-error/10 text-error"
                    : "rounded-bl-md bg-superficie-alta text-texto")
              }
            >
              <span className="sr-only">{m.de === "tu" ? "Tú: " : "Bot: "}</span>
              <span className="whitespace-pre-line">{m.texto}</span>
            </p>
            {m.deIA && (
              <span className="-mt-1 px-2 text-[11px] text-texto-atenuado">
                Respondido por IA · puede equivocarse
              </span>
            )}
            {m.accion && (
              <Boton
                variante={
                  m.accion.tipo === "DETENER_BOT"
                    ? "peligro"
                    : m.accion.tipo === "IR" || m.accion.tipo === "ALERTA"
                      ? "contorno"
                      : "dorado"
                }
                onClick={() => usarAccion(m)}
                disabled={m.accionUsada}
                cargando={
                  !m.accionUsada &&
                  ((m.accion.tipo === "INICIAR_BOT" && iniciar.isPending) ||
                    (m.accion.tipo === "DETENER_BOT" && detener.isPending) ||
                    (m.accion.tipo === "ORDEN" && (ordenes.crear.isPending || ordenes.procesar.isPending)) ||
                    (m.accion.tipo === "ALERTA" && alertas.crear.isPending))
                }
                className="min-h-10 text-sm"
              >
                {m.accion.tipo === "IR" ? `${m.accion.etiqueta} →` : m.accion.etiqueta}
              </Boton>
            )}
          </div>
        ))}
        {pregunta.isPending && (
          <p role="status" className="flex items-center gap-2 text-sm text-texto-atenuado">
            <span aria-hidden className="flex gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-texto-atenuado" />
              <span className="size-1.5 animate-bounce rounded-full bg-texto-atenuado [animation-delay:150ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-texto-atenuado [animation-delay:300ms]" />
            </span>
            El bot está escribiendo…
          </p>
        )}
        <div ref={fin} />
      </div>

      {sugerencias.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2" role="group" aria-label="Preguntas sugeridas">
          {sugerencias.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => enviar(s)}
              className="min-h-9 rounded-full border border-oro/40 px-3 text-sm text-texto-secundario hover:bg-oro/10 hover:text-texto"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={alEnviar} className="mt-3 flex gap-2">
        <label htmlFor="chat-mensaje" className="sr-only">
          Escribe tu pregunta para el bot
        </label>
        <input
          id="chat-mensaje"
          ref={casilla}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={LARGO_MAXIMO_MENSAJE}
          autoComplete="off"
          placeholder="Escribe tu pregunta…"
          className="min-h-11 min-w-0 flex-1 rounded-md border border-borde-fuerte/70 bg-superficie-alta/70 px-4 text-base text-texto placeholder:text-texto-atenuado focus:ring-2 focus:ring-oro/60 focus:outline-none"
        />
        <Boton type="submit" disabled={!texto.trim()} cargando={pregunta.isPending}>
          Enviar
        </Boton>
      </form>
    </div>
  );
}
