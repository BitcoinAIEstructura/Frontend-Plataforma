"use client";

import Link from "next/link";

import { clasesBoton } from "@/componentes/ui/Boton";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { useCartera } from "@/lib/hooks/useDatos";
import { useUsuarioActual } from "@/lib/hooks/useSesion";

/** Saludo del panel: invita a la primera orden o resume cómo va, y recuerda la verificación en dos pasos. */
export function Bienvenida() {
  const { usuario } = useUsuarioActual();
  const cartera = useCartera();
  if (!usuario) return null;
  // Sin comisiones pagadas no ha ejecutado ninguna orden.
  const nuevo = !cartera.data || cartera.data.comisionesPagadas === 0;
  return (
    <>
      <Tarjeta destacada como="div" className="flex flex-col gap-3 sm:p-8">
        <p className="text-sm font-medium tracking-wide text-oro uppercase">Tu cuenta de práctica</p>
        <h2 className="text-2xl leading-tight font-semibold sm:text-3xl">
          Hola, <span className="texto-oro">{usuario.nombre}</span>.{" "}
          {nuevo ? "Tu primera inversión te espera." : "Así va tu cartera hoy."}
        </h2>
        <p className="max-w-2xl text-texto-secundario">
          {nuevo ? (
            <>
              Tienes <strong className="cifra text-texto">10 000 USDT</strong> de práctica para invertir en
              Bitcoin con ayuda de la IA, sin arriesgar dinero real.
            </>
          ) : (
            "Mira la señal de la IA, revisa el mercado y decide tu siguiente paso con calma."
          )}
        </p>
        <div className="mt-1 flex flex-wrap gap-3">
          <Link href="/ordenes" className={clasesBoton("dorado")}>
            {nuevo ? "Hacer mi primera orden" : "Nueva orden"}
          </Link>
          <Link href="/mercado" className={clasesBoton("contorno")}>
            Ver el mercado
          </Link>
        </div>
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
          <Link href="/seguridad" className={clasesBoton("contorno")}>
            Activarla ahora
          </Link>
        </Tarjeta>
      )}
    </>
  );
}
