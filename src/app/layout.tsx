import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Proveedores } from "@/componentes/Proveedores";

import { variablesDeFuentes } from "./fuentes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexabit",
  description: "Trading simulado de Bitcoin con inteligencia artificial. Sin dinero real.",
};

export default function RaizLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO" data-theme="oscuro" className={variablesDeFuentes}>
      <body>
        <Proveedores>{children}</Proveedores>
      </body>
    </html>
  );
}
