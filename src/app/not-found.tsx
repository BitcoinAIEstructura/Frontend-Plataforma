import type { Metadata } from "next";
import Link from "next/link";

import { SimboloNexabit } from "@/componentes/marca/Logo";
import { clasesBoton } from "@/componentes/ui/Boton";

export const metadata: Metadata = { title: "Página no encontrada · Nexabit" };

/** 404: una ruta que no existe. */
export default function NoEncontrada() {
  return (
    <main className="fondo-aurora grid min-h-dvh place-items-center px-4 text-center">
      <div className="vidrio flex max-w-md flex-col items-center gap-4 rounded-3xl p-8">
        <SimboloNexabit tamano={56} />
        <p className="cifra text-sm tracking-widest text-oro">404</p>
        <h1 className="text-2xl font-semibold">Esta página no existe</h1>
        <p className="text-texto-secundario">
          Puede que el enlace esté mal escrito o que la página se haya movido.
        </p>
        <Link href="/panel" className={clasesBoton("dorado")}>
          Volver al panel
        </Link>
      </div>
    </main>
  );
}
