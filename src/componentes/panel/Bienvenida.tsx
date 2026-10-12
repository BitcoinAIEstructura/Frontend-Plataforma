"use client";

import Link from "next/link";

import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { useUsuarioActual } from "@/lib/hooks/useSesion";

const PROXIMAMENTE = [
  { icono: "⌁", titulo: "Mercado en vivo", texto: "Velas de BTCUSDT en tiempo real e indicadores técnicos." },
  { icono: "⇅", titulo: "Tus órdenes", texto: "Compra y vende con tus 10 000 USDT de práctica." },
  {
    icono: "✦",
    titulo: "Predicciones IA",
    texto: "Modelos entrenados con la historia del mercado, y por qué deciden.",
  },
];

/** Saludo del panel (las gráficas llegan en la fase 4). */
export function Bienvenida() {
  const { usuario } = useUsuarioActual();
  if (!usuario) return null;
  return (
    <>
      <Tarjeta destacada como="div" className="flex flex-col gap-3 sm:p-8">
        <p className="text-sm font-medium tracking-wide text-oro uppercase">Tu cuenta de práctica</p>
        <h2 className="text-2xl leading-tight font-semibold sm:text-3xl">
          Hola, <span className="texto-oro">{usuario.nombre}</span>. Tu primera inversión te espera.
        </h2>
        <p className="max-w-2xl text-texto-secundario">
          Tienes <strong className="cifra text-texto">10 000 USDT</strong> de práctica para invertir en
          Bitcoin con ayuda de la IA, sin arriesgar dinero real.
        </p>
      </Tarjeta>

      {!usuario.verificacionDosPasos && (
        <Tarjeta
          como="div"
          className="flex flex-col gap-3 border-bitcoin/40 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden className="text-2xl text-bitcoin">
              ⛨
            </span>
            <div>
              <p className="font-semibold text-texto">Protege tu cuenta con verificación en dos pasos</p>
              <p className="text-sm text-texto-secundario">
                Con Google Authenticator, nadie entra aunque conozca tu contraseña.
              </p>
            </div>
          </div>
          <Link
            href="/seguridad"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-oro/50 px-5 font-semibold text-oro hover:bg-oro/10"
          >
            Activarla ahora
          </Link>
        </Tarjeta>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {PROXIMAMENTE.map((p) => (
          <Tarjeta key={p.titulo} como="article" className="flex flex-col gap-2">
            <span aria-hidden className="text-2xl text-oro">
              {p.icono}
            </span>
            <h3 className="font-semibold">{p.titulo}</h3>
            <p className="text-sm text-texto-secundario">{p.texto}</p>
            <p className="mt-auto text-xs font-semibold tracking-wide text-violeta uppercase">Muy pronto</p>
          </Tarjeta>
        ))}
      </div>
    </>
  );
}
