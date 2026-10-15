"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { abrirChat } from "@/lib/chat";

/** Las palabras difíciles, en lenguaje sencillo (las mismas ideas que explica el bot en el chat). */
export const GLOSARIO = {
  usdt: "USDT es una moneda digital que vale casi lo mismo que un dólar. Aquí es tu dinero de práctica: empiezas con 10.000 USDT simulados.",
  btc: "BTC es la abreviatura de Bitcoin. Puedes comprar pedacitos: 0,001 BTC también es Bitcoin.",
  vela: "Una vela resume el precio en un rato (por ejemplo, 1 hora): dónde empezó, dónde terminó y hasta dónde subió y bajó.",
  comision:
    "Cada compra y cada venta paga una comisión del 0,1 %, como en un exchange real. Por 1.000 USDT son 1 USDT.",
  riesgo:
    "Qué parte de tus USDT usa el bot en cada compra. Con 20 %, si tienes 1.000 USDT, compra por 200 y guarda el resto.",
  "stop-loss":
    "Un freno de emergencia: si el precio cae este porcentaje desde lo que pagaste, el bot vende todo para que la pérdida no siga creciendo.",
  "take-profit":
    "La meta de ganancia: si el precio sube este porcentaje desde lo que pagaste, el bot vende todo y guarda la ganancia.",
  rsi: "Un medidor de 0 a 100 que dice si el precio subió o bajó muy rápido. Arriba de 70 suele estar «caro»; abajo de 30, «barato».",
  macd: "Compara dos promedios del precio para ver si toma fuerza hacia arriba o hacia abajo.",
  cola: "Las órdenes esperan en fila y se ejecutan en el orden en que llegaron, al precio de ese momento.",
  rentabilidad:
    "Cuánto has ganado o perdido comparado con lo que empezaste. 5 % de 10.000 USDT son 500 USDT.",
} as const;

export type Concepto = keyof typeof GLOSARIO;

const NOMBRE: Record<Concepto, string> = {
  usdt: "USDT",
  btc: "BTC",
  vela: "vela",
  comision: "comisión",
  riesgo: "riesgo por compra",
  "stop-loss": "stop-loss",
  "take-profit": "take-profit",
  rsi: "RSI",
  macd: "MACD",
  cola: "cola de pendientes",
  rentabilidad: "rentabilidad",
};

/** Qué se le pregunta al bot si la persona quiere saber más. */
const PREGUNTA: Partial<Record<Concepto, string>> = {
  "stop-loss": "¿Qué es el stop loss?",
  "take-profit": "¿Qué es el take profit?",
  rsi: "¿Qué es el RSI?",
  macd: "¿Qué es el MACD?",
  vela: "¿Qué es una vela?",
  usdt: "¿Qué es USDT?",
  comision: "¿Qué es la comisión?",
  riesgo: "¿Qué es el riesgo?",
};

/**
 * Un «?» al lado de una palabra difícil. Al tocarlo se abre una explicación corta (no
 * un tooltip que solo sale con el ratón: así también funciona en el teléfono).
 */
export function Termino({ concepto, children }: { concepto: Concepto; children?: ReactNode }) {
  const id = useId();
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLSpanElement>(null);
  const pregunta = PREGUNTA[concepto];

  useEffect(() => {
    if (!abierto) return;
    const alTocarAfuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("pointerdown", alTocarAfuera);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alTocarAfuera);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  return (
    <span ref={caja} className="relative inline-flex items-center gap-1 align-baseline">
      {children}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls={id}
        aria-label={`¿Qué significa ${NOMBRE[concepto]}?`}
        className="inline-grid size-5 place-items-center rounded-full border border-oro/50 text-[11px] font-bold text-oro hover:bg-oro/10"
      >
        ?
      </button>
      {abierto && (
        <span
          id={id}
          role="note"
          className="vidrio absolute top-full left-0 z-30 mt-2 flex w-72 max-w-[80vw] flex-col gap-2 rounded-xl border border-oro/30 p-3 text-left text-sm leading-relaxed font-normal text-texto normal-case shadow-xl"
        >
          {GLOSARIO[concepto]}
          {pregunta && (
            <button
              type="button"
              onClick={() => {
                setAbierto(false);
                abrirChat(pregunta);
              }}
              className="self-start text-sm font-semibold text-oro hover:underline"
            >
              Pregúntale al bot →
            </button>
          )}
        </span>
      )}
    </span>
  );
}
