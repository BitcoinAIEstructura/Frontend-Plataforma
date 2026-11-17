"use client";

import { useState } from "react";

import { Boton } from "@/componentes/ui/Boton";

export function textoParaGuardar(codigos: readonly string[]): string {
  return [
    "Códigos de respaldo de Nexabit",
    "Cada código sirve una sola vez para entrar si pierdes el teléfono.",
    "Guárdalos en un lugar seguro y no los compartas con nadie.",
    "",
    ...codigos,
    "",
  ].join("\n");
}

/** Los 10 códigos de respaldo, que el backend muestra una sola vez. */
export function CodigosRespaldo({
  codigos,
  alTerminar,
}: {
  codigos: readonly string[];
  alTerminar: () => void;
}) {
  const [copiados, setCopiados] = useState(false);
  const [guardados, setGuardados] = useState(false);
  const [sinPortapapeles, setSinPortapapeles] = useState(false);

  async function copiar() {
    try {
      if (!navigator.clipboard) throw new Error("sin portapapeles");
      await navigator.clipboard.writeText(textoParaGuardar(codigos));
      setCopiados(true);
      setGuardados(true);
    } catch {
      // El navegador puede negar el permiso: entonces no se dan por guardados.
      setSinPortapapeles(true);
    }
  }

  function descargar() {
    const url = URL.createObjectURL(
      new Blob([textoParaGuardar(codigos)], { type: "text/plain;charset=utf-8" }),
    );
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "nexabit-codigos-de-respaldo.txt";
    enlace.click();
    URL.revokeObjectURL(url);
    setGuardados(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-bitcoin/40 bg-bitcoin/10 p-4 text-sm text-texto-secundario">
        <strong className="text-texto">Guarda estos códigos ahora.</strong> No los volverás a ver. Cada uno
        sirve una sola vez para entrar si pierdes el teléfono.
      </div>
      <ol aria-label="Códigos de respaldo" className="grid grid-cols-2 gap-2">
        {codigos.map((codigo) => (
          <li
            key={codigo}
            className="cifra rounded-lg bg-superficie-alta px-3 py-2 text-center tracking-wider"
          >
            {codigo}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Boton variante="contorno" onClick={copiar}>
          {copiados ? "Copiados ✓" : "Copiar"}
        </Boton>
        <Boton variante="contorno" onClick={descargar}>
          Descargar .txt
        </Boton>
        <Boton onClick={alTerminar} disabled={!guardados} className="ml-auto">
          Ya los guardé
        </Boton>
      </div>
      {sinPortapapeles && (
        <p role="alert" className="text-sm text-bitcoin">
          Tu navegador no dejó copiar. Usa «Descargar .txt» o anótalos en un lugar seguro.
        </p>
      )}
    </div>
  );
}
