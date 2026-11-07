"use client";

import { useEffect } from "react";

import { Boton } from "@/componentes/ui/Boton";
import { Tarjeta } from "@/componentes/ui/Tarjeta";

/**
 * Si una pantalla privada falla al dibujarse, se muestra esto dentro del marco (la
 * navegación sigue funcionando) en vez de una página en blanco.
 */
export default function ErrorDePantalla({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error al renderizar una pantalla privada de Nexabit:", error);
  }, [error]);
  return (
    <Tarjeta como="div" className="flex flex-col items-center gap-4 py-12 text-center">
      <span aria-hidden className="text-4xl text-bitcoin">
        ⚠
      </span>
      <h2 className="text-xl font-semibold">Algo salió mal al mostrar esta pantalla</h2>
      <p className="max-w-md text-texto-secundario">
        Tu cuenta y tu cartera de práctica están bien. Puedes intentarlo de nuevo o ir a otra sección.
      </p>
      <Boton onClick={reset}>Reintentar</Boton>
    </Tarjeta>
  );
}
