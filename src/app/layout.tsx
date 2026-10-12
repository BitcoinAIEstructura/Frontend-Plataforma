import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Proveedores } from "@/componentes/Proveedores";
import { SCRIPT_TEMA } from "@/componentes/ui/InterruptorTema";

import { variablesDeFuentes } from "./fuentes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexabit",
  description: "Trading simulado de Bitcoin con inteligencia artificial. Sin dinero real.",
};

export default function RaizLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: el script de abajo puede cambiar data-theme antes de que React hidrate.
    <html lang="es-CO" data-theme="oscuro" className={variablesDeFuentes} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        <Proveedores>{children}</Proveedores>
      </body>
    </html>
  );
}
