"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { GraficaVelas } from "@/componentes/graficas/GraficaVelas";
import { PrecioEnVivo } from "@/componentes/mercado/PrecioEnVivo";
import { clasesBoton } from "@/componentes/ui/Boton";
import { Segmentado } from "@/componentes/ui/Segmentado";
import type { Intervalo } from "@/lib/api/mercado";
import { useVelas } from "@/lib/hooks/useDatos";

type Rango = "15m" | "1h" | "4h" | "1d";

const RANGOS: { valor: Rango; etiqueta: string; nombre: string }[] = [
  { valor: "15m", etiqueta: "15m", nombre: "15 minutos" },
  { valor: "1h", etiqueta: "1H", nombre: "hora" },
  { valor: "4h", etiqueta: "4H", nombre: "4 horas" },
  { valor: "1d", etiqueta: "1D", nombre: "día" },
];

/**
 * La gráfica principal del panel: el precio de BTC en velas, con el precio en vivo arriba
 * y las dos acciones de siempre (nueva orden y el mercado completo).
 */
export function GraficaPanel() {
  const [intervalo, setIntervalo] = useState<Rango>("1h");
  const velas = useVelas(intervalo as Intervalo, 120);
  // Variación de 24 h: la misma consulta que usa la barra superior (comparten caché).
  const dia = useVelas("1h", 24);
  const lista = useMemo(() => velas.data ?? [], [velas.data]);
  const nombre = RANGOS.find((r) => r.valor === intervalo)?.nombre ?? intervalo;

  return (
    <section aria-label="Precio de Bitcoin" className="vidrio flex flex-col rounded-md">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-borde p-4 sm:px-5">
        <PrecioEnVivo referencia={dia.data?.[0]?.apertura} textoReferencia="24 h" />
        <div className="flex flex-wrap items-center gap-2">
          <Segmentado
            etiqueta="Tamaño de vela"
            opciones={RANGOS}
            valor={intervalo}
            alCambiar={setIntervalo}
          />
          <Link href="/mercado" className={clasesBoton("contorno")}>
            Mercado
          </Link>
          <Link href="/ordenes" className={clasesBoton("dorado")}>
            Nueva orden
          </Link>
        </div>
      </header>
      <div className="p-2 sm:p-3">
        {velas.isError ? (
          <p role="alert" className="p-4 text-error">
            {velas.error.message}
          </p>
        ) : lista.length === 0 ? (
          <p role="status" className="grid h-[360px] place-items-center text-texto-secundario">
            Cargando velas…
          </p>
        ) : (
          <GraficaVelas titulo={`Velas de BTCUSDT cada ${nombre}`} velas={lista} alto={360} />
        )}
      </div>
    </section>
  );
}
