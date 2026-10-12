import type { ReactNode } from "react";

import { Logo } from "@/componentes/marca/Logo";
import { MonedaBitcoin } from "@/componentes/moneda3d/MonedaBitcoin";
import { AvisoSimulacion } from "@/componentes/ui/AvisoSimulacion";
import { InterruptorTema } from "@/componentes/ui/InterruptorTema";

const BENEFICIOS = [
  { icono: "◆", texto: "10.000 USDT de práctica al crear tu cuenta" },
  { icono: "✦", texto: "Una IA que te explica cada señal del mercado" },
  { icono: "⬢", texto: "Cuenta protegida: datos cifrados y verificación en dos pasos" },
];

/** Inicio de sesión y registro: la moneda 3D a un lado y el formulario al otro. */
export default function AccesoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fondo-aurora relative min-h-dvh">
      <InterruptorTema className="absolute top-4 right-4 z-10" />
      <div className="mx-auto grid max-w-7xl content-start lg:min-h-dvh lg:grid-cols-[1.1fr_1fr] lg:content-stretch">
        <section
          aria-label="Bienvenida a Nexabit"
          className="flex flex-col items-center justify-center gap-4 px-4 pt-6 sm:px-8 lg:items-start lg:gap-6 lg:px-12 lg:py-12"
        >
          <Logo tamano={40} />
          <MonedaBitcoin className="aspect-square w-56 sm:w-72 lg:w-full lg:max-w-[34rem]" />
          <div className="hidden max-w-lg flex-col gap-4 lg:flex">
            <p className="font-titulo text-3xl leading-tight font-semibold xl:text-4xl">
              <span className="texto-oro">Invierte como un experto.</span>{" "}
              <span className="text-texto">Practica sin arriesgar un peso.</span>
            </p>
            <ul className="flex flex-col gap-2.5 text-texto-secundario">
              {BENEFICIOS.map((b) => (
                <li key={b.texto} className="flex items-center gap-3">
                  <span aria-hidden className="text-oro">
                    {b.icono}
                  </span>
                  {b.texto}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <main className="flex flex-col items-center justify-center gap-6 px-4 pt-2 pb-8 sm:px-8 lg:py-12">
          <div className="w-full max-w-md">{children}</div>
          <AvisoSimulacion className="max-w-md text-center" />
        </main>
      </div>
    </div>
  );
}
