import type { ReactNode } from "react";

import { Logo } from "@/componentes/marca/Logo";
import { MonedaBitcoin } from "@/componentes/moneda3d/MonedaBitcoin";
import { AvisoSimulacion } from "@/componentes/ui/AvisoSimulacion";
import { InterruptorTema } from "@/componentes/ui/InterruptorTema";

const BENEFICIOS = [
  { numero: "I", titulo: "10.000 USDT de práctica", texto: "Los recibes al crear tu cuenta." },
  { numero: "II", titulo: "Una IA que explica", texto: "Te cuenta el porqué de cada señal del mercado." },
  { numero: "III", titulo: "Cuenta blindada", texto: "Datos cifrados y verificación en dos pasos." },
];

/**
 * Inicio de sesión y registro, como la portada de una revista financiera: cabecera con
 * filete, el titular en serif con la moneda acuñada y el formulario en una lámina.
 */
export default function AccesoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fondo-aurora relative flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 border-b border-borde px-4 py-3 sm:px-8 lg:shrink-0">
        <Logo tamano={32} />
        <p className="rotulo hidden md:block">Edición de práctica · Precios reales de Binance</p>
        <InterruptorTema />
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 content-start lg:min-h-0 lg:grid-cols-[1.15fr_1fr] lg:content-stretch">
        <section
          aria-label="Bienvenida a Nexabit"
          className="flex flex-col items-center justify-center gap-5 px-4 pt-6 sm:px-8 lg:min-h-0 lg:items-start lg:gap-[3dvh] lg:overflow-hidden lg:border-r lg:border-borde lg:px-12 lg:py-[4dvh]"
        >
          <div className="hidden max-w-xl flex-col gap-4 lg:flex">
            <p className="rotulo text-oro">Bóveda de práctica</p>
            <p className="font-titulo text-5xl leading-[1.04] tracking-tight text-texto xl:text-[min(3.75rem,6.5dvh)]">
              Invierte como un experto.{" "}
              <em className="texto-oro font-normal">Practica sin arriesgar un peso.</em>
            </p>
          </div>

          {/* La moneda dentro de un sello: dos filetes finos, como el troquel de una casa de moneda. */}
          <div className="relative grid aspect-square w-52 place-items-center sm:w-64 lg:w-[min(26rem,34dvh)] lg:shrink">
            <span
              aria-hidden
              className="absolute inset-[4%] rounded-full border border-oro/25 lg:inset-[2%]"
            />
            <span
              aria-hidden
              className="absolute inset-[9%] rounded-full border border-dashed border-oro/20"
            />
            <MonedaBitcoin className="size-full" />
          </div>

          <ol className="hidden w-full max-w-xl grid-cols-3 border-t border-borde lg:grid">
            {BENEFICIOS.map((b, i) => (
              <li
                key={b.numero}
                className={`flex flex-col gap-1 pt-4 pr-4 ${i > 0 ? "border-l border-borde pl-4" : ""}`}
              >
                <span aria-hidden className="font-titulo text-xl text-oro italic">
                  {b.numero}
                </span>
                <span className="font-semibold text-texto">{b.titulo}</span>
                <span className="text-sm leading-snug text-texto-secundario">{b.texto}</span>
              </li>
            ))}
          </ol>
        </section>

        <main className="flex flex-col items-center justify-center gap-6 px-4 pt-2 pb-8 sm:px-8 lg:min-h-0 lg:justify-start lg:overflow-y-auto lg:py-[4dvh] lg:[scrollbar-width:thin]">
          <div className="w-full max-w-md lg:my-auto">{children}</div>
          <AvisoSimulacion className="max-w-md text-center" />
        </main>
      </div>
    </div>
  );
}
